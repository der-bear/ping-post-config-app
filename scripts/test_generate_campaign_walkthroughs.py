from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).with_name('generate-campaign-walkthroughs.py')
SPEC = importlib.util.spec_from_file_location('campaign_walkthroughs', SCRIPT_PATH)
assert SPEC and SPEC.loader
walkthroughs = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = walkthroughs
SPEC.loader.exec_module(walkthroughs)


class WalkthroughTimelineTests(unittest.TestCase):
    def test_generates_a_ten_second_1080p_loop_for_both_themes(self):
        self.assertEqual(walkthroughs.THEMES, ('light', 'dark'))
        self.assertEqual(walkthroughs.DURATION_SECONDS, 10)
        self.assertEqual(walkthroughs.FRAME_COUNT, walkthroughs.FPS * 10)
        self.assertEqual(walkthroughs.OUTPUT_SIZE, (1920, 1080))
        self.assertEqual(walkthroughs.SOURCE_SIZE, (3840, 2160))

    def test_first_tab_click_happens_at_one_second(self):
        self.assertGreaterEqual(walkthroughs.TAB_CLICK_SECONDS, 0.9)
        self.assertLessEqual(walkthroughs.TAB_CLICK_SECONDS, 1.05)
        self.assertGreater(walkthroughs.cursor_travel(0.7), 0.95)

    def test_each_channel_reaches_the_approved_configuration_outcome(self):
        final_actions = {
            item.channel: item.actions[-1].name
            for item in walkthroughs.WALKTHROUGHS
        }
        self.assertEqual(final_actions, {
            'web': 'save-general-settings',
            'ping-post': 'save-ping-field',
            'phone': 'save-ivr-number',
            'chat': 'save-chat-properties',
        })

    def test_theme_specific_asset_names_are_stable(self):
        web = next(item for item in walkthroughs.WALKTHROUGHS if item.channel == 'web')
        self.assertEqual(web.asset_stem('light'), 'web-light')
        self.assertEqual(web.asset_stem('dark'), 'web-dark')

    def test_each_walkthrough_uses_ordered_realistic_actions_and_a_final_hold(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            action_times = [action.at_seconds for action in walkthrough.actions]
            self.assertEqual(action_times, sorted(action_times))
            self.assertGreaterEqual(len(walkthrough.actions), 6)
            self.assertTrue(all(action.pointer_target for action in walkthrough.actions))
            self.assertTrue(all(action.dwell_seconds >= 0.3 for action in walkthrough.actions))
            self.assertTrue(all(action.scene_delay_seconds >= 0.12 for action in walkthrough.actions))
            self.assertGreaterEqual(walkthrough.final_hold_seconds, 1.0)
            self.assertLessEqual(
                walkthrough.actions[-1].at_seconds + walkthrough.final_hold_seconds,
                walkthroughs.DURATION_SECONDS,
            )

    def test_camera_settles_before_every_action(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            for action in walkthrough.actions:
                before = walkthroughs.camera_state(
                    walkthrough,
                    action.at_seconds - (action.dwell_seconds / 2),
                )
                during = walkthroughs.camera_state(walkthrough, action.at_seconds)
                after = walkthroughs.camera_state(
                    walkthrough,
                    action.at_seconds + (action.dwell_seconds / 2),
                )
                self.assertEqual(before, during)
                self.assertEqual(during, after)

    def test_camera_cues_are_ordered_and_do_not_overlap(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            previous_end = 0.0
            for cue in walkthrough.camera_cues:
                self.assertGreaterEqual(cue.start_seconds, previous_end)
                self.assertGreater(cue.end_seconds, cue.start_seconds)
                previous_end = cue.end_seconds

    def test_every_walkthrough_uses_a_directed_adaptive_close_up(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            initial_scale, focus = walkthroughs.camera_state(walkthrough, 0.5)
            cue_scales = [
                scale
                for cue in walkthrough.camera_cues
                for scale in (cue.start_scale, cue.end_scale)
            ]
            final_scale, _ = walkthroughs.camera_state(walkthrough, 9.5)

            self.assertGreaterEqual(initial_scale, 2.05)
            self.assertEqual(focus, (1360.0, 280.0))
            self.assertGreaterEqual(min(cue_scales), 1.82)
            self.assertLessEqual(max(cue_scales), 2.3)
            self.assertTrue(any(scale >= 2.18 for scale in cue_scales[2:]))
            self.assertGreaterEqual(final_scale, 1.82)

    def test_each_configuration_action_keeps_labels_and_values_readable(self):
        """All task shots after tab selection use a semantic-block close-up."""
        for walkthrough in walkthroughs.WALKTHROUGHS:
            for action in walkthrough.actions[1:-1]:
                scale, _ = walkthroughs.camera_state(
                    walkthrough,
                    action.at_seconds,
                )
                with self.subTest(channel=walkthrough.channel, action=action.name):
                    self.assertGreaterEqual(scale, 2.18)

    def test_completion_shot_keeps_the_last_edit_and_save_action_in_frame(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            final_scale, (focus_x, focus_y) = walkthroughs.camera_state(
                walkthrough,
                walkthrough.actions[-1].at_seconds,
            )
            crop_width, crop_height = walkthroughs.crop_size(
                walkthroughs.SOURCE_SIZE,
                final_scale,
            )
            safe_left = focus_x - (crop_width * 0.42)
            safe_right = focus_x + (crop_width * 0.42)
            safe_top = focus_y - (crop_height * 0.42)
            safe_bottom = focus_y + (crop_height * 0.42)

            for action in walkthrough.actions[-2:]:
                with self.subTest(channel=walkthrough.channel, action=action.name):
                    pointer_x, pointer_y = action.pointer_target
                    self.assertGreaterEqual(pointer_x, safe_left)
                    self.assertLessEqual(pointer_x, safe_right)
                    self.assertGreaterEqual(pointer_y, safe_top)
                    self.assertLessEqual(pointer_y, safe_bottom)

    def test_field_actions_keep_the_label_and_value_inside_the_safe_frame(self):
        required_anchors = {
            'web': {
                'set-inactive-status': ((1000, 470), (1400, 564)),
                'select-revenue-share': ((1050, 900), (1400, 1064)),
                'enter-payout': ((1050, 900), (1400, 1064)),
            },
            'ping-post': {
                'enter-profit-value': ((1100, 320), (1600, 420)),
                'enable-delivery-requirement': ((1100, 750), (1600, 820)),
                'search-lead-field': ((1500, 980), (2050, 1078)),
                'select-lead-field': ((1500, 980), (2050, 1264)),
            },
            'phone': {
                'enter-number-name': ((1450, 700), (2050, 802)),
                'select-call-flow': ((1450, 1110), (2050, 1220)),
            },
            'chat': {
                'fill-chat-identity': ((1100, 390), (1700, 476)),
                'select-message-flow': ((2200, 390), (2550, 476)),
                'fill-company-agent': ((1200, 920), (2300, 1016)),
                'enter-welcome-message': ((1150, 1220), (2050, 1330)),
                'enable-chat-options': ((1150, 1710), (2300, 1894)),
            },
        }

        for walkthrough in walkthroughs.WALKTHROUGHS:
            actions = {action.name: action for action in walkthrough.actions}
            for action_name, anchors in required_anchors[walkthrough.channel].items():
                action = actions[action_name]
                scale, (focus_x, focus_y) = walkthroughs.camera_state(
                    walkthrough,
                    action.at_seconds,
                )
                crop_width, crop_height = walkthroughs.crop_size(
                    walkthroughs.SOURCE_SIZE,
                    scale,
                )
                safe_left = focus_x - (crop_width * 0.42)
                safe_right = focus_x + (crop_width * 0.42)
                safe_top = focus_y - (crop_height * 0.42)
                safe_bottom = focus_y + (crop_height * 0.42)

                for anchor_name, (anchor_x, anchor_y) in zip(
                    ('label', 'value'),
                    anchors,
                ):
                    with self.subTest(
                        channel=walkthrough.channel,
                        action=action_name,
                        anchor=anchor_name,
                    ):
                        self.assertGreaterEqual(anchor_x, safe_left)
                        self.assertLessEqual(anchor_x, safe_right)
                        self.assertGreaterEqual(anchor_y, safe_top)
                        self.assertLessEqual(anchor_y, safe_bottom)

    def test_crop_validation_allows_only_a_small_readability_upscale(self):
        self.assertEqual(
            walkthroughs.crop_size(walkthroughs.SOURCE_SIZE, 2.0),
            walkthroughs.OUTPUT_SIZE,
        )
        walkthroughs.validate_crop(walkthroughs.SOURCE_SIZE, 2.0)
        self.assertEqual(
            walkthroughs.crop_size(walkthroughs.SOURCE_SIZE, 2.3),
            (1670, 939),
        )
        walkthroughs.validate_crop(walkthroughs.SOURCE_SIZE, 2.3)
        with self.assertRaisesRegex(ValueError, 'upscal'):
            walkthroughs.validate_crop(walkthroughs.SOURCE_SIZE, 2.31)


if __name__ == '__main__':
    unittest.main()
