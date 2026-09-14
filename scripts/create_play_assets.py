from pathlib import Path
from PIL import Image

icon_source = Path('/home/ubuntu/upload/tactictac-icon-gridfree.png')
feature_source = Path('/home/ubuntu/tactictac/assets/images/tactictac-feature-graphic-source.png')
out_dir = Path('/home/ubuntu/tactictac/assets/images')

icon = Image.open(icon_source).convert('RGB').resize((512, 512), Image.Resampling.LANCZOS)
icon.save(out_dir / 'tactictac-play-icon-512.png', format='PNG', optimize=True, compress_level=9)

feature = Image.open(feature_source).convert('RGB')
target_ratio = 1024 / 500
current_ratio = feature.width / feature.height
if current_ratio > target_ratio:
    crop_width = int(feature.height * target_ratio)
    left = (feature.width - crop_width) // 2
    feature = feature.crop((left, 0, left + crop_width, feature.height))
else:
    crop_height = int(feature.width / target_ratio)
    top = (feature.height - crop_height) // 2
    feature = feature.crop((0, top, feature.width, top + crop_height))
feature = feature.resize((1024, 500), Image.Resampling.LANCZOS)
feature.save(out_dir / 'tactictac-feature-graphic-1024x500.png', format='PNG', optimize=True, compress_level=9)

for name in ('tactictac-play-icon-512.png', 'tactictac-feature-graphic-1024x500.png'):
    path = out_dir / name
    print(f'{path}: {path.stat().st_size} bytes, {Image.open(path).size}')
