import json
import os
import sys
from faster_whisper import WhisperModel

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing video path"}), file=sys.stderr)
        return 2
    video_path = sys.argv[1]
    requested_language = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] not in ("", "auto") else None
    model_name = os.getenv("WHISPER_MODEL", "small")
    device = os.getenv("WHISPER_DEVICE", "cpu")
    compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    model = WhisperModel(model_name, device=device, compute_type=compute_type, download_root=os.getenv("WHISPER_MODEL_DIR", "/tmp/whisper-models"))
    segments, info = model.transcribe(
        video_path,
        language=requested_language,
        task="transcribe",
        word_timestamps=True,
        vad_filter=True,
        beam_size=5,
    )
    result_segments = []
    for segment in segments:
        words = []
        for word in (segment.words or []):
            words.append({
                "start": round(float(word.start), 3),
                "end": round(float(word.end), 3),
                "text": word.word,
                "probability": round(float(word.probability), 4),
            })
        result_segments.append({
            "start": round(float(segment.start), 3),
            "end": round(float(segment.end), 3),
            "text": segment.text.strip(),
            "words": words,
        })
    print(json.dumps({
        "language": info.language,
        "languageProbability": round(float(info.language_probability), 4),
        "duration": round(float(info.duration), 3),
        "model": model_name,
        "segments": result_segments,
    }, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
