#!/usr/bin/env python3
"""Extract transparent PNG cutouts for floating product display (no background box)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
SETS = ROOT / "public" / "catalog" / "sets"
CUTOUTS = ROOT / "public" / "catalog" / "cutouts"


def cutout(input_path: Path, output_path: Path, size: int = 1400) -> None:
    raw = Image.open(input_path).convert("RGBA")
    cut = remove(raw)
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)

    rgb = cut.convert("RGB")
    rgb = ImageOps.autocontrast(rgb, cutoff=1)
    rgb = ImageEnhance.Color(rgb).enhance(1.05)
    cut = Image.merge("RGBA", (*rgb.split(), cut.split()[-1]))

    padding = int(size * 0.18)
    max_side = size - padding * 2
    cut.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    cw, ch = cut.size
    aspect = ch / cw if cw else 1
    if aspect > 1.12:
        canvas_w = size
        canvas_h = int(size * aspect) + padding
    else:
        canvas_w = canvas_h = size

    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    x = (canvas_w - cut.size[0]) // 2
    y = (canvas_h - cut.size[1]) // 2
    canvas.paste(cut, (x, y), cut)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, "PNG", optimize=True)
    print(f"  ✓ {output_path.name}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="*", help="Files or dirs; default: all *-packaging.jpg")
    args = parser.parse_args()

    files: list[Path] = []
    if args.inputs:
        for p in args.inputs:
            path = Path(p)
            if path.is_dir():
                files.extend(sorted(path.glob("*-packaging.jpg")))
            else:
                files.append(path)
    else:
        files = sorted(SETS.glob("*-packaging.jpg"))
        files.extend(sorted(SETS.glob("*-contents.jpg")))

    hero = ROOT / "public" / "catalog" / "hero-main.jpg"
    if hero.exists():
        files.append(hero)

    if not files:
        print("No images found.", file=sys.stderr)
        return 1

    print(f"Cutting out {len(files)} images → {CUTOUTS}/")
    for f in files:
        name = f.stem.replace("-packaging", "").replace("hero-main", "hero-main")
        if f.name == "hero-main.jpg":
            out = CUTOUTS / "hero-main.png"
        elif "-contents" in f.stem:
            slug = f.stem.replace("-contents", "")
            out = CUTOUTS / f"{slug}-contents.png"
        else:
            slug = f.stem.replace("-packaging", "")
            out = CUTOUTS / f"{slug}-packaging.png"
        try:
            cutout(f, out)
        except Exception as e:
            print(f"  ✗ {f.name}: {e}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
