from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT_PATH = Path(__file__).with_name('generate-campaign-walkthroughs.py')
SPEC = importlib.util.spec_from_file_location('campaign_walkthroughs', SCRIPT_PATH)
assert SPEC and SPEC.loader
walkthroughs = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = walkthroughs
SPEC.loader.exec_module(walkthroughs)


def sample_action(**overrides):
    action = {
        'id': 'toggle-profit-requirement',
        'kind': 'toggle',
        'targetRole': 'switch',
        'beforeScene': '000-before.jpg',
        'afterScene': '001-after.jpg',
        'targetRect': {'x': 100, 'y': 100, 'width': 48, 'height': 28},
        'frameRect': {'x': 100, 'y': 100, 'width': 620, 'height': 96},
        'clickPoint': {'x': 124, 'y': 114},
        'stateDelta': ['ping.profit.enabled'],
        'holdMs': 600,
        'startedAtMs': 1000,
    }
    action.update(overrides)
    return action


def sample_trace(actions=None, theme='light'):
    actions = actions or [sample_action()]
    timeline_actions = []
    cursor = 650
    for action in actions:
        start = cursor
        interaction = start + 360 + 200 + 360 + 150
        end = interaction + 120 + 140 + action['holdMs']
        timeline_actions.append({
            **action,
            'startMs': start,
            'cameraMoveMs': 360,
            'cameraSettleMs': 200,
            'travelMs': 360,
            'intentMs': 150,
            'interactionMs': interaction,
            'feedbackMs': 120,
            'stateMs': 140,
            'endMs': end,
        })
        cursor = end
    return {
        'version': 1,
        'channel': 'ping-post',
        'theme': theme,
        'viewport': {'width': 1920, 'height': 1080, 'deviceScaleFactor': 2},
        'actions': actions,
        'timeline': {'actions': timeline_actions, 'durationMs': cursor + 1100},
    }


class TraceValidationTests(unittest.TestCase):
    def test_output_contract_preserves_previous_quality(self):
        self.assertEqual(walkthroughs.OUTPUT_SIZE, (1920, 1080))
        self.assertEqual(walkthroughs.SOURCE_SIZE, (3840, 2160))
        self.assertEqual(walkthroughs.FPS, 30)
        self.assertGreaterEqual(walkthroughs.VIDEO_BITRATE_KBPS, 8_000)
        self.assertEqual(walkthroughs.CURSOR_SAFE_INSET, 18)

    def test_rejects_click_outside_exact_target(self):
        trace = sample_trace([sample_action(clickPoint={'x': 90, 'y': 114})])
        with self.assertRaisesRegex(ValueError, 'outside target rectangle'):
            walkthroughs.validate_trace(trace)

    def test_rejects_toggle_targeting_container_instead_of_switch(self):
        trace = sample_trace([sample_action(targetRole='group')])
        with self.assertRaisesRegex(ValueError, 'switch itself'):
            walkthroughs.validate_trace(trace)

    def test_rejects_multiple_semantic_deltas(self):
        trace = sample_trace([sample_action(
            stateDelta=['chat.companyName', 'chat.agentName'],
        )])
        with self.assertRaisesRegex(ValueError, 'exactly one semantic state delta'):
            walkthroughs.validate_trace(trace)

    def test_load_trace_validates_and_resolves_scene_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            trace_path = Path(directory) / 'trace.json'
            trace_path.write_text(json.dumps(sample_trace()), encoding='utf-8')
            loaded = walkthroughs.load_trace(trace_path)
            self.assertEqual(loaded.channel, 'ping-post')
            self.assertEqual(loaded.theme, 'light')
            self.assertEqual(loaded.scene_dir, trace_path.parent)


class EncoderCompatibilityTests(unittest.TestCase):
    def test_encoder_accepts_lossless_rgb_frames_instead_of_lossy_jpeg_frames(self):
        self.assertTrue(hasattr(walkthroughs, 'build_encoder_command'))

        command = walkthroughs.build_encoder_command(
            Path('/usr/local/bin/ffmpeg'),
            'libvpx',
            Path('/tmp/walkthrough.webm'),
        )

        self.assertEqual(command[command.index('-f') + 1], 'rawvideo')
        self.assertEqual(command[command.index('-pixel_format') + 1], 'rgb24')
        self.assertEqual(command[command.index('-video_size') + 1], '1920x1080')
        self.assertNotIn('mjpeg', command)

    def test_prefers_browser_safe_vp8_when_vp8_and_vp9_are_available(self):
        encoders = subprocess.CompletedProcess(
            args=['ffmpeg', '-encoders'],
            returncode=0,
            stdout=' V....D libvpx-vp9\n V....D libvpx\n',
            stderr='',
        )
        with mock.patch.object(walkthroughs.subprocess, 'run', return_value=encoders):
            encoder = walkthroughs.preferred_encoder(Path('ffmpeg'))

        self.assertEqual(encoder, 'libvpx')


class CameraAndCursorTests(unittest.TestCase):
    def test_action_can_request_a_tighter_semantic_close_up(self):
        action = sample_action(
            kind='save',
            targetRole='button',
            cameraScale=2.24,
        )

        self.assertEqual(walkthroughs.camera_scale_for_action(action), 2.24)

    def test_poster_uses_the_last_completed_configuration_before_save(self):
        trace = sample_trace([
            sample_action(id='type-final-value', kind='type', targetRole='textbox'),
            sample_action(
                id='save-settings',
                kind='save',
                targetRole='button',
                startedAtMs=2000,
            ),
        ])
        save = trace['timeline']['actions'][-1]

        self.assertAlmostEqual(
            walkthroughs.poster_time_seconds(trace),
            (save['startMs'] - 1) / 1000,
        )

    def test_static_poster_does_not_leave_a_pointer_over_stale_ui(self):
        cursor = walkthroughs.Image.new('RGBA', (54, 72), (0, 0, 0, 255))

        poster_cursor = walkthroughs.poster_cursor(cursor)

        self.assertIsNone(poster_cursor.getchannel('A').getbbox())

    def test_dialog_camera_centers_the_full_dialog_region_with_balanced_margins(self):
        action = sample_action(
            id='focus-number-name',
            kind='focus',
            targetRole='textbox',
            cameraMode='dialog',
            targetRect={'x': 760, 'y': 340, 'width': 560, 'height': 40},
            frameRect={'x': 620, 'y': 190, 'width': 800, 'height': 660},
            clickPoint={'x': 940, 'y': 360},
        )

        camera = walkthroughs.camera_for_action(action)
        frame_left = walkthroughs.project_css_point(
            {'x': action['frameRect']['x'], 'y': 360},
            camera.crop_box,
        )[0]
        frame_right = walkthroughs.project_css_point(
            {
                'x': action['frameRect']['x'] + action['frameRect']['width'],
                'y': 360,
            },
            camera.crop_box,
        )[0]

        self.assertAlmostEqual(
            frame_left,
            walkthroughs.OUTPUT_SIZE[0] - frame_right,
            delta=1,
        )

    def test_dialog_save_uses_a_readable_close_up_when_the_final_region_fits(self):
        action = sample_action(
            id='save-ping-field',
            kind='save',
            targetRole='button',
            cameraMode='dialog',
            targetRect={'x': 1220, 'y': 760, 'width': 64, 'height': 40},
            frameRect={'x': 720, 'y': 560, 'width': 600, 'height': 260},
            clickPoint={'x': 1252, 'y': 780},
        )

        camera = walkthroughs.camera_for_action(action)

        self.assertGreaterEqual(camera.scale, 1.8)

    def test_work_camera_uses_a_close_up_without_reserving_navigation_for_empty_width(self):
        action = sample_action(
            id='open-status',
            kind='open',
            targetRole='combobox',
            targetRect={'x': 600, 'y': 330, 'width': 720, 'height': 40},
            frameRect={'x': 520, 'y': 280, 'width': 1096, 'height': 340},
            clickPoint={'x': 720, 'y': 350},
        )

        camera = walkthroughs.camera_for_action(action)
        frame_left = walkthroughs.project_css_point(
            {'x': action['frameRect']['x'], 'y': 350},
            camera.crop_box,
        )[0]
        self.assertGreaterEqual(frame_left, 0)
        self.assertLessEqual(frame_left, 96)
        self.assertGreaterEqual(camera.scale, 2.1)

    def test_camera_keeps_exact_click_hotspot_and_full_cursor_inside_safe_frame(self):
        edge_actions = [
            sample_action(
                id='left',
                targetRect={'x': 0, 'y': 200, 'width': 48, 'height': 28},
                frameRect={'x': 0, 'y': 150, 'width': 460, 'height': 160},
                clickPoint={'x': 24, 'y': 214},
            ),
            sample_action(
                id='right',
                targetRect={'x': 1848, 'y': 820, 'width': 48, 'height': 28},
                frameRect={'x': 1420, 'y': 720, 'width': 500, 'height': 220},
                clickPoint={'x': 1872, 'y': 834},
                startedAtMs=2000,
            ),
        ]
        for action in edge_actions:
            camera = walkthroughs.camera_for_action(action)
            hotspot = walkthroughs.project_css_point(action['clickPoint'], camera.crop_box)
            cursor_rect = walkthroughs.cursor_rect_for_hotspot(hotspot)
            walkthroughs.validate_cursor_rect(cursor_rect)

    def test_cursor_path_is_safe_for_every_rendered_frame(self):
        trace = sample_trace([
            sample_action(id='first'),
            sample_action(
                id='second',
                targetRect={'x': 1700, 'y': 900, 'width': 120, 'height': 40},
                frameRect={'x': 1500, 'y': 780, 'width': 380, 'height': 200},
                clickPoint={'x': 1760, 'y': 920},
                startedAtMs=2000,
            ),
        ])
        walkthroughs.validate_trace(trace)
        for frame_index in range(
            int(trace['timeline']['durationMs'] / 1000 * walkthroughs.FPS),
        ):
            state = walkthroughs.frame_state(trace, frame_index / walkthroughs.FPS)
            walkthroughs.validate_cursor_rect(state.cursor_rect)

    def test_camera_is_stationary_during_intent_click_and_state_change(self):
        trace = sample_trace()
        action = trace['timeline']['actions'][0]
        before_click = walkthroughs.frame_state(
            trace,
            (action['interactionMs'] - 100) / 1000,
        ).camera
        after_click = walkthroughs.frame_state(
            trace,
            (action['interactionMs'] + action['feedbackMs'] + 50) / 1000,
        ).camera
        self.assertEqual(before_click.crop_box, after_click.crop_box)

    def test_typing_scene_advances_one_character_at_a_time(self):
        typing = sample_action(
            id='type-profit-value',
            kind='type',
            targetRole='textbox',
            text='35',
            typingDelayMs=60,
            typingScenes=[
                {'scene': '010-empty.jpg', 'value': ''},
                {'scene': '011-3.jpg', 'value': '3'},
                {'scene': '012-35.jpg', 'value': '35'},
            ],
            afterScene='012-35.jpg',
        )
        trace = sample_trace([typing])
        timeline = trace['timeline']['actions'][0]
        timeline['stateMs'] = 180
        timeline['endMs'] = timeline['interactionMs'] + 120 + 180 + 600
        trace['timeline']['durationMs'] = timeline['endMs'] + 1100

        start_seconds = (timeline['interactionMs'] + timeline['feedbackMs']) / 1000
        self.assertEqual(walkthroughs.scene_at_time(trace, start_seconds), '010-empty.jpg')
        self.assertEqual(walkthroughs.scene_at_time(trace, start_seconds + .065), '011-3.jpg')
        self.assertEqual(walkthroughs.scene_at_time(trace, start_seconds + .125), '012-35.jpg')

    def test_actions_in_one_semantic_shot_keep_one_camera_state(self):
        first = sample_action(
            id='focus-profit',
            cameraShot='profit',
            targetRect={'x': 560, 'y': 380, 'width': 260, 'height': 40},
            frameRect={'x': 500, 'y': 320, 'width': 420, 'height': 180},
            clickPoint={'x': 640, 'y': 400},
        )
        second = sample_action(
            id='type-profit',
            cameraShot='profit',
            targetRect={'x': 1160, 'y': 600, 'width': 260, 'height': 40},
            frameRect={'x': 1000, 'y': 520, 'width': 520, 'height': 180},
            clickPoint={'x': 1240, 'y': 620},
            startedAtMs=2000,
        )
        trace = sample_trace([first, second])
        first_time = (trace['timeline']['actions'][0]['interactionMs'] - 50) / 1000
        second_time = (trace['timeline']['actions'][1]['interactionMs'] - 50) / 1000

        first_camera = walkthroughs.frame_state(trace, first_time).camera
        second_camera = walkthroughs.frame_state(trace, second_time).camera
        self.assertEqual(first_camera.crop_box, second_camera.crop_box)

    def test_scene_crossfade_finishes_quickly_instead_of_lasting_for_camera_move(self):
        first = sample_action(id='first', cameraShot='first-shot')
        second = sample_action(
            id='second',
            cameraShot='second-shot',
            clickPoint={'x': 500, 'y': 360},
            startedAtMs=2000,
        )
        trace = sample_trace([first, second])
        second_timeline = trace['timeline']['actions'][1]
        state = walkthroughs.frame_state(
            trace,
            (second_timeline['startMs'] + 100) / 1000,
        )

        self.assertEqual(state.scene_blend, 1.0)

    def test_completion_shot_keeps_last_configuration_label_and_save_click_visible(self):
        action = sample_action(
            id='save-general-settings',
            kind='save',
            targetRole='button',
            targetRect={'x': 1562, 'y': 1004, 'width': 54, 'height': 32},
            frameRect={'x': 520, 'y': 433, 'width': 1096, 'height': 603},
            clickPoint={'x': 1589, 'y': 1020},
        )
        camera = walkthroughs.camera_for_action(action)
        label_anchor = walkthroughs.project_css_point(
            {'x': 520, 'y': 540},
            camera.crop_box,
        )
        save_anchor = walkthroughs.project_css_point(action['clickPoint'], camera.crop_box)

        self.assertGreaterEqual(label_anchor[0], walkthroughs.CURSOR_SAFE_INSET)
        self.assertLessEqual(save_anchor[0], walkthroughs.OUTPUT_SIZE[0] - walkthroughs.CURSOR_SAFE_INSET)


class ThemeParityTests(unittest.TestCase):
    def test_light_and_dark_require_identical_action_structure(self):
        light = sample_trace(theme='light')
        dark = sample_trace(theme='dark')
        walkthroughs.validate_theme_parity(light, dark)
        dark['actions'][0]['id'] = 'different-action'
        with self.assertRaisesRegex(ValueError, 'structurally identical'):
            walkthroughs.validate_theme_parity(light, dark)


if __name__ == '__main__':
    unittest.main()
