from PIL import Image
from pathlib import Path

src = Path(r"F:\Haroon Projects\ISO Brain AI\ISOBrain Logo.png")
out_dir = Path(r"F:\Haroon Projects\ISO Brain AI\scalafrodriguez-front_end-main\public")
app_dir = Path(r"F:\Haroon Projects\ISO Brain AI\scalafrodriguez-front_end-main\app")

img = Image.open(src).convert("RGBA")
print("size", img.size, "mode", img.mode)

# Canonical full logo — exact attached asset
img.save(out_dir / "isobrain-logo.png", optimize=True)
img.convert("RGB").save(out_dir / "isobrain-logo.jpg", quality=95, optimize=True)

arr = img.load()
w, h = img.size

# B mark is in the upper band; restrict Y so wordmark blue isn't included
y_min = int(h * 0.08)
y_max = int(h * 0.48)

blue_xs, blue_ys = [], []
for y in range(y_min, y_max):
    for x in range(0, w, 2):
        r, g, b, a = arr[x, y]
        # Bright blue/cyan of the mark (not near-black bg)
        if b > 100 and b >= r + 20 and b >= g + 5 and (r + g + b) > 120:
            blue_xs.append(x)
            blue_ys.append(y)

print(
    "icon blue bbox",
    min(blue_xs),
    min(blue_ys),
    max(blue_xs),
    max(blue_ys),
    "count",
    len(blue_xs),
)

bx0, by0, bx1, by1 = min(blue_xs), min(blue_ys), max(blue_xs), max(blue_ys)
pad = int(max(bx1 - bx0, by1 - by0) * 0.10)
side = max(bx1 - bx0, by1 - by0) + pad * 2
cx, cy = (bx0 + bx1) // 2, (by0 + by1) // 2
left = max(0, cx - side // 2)
top = max(0, cy - side // 2)
right = min(w, left + side)
bottom = min(h, top + side)
left = max(0, right - side)
top = max(0, bottom - side)

icon = img.crop((left, top, right, bottom)).convert("RGBA")
pixels = icon.load()
iw, ih = icon.size
for y in range(ih):
    for x in range(iw):
        r, g, b, a = pixels[x, y]
        # Transparent near-black background for use on light UI
        if r < 28 and g < 28 and b < 28:
            pixels[x, y] = (0, 0, 0, 0)

icon_512 = icon.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(out_dir / "Icon.png", optimize=True)
icon_512.save(out_dir / "isobrain-icon.png", optimize=True)

for name, size in [
    ("favicon-16x16.png", 16),
    ("favicon-32x32.png", 32),
    ("apple-touch-icon.png", 180),
]:
    # Favicons: composite on white for browser chrome clarity
    layer = icon.resize((size, size), Image.Resampling.LANCZOS)
    base = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    base.alpha_composite(layer)
    base.convert("RGB").save(out_dir / name, optimize=True)

# Multi-size ICO
ico_sizes = []
for s in (16, 32, 48):
    layer = icon.resize((s, s), Image.Resampling.LANCZOS)
    base = Image.new("RGBA", (s, s), (255, 255, 255, 255))
    base.alpha_composite(layer)
    ico_sizes.append(base.convert("RGBA"))
ico_sizes[0].save(
    out_dir / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=ico_sizes[1:],
)

icon_512.save(app_dir / "icon.png", optimize=True)
icon.resize((180, 180), Image.Resampling.LANCZOS).save(
    app_dir / "apple-icon.png", optimize=True
)

print("wrote assets ok", (left, top, right, bottom))
print("Icon.png", (out_dir / "Icon.png").stat().st_size)
print("isobrain-logo.png", (out_dir / "isobrain-logo.png").stat().st_size)
