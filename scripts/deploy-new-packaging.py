#!/usr/bin/env python3
"""Copy Gemini packaging from catalog-source/new set to public/catalog/sets."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "catalog-source/new set"
DST = ROOT / "public/catalog/sets"

MAPPING = {
    "Gemini_Generated_Image_nz3tmcnz3tmcnz3t.png": "set-3-45",
    "Gemini_Generated_Image_2tlpdv2tlpdv2tlp.png": "set-4-6",
    "Gemini_Generated_Image_omljskomljskomlj.png": "set-5-7",
    "Gemini_Generated_Image_c3vw0kc3vw0kc3vw.png": "set-7-8a",
    "Gemini_Generated_Image_vr9oidvr9oidvr9o.png": "set-8-21",
    "Gemini_Generated_Image_jkgcn1jkgcn1jkgc.png": "set-9-20",
    "Gemini_Generated_Image_98752z98752z9875.png": "set-11-65",
    "Gemini_Generated_Image_5fxt425fxt425fxt.png": "set-12-2",
    "Gemini_Generated_Image_kef2wpkef2wpkef2.png": "set-16-26",
    "Gemini_Generated_Image_vtg73lvtg73lvtg7.png": "set-17-17",
    "Gemini_Generated_Image_xdj4n5xdj4n5xdj4.png": "set-20-35",
}

CONTENTS_PROMPT = """Use the attached reference image only. Do not invent or paraphrase any text, graphics, or colors.

TASK: Studio food flat-lay for premium B2B e-commerce catalog.

Recreate ONLY the candy assortment from the bottom panel of the reference. Ignore packaging, text lists, page borders, titles.

FIDELITY (highest priority):
- Copy every candy wrapper exactly as shown in the reference — same brands, colors, shapes, count, and layout pattern
- Do not redraw wrappers from memory
- Do not add, remove, or substitute candies

COMPOSITION:
- Top-down 90° flat lay on cream marble surface #FAF7F2
- Entire assortment centered in square 1:1 frame
- 12-15% margin on all sides — nothing cropped
- Soft studio lighting, subtle shadows between items
- Photorealistic sharp detail

No packaging box in frame. No catalog page elements."""


def deploy() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    for src_name, slug in MAPPING.items():
        src = SRC / src_name
        if not src.exists():
            raise FileNotFoundError(src)
        img = Image.open(src).convert("RGB")
        for suffix in ("packaging", "thumb"):
            out = DST / f"{slug}-{suffix}.jpg"
            img.save(out, "JPEG", quality=92, optimize=True)
            print(f"Saved {out}")


if __name__ == "__main__":
    deploy()
