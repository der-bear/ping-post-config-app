#!/usr/bin/env python3
"""Generate polished 1080p campaign walkthrough loops from real editor captures."""

from __future__ import annotations

import argparse
import glob
import math
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


FPS = 30
DURATION_SECONDS = 6
FRAME_COUNT = FPS * DURATION_SECONDS
OUTPUT_SIZE = (1920, 1080)
CAPTURE_CROP = (0, 0, 1920, 1080)
THEMES = ('light', 'dark')
TAB_CLICK_SECONDS = 0.98
CAMERA_SCALE = 2.04
SCENE_BLEND_SECONDS = 0.14


@dataclass(frozen=True)
class WalkthroughStep:
    scene_suffix: str
    at_seconds: float
    focus: tuple[float, float]
    pointer_target: tuple[float, float]


@dataclass(frozen=True)
class Walkthrough:
    channel: str
    action: str
    tab_target: tuple[float, float]
    steps: tuple[WalkthroughStep, ...]

    def asset_stem(self, theme: str) -> str:
        if theme not in THEMES:
            raise ValueError(f'Unsupported theme: {theme}')
        return f'{self.channel}-{theme}'


WALKTHROUGHS = (
    Walkthrough(
        'web',
        'scroll',
        (637, 54),
        (
            WalkthroughStep('selected', TAB_CLICK_SECONDS, (680, 140), (637, 54)),
            WalkthroughStep('step-1', 1.70, (1120, 190), (1050, 178)),
            WalkthroughStep('step-2', 2.65, (1120, 350), (1050, 325)),
            WalkthroughStep('step-3', 3.60, (1120, 570), (1050, 560)),
            WalkthroughStep('destination', 4.65, (1120, 760), (1050, 740)),
        ),
    ),
    Walkthrough(
        'ping-post',
        'scroll',
        (637, 144),
        (
            WalkthroughStep('selected', TAB_CLICK_SECONDS, (680, 140), (637, 144)),
            WalkthroughStep('step-1', 1.65, (1120, 220), (1000, 165)),
            WalkthroughStep('step-2', 2.55, (1120, 420), (1000, 360)),
            WalkthroughStep('step-3', 3.45, (1120, 620), (1000, 590)),
            WalkthroughStep('destination', 4.50, (1120, 820), (820, 820)),
        ),
    ),
    Walkthrough(
        'phone',
        'add',
        (637, 144),
        (
            WalkthroughStep('selected', TAB_CLICK_SECONDS, (680, 140), (637, 144)),
            WalkthroughStep('step-1', 1.65, (920, 310), (793, 124)),
            WalkthroughStep('step-2', 2.55, (960, 560), (1050, 690)),
            WalkthroughStep('step-3', 3.45, (960, 600), (1050, 560)),
            WalkthroughStep('destination', 4.50, (960, 720), (1050, 690)),
        ),
    ),
    Walkthrough(
        'chat',
        'add',
        (637, 144),
        (
            WalkthroughStep('selected', TAB_CLICK_SECONDS, (680, 140), (637, 144)),
            WalkthroughStep('step-1', 1.65, (960, 260), (793, 124)),
            WalkthroughStep('step-2', 2.55, (960, 420), (1250, 330)),
            WalkthroughStep('step-3', 3.45, (960, 650), (1040, 650)),
            WalkthroughStep('destination', 4.50, (960, 850), (1450, 840)),
        ),
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
        if source.size != OUTPUT_SIZE:
            raise ValueError(f'{path} must be 1920x1080, got {source.size}')
        return source.convert('RGB').crop(CAPTURE_CROP)


def camera_state(
    walkthrough: Walkthrough,
    time_seconds: float,
) -> tuple[float, tuple[float, float]]:
    nav_focus = (680.0, 140.0)
    previous_time = 1.06
    previous_focus = nav_focus

    if time_seconds <= previous_time:
        return CAMERA_SCALE, nav_focus

    for step in walkthrough.steps[1:]:
        if time_seconds <= step.at_seconds:
            progress = smootherstep(
                (time_seconds - previous_time) / (step.at_seconds - previous_time)
            )
            return CAMERA_SCALE, (
                mix(previous_focus[0], step.focus[0], progress),
                mix(previous_focus[1], step.focus[1], progress),
            )
        previous_time = step.at_seconds
        previous_focus = step.focus

    return CAMERA_SCALE, walkthrough.steps[-1].focus


def render_camera(
    scene: Image.Image,
    scale: float,
    focus: tuple[float, float],
) -> tuple[Image.Image, tuple[float, float, float, float]]:
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
    for step in walkthrough.steps:
        if time_seconds < step.at_seconds:
            return scenes[previous_suffix]
        if time_seconds < step.at_seconds + SCENE_BLEND_SECONDS:
            progress = smootherstep(
                (time_seconds - step.at_seconds) / SCENE_BLEND_SECONDS
            )
            return Image.blend(
                scenes[previous_suffix],
                scenes[step.scene_suffix],
                progress,
            )
        previous_suffix = step.scene_suffix

    return scenes[walkthrough.steps[-1].scene_suffix]


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
    for step_index, step in enumerate(walkthrough.steps):
        arrival_time = step.at_seconds - (0.24 if step_index else 0.28)
        if time_seconds <= step.at_seconds + 0.16:
            progress = ease_out_cubic(
                (time_seconds - previous_time) / max(0.01, arrival_time - previous_time)
            )
            position = (
                mix(previous_position[0], step.pointer_target[0], progress),
                mix(previous_position[1], step.pointer_target[1], progress),
            )
            compression = 1.0 - (
                0.09 * math.exp(-((time_seconds - step.at_seconds) / 0.065) ** 2)
            )
            return position, 1.0, compression
        previous_time = step.at_seconds + 0.16
        previous_position = step.pointer_target

    opacity = 1.0 - smoothstep((time_seconds - 5.55) / 0.30)
    return walkthrough.steps[-1].pointer_target, opacity, 1.0


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

    for step in walkthrough.steps:
        step_position = scene_to_frame(step.pointer_target, crop_box)
        add_click_accent(composed, step_position, time_seconds, step.at_seconds)
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
    scene_suffixes = ('start', *(step.scene_suffix for step in walkthrough.steps))
    scenes = {
        suffix: load_scene(theme_dir / f'{walkthrough.channel}-{suffix}.png')
        for suffix in scene_suffixes
    }
    output_path = output_dir / f'campaign-walkthrough-{stem}.webm'
    poster_path = output_dir / f'campaign-preview-{stem}.png'

    render_frame(walkthrough, scenes, cursor, 5.40).save(poster_path, optimize=True)

    command = [
        str(ffmpeg),
        '-hide_banner',
        '-loglevel', 'error',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg',
        '-framerate', str(FPS),
        '-i', 'pipe:0',
        '-an',
        '-c:v', 'libvpx',
        '-b:v', '6500k',
        '-deadline', 'good',
        '-cpu-used', '2',
        '-pix_fmt', 'yuv420p',
        '-f', 'webm',
        '-y',
        str(output_path),
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
        raise RuntimeError(
            f'ffmpeg failed for {walkthrough.channel}/{theme} with exit code {return_code}'
        )


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
