import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STYLES = {item["id"]: item for item in json.loads((ROOT / "styles.json").read_text(encoding="utf-8"))}

def ass_time(seconds):
    seconds = max(0.0, float(seconds))
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    whole = int(seconds % 60)
    centiseconds = int((seconds - int(seconds)) * 100)
    return f"{hours}:{minutes:02d}:{whole:02d}.{centiseconds:02d}"

def ass_color(hex_color):
    value = hex_color.lstrip("#")
    r, g, b = (int(value[i:i+2], 16) for i in (0, 2, 4))
    return f"&H00{b:02X}{g:02X}{r:02X}"

def ass_escape(text):
    return str(text).replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}").replace("\n", r"\N")

def escape_filter_path(path):
    """Escape a filesystem path for FFmpeg's subtitles filter argument."""
    return str(path).replace("\\", "/").replace(":", r"\:")

def make_ass(transcript, style, output_path):
    primary = ass_color(style["primary"])
    accent = ass_color(style["accent"])
    bold = -1 if style["weight"] == "bold" else 0
    font = "Arial"
    outline = 3 if style["effect"] in ("box", "banner", "button", "bubble", "paint", "highlight") else 2
    shadow = 1 if style["effect"] in ("glow", "gradient", "motion", "arrow") else 0
    alignment = 2
    margin_v = 72
    back = "&H99000000" if style["effect"] in ("box", "banner", "button", "bubble", "blocks") else "&H80000000"
    border_style = 3 if style["effect"] in ("box", "banner", "button", "bubble", "blocks") else 1
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,{font},66,{primary},{accent},&H00101010,{back},{bold},0,0,0,100,100,0,0,{border_style},{outline},{shadow},{alignment},100,100,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [header]
    segments = transcript.get("segments", [])
    for segment in segments:
        start = float(segment.get("start", 0))
        end = max(start + 0.08, float(segment.get("end", start + 0.5)))
        text = str(segment.get("text", "")).strip()
        if not text:
            continue
        words = text.split()
        if style["effect"] in ("stack", "blocks", "highlight", "brush", "paint", "glitch", "slant"):
            # Keep captions readable and short; break long speech into timed chunks.
            chunks = [words[i:i+5] for i in range(0, len(words), 5)]
            duration = (end - start) / max(1, len(chunks))
            for index, chunk in enumerate(chunks):
                chunk_text = " ".join(chunk)
                if style["effect"] in ("highlight", "blocks"):
                    chunk_text = r"{\bord4\3c" + accent + r"}" + ass_escape(chunk_text) + r"{\rCaption}"
                elif style["effect"] == "glitch":
                    chunk_text = r"{\fax0.06\bord3\3c" + accent + r"}" + ass_escape(chunk_text) + r"{\rCaption}"
                elif style["effect"] == "slant":
                    chunk_text = r"{\i1\frz-3}" + ass_escape(chunk_text) + r"{\rCaption}"
                else:
                    chunk_text = ass_escape(chunk_text)
                lines.append(f"Dialogue: 0,{ass_time(start+index*duration)},{ass_time(start+(index+1)*duration)},Caption,,0,0,0,,{chunk_text}\n")
        else:
            text = ass_escape(text)
            if style["effect"] == "underline":
                text = r"{\u1}" + text + r"{\u0}"
            elif style["effect"] == "glow":
                text = r"{\bord4\blur1\3c" + accent + r"}" + text + r"{\rCaption}"
            elif style["effect"] in ("arrow", "motion"):
                text = r"{\fsp2}" + text + r"{\fsp0}"
            lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Caption,,0,0,0,,{text}\n")
    Path(output_path).write_text("".join(lines), encoding="utf-8-sig")

def main():
    if len(sys.argv) != 5:
        print("Usage: render.py VIDEO TRANSCRIPT_JSON STYLE_ID OUTPUT_MP4", file=sys.stderr)
        return 2
    video, transcript_path, style_id, output = sys.argv[1:]
    if style_id not in STYLES:
        print(json.dumps({"error": "Unknown caption style", "validStyles": len(STYLES)}), file=sys.stderr)
        return 3
    transcript = json.loads(Path(transcript_path).read_text(encoding="utf-8"))
    ass_path = str(Path(output).with_suffix(".ass"))
    make_ass(transcript, STYLES[style_id], ass_path)
    # Burn captions into the video and preserve source audio. Output is H.264/AAC MP4.
    escaped_ass = escape_filter_path(ass_path)
    command = [
        "ffmpeg", "-y", "-i", video, "-vf", f"subtitles='{escaped_ass}'",
        "-map", "0:v:0", "-map", "0:a?", "-c:v", "libx264", "-preset", os.getenv("FFMPEG_PRESET", "veryfast"),
        "-crf", os.getenv("FFMPEG_CRF", "20"), "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", output
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        print(result.stderr[-5000:], file=sys.stderr)
        return result.returncode
    print(json.dumps({"output": output, "styleId": style_id, "styleName": STYLES[style_id]["name"], "bytes": Path(output).stat().st_size}))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
