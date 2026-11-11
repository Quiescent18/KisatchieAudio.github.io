#!/usr/bin/env python3
"""Generate SEO-friendly image COPIES without altering existing portfolio assets."""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance
import json

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "img"
TARGET = SOURCE / "seo-optimized"
TARGET.mkdir(parents=True, exist_ok=True)

def optimize(source: Path, destination: Path, max_width: int, quality: int) -> dict:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original)
        photo = photo.convert("RGB")
        if photo.width > max_width:
            new_height = max(1, round(photo.height * max_width / photo.width))
            photo = photo.resize((max_width, new_height), Image.Resampling.LANCZOS)
        photo.save(destination, "WEBP", quality=quality, method=6)
        return {"source": source.relative_to(ROOT).as_posix(),
                "optimized": destination.relative_to(ROOT).as_posix(),
                "width": photo.width, "height": photo.height,
                "original_bytes": source.stat().st_size,
                "optimized_bytes": destination.stat().st_size}

records = []
records.append(optimize(SOURCE / "intro/faderport.webp", TARGET / "hero.webp", 1800, 78))
records.append(optimize(SOURCE / "intro/headshot.webp", TARGET / "headshot.webp", 900, 82))
for source in sorted((SOURCE / "portfolio").iterdir()):
    if source.suffix.lower() not in {".jpeg", ".jpg", ".png", ".webp"}:
        continue
    records.append(optimize(source, TARGET / "portfolio" / (source.stem + ".webp"), 640, 84))

# Create a universally supported 1200×630 social-sharing card.
with Image.open(SOURCE / "intro/faderport.webp") as raw:
    photo = ImageOps.fit(ImageOps.exif_transpose(raw).convert("RGB"), (1200,630),
                         method=Image.Resampling.LANCZOS, centering=(0.5,0.5))
    photo = ImageEnhance.Brightness(photo).enhance(0.67)
    with Image.open(SOURCE / "intro/logo.webp") as logo_raw:
        logo = logo_raw.convert("RGBA")
        logo.thumbnail((125,125), Image.Resampling.LANCZOS)
        photo.paste(logo.convert("RGB"), (45, 630-logo.height-42))
    photo.save(TARGET / "social-share.jpg", "JPEG", quality=86, optimize=True, progressive=True)

(TARGET / "manifest.json").write_text(json.dumps(records, indent=2)+"\n", encoding="utf-8")
total_original=sum(r["original_bytes"] for r in records)
total_optimized=sum(r["optimized_bytes"] for r in records)
print(f"Optimized {len(records)} files; {total_original/1048576:.2f} MB → {total_optimized/1048576:.2f} MB")
print("Created", TARGET / "social-share.jpg")
