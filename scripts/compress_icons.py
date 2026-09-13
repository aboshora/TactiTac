from pathlib import Path
from PIL import Image

paths = [
    Path('/home/ubuntu/tactictac/assets/images/icon.png'),
    Path('/home/ubuntu/tactictac/assets/images/tactictac-icon-final.png'),
    Path('/home/ubuntu/tactictac/assets/images/android-icon-foreground.png'),
    Path('/home/ubuntu/tactictac/assets/images/tactictac-icon-generated.png'),
    Path('/home/ubuntu/tactictac/assets/images/tactictac-adaptive-foreground-generated.png'),
    Path('/home/ubuntu/tactictac/assets/images/tactictac-icon-gridfree.png'),
    Path('/home/ubuntu/tactictac/assets/images/tactictac-adaptive-foreground-gridfree.png'),
]

for path in paths:
    image = Image.open(path)
    if image.width > 1024 or image.height > 1024:
        image = image.resize((1024, 1024), Image.Resampling.LANCZOS)
    if 'A' in image.getbands():
        image = image.convert('RGBA').quantize(colors=64, method=Image.Quantize.FASTOCTREE).convert('RGBA')
    else:
        image = image.convert('RGB').quantize(colors=64, method=Image.Quantize.MEDIANCUT).convert('RGB')
    image.save(path, format='PNG', optimize=True, compress_level=9)
    print(f'{path.name}: {path.stat().st_size} bytes')
