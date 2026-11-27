"""Composes the recorded frames into a 1080x1350 (4:5) MP4 for the LinkedIn feed.

    python3 scripts/demo/compose.py scripts/demo/out demo-video.mp4

Real-time playback of the recording (no speed-up), app shown as a phone screen,
one short caption per scene with a soft cross-fade. Silent (no audio track).
Needs Pillow and ffmpeg (libx264).
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, dst = sys.argv[1], sys.argv[2]
tl = json.load(open(os.path.join(src, 'timeline.json')))
W, H, FPS = 1080, 1350, 30
BG, INK, INK2 = (245, 239, 228), (31, 27, 22), (87, 78, 67)
here = os.path.dirname(os.path.abspath(__file__))
font_dir = os.path.join(here, '..', '..', 'node_modules', '@fontsource', 'be-vietnam-pro', 'files')
FONT = ImageFont.truetype(os.path.join(font_dir, 'be-vietnam-pro-latin-600-normal.woff'), 44)

frames, marks = tl['frames'], tl['marks']
t0, t1 = marks[0]['t'], marks[-1]['t']
# phone screen: fit below the caption band
fw, fh = tl['size']
SH = 1110; SW = round(fw * SH / fh); X0, Y0 = (W - SW) // 2, H - SH - 40
RADIUS = 44
mask = Image.new('L', (SW, SH), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, SW - 1, SH - 1), RADIUS, fill=255)
shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle((X0, Y0 + 14, X0 + SW, Y0 + SH + 14), RADIUS, fill=(31, 27, 22, 70))
shadow = shadow.filter(ImageFilter.GaussianBlur(22))

def wrap(text, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if FONT.getlength(test) <= max_w: cur = test
        else: lines.append(cur); cur = w
    return lines + ([cur] if cur else [])

def caption_img(text):
    img = Image.new('RGBA', (W, Y0), (0, 0, 0, 0))
    if not text: return img
    d = ImageDraw.Draw(img); lines = wrap(text, W - 140)
    lh = 56; y = (Y0 - lh * len(lines)) // 2 + 4
    for ln in lines:
        d.text(((W - FONT.getlength(ln)) / 2, y), ln, font=FONT, fill=INK); y += lh
    return img

caps = [(m['t'] - t0, caption_img(m['caption'])) for m in marks]

def paste_alpha(img, layer, a):
    l = layer.copy(); l.putalpha(layer.getchannel('A').point(lambda v: int(v * a))); img.paste(l, (0, 0), l)
times = [f['t'] - t0 for f in frames]
base = Image.new('RGB', (W, H), BG); base.paste(shadow, (0, 0), shadow)

dur = t1 - t0
n = int(dur * FPS)
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', dst], stdin=subprocess.PIPE)
fi = 0; cache = {}
for k in range(n):
    t = k / FPS
    while fi + 1 < len(times) and times[fi + 1] <= t: fi += 1
    name = frames[fi]['f']
    if name not in cache:
        cache.clear()
        cache[name] = Image.open(os.path.join(src, 'frames', name)).convert('RGB').resize((SW, SH), Image.LANCZOS)
    img = base.copy(); img.paste(cache[name], (X0, Y0), mask)
    # caption with a 0.3 s cross-fade
    ci = max(i for i, (ct, _) in enumerate(caps) if ct <= t)
    since = t - caps[ci][0]
    if ci > 0 and since < 0.3:
        a = since / 0.3
        paste_alpha(img, caps[ci - 1][1], 1 - a); paste_alpha(img, caps[ci][1], a)
    else:
        img.paste(caps[ci][1], (0, 0), caps[ci][1])
    ff.stdin.write(img.tobytes())
ff.stdin.close(); ff.wait()
print(f'{dst}: {n / FPS:.1f} s, {W}x{H}, {FPS} fps, silent')
