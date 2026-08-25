#!/usr/bin/env python3
"""Render DOM-traced campaign walkthroughs with the established directed camera style."""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw


FPS = 30
OUTPUT_SIZE = (1920, 1080)
SOURCE_SIZE = (3840, 2160)
DEVICE_SCALE_FACTOR = 2
THEMES = ('light', 'dark')
CHANNELS = ('web', 'ping-post', 'phone', 'chat')
VIDEO_BITRATE_KBPS = 8_500
CURSOR_SIZE = (54, 72)
CURSOR_HOTSPOT = (5, 4)
CURSOR_SAFE_INSET = 18
SCENE_BLEND_MS = 80
TASK_CAMERA_SCALE = 2.24
NAV_CAMERA_SCALE = 2.10
FINAL_CAMERA_SCALE = 1.88
SEMANTIC_FRAME_LEFT_INSET = 32
SEMANTIC_FRAME_RIGHT_INSET = 72
SEMANTIC_FRAME_VERTICAL_INSET = 64
DIALOG_FRAME_HORIZONTAL_INSET = 80
DIALOG_FRAME_VERTICAL_INSET = 64
CONTENT_IMPORTANCE_MAX_WIDTH = 820
CONTENT_IMPORTANCE_MAX_HEIGHT = 420
CONTENT_IMPORTANCE_TRAILING_SPACE = 160


@dataclass(frozen=True)
class TraceCapture:
    channel: str
    theme: str
    scene_dir: Path
    data: dict[str, Any]


@dataclass(frozen=True)
class CameraState:
    crop_box: tuple[float, float, float, float]
    scale: float


@dataclass(frozen=True)
class FrameState:
    camera: CameraState
    cursor_hotspot: tuple[float, float]
    cursor_rect: tuple[float, float, float, float]
    scene: str
    previous_scene: str | None
    scene_blend: float
    click_progress: float | None


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def smootherstep(value: float) -> float:
    progress = clamp(value, 0.0, 1.0)
    return progress ** 3 * (progress * (progress * 6.0 - 15.0) + 10.0)


def ease_out_cubic(value: float) -> float:
    progress = clamp(value, 0.0, 1.0)
    return 1.0 - ((1.0 - progress) ** 3)


def mix(start: float, end: float, progress: float) -> float:
    return start + ((end - start) * progress)


def contains_point(rect: dict[str, float], point: dict[str, float]) -> bool:
    return (
        rect['x'] <= point['x'] <= rect['x'] + rect['width']
        and rect['y'] <= point['y'] <= rect['y'] + rect['height']
    )


def validate_trace(trace: dict[str, Any]) -> None:
    viewport = trace.get('viewport', {})
    if viewport != {
        'width': 1920,
        'height': 1080,
        'deviceScaleFactor': DEVICE_SCALE_FACTOR,
    }:
        raise ValueError('trace viewport must be 1920x1080 at device scale factor 2')

    actions = trace.get('actions')
    timeline = trace.get('timeline', {})
    if not isinstance(actions, list) or not actions:
        raise ValueError('trace must contain actions')
    if len(timeline.get('actions', [])) != len(actions):
        raise ValueError('trace timeline must contain every action')

    ids: set[str] = set()
    previous_started_at = -1.0
    for action in actions:
        action_id = action.get('id')
        if not action_id or action_id in ids:
            raise ValueError('trace action ids must be unique')
        ids.add(action_id)
        rect = action.get('targetRect')
        point = action.get('clickPoint')
        if not rect or not point or not contains_point(rect, point):
            raise ValueError(f'{action_id}: click point is outside target rectangle')
        if action.get('kind') == 'toggle' and action.get('targetRole') != 'switch':
            raise ValueError(f'{action_id}: toggle action must target the switch itself')
        if len(action.get('stateDelta', [])) != 1:
            raise ValueError(f'{action_id}: action must declare exactly one semantic state delta')
        hold_ms = action.get('holdMs')
        if not isinstance(hold_ms, (int, float)) or not 120 <= hold_ms <= 1100:
            raise ValueError(f'{action_id}: readable hold must be between 120 and 1100 ms')
        started_at = action.get('startedAtMs', 0)
        if started_at <= previous_started_at:
            raise ValueError('trace actions must be strictly sequential')
        previous_started_at = started_at

        if action.get('kind') == 'type':
            text = action.get('text', '')
            scenes = action.get('typingScenes', [])
            if len(scenes) != len(text) + 1:
                raise ValueError(f'{action_id}: typing must be captured one character at a time')
            for index, scene in enumerate(scenes):
                if scene.get('value') != text[:index]:
                    raise ValueError(f'{action_id}: typing must be captured one character at a time')


def load_trace(trace_path: Path) -> TraceCapture:
    with trace_path.open(encoding='utf-8') as source:
        trace = json.load(source)
    validate_trace(trace)
    return TraceCapture(
        channel=trace['channel'],
        theme=trace['theme'],
        scene_dir=trace_path.parent,
        data=trace,
    )


def validate_theme_parity(light: dict[str, Any], dark: dict[str, Any]) -> None:
    def structure(trace: dict[str, Any]) -> list[tuple[Any, ...]]:
        return [
            (
                action.get('id'),
                action.get('kind'),
                action.get('targetRole'),
                tuple(action.get('stateDelta', [])),
                action.get('text'),
            )
            for action in trace.get('actions', [])
        ]

    if structure(light) != structure(dark):
        raise ValueError('light and dark traces must be structurally identical')


def camera_scale_for_action(action: dict[str, Any]) -> float:
    if isinstance(action.get('cameraScale'), (int, float)):
        return float(action['cameraScale'])
    action_id = action.get('id', '')
    if action_id.startswith('open-') and action.get('stateDelta', [''])[0].startswith('navigation.'):
        return NAV_CAMERA_SCALE
    if action.get('kind') == 'save':
        return FINAL_CAMERA_SCALE
    return TASK_CAMERA_SCALE


def _safe_hotspot_bounds() -> tuple[float, float, float, float]:
    min_x = CURSOR_SAFE_INSET + CURSOR_HOTSPOT[0]
    max_x = OUTPUT_SIZE[0] - CURSOR_SAFE_INSET - (CURSOR_SIZE[0] - CURSOR_HOTSPOT[0])
    min_y = CURSOR_SAFE_INSET + CURSOR_HOTSPOT[1]
    max_y = OUTPUT_SIZE[1] - CURSOR_SAFE_INSET - (CURSOR_SIZE[1] - CURSOR_HOTSPOT[1])
    return min_x, max_x, min_y, max_y


def _camera_for_actions(actions: list[dict[str, Any]]) -> CameraState:
    camera_modes = {
        action.get(
            'cameraMode',
            'navigation'
            if action.get('id', '').startswith('open-')
            and action.get('stateDelta', [''])[0].startswith('navigation.')
            else 'content',
        )
        for action in actions
    }
    if len(camera_modes) != 1:
        ids = ', '.join(action['id'] for action in actions)
        raise ValueError(f'{ids}: one camera shot cannot mix camera modes')
    camera_mode = next(iter(camera_modes))
    is_navigation_shot = camera_mode == 'navigation'
    scale = min(camera_scale_for_action(action) for action in actions)
    points = [action['clickPoint'] for action in actions]
    point_span_x = max(point['x'] for point in points) - min(point['x'] for point in points)
    point_span_y = max(point['y'] for point in points) - min(point['y'] for point in points)
    safe_min_x, safe_max_x, safe_min_y, safe_max_y = _safe_hotspot_bounds()
    if point_span_x > 0:
        scale = min(scale, (safe_max_x - safe_min_x) / point_span_x)
    if point_span_y > 0:
        scale = min(scale, (safe_max_y - safe_min_y) / point_span_y)
    frame_left = min(action['frameRect']['x'] for action in actions) * DEVICE_SCALE_FACTOR
    frame_top = min(action['frameRect']['y'] for action in actions) * DEVICE_SCALE_FACTOR
    frame_right = max(
        action['frameRect']['x'] + action['frameRect']['width']
        for action in actions
    ) * DEVICE_SCALE_FACTOR
    frame_bottom = max(
        action['frameRect']['y'] + action['frameRect']['height']
        for action in actions
    ) * DEVICE_SCALE_FACTOR
    if camera_mode == 'content' and not any(
        action.get('kind') == 'save' for action in actions
    ):
        important_right = max(
            frame_left + CONTENT_IMPORTANCE_MAX_WIDTH * DEVICE_SCALE_FACTOR,
            max(point['x'] for point in points) * DEVICE_SCALE_FACTOR
            + CONTENT_IMPORTANCE_TRAILING_SPACE * DEVICE_SCALE_FACTOR,
        )
        important_bottom = max(
            frame_top + CONTENT_IMPORTANCE_MAX_HEIGHT * DEVICE_SCALE_FACTOR,
            max(point['y'] for point in points) * DEVICE_SCALE_FACTOR
            + CONTENT_IMPORTANCE_TRAILING_SPACE * DEVICE_SCALE_FACTOR,
        )
        frame_right = min(frame_right, important_right)
        frame_bottom = min(frame_bottom, important_bottom)
    if not is_navigation_shot:
        frame_width_css = (frame_right - frame_left) / DEVICE_SCALE_FACTOR
        frame_height_css = (frame_bottom - frame_top) / DEVICE_SCALE_FACTOR
        horizontal_insets = (
            2 * DIALOG_FRAME_HORIZONTAL_INSET
            if camera_mode == 'dialog'
            else SEMANTIC_FRAME_LEFT_INSET + SEMANTIC_FRAME_RIGHT_INSET
        )
        vertical_inset = (
            DIALOG_FRAME_VERTICAL_INSET
            if camera_mode == 'dialog'
            else SEMANTIC_FRAME_VERTICAL_INSET
        )
        if frame_width_css > 0:
            scale = min(
                scale,
                (OUTPUT_SIZE[0] - horizontal_insets) / frame_width_css,
            )
        if frame_height_css > 0:
            scale = min(
                scale,
                (OUTPUT_SIZE[1] - 2 * vertical_inset) / frame_height_css,
            )
    scale = max(1.0, scale)
    crop_width = SOURCE_SIZE[0] / scale
    crop_height = SOURCE_SIZE[1] / scale
    point_center_x = mix(
        min(point['x'] for point in points),
        max(point['x'] for point in points),
        0.5,
    ) * DEVICE_SCALE_FACTOR
    point_center_y = mix(
        min(point['y'] for point in points),
        max(point['y'] for point in points),
        0.5,
    ) * DEVICE_SCALE_FACTOR
    if is_navigation_shot:
        focus_x = mix(frame_left, point_center_x, 0.58)
        focus_y = mix(frame_top, point_center_y, 0.62)
    else:
        focus_x = (frame_left + frame_right) / 2
        focus_y = (frame_top + frame_bottom) / 2
    max_left = SOURCE_SIZE[0] - crop_width
    max_top = SOURCE_SIZE[1] - crop_height
    left = clamp(focus_x - crop_width / 2, 0.0, max_left)
    top = clamp(focus_y - crop_height / 2, 0.0, max_top)
    if camera_mode == 'content':
        semantic_left_margin = SEMANTIC_FRAME_LEFT_INSET * crop_width / OUTPUT_SIZE[0]
        left = max(left, min(frame_left - semantic_left_margin, max_left))

    relative_min_x = safe_min_x * crop_width / OUTPUT_SIZE[0]
    relative_max_x = safe_max_x * crop_width / OUTPUT_SIZE[0]
    relative_min_y = safe_min_y * crop_height / OUTPUT_SIZE[1]
    relative_max_y = safe_max_y * crop_height / OUTPUT_SIZE[1]

    allowed_left_min = max(
        0.0,
        *(point['x'] * DEVICE_SCALE_FACTOR - relative_max_x for point in points),
    )
    allowed_left_max = min(
        max_left,
        *(point['x'] * DEVICE_SCALE_FACTOR - relative_min_x for point in points),
    )
    allowed_top_min = max(
        0.0,
        *(point['y'] * DEVICE_SCALE_FACTOR - relative_max_y for point in points),
    )
    allowed_top_max = min(
        max_top,
        *(point['y'] * DEVICE_SCALE_FACTOR - relative_min_y for point in points),
    )
    if allowed_left_min > allowed_left_max or allowed_top_min > allowed_top_max:
        ids = ', '.join(action['id'] for action in actions)
        raise ValueError(f'{ids}: camera cannot keep complete cursor inside frame')
    left = clamp(left, allowed_left_min, allowed_left_max)
    top = clamp(top, allowed_top_min, allowed_top_max)

    return CameraState(
        crop_box=(left, top, left + crop_width, top + crop_height),
        scale=scale,
    )


def camera_for_action(action: dict[str, Any]) -> CameraState:
    return _camera_for_actions([action])


def camera_for_trace_action(trace: dict[str, Any], index: int) -> CameraState:
    timeline_actions = trace['timeline']['actions']
    action = timeline_actions[index]
    camera_shot = action.get('cameraShot', action['id'])
    shot_actions = [
        candidate
        for candidate in timeline_actions
        if candidate.get('cameraShot', candidate['id']) == camera_shot
    ]
    return _camera_for_actions(shot_actions)


def project_css_point(
    point: dict[str, float],
    crop_box: tuple[float, float, float, float],
) -> tuple[float, float]:
    left, top, right, bottom = crop_box
    source_x = point['x'] * DEVICE_SCALE_FACTOR
    source_y = point['y'] * DEVICE_SCALE_FACTOR
    return (
        (source_x - left) * OUTPUT_SIZE[0] / (right - left),
        (source_y - top) * OUTPUT_SIZE[1] / (bottom - top),
    )


def cursor_rect_for_hotspot(
    hotspot: tuple[float, float],
) -> tuple[float, float, float, float]:
    return (
        hotspot[0] - CURSOR_HOTSPOT[0],
        hotspot[1] - CURSOR_HOTSPOT[1],
        CURSOR_SIZE[0],
        CURSOR_SIZE[1],
    )


def validate_cursor_rect(cursor_rect: tuple[float, float, float, float]) -> None:
    x, y, width, height = cursor_rect
    if (
        x < CURSOR_SAFE_INSET
        or y < CURSOR_SAFE_INSET
        or x + width > OUTPUT_SIZE[0] - CURSOR_SAFE_INSET
        or y + height > OUTPUT_SIZE[1] - CURSOR_SAFE_INSET
    ):
        raise ValueError('cursor leaves output frame safe inset')


def _interpolate_camera(
    start: CameraState,
    end: CameraState,
    progress: float,
) -> CameraState:
    eased = smootherstep(progress)
    crop_box = tuple(
        mix(start_value, end_value, eased)
        for start_value, end_value in zip(start.crop_box, end.crop_box)
    )
    return CameraState(
        crop_box=crop_box,
        scale=mix(start.scale, end.scale, eased),
    )


def _safe_hotspot(point: tuple[float, float]) -> tuple[float, float]:
    min_x, max_x, min_y, max_y = _safe_hotspot_bounds()
    return (clamp(point[0], min_x, max_x), clamp(point[1], min_y, max_y))


def _cursor_curve(
    start: tuple[float, float],
    end: tuple[float, float],
    progress: float,
) -> tuple[float, float]:
    eased = ease_out_cubic(progress)
    x = mix(start[0], end[0], eased)
    y = mix(start[1], end[1], eased)
    distance = math.hypot(end[0] - start[0], end[1] - start[1])
    if distance > 1.0:
        normal_x = -(end[1] - start[1]) / distance
        normal_y = (end[0] - start[0]) / distance
        arc = math.sin(math.pi * eased) * min(24.0, distance * 0.055)
        x += normal_x * arc
        y += normal_y * arc
    return _safe_hotspot((x, y))


def _action_index_at_time(trace: dict[str, Any], time_ms: float) -> int:
    actions = trace['timeline']['actions']
    for index, action in enumerate(actions):
        if time_ms < action['endMs']:
            return index
    return len(actions) - 1


def scene_at_time(trace: dict[str, Any], time_seconds: float) -> str:
    time_ms = time_seconds * 1000
    actions = trace['timeline']['actions']
    index = _action_index_at_time(trace, time_ms)
    action = actions[index]
    state_start = action['interactionMs'] + action['feedbackMs']
    if time_ms < state_start:
        return action['beforeScene']
    if action.get('kind') == 'type':
        delay = action.get('typingDelayMs', 60)
        scene_index = int(max(0.0, time_ms - state_start) // delay)
        return action['typingScenes'][min(scene_index, len(action['typingScenes']) - 1)]['scene']
    return action['afterScene']


def _scene_transition(
    trace: dict[str, Any],
    index: int,
    time_ms: float,
) -> tuple[str | None, str, float]:
    actions = trace['timeline']['actions']
    action = actions[index]
    if index > 0 and time_ms < action['startMs'] + SCENE_BLEND_MS:
        previous = actions[index - 1]['afterScene']
        current = action['beforeScene']
        progress = smootherstep(
            (time_ms - action['startMs']) / SCENE_BLEND_MS
        )
        return previous, current, progress
    return None, scene_at_time(trace, time_ms / 1000), 1.0


def frame_state(trace: dict[str, Any], time_seconds: float) -> FrameState:
    time_ms = clamp(time_seconds * 1000, 0.0, trace['timeline']['durationMs'] - 1)
    actions = trace['timeline']['actions']
    index = _action_index_at_time(trace, time_ms)
    action = actions[index]
    target_camera = camera_for_trace_action(trace, index)

    if index > 0 and time_ms < action['startMs'] + action['cameraMoveMs']:
        previous_camera = camera_for_trace_action(trace, index - 1)
        camera = _interpolate_camera(
            previous_camera,
            target_camera,
            (time_ms - action['startMs']) / max(1.0, action['cameraMoveMs']),
        )
    else:
        camera = target_camera

    target_hotspot = _safe_hotspot(project_css_point(action['clickPoint'], camera.crop_box))
    if index == 0:
        previous_hotspot = _safe_hotspot((OUTPUT_SIZE[0] * 0.50, OUTPUT_SIZE[1] * 0.18))
    else:
        previous_action = actions[index - 1]
        previous_hotspot = _safe_hotspot(project_css_point(
            previous_action['clickPoint'], camera.crop_box,
        ))

    travel_start = action.get(
        'travelStartMs',
        action['startMs'] + action['cameraMoveMs'] + action['cameraSettleMs'],
    )
    travel_end = travel_start + action['travelMs']
    if time_ms <= travel_start:
        cursor_hotspot = previous_hotspot
    elif time_ms < travel_end:
        cursor_hotspot = _cursor_curve(
            previous_hotspot,
            target_hotspot,
            (time_ms - travel_start) / max(1.0, action['travelMs']),
        )
    else:
        cursor_hotspot = target_hotspot
    cursor_rect = cursor_rect_for_hotspot(cursor_hotspot)
    validate_cursor_rect(cursor_rect)

    click_progress = None
    if action.get('kind') != 'type':
        raw_click_progress = (time_ms - action['interactionMs']) / 300
        if 0.0 <= raw_click_progress <= 1.0:
            click_progress = raw_click_progress

    previous_scene, scene, scene_blend = _scene_transition(trace, index, time_ms)
    return FrameState(
        camera=camera,
        cursor_hotspot=cursor_hotspot,
        cursor_rect=cursor_rect,
        scene=scene,
        previous_scene=previous_scene,
        scene_blend=scene_blend,
        click_progress=click_progress,
    )


def _render_camera(
    scene: Image.Image,
    crop_box: tuple[float, float, float, float],
) -> Image.Image:
    return scene.crop(crop_box).resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)


def _add_click_accent(
    frame: Image.Image,
    hotspot: tuple[float, float],
    progress: float | None,
) -> None:
    if progress is None:
        return
    eased = smootherstep(progress)
    radius = mix(18.0, 58.0, eased)
    alpha = round(mix(185.0, 0.0, eased))
    overlay = Image.new('RGBA', OUTPUT_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x, y = hotspot
    draw.ellipse(
        (x - radius, y - radius, x + radius, y + radius),
        outline=(73, 139, 255, alpha),
        width=6,
    )
    frame.alpha_composite(overlay)


def _add_cursor(
    frame: Image.Image,
    cursor: Image.Image,
    state: FrameState,
    time_seconds: float,
    trace: dict[str, Any],
) -> None:
    compression = 1.0
    action = trace['timeline']['actions'][_action_index_at_time(trace, time_seconds * 1000)]
    if action.get('kind') != 'type':
        compression = 1.0 - (
            0.08 * math.exp(-((time_seconds - action['interactionMs'] / 1000) / 0.065) ** 2)
        )
    rendered = cursor.resize(
        (CURSOR_SIZE[0], max(1, round(CURSOR_SIZE[1] * compression))),
        Image.Resampling.LANCZOS,
    )
    x, y, _, _ = state.cursor_rect
    frame.alpha_composite(rendered, (round(x), round(y)))


def _scene_loader(scene_dir: Path):
    @lru_cache(maxsize=8)
    def load(name: str) -> Image.Image:
        path = scene_dir / name
        with Image.open(path) as source:
            if source.size != SOURCE_SIZE:
                raise ValueError(f'{path} must be 3840x2160, got {source.size}')
            return source.convert('RGB')

    return load


def render_frame(
    trace: dict[str, Any],
    load_scene,
    cursor: Image.Image,
    time_seconds: float,
) -> Image.Image:
    state = frame_state(trace, time_seconds)
    current = _render_camera(load_scene(state.scene), state.camera.crop_box)
    if state.previous_scene and state.scene_blend < 1.0:
        previous = _render_camera(load_scene(state.previous_scene), state.camera.crop_box)
        current = Image.blend(previous, current, state.scene_blend)
    composed = current.convert('RGBA')
    _add_click_accent(composed, state.cursor_hotspot, state.click_progress)
    _add_cursor(composed, cursor, state, time_seconds, trace)
    return composed.convert('RGB')


def find_ffmpeg(explicit_path: str | None) -> Path:
    if explicit_path:
        candidate = Path(explicit_path).expanduser()
        if candidate.is_file():
            return candidate
        raise FileNotFoundError(f'ffmpeg not found at {candidate}')
    system_ffmpeg = shutil.which('ffmpeg')
    if system_ffmpeg:
        return Path(system_ffmpeg)
    raise FileNotFoundError('ffmpeg was not found on PATH')


def preferred_encoder(ffmpeg: Path) -> str:
    result = subprocess.run(
        [str(ffmpeg), '-hide_banner', '-encoders'],
        check=True,
        capture_output=True,
        text=True,
    )
    available = result.stdout + result.stderr
    encoder_names = {
        fields[1]
        for line in available.splitlines()
        if len(fields := line.split()) > 1
    }
    if 'libvpx' in encoder_names:
        return 'libvpx'
    raise RuntimeError('ffmpeg does not provide the browser-safe libvpx VP8 encoder')


def build_encoder_command(
    ffmpeg: Path,
    encoder: str,
    output_path: Path,
) -> list[str]:
    return [
        str(ffmpeg),
        '-hide_banner', '-loglevel', 'error',
        '-f', 'rawvideo',
        '-pixel_format', 'rgb24',
        '-video_size', f'{OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]}',
        '-framerate', str(FPS), '-i', 'pipe:0',
        '-an', '-c:v', encoder,
        '-b:v', f'{VIDEO_BITRATE_KBPS}k',
        '-deadline', 'good', '-cpu-used', '2',
        '-pix_fmt', 'yuv420p',
        '-f', 'webm', '-y', str(output_path),
    ]


def validate_every_cursor_frame(trace: dict[str, Any]) -> None:
    frame_count = math.ceil(trace['timeline']['durationMs'] / 1000 * FPS)
    for frame_index in range(frame_count):
        validate_cursor_rect(frame_state(trace, frame_index / FPS).cursor_rect)


def poster_time_seconds(trace: dict[str, Any]) -> float:
    """Use the final completed form, before Save replaces or closes its surface."""
    actions = trace['timeline']['actions']
    final_save = next(
        (action for action in reversed(actions) if action.get('kind') == 'save'),
        None,
    )
    if final_save is None:
        return max(0.0, trace['timeline']['durationMs'] / 1000 - 0.10)
    return max(0.0, (final_save['startMs'] - 1) / 1000)


def poster_cursor(cursor: Image.Image) -> Image.Image:
    return Image.new('RGBA', cursor.size, (0, 0, 0, 0))


def render_poster_to_path(
    capture: TraceCapture,
    cursor: Image.Image,
    destination: Path,
) -> None:
    load_scene = _scene_loader(capture.scene_dir)
    render_frame(
        capture.data,
        load_scene,
        poster_cursor(cursor),
        poster_time_seconds(capture.data),
    ).save(destination, optimize=True)


def render_poster(
    capture: TraceCapture,
    output_dir: Path,
    cursor: Image.Image,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = f'{capture.channel}-{capture.theme}'
    poster_path = output_dir / f'campaign-preview-{stem}.png'
    temporary_poster = output_dir / f'.campaign-preview-{stem}.tmp.png'
    render_poster_to_path(capture, cursor, temporary_poster)
    os.replace(temporary_poster, poster_path)


def render_walkthrough(
    capture: TraceCapture,
    output_dir: Path,
    cursor: Image.Image,
    ffmpeg: Path,
) -> None:
    trace = capture.data
    validate_every_cursor_frame(trace)
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = f'{capture.channel}-{capture.theme}'
    output_path = output_dir / f'campaign-walkthrough-{stem}.webm'
    poster_path = output_dir / f'campaign-preview-{stem}.png'
    temporary_output = output_dir / f'.campaign-walkthrough-{stem}.tmp.webm'
    temporary_poster = output_dir / f'.campaign-preview-{stem}.tmp.png'
    duration_seconds = trace['timeline']['durationMs'] / 1000
    frame_count = math.ceil(duration_seconds * FPS)
    load_scene = _scene_loader(capture.scene_dir)

    render_poster_to_path(capture, cursor, temporary_poster)

    encoder = preferred_encoder(ffmpeg)
    command = build_encoder_command(ffmpeg, encoder, temporary_output)
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    if process.stdin is None:
        raise RuntimeError('Unable to open ffmpeg stdin')
    try:
        for frame_index in range(frame_count):
            frame = render_frame(trace, load_scene, cursor, frame_index / FPS)
            process.stdin.write(frame.tobytes())
    finally:
        process.stdin.close()

    return_code = process.wait()
    if return_code != 0:
        temporary_output.unlink(missing_ok=True)
        temporary_poster.unlink(missing_ok=True)
        raise RuntimeError(
            f'ffmpeg failed for {capture.channel}/{capture.theme} with exit code {return_code}'
        )
    os.replace(temporary_output, output_path)
    os.replace(temporary_poster, poster_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--channel', choices=CHANNELS)
    parser.add_argument('--theme', choices=THEMES)
    parser.add_argument('--posters-only', action='store_true')
    parser.add_argument('--ffmpeg')
    parser.add_argument(
        '--cursor',
        type=Path,
        default=Path(
            '/System/Library/CoreServices/StageManagerOnboarding.app/Contents/'
            'Resources/StageManager_DK.ca/assets/cursor-big_pp.png'
        ),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    channels = (args.channel,) if args.channel else CHANNELS
    themes = (args.theme,) if args.theme else THEMES
    captures: dict[tuple[str, str], TraceCapture] = {}
    for channel in channels:
        for theme in themes:
            capture = load_trace(
                args.source_dir.resolve() / theme / channel / 'trace.json'
            )
            captures[(channel, theme)] = capture

    for channel in channels:
        if (channel, 'light') in captures and (channel, 'dark') in captures:
            validate_theme_parity(
                captures[(channel, 'light')].data,
                captures[(channel, 'dark')].data,
            )

    ffmpeg = None if args.posters_only else find_ffmpeg(args.ffmpeg)
    with Image.open(args.cursor) as cursor_source:
        cursor = cursor_source.convert('RGBA').resize(CURSOR_SIZE, Image.Resampling.LANCZOS)
    for theme in themes:
        for channel in channels:
            print(f'Rendering {channel}/{theme}...', flush=True)
            capture = captures[(channel, theme)]
            if args.posters_only:
                render_poster(capture, args.output_dir, cursor)
            else:
                assert ffmpeg is not None
                render_walkthrough(capture, args.output_dir, cursor, ffmpeg)


if __name__ == '__main__':
    main()
