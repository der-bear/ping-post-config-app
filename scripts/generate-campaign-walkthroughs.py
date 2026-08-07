#!/usr/bin/env python3
"""Generate polished 1080p campaign walkthrough loops from real editor captures."""

from __future__ import annotations

import argparse
import glob
import math
import os
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


FPS = 30
DURATION_SECONDS = 10
FRAME_COUNT = FPS * DURATION_SECONDS
OUTPUT_SIZE = (1920, 1080)
SOURCE_SIZE = (3840, 2160)
THEMES = ('light', 'dark')
TAB_CLICK_SECONDS = 0.98
SCENE_BLEND_SECONDS = 0.06
MAX_CAMERA_SCALE = 2.3


@dataclass(frozen=True)
class ActionCue:
    name: str
    scene: str
    at_seconds: float
    pointer_target: tuple[float, float]
    dwell_seconds: float = 0.36
    scene_delay_seconds: float = 0.14


@dataclass(frozen=True)
class CameraCue:
    start_seconds: float
    end_seconds: float
    start_focus: tuple[float, float]
    end_focus: tuple[float, float]
    start_scale: float
    end_scale: float


@dataclass(frozen=True)
class Walkthrough:
    channel: str
    tab_target: tuple[float, float]
    actions: tuple[ActionCue, ...]
    camera_cues: tuple[CameraCue, ...]
    final_hold_seconds: float

    def asset_stem(self, theme: str) -> str:
        if theme not in THEMES:
            raise ValueError(f'Unsupported theme: {theme}')
        return f'{self.channel}-{theme}'


NAV_FOCUS = (1360.0, 280.0)
NAV_SCALE = 2.10


def camera_move(
    start_seconds: float,
    end_seconds: float,
    start_focus: tuple[float, float],
    end_focus: tuple[float, float],
    start_scale: float = NAV_SCALE,
    end_scale: float = NAV_SCALE,
) -> CameraCue:
    return CameraCue(
        start_seconds,
        end_seconds,
        start_focus,
        end_focus,
        start_scale,
        end_scale,
    )


WALKTHROUGHS = (
    Walkthrough(
        'web',
        (840, 114),
        (
            ActionCue('open-general-tab', 'tab-selected', 1.00, (840, 114)),
            ActionCue('set-inactive-status', 'status-inactive', 2.35, (2276, 564)),
            ActionCue('set-active-status', 'status-active', 3.25, (2276, 564)),
            ActionCue('select-revenue-share', 'pricing-selected', 4.55, (1130, 946)),
            ActionCue('enter-payout', 'payout-value', 5.65, (1600, 1064)),
            ActionCue('save-general-settings', 'complete', 8.55, (3167, 2032)),
        ),
        (
            camera_move(1.38, 1.92, NAV_FOCUS, (1400.0, 520.0), NAV_SCALE, 2.22),
            camera_move(3.68, 4.12, (1400.0, 520.0), (1500.0, 1000.0), 2.22, 2.28),
            camera_move(7.38, 8.02, (1500.0, 1000.0), (2300.0, 1550.0), 2.28, 1.82),
        ),
        1.15,
    ),
    Walkthrough(
        'ping-post',
        (840, 308),
        (
            ActionCue('open-ping-options', 'tab-selected', 1.00, (840, 308)),
            ActionCue('enable-profit-requirement', 'profit-enabled', 2.25, (1160, 310)),
            ActionCue('enter-profit-value', 'profit-value', 3.20, (2240, 420)),
            ActionCue('enable-delivery-requirement', 'delivery-enabled', 4.35, (1160, 820)),
            ActionCue('open-field-dialog', 'field-dialog', 5.55, (1200, 1404)),
            ActionCue('search-lead-field', 'field-search', 6.35, (2048, 1078)),
            ActionCue('select-lead-field', 'field-selected', 7.15, (2048, 1264)),
            ActionCue('save-ping-field', 'complete', 8.70, (2460, 1335)),
        ),
        (
            camera_move(1.38, 1.86, NAV_FOCUS, (1600.0, 380.0), NAV_SCALE, 2.24),
            camera_move(3.58, 3.98, (1600.0, 380.0), (1550.0, 780.0), 2.24, 2.25),
            camera_move(4.73, 5.18, (1550.0, 780.0), (1750.0, 1450.0), 2.25, 2.20),
            camera_move(5.92, 6.10, (1750.0, 1450.0), (1800.0, 1080.0), 2.20, 2.30),
            camera_move(7.52, 8.12, (1800.0, 1080.0), (2100.0, 1400.0), 2.30, 1.88),
        ),
        1.10,
    ),
    Walkthrough(
        'phone',
        (840, 308),
        (
            ActionCue('open-phone-numbers', 'tab-selected', 1.00, (840, 308)),
            ActionCue('add-ivr-number', 'ivr-dialog', 2.20, (1170, 264)),
            ActionCue('enter-number-name', 'name-filled', 3.10, (2048, 802)),
            ActionCue('purchase-new-number', 'purchase-dialog', 4.15, (1588, 1706)),
            ActionCue('select-phone-number', 'number-selected', 5.25, (2048, 1406)),
            ActionCue('confirm-purchase', 'number-purchased', 6.10, (2600, 1868)),
            ActionCue('select-call-flow', 'flow-selected', 7.15, (2048, 1220)),
            ActionCue('save-ivr-number', 'complete', 8.70, (2466, 1599)),
        ),
        (
            camera_move(1.38, 1.82, NAV_FOCUS, (1500.0, 300.0), NAV_SCALE, 2.20),
            camera_move(2.58, 2.82, (1500.0, 300.0), (1980.0, 760.0), 2.20, 2.30),
            camera_move(3.48, 3.82, (1980.0, 760.0), (1550.0, 1480.0), 2.30, 2.20),
            camera_move(4.53, 4.72, (1550.0, 1480.0), (2000.0, 1250.0), 2.20, 2.24),
            camera_move(4.78, 5.00, (2000.0, 1250.0), (2050.0, 1400.0), 2.24, 2.26),
            camera_move(5.61, 5.82, (2050.0, 1400.0), (2420.0, 1660.0), 2.26, 2.22),
            camera_move(6.30, 6.66, (2420.0, 1660.0), (2100.0, 1250.0), 2.22, 2.30),
            camera_move(7.53, 8.15, (2100.0, 1250.0), (2050.0, 1450.0), 2.30, 1.86),
        ),
        1.10,
    ),
    Walkthrough(
        'chat',
        (840, 308),
        (
            ActionCue('open-web-chats', 'tab-selected', 1.00, (840, 308)),
            ActionCue('add-web-chat', 'chat-dialog', 2.15, (1170, 264)),
            ActionCue('fill-chat-identity', 'identity-filled', 3.30, (1540, 476)),
            ActionCue('select-message-flow', 'message-flow', 4.20, (2550, 476)),
            ActionCue('fill-company-agent', 'profile-filled', 5.25, (1480, 1016)),
            ActionCue('enter-welcome-message', 'welcome-filled', 6.25, (2048, 1330)),
            ActionCue('enable-chat-options', 'options-enabled', 7.35, (2134, 1894)),
            ActionCue('save-chat-properties', 'complete', 8.70, (2785, 2030)),
        ),
        (
            camera_move(1.38, 1.78, NAV_FOCUS, (1500.0, 300.0), NAV_SCALE, 2.20),
            camera_move(2.53, 2.88, (1500.0, 300.0), (1825.0, 500.0), 2.20, 2.20),
            camera_move(4.58, 4.88, (1825.0, 500.0), (1750.0, 1000.0), 2.20, 2.28),
            camera_move(5.63, 5.92, (1750.0, 1000.0), (1650.0, 1300.0), 2.28, 2.30),
            camera_move(6.63, 6.98, (1650.0, 1300.0), (1725.0, 1800.0), 2.30, 2.28),
            camera_move(7.73, 8.18, (1725.0, 1800.0), (2100.0, 1750.0), 2.28, 1.86),
        ),
        1.10,
    ),
)


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def smoothstep(value: float) -> float:
    progress = clamp(value, 0.0, 1.0)
    return progress * progress * (3.0 - 2.0 * progress)


def smootherstep(value: float) -> float:
    """Fifth-order easing keeps both velocity and acceleration quiet at joins."""
    progress = clamp(value, 0.0, 1.0)
    return progress ** 3 * (progress * (progress * 6.0 - 15.0) + 10.0)


def ease_out_cubic(value: float) -> float:
    progress = clamp(value, 0.0, 1.0)
    return 1.0 - ((1.0 - progress) ** 3)


def mix(start: float, end: float, progress: float) -> float:
    return start + ((end - start) * progress)


def cursor_travel(time_seconds: float) -> float:
    """Make the pointer arrive at the tab in under seven tenths of a second."""
    return ease_out_cubic((time_seconds - 0.08) / 0.58)


def find_ffmpeg(explicit_path: str | None) -> Path:
    if explicit_path:
        candidate = Path(explicit_path).expanduser()
        if candidate.is_file():
            return candidate
        raise FileNotFoundError(f'ffmpeg not found at {candidate}')

    matches = sorted(glob.glob(str(
        Path.home() / 'Library/Caches/ms-playwright/ffmpeg-*/ffmpeg-mac'
    )))
    if not matches:
        raise FileNotFoundError('Playwright ffmpeg-mac was not found')
    return Path(matches[-1])


def load_scene(path: Path) -> Image.Image:
    with Image.open(path) as source:
        if source.size != SOURCE_SIZE:
            raise ValueError(f'{path} must be 3840x2160, got {source.size}')
        return source.convert('RGB')


def crop_size(
    source_size: tuple[int, int],
    scale: float,
) -> tuple[int, int]:
    return (
        round(source_size[0] / scale),
        round(source_size[1] / scale),
    )


def validate_crop(source_size: tuple[int, int], scale: float) -> None:
    if scale > MAX_CAMERA_SCALE:
        raise ValueError(
            'Camera crop would require excessive upscaling: '
            f'{scale:.2f}x exceeds the {MAX_CAMERA_SCALE:.2f}x quality limit'
        )
    width, height = crop_size(source_size, scale)
    if width <= 0 or height <= 0:
        raise ValueError('Camera crop has invalid dimensions')


def camera_state(
    walkthrough: Walkthrough,
    time_seconds: float,
) -> tuple[float, tuple[float, float]]:
    if not walkthrough.camera_cues:
        return NAV_SCALE, NAV_FOCUS

    first_cue = walkthrough.camera_cues[0]
    if time_seconds < first_cue.start_seconds:
        return first_cue.start_scale, first_cue.start_focus

    previous_scale = first_cue.start_scale
    previous_focus = first_cue.start_focus
    for cue in walkthrough.camera_cues:
        if time_seconds < cue.start_seconds:
            return previous_scale, previous_focus
        if time_seconds <= cue.end_seconds:
            progress = smootherstep(
                (time_seconds - cue.start_seconds)
                / (cue.end_seconds - cue.start_seconds)
            )
            return (
                mix(cue.start_scale, cue.end_scale, progress),
                (
                    mix(cue.start_focus[0], cue.end_focus[0], progress),
                    mix(cue.start_focus[1], cue.end_focus[1], progress),
                ),
            )
        previous_scale = cue.end_scale
        previous_focus = cue.end_focus

    return previous_scale, previous_focus


def render_camera(
    scene: Image.Image,
    scale: float,
    focus: tuple[float, float],
) -> tuple[Image.Image, tuple[float, float, float, float]]:
    validate_crop(scene.size, scale)
    crop_width = scene.width / scale
    crop_height = scene.height / scale
    left = clamp(focus[0] - (crop_width / 2), 0.0, scene.width - crop_width)
    top = clamp(focus[1] - (crop_height / 2), 0.0, scene.height - crop_height)
    crop_box = (left, top, left + crop_width, top + crop_height)
    frame = scene.crop(crop_box).resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)
    return frame, crop_box


def scene_to_frame(
    point: tuple[float, float],
    crop_box: tuple[float, float, float, float],
) -> tuple[float, float]:
    left, top, right, bottom = crop_box
    return (
        (point[0] - left) * OUTPUT_SIZE[0] / (right - left),
        (point[1] - top) * OUTPUT_SIZE[1] / (bottom - top),
    )


def select_scene(
    walkthrough: Walkthrough,
    scenes: dict[str, Image.Image],
    time_seconds: float,
) -> Image.Image:
    previous_suffix = 'start'
    for action in walkthrough.actions:
        scene_change_seconds = action.at_seconds + action.scene_delay_seconds
        if time_seconds < scene_change_seconds:
            return scenes[previous_suffix]
        if time_seconds < scene_change_seconds + SCENE_BLEND_SECONDS:
            progress = smootherstep(
                (time_seconds - scene_change_seconds) / SCENE_BLEND_SECONDS
            )
            return Image.blend(
                scenes[previous_suffix],
                scenes[action.scene],
                progress,
            )
        previous_suffix = action.scene

    return scenes[walkthrough.actions[-1].scene]


def add_click_accent(
    frame: Image.Image,
    position: tuple[float, float],
    time_seconds: float,
    click_time: float,
) -> None:
    click_progress = (time_seconds - click_time) / 0.30
    if click_progress < 0.0 or click_progress > 1.0:
        return

    progress = smoothstep(click_progress)
    radius = mix(18.0, 60.0, progress)
    alpha = round(mix(185.0, 0.0, progress))
    overlay = Image.new('RGBA', OUTPUT_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x, y = position
    draw.ellipse(
        (x - radius, y - radius, x + radius, y + radius),
        outline=(73, 139, 255, alpha),
        width=6,
    )
    frame.alpha_composite(overlay)


def pointer_scene_position(
    walkthrough: Walkthrough,
    time_seconds: float,
) -> tuple[tuple[float, float], float, float] | None:
    if time_seconds < 0.08:
        return (900.0, 240.0), 1.0, 1.0

    previous_time = 0.08
    previous_position = (900.0, 240.0)
    for action_index, action in enumerate(walkthrough.actions):
        arrival_time = action.at_seconds - (0.24 if action_index else 0.28)
        if time_seconds <= action.at_seconds + action.dwell_seconds:
            progress = ease_out_cubic(
                (time_seconds - previous_time) / max(0.01, arrival_time - previous_time)
            )
            position = (
                mix(previous_position[0], action.pointer_target[0], progress),
                mix(previous_position[1], action.pointer_target[1], progress),
            )
            compression = 1.0 - (
                0.09 * math.exp(-((time_seconds - action.at_seconds) / 0.065) ** 2)
            )
            return position, 1.0, compression
        previous_time = action.at_seconds + action.dwell_seconds
        previous_position = action.pointer_target

    fade_start = DURATION_SECONDS - 0.45
    opacity = 1.0 - smoothstep((time_seconds - fade_start) / 0.30)
    return walkthrough.actions[-1].pointer_target, opacity, 1.0


def add_pointer(
    frame: Image.Image,
    cursor: Image.Image,
    walkthrough: Walkthrough,
    crop_box: tuple[float, float, float, float],
    time_seconds: float,
) -> None:
    pointer = pointer_scene_position(walkthrough, time_seconds)
    if not pointer:
        return

    scene_position, opacity, compression = pointer
    if opacity <= 0.0:
        return

    frame_position = scene_to_frame(scene_position, crop_box)
    cursor_size = (
        max(1, round(cursor.width * compression)),
        max(1, round(cursor.height * compression)),
    )
    rendered_cursor = cursor.resize(cursor_size, Image.Resampling.LANCZOS)
    if opacity < 1.0:
        alpha = rendered_cursor.getchannel('A').point(lambda value: round(value * opacity))
        rendered_cursor.putalpha(alpha)

    frame.alpha_composite(
        rendered_cursor,
        (round(frame_position[0] - 5), round(frame_position[1] - 4)),
    )


def render_frame(
    walkthrough: Walkthrough,
    scenes: dict[str, Image.Image],
    cursor: Image.Image,
    time_seconds: float,
) -> Image.Image:
    active_scene = select_scene(walkthrough, scenes, time_seconds)
    scale, focus = camera_state(walkthrough, time_seconds)
    rendered, crop_box = render_camera(active_scene, scale, focus)
    composed = rendered.convert('RGBA')

    for action in walkthrough.actions:
        step_position = scene_to_frame(action.pointer_target, crop_box)
        add_click_accent(composed, step_position, time_seconds, action.at_seconds)
    add_pointer(composed, cursor, walkthrough, crop_box, time_seconds)
    return composed.convert('RGB')


def render_walkthrough(
    walkthrough: Walkthrough,
    theme: str,
    source_dir: Path,
    output_dir: Path,
    cursor: Image.Image,
    ffmpeg: Path,
) -> None:
    theme_dir = source_dir / theme
    stem = walkthrough.asset_stem(theme)
    scene_suffixes = ('start', *(action.scene for action in walkthrough.actions))
    scenes = {
        suffix: load_scene(theme_dir / f'{walkthrough.channel}-{suffix}.png')
        for suffix in scene_suffixes
    }
    output_path = output_dir / f'campaign-walkthrough-{stem}.webm'
    poster_path = output_dir / f'campaign-preview-{stem}.png'
    temporary_output_path = output_dir / f'.campaign-walkthrough-{stem}.tmp.webm'
    temporary_poster_path = output_dir / f'.campaign-preview-{stem}.tmp.png'

    render_frame(
        walkthrough,
        scenes,
        cursor,
        DURATION_SECONDS - 0.10,
    ).save(temporary_poster_path, optimize=True)

    encoder = preferred_encoder(ffmpeg)
    command = [
        str(ffmpeg),
        '-hide_banner',
        '-loglevel', 'error',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-framerate', str(FPS),
        '-i', 'pipe:0',
        '-an',
        '-c:v', encoder,
        '-b:v', '8500k',
        '-deadline', 'good',
        '-cpu-used', '2',
        '-pix_fmt', 'yuv420p',
        '-f', 'webm',
        '-y',
        str(temporary_output_path),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    if process.stdin is None:
        raise RuntimeError('Unable to open ffmpeg stdin')

    try:
        for frame_index in range(FRAME_COUNT):
            frame = render_frame(
                walkthrough,
                scenes,
                cursor,
                frame_index / FPS,
            )
            frame.save(
                process.stdin,
                format='JPEG',
                quality=95,
                subsampling=0,
            )
    finally:
        process.stdin.close()

    return_code = process.wait()
    if return_code != 0:
        temporary_output_path.unlink(missing_ok=True)
        temporary_poster_path.unlink(missing_ok=True)
        raise RuntimeError(
            f'ffmpeg failed for {walkthrough.channel}/{theme} with exit code {return_code}'
        )
    os.replace(temporary_output_path, output_path)
    os.replace(temporary_poster_path, poster_path)


def preferred_encoder(ffmpeg: Path) -> str:
    result = subprocess.run(
        [str(ffmpeg), '-hide_banner', '-encoders'],
        check=True,
        capture_output=True,
        text=True,
    )
    available = result.stdout + result.stderr
    if 'libvpx-vp9' in available:
        return 'libvpx-vp9'
    if 'libvpx' in available:
        return 'libvpx'
    raise RuntimeError('ffmpeg provides neither libvpx-vp9 nor libvpx')


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
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
    source_dir = args.source_dir.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    ffmpeg = find_ffmpeg(args.ffmpeg)

    with Image.open(args.cursor) as cursor_source:
        cursor = cursor_source.convert('RGBA').resize((54, 72), Image.Resampling.LANCZOS)

    for theme in THEMES:
        for walkthrough in WALKTHROUGHS:
            print(f'Generating {walkthrough.channel}/{theme} walkthrough...', flush=True)
            render_walkthrough(walkthrough, theme, source_dir, output_dir, cursor, ffmpeg)


if __name__ == '__main__':
    main()
