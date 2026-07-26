#!/usr/bin/env python3
"""Create web-safe optimized image copies without modifying source files."""

from __future__ import annotations

import argparse
import csv
import shutil
from pathlib import Path

from PIL import Image, ImageOps

SUPPORTED = {".png", ".jpg", ".jpeg", ".webp", ".avif"}


def optimize(source: Path, destination: Path, max_width: int, quality: int) -> dict:
    original_size = source.stat().st_size
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        original_width, original_height = image.size
        if original_width > max_width:
            height = round(original_height * max_width / original_width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)
        has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
        output_suffix = ".png" if has_alpha and source.suffix.lower() == ".png" else ".webp"
        output = destination.with_suffix(output_suffix)
        output.parent.mkdir(parents=True, exist_ok=True)
        if output.exists():
            status = "skipped: output exists"
        else:
            save_options = {"optimize": True}
            if output_suffix == ".webp":
                save_options.update({"quality": quality, "method": 6})
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGB")
            image.save(output, **save_options)
            if output.stat().st_size >= original_size and output_suffix == source.suffix.lower():
                shutil.copy2(source, output)
                status = "copied: source already optimized"
            else:
                status = "optimized"
        new_size = output.stat().st_size
        width, height = image.size
    return {
        "original_path": source, "optimized_path": output,
        "original_width": original_width, "original_height": original_height,
        "new_width": width, "new_height": height,
        "original_file_size": original_size, "new_file_size": new_size,
        "reduction_percentage": round((1 - new_size / original_size) * 100, 2),
        "output_format": output_suffix.removeprefix(".").upper(), "processing_status": status,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-width", type=int, default=1200)
    parser.add_argument("--quality", type=int, default=88)
    parser.add_argument("--report", type=Path, default=Path("image_optimization_report.csv"))
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        raise SystemExit("Source and output directories must be different.")
    rows = []
    for source in sorted(args.source.rglob("*")):
        if source.is_file() and source.suffix.lower() in SUPPORTED:
            relative = source.relative_to(args.source)
            row = optimize(source, args.output / relative, args.max_width, args.quality)
            rows.append(row)
            print(f"{relative}: {row['original_file_size']:,} → {row['new_file_size']:,} bytes ({row['reduction_percentage']}%)")
    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", newline="", encoding="utf-8") as report:
        writer = csv.DictWriter(report, fieldnames=rows[0].keys() if rows else [
            "original_path", "optimized_path", "original_width", "original_height", "new_width",
            "new_height", "original_file_size", "new_file_size", "reduction_percentage",
            "output_format", "processing_status",
        ])
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    main()
