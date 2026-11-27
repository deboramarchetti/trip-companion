"""Generates the FICTIONAL travel documents used by the demo (clearly marked as specimens).

    python3 scripts/demo/make-demo-pdfs.py /tmp/demo-docs
"""
import sys, os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

out = sys.argv[1] if len(sys.argv) > 1 else 'demo-docs'
os.makedirs(out, exist_ok=True)
W, H = A4

def doc(name, title, subtitle, rows, color='#9e2f26'):
    c = canvas.Canvas(os.path.join(out, name), pagesize=A4)
    c.setFillColor(HexColor(color)); c.rect(0, H - 110, W, 110, fill=1, stroke=0)
    c.setFillColor(HexColor('#ffffff')); c.setFont('Helvetica-Bold', 24); c.drawString(40, H - 60, title)
    c.setFont('Helvetica', 12); c.drawString(40, H - 85, subtitle)
    c.setFillColor(HexColor('#1f1b16')); y = H - 160
    for k, v in rows:
        c.setFont('Helvetica-Bold', 11); c.drawString(40, y, k)
        c.setFont('Helvetica', 11); c.drawString(220, y, v); y -= 26
    c.saveState(); c.setFillColor(HexColor('#9e2f26')); c.setFillAlpha(0.12); c.setFont('Helvetica-Bold', 54)
    c.translate(W / 2, H / 2 - 120); c.rotate(30); c.drawCentredString(0, 0, 'SPECIMEN'); c.drawCentredString(0, -70, 'FICTIONAL DOCUMENT')
    c.restoreState()
    c.setFont('Helvetica-Oblique', 9); c.setFillColor(HexColor('#8a8072'))
    c.drawString(40, 40, 'Fictional document generated for the Trip Companion demo. Not valid for travel.')
    c.save()

doc('evisa-ana.pdf', 'ELECTRONIC VISA (SPECIMEN)', 'Demo document — not issued by any government',
    [('Full name', 'ANA EXEMPLO'), ('Passport', 'XX0000000'), ('Valid', '22/11/2027 – 05/12/2027'), ('Entries', 'Single'), ('Code', 'EV-DEMO-0001')])
doc('insurance-ana.pdf', 'TRAVEL INSURANCE (SPECIMEN)', 'Seguradora Exemplo — demo policy', [('Insured', 'ANA EXEMPLO'), ('Policy', 'POL-0000-DEMO'), ('Coverage', '19/11/2027 – 06/12/2027'), ('Medical', 'USD 50,000 (fictional)'), ('Assistance', 'See your real policy')], '#2e5e4e')
doc('vaccine-ana.pdf', 'VACCINATION CERTIFICATE (SPECIMEN)', 'Yellow fever — demo document', [('Name', 'ANA EXEMPLO'), ('Vaccine', 'Yellow fever (fictional record)'), ('Date', '01/01/2020'), ('Certificate', 'CV-DEMO-0001')], '#b9852f')
for name, route, date, code in [('flight-hph-dad.pdf', 'Hai Phong (HPH) → Da Nang (DAD)', '27/11/2027 · 16:30 → 17:45', 'LA9T4K'), ('flight-hui-sgn.pdf', 'Hue (HUI) → Ho Chi Minh City (SGN)', '01/12/2027 · 17:50 → 19:15', 'LA2W8P')]:
    doc(name, 'LOTUS AIR — ITINERARY (SPECIMEN)', 'Fictional airline · demo booking', [('Route', route), ('Date', date), ('Booking', code), ('Passengers', 'ANA EXEMPLO · LEO EXEMPLO · SAM EXEMPLO'), ('Baggage', '7 kg cabin + 20 kg checked')], '#1e88e5')
print('ok', sorted(os.listdir(out)))
