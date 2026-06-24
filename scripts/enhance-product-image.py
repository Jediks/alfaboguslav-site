#!/usr/bin/env python3
"""Studio-style product image enhancement: AI background removal + cream backdrop + soft shadow."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from rembg import remove


def add_drop_shadow(
    product: Image.Image,
    canvas_size: tuple[int, int],
    offset: tuple[int, int] = (0, 28),
    blur: int = 42,
    opacity: int = 55,
) -> Image.Image:
    shadow = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    alpha = product.split()[-1]
    shadow_layer = Image.new("RGBA", product.size, (35, 45, 70, opacity))
    shadow_layer.putalpha(alpha)
    shadow.paste(
        shadow_layer,
        (
            (canvas_size[0] - product.size[0]) // 2 + offset[0],
            (canvas_size[1] - product.size[1]) // 2 + offset[1],
        ),
        shadow_layer,
    )
    return shadow.filter(ImageFilter.GaussianBlur(blur))


def enhance_product(
    input_path: Path,
    output_path: Path,
    size: int = 1200,
    bg_color: tuple[int, int, int] = (250, 247, 242),
) -> None:
    raw = Image.open(input_path).convert("RGBA")
    cutout = remove(raw)

  # Trim transparent padding
    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)

    # Slight contrast boost on RGB channels
    rgb = cutout.convert("RGB")
    rgb = ImageOps.autocontrast(rgb, cutoff=1)
    rgb = ImageEnhance.Color(rgb).enhance(1.08)
    cutout = Image.merge("RGBA", (*rgb.split(), cutout.split()[-1]))

    # Fit product into canvas with padding
    padding = int(size * 0.12)
    max_side = size - padding * 2
    cutout.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (*bg_color, 255))

    # Subtle radial vignette for depth
    vignette = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(vignette)
    draw.ellipse((-size * 0.1, -size * 0.1, size * 1.1, size * 1.1), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(size // 6))
    warm = Image.new("RGBA", (size, size), (255, 252, 248, 0))
    warm.putalpha(vignette.point(lambda p: int(p * 0.18)))
    canvas = Image.alpha_composite(canvas, warm)

    shadow = add_drop_shadow(cutout, (size, size))
    canvas = Image.alpha_composite(canvas, shadow)

    x = (size - cutout.size[0]) // 2
    y = (size - cutout.size[1]) // 2 - int(size * 0.02)
    canvas.paste(cutout, (x, y), cutout)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output_path, "JPEG", quality=92, optimize=True)
    print(f"Saved: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("-o", "--output", required=True)
    parser.add_argument("--size", type=int, default=1200)
    args = parser.parse_args()
    enhance_product(Path(args.input), Path(args.output), size=args.size)


if __name__ == "__main__":
    main()
