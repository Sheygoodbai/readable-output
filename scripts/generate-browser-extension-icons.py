from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path("/Users/alma/readable-output/browser-companion/openclaw-tool-overlay/icons")
ROOT.mkdir(parents=True, exist_ok=True)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def make_gradient(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pixels = image.load()
    for y in range(size):
      for x in range(size):
        tx = x / max(size - 1, 1)
        ty = y / max(size - 1, 1)
        mix = (tx * 0.42) + (ty * 0.58)
        r = lerp(47, 31, mix)
        g = lerp(104, 78, mix)
        b = lerp(255, 214, mix)
        pixels[x, y] = (r, g, b, 255)
    return image


def draw_icon(size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    pad = max(2, round(size * 0.07))
    radius = round(size * 0.28)
    shadow_draw.rounded_rectangle(
        [pad, pad + round(size * 0.03), size - pad, size - pad + round(size * 0.03)],
        radius=radius,
        fill=(34, 53, 95, 95),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(2, round(size * 0.06))))
    canvas.alpha_composite(shadow)

    card = make_gradient(size)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=radius, fill=255)
    clipped = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    clipped.paste(card, (0, 0), mask)
    canvas.alpha_composite(clipped)

    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    highlight_draw = ImageDraw.Draw(highlight)
    highlight_draw.ellipse(
        [round(size * 0.08), round(size * 0.04), round(size * 0.68), round(size * 0.5)],
        fill=(255, 255, 255, 34),
    )
    highlight = highlight.filter(ImageFilter.GaussianBlur(radius=max(1, round(size * 0.03))))
    canvas.alpha_composite(highlight)

    draw = ImageDraw.Draw(canvas)
    line_width = max(2, round(size * 0.075))
    left = round(size * 0.26)
    right_values = [round(size * 0.74), round(size * 0.60), round(size * 0.69)]
    y_values = [round(size * 0.35), round(size * 0.50), round(size * 0.65)]
    for right, y in zip(right_values, y_values):
        draw.line((left, y, right, y), fill=(255, 255, 255, 255), width=line_width)
    dot_r = max(2, round(size * 0.045))
    draw.ellipse(
        [
            round(size * 0.20) - dot_r,
            y_values[0] - dot_r,
            round(size * 0.20) + dot_r,
            y_values[0] + dot_r,
        ],
        fill=(255, 224, 160, 255),
    )

    return canvas


for size in (16, 32, 48, 128):
    image = draw_icon(size)
    image.save(ROOT / f"icon{size}.png")

print(f"Generated icons in {ROOT}")
