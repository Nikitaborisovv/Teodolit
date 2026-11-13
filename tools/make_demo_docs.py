"""Generate fictitious Commercial Invoices and Packing List (PDF) for demo set 01.

All companies, addresses and registration numbers are invented.
Usage: python3 tools/make_demo_docs.py samples/demo-01
"""
import sys
from pathlib import Path
import subprocess, tempfile

CHROME = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"

OUT = Path(sys.argv[1])

SELLER = ("NINGBO HARBORLIGHT MACHINERY CO., LTD.",
          "No. 18 Demo Industrial Road, Beilun District, Ningbo, Zhejiang, China",
          "Tel: +86 574 0000 0000 · sales@harborlight.example")
BUYER = ("GOLDEN DUNE TRADING FZ-LLC",
         "Office 1204, Bay Square Tower 7, Business Bay, Dubai, UAE",
         "TRN: 100000000000003")
CONSIGNEE = '"STEPPE INDUSTRIAL SYSTEMS" LLP, 15 Abay Avenue, office 210, Almaty, Republic of Kazakhstan, BIN 990000000001'
TERMS = "EXW NINGBO, CHINA"
CONTRACT = "Contract No. GD-2026/14 dated 12.08.2026"

CSS = """
@page { size: A4; margin: 16mm 14mm; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; color: #111; }
.hdr { border-bottom: 2px solid #1f3a5f; padding-bottom: 6px; margin-bottom: 14px; }
.hdr b { font-size: 14pt; color: #1f3a5f; }
h1 { text-align: center; font-size: 16pt; letter-spacing: 1px; margin: 10px 0 14px; }
.meta { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 12px; }
.meta div { flex: 1; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; }
th, td { border: 1px solid #555; padding: 5px 6px; vertical-align: top; }
th { background: #e8edf3; font-size: 9.5pt; }
td.n { text-align: right; white-space: nowrap; }
tr.tot td { font-weight: bold; background: #f4f6f8; }
.small { font-size: 9pt; color: #333; }
.sample { position: fixed; bottom: 0; left: 0; right: 0; text-align: center;
          font-size: 8.5pt; color: #b00020; border-top: 1px dashed #b00020; padding-top: 3px; }
.wm { position: fixed; top: 40%; left: 0; right: 0; text-align: center; font-size: 72pt;
      color: rgba(176,0,32,0.08); transform: rotate(-30deg); font-weight: bold; }
"""

def page(title, meta_left, meta_right, table_html, after=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="wm">SAMPLE</div>
<div class="hdr"><b>{SELLER[0]}</b><br>{SELLER[1]}<br><span class="small">{SELLER[2]}</span></div>
<h1>{title}</h1>
<div class="meta"><div>{meta_left}</div><div>{meta_right}</div></div>
{table_html}
{after}
<div class="sample">SAMPLE — FICTITIOUS DATA FOR TESTING ONLY. Not a commercial document.</div>
</body></html>"""

def money(x): return f"{x:,.2f}"

def invoice(no, date, lines):
    rows = ""; total = 0
    for i, (desc, qty, uom, price) in enumerate(lines, 1):
        amt = qty * price; total += amt
        rows += f"<tr><td>{i}</td><td>{desc}</td><td class='n'>{qty}</td><td>{uom}</td><td class='n'>{money(price)}</td><td class='n'>{money(amt)}</td></tr>"
    rows += f"<tr class='tot'><td colspan='5'>TOTAL, USD</td><td class='n'>{money(total)}</td></tr>"
    table = f"""<table><tr><th>#</th><th>Description of goods</th><th>Qty</th><th>UOM</th><th>Unit price, USD</th><th>Amount, USD</th></tr>{rows}</table>"""
    left = f"<b>Bill to:</b><br>{BUYER[0]}<br>{BUYER[1]}<br>{BUYER[2]}"
    right = (f"<b>Invoice No.:</b> {no}<br><b>Date:</b> {date}<br><b>{CONTRACT}</b><br>"
             f"<b>Terms of delivery:</b> {TERMS}<br><b>Country of origin:</b> China")
    after = ("<p class='small'><b>Payment:</b> 100% T/T in advance.<br>"
             "<b>Beneficiary bank:</b> Demo Bank of Ningbo, SWIFT DEMOCNXX, Account 0000 0000 0000 0000</p>")
    return page("COMMERCIAL INVOICE", left, right, table, after), total

INV1 = ("NHM-2611-01", "03.11.2026", [
    ("Conveyor idler roller D133 x 1150 mm", 40, "PCS", 185.00),
    ("Drive unit 30 kW (gear motor with drive pulley)", 2, "PCS", 9850.00),
    ("Spare parts kit for conveyor line CL-800", 1, "SET", 1240.00),
])
INV2 = ("NHM-2611-02", "03.11.2026", [
    ("Control cabinet for conveyor line CL-800", 1, "PC", 14600.00),
])

# case no, content, qty, nw, gw, LxWxH (m), volume
CASES = [
    (1, "Conveyor idler roller D133 x 1150 mm", "20 PCS", 380.00, 412.00, "1.25x0.96x1.00", 1.20),
    (2, "Conveyor idler roller D133 x 1150 mm", "20 PCS", 368.00, 398.50, "1.25x0.92x1.00", 1.15),
    (3, "Drive unit 30 kW", "1 PC", 610.00, 655.00, "1.50x1.20x1.00", 1.80),
    (4, "Drive unit 30 kW", "1 PC", 604.00, 648.00, "1.50x1.20x1.00", 1.80),
    (5, "Control cabinet for conveyor line CL-800", "1 PC", 251.00, 286.00, "1.00x0.95x1.00", 0.95),
    (6, "Spare parts kit for conveyor line CL-800", "1 SET", 62.00, 74.50, "0.80x0.50x0.50", 0.20),
]

def packing_list():
    rows = ""
    for c in CASES:
        rows += (f"<tr><td class='n'>{c[0]}</td><td>{c[1]}</td><td class='n'>{c[2]}</td>"
                 f"<td class='n'>{money(c[3])}</td><td class='n'>{money(c[4])}</td><td>{c[5]}</td><td class='n'>{c[6]:.2f}</td></tr>")
    nw = sum(c[3] for c in CASES); gw = sum(c[4] for c in CASES); vol = sum(c[6] for c in CASES)
    rows += (f"<tr class='tot'><td colspan='3'>TOTAL: {len(CASES)} WOODEN CASES</td><td class='n'>{money(nw)}</td>"
             f"<td class='n'>{money(gw)}</td><td></td><td class='n'>{vol:.2f}</td></tr>")
    table = ("<table><tr><th>Case No.</th><th>Contents</th><th>Qty</th><th>N.W., kg</th><th>G.W., kg</th>"
             f"<th>Dimensions, m</th><th>Volume, m³</th></tr>{rows}</table>")
    left = f"<b>To:</b><br>{BUYER[0]}<br>{BUYER[1]}<br><br><b>Consignee:</b><br>{CONSIGNEE}"
    right = (f"<b>Packing List No.:</b> NHM-2611-PL<br><b>Date:</b> 05.11.2026<br>"
             f"<b>To invoices:</b> {INV1[0]}, {INV2[0]} dd {INV1[1]}<br><b>Terms of delivery:</b> {TERMS}<br>"
             "<b>Method of packing:</b> wooden cases<br><b>Shipping marks:</b> SIS / ALMATY / CL-800 / C/NO. 1-6")
    return page("PACKING LIST", left, right, table), (len(CASES), nw, gw, vol)

def pdf(html, name):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={OUT / name}", f.name], check=True, capture_output=True)

h1, t1 = invoice(*INV1); pdf(h1, "invoice-NHM-2611-01.pdf")
h2, t2 = invoice(*INV2); pdf(h2, "invoice-NHM-2611-02.pdf")
hp, tot = packing_list(); pdf(hp, "packing-list-NHM-2611-PL.pdf")
print("invoice totals USD:", t1, t2, "| PL cases/NW/GW/vol:", tot)
