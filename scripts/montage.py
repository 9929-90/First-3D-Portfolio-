#!/usr/bin/env python3
"""Montage galaxy sweep screenshots into a labeled grid for one-shot inspection."""
import sys
from PIL import Image, ImageDraw

paths = sys.argv[1:]
cols = 3
rows = (len(paths) + cols - 1) // cols
TW = 760  # thumb width
TH = int(TW * 9 / 16)
pad = 8
W = cols * TW + (cols + 1) * pad
H = rows * TH + (rows + 1) * pad + rows * 22

canvas = Image.new("RGB", (W, H), (10, 10, 12))
d = ImageDraw.Draw(canvas)
for i, p in enumerate(paths):
    im = Image.open(p).convert("RGB")
    im = im.resize((TW, TH), Image.LANCZOS)
    r, c = divmod(i, cols)
    x = pad + c * (TW + pad)
    y = pad + r * (TH + pad + 22)
    canvas.paste(im, (x, y))
    d.text((x + 4, y + TH + 4), p.split("/")[-1], fill=(180, 190, 200))
canvas.save("/tmp/shots/montage.png", quality=88)
print("saved", canvas.size)
