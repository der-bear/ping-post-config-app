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
    def test_generates_a_compact_six_second_loop_for_both_themes(self):
        self.assertEqual(walkthroughs.THEMES, ('light', 'dark'))
        self.assertEqual(walkthroughs.DURATION_SECONDS, 6)
        self.assertEqual(walkthroughs.FRAME_COUNT, walkthroughs.FPS * 6)

    def test_first_tab_click_happens_at_one_second(self):
        self.assertGreaterEqual(walkthroughs.TAB_CLICK_SECONDS, 0.9)
        self.assertLessEqual(walkthroughs.TAB_CLICK_SECONDS, 1.05)
        self.assertGreater(walkthroughs.cursor_travel(0.7), 0.95)

    def test_each_channel_uses_the_approved_destination_action(self):
        actions = {item.channel: item.action for item in walkthroughs.WALKTHROUGHS}
        self.assertEqual(actions, {
            'web': 'scroll',
            'ping-post': 'scroll',
            'phone': 'add',
            'chat': 'add',
        })

    def test_theme_specific_asset_names_are_stable(self):
        web = next(item for item in walkthroughs.WALKTHROUGHS if item.channel == 'web')
        self.assertEqual(web.asset_stem('light'), 'web-light')
        self.assertEqual(web.asset_stem('dark'), 'web-dark')

    def test_each_walkthrough_uses_progressive_configuration_scenes(self):
        expected_suffixes = ['selected', 'step-1', 'step-2', 'step-3', 'destination']

        for walkthrough in walkthroughs.WALKTHROUGHS:
            self.assertEqual(
                [step.scene_suffix for step in walkthrough.steps],
                expected_suffixes,
            )
            self.assertEqual(
                [step.at_seconds for step in walkthrough.steps],
                sorted(step.at_seconds for step in walkthrough.steps),
            )
            self.assertTrue(all(step.pointer_target for step in walkthrough.steps))

    def test_camera_tracks_each_step_without_zooming_out(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            initial_scale, _ = walkthroughs.camera_state(walkthrough, 0.5)
            for sample in (1.0, 1.7, 2.6, 3.5, 4.5, 5.8):
                scale, _ = walkthroughs.camera_state(walkthrough, sample)
                self.assertGreaterEqual(scale, initial_scale)

            _, final_focus = walkthroughs.camera_state(walkthrough, 5.8)
            self.assertEqual(final_focus, walkthrough.steps[-1].focus)

    def test_every_walkthrough_starts_with_a_close_navigation_view(self):
        for walkthrough in walkthroughs.WALKTHROUGHS:
            scale, focus = walkthroughs.camera_state(walkthrough, 0.5)
            self.assertGreaterEqual(scale, 1.9)
            self.assertEqual(focus, (680.0, 140.0))


if __name__ == '__main__':
    unittest.main()
