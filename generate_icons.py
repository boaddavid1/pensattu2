from PIL import Image
import base64, io

src = r'C:\Users\LENOVO\Downloads\pensattu2\pensafallback.png'
pub = r'C:\Users\LENOVO\Downloads\pensattu2\client\public'

img = Image.open(src).convert('RGBA')

# Generate PNG icons at standard PWA sizes
for size in [192, 512]:
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(f'{pub}/pwa-icon-{size}.png')
    print(f'Created pwa-icon-{size}.png')

# Also save a copy as pwa-icon.png (any size)
img.save(f'{pub}/pwa-icon.png')
print('Created pwa-icon.png')

# Create SVG with embedded base64 PNG (512x512 for quality)
resized512 = img.resize((512, 512), Image.LANCZOS)
buf = io.BytesIO()
resized512.save(buf, format='PNG')
b64 = base64.b64encode(buf.getvalue()).decode('ascii')
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">\n'
svg += f'  <image href="data:image/png;base64,{b64}" width="512" height="512" />\n'
svg += '</svg>'
with open(f'{pub}/pwa-icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg)
print('Created pwa-icon.svg with embedded image')
