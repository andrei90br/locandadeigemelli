# Ottimizza le foto degli appartamenti per il web.
# Uso: python3 scripts/foto.py "<cartella con le foto originali>" assets/img/appartamenti/<slug>
# Per ogni jpg crea <stanza>-NN.webp (2000px) e <stanza>-NN-sm.webp (900px, per le miniature).
import sys, os, re, unicodedata
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def slug(n):
    n = os.path.splitext(n)[0].lower().replace('entarta','entrata').replace('sranza','stanza')
    n = re.sub(r'[^a-z0-9]+','-',n).strip('-')
    return n
for f in sorted(os.listdir(src)):
    if not f.lower().endswith('.jpg'): continue
    s = slug(f)
    if os.path.exists(f'{out}/{s}-sm.webp'): continue
    im = ImageOps.exif_transpose(Image.open(f'{src}/{f}')).convert('RGB')
    for suf, size, q in (('', 2000, 80), ('-sm', 900, 76)):
        c = im.copy(); c.thumbnail((size, size), Image.LANCZOS)
        c.save(f'{out}/{s}{suf}.webp', 'WEBP', quality=q, method=6)
    print(f, '->', s, im.size)
