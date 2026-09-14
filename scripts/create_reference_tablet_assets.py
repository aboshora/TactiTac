from pathlib import Path
from PIL import Image

sources = [
    (Path('/home/ubuntu/upload/photo_2026-09-1402.15.33(1).jpeg'), 'tactictac-tablet-cpu-result-1200x1920.png'),
    (Path('/home/ubuntu/upload/photo_2026-09-1402.15.28.jpeg'), 'tactictac-tablet-pass-play-1200x1920.png'),
]
out_dir = Path('/home/ubuntu/tactictac/assets/images')
target = (1200, 1920)
background = (8, 18, 32)

for source, name in sources:
    image = Image.open(source).convert('RGB')
    scale = min(target[0] / image.width, target[1] / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new('RGB', target, background)
    left = (target[0] - size[0]) // 2
    top = (target[1] - size[1]) // 2
    canvas.paste(resized, (left, top))
    output = out_dir / name
    canvas.save(output, format='PNG', optimize=True, compress_level=9)
    print(f'{output}: {output.stat().st_size} bytes, {canvas.size}; content area {size}')
