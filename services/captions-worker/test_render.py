import importlib.util
import tempfile
import unittest
from pathlib import Path

RENDER_PATH = Path(__file__).parent / "src" / "render.py"
SPEC = importlib.util.spec_from_file_location("captions_render", RENDER_PATH)
render = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(render)

class RenderTests(unittest.TestCase):
    def test_ass_time(self):
        self.assertEqual(render.ass_time(1.239), "0:00:01.23")
        self.assertEqual(render.ass_time(-3), "0:00:00.00")

    def test_ass_color(self):
        self.assertEqual(render.ass_color("#12ABEF"), "&H00EFAB12")

    def test_escape_braces_and_newlines(self):
        escaped = render.ass_escape("hello {world}\nnext")
        self.assertIn(r"\{world\}", escaped)
        self.assertIn(r"\N", escaped)

    def test_make_ass_writes_dialogue_and_valid_reset_tag(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "captions.ass"
            render.make_ass({"segments": [{"start": 1.0, "end": 2.5, "text": "hello there"}]}, render.STYLES["style-04"], output)
            ass = output.read_text(encoding="utf-8-sig")
        self.assertIn("Dialogue: 0,0:00:01.00", ass)
        self.assertIn(r"{\rCaption}", ass)
        self.assertNotIn(r"{\\rCaption}", ass)

    def test_empty_transcript(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "empty.ass"
            render.make_ass({"segments": []}, render.STYLES["style-01"], output)
            ass = output.read_text(encoding="utf-8-sig")
        self.assertIn("[Events]", ass)
        self.assertNotIn("Dialogue:", ass)

if __name__ == "__main__":
    unittest.main()
