import importlib.util
import json
import shutil
import subprocess
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

    def test_escape_filter_path(self):
        self.assertEqual(render.escape_filter_path("/tmp/captions.ass"), "/tmp/captions.ass")
        self.assertEqual(render.escape_filter_path("C:\\\\video files\\\\captions.ass"), "C\\\\:video files/captions.ass")

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

    def test_all_60_catalog_styles_render_a_caption(self):
        self.assertEqual(len(render.STYLES), 60)
        with tempfile.TemporaryDirectory() as directory:
            for style_id, style in render.STYLES.items():
                output = Path(directory) / f"{style_id}.ass"
                render.make_ass(
                    {"segments": [{"start": 0.25, "end": 1.5, "text": "quality check"}]},
                    style,
                    output,
                )
                ass = output.read_text(encoding="utf-8-sig")
                self.assertIn("Dialogue:", ass, style_id)
                self.assertIn("quality check", ass, style_id)

    def test_styles_have_visibly_distinct_ass_definitions(self):
        outputs = set()
        with tempfile.TemporaryDirectory() as directory:
            for style_id, style in render.STYLES.items():
                output = Path(directory) / f"{style_id}.ass"
                render.make_ass({"segments": [{"start": 0, "end": 1, "text": "style check"}]}, style, output)
                ass = output.read_text(encoding="utf-8-sig")
                outputs.add(ass.split("[Events]", 1)[0])
        self.assertGreaterEqual(len(outputs), 20, "Catalog styles should not all render identically")

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "FFmpeg/ffprobe are required for integration test")
    def test_ffmpeg_exports_valid_h264_aac_mp4(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "source.mp4"
            transcript = root / "transcript.json"
            output = root / "captioned.mp4"
            subprocess.run([
                "ffmpeg", "-v", "error", "-y",
                "-f", "lavfi", "-i", "color=c=black:s=640x360:d=2:r=24",
                "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
                "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-c:a", "aac", str(source),
            ], check=True, capture_output=True, text=True)
            transcript.write_text(json.dumps({"segments": [{"start": 0.2, "end": 1.5, "text": "quality check"}]}), encoding="utf-8")
            subprocess.run([
                "python", str(RENDER_PATH), str(source), str(transcript), "style-04", str(output)
            ], check=True, capture_output=True, text=True, timeout=90)
            probe = subprocess.run([
                "ffprobe", "-v", "error", "-show_entries", "stream=codec_name,codec_type",
                "-of", "json", str(output)
            ], check=True, capture_output=True, text=True)
            streams = json.loads(probe.stdout)["streams"]
            self.assertTrue(output.exists() and output.stat().st_size > 0)
            self.assertIn({"codec_name": "h264", "codec_type": "video"}, streams)
            self.assertIn({"codec_name": "aac", "codec_type": "audio"}, streams)

    def test_empty_transcript(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "empty.ass"
            render.make_ass({"segments": []}, render.STYLES["style-01"], output)
            ass = output.read_text(encoding="utf-8-sig")
        self.assertIn("[Events]", ass)
        self.assertNotIn("Dialogue:", ass)

if __name__ == "__main__":
    unittest.main()
