"""Generate fictitious Commercial Invoices and a Packing List (PDF) from a data file.

All companies, addresses and registration numbers in the data files are invented.
Usage: python3 tools/make_demo_docs.py samples/demo-01/data.json
PDFs are written next to the data file. Needs headless Chromium.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

CHROME = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"

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


def money(x):
    return f"{x:,.2f}"


def page(seller, title, meta_left, meta_right, table_html, after=""):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="wm">SAMPLE</div>
<div class="hdr"><b>{seller['name']}</b><br>{seller['address']}<br><span class="small">{seller['contact']}</span></div>
<h1>{title}</h1>
<div class="meta"><div>{meta_left}</div><div>{meta_right}</div></div>
{table_html}
{after}
<div class="sample">SAMPLE — FICTITIOUS DATA FOR TESTING ONLY. Not a commercial document.</div>
</body></html>"""


def invoice(d, inv):
    cur = d["currency"]
    with_hs = any(len(line) > 4 for line in inv["lines"])
    head = "<th>#</th><th>Description of goods</th>" + ("<th>HS code</th>" if with_hs else "")
    head += f"<th>Qty</th><th>UOM</th><th>Unit price, {cur}</th><th>Amount, {cur}</th>"
    rows, total = "", 0.0
    for i, line in enumerate(inv["lines"], 1):
        desc, qty, uom, price = line[:4]
        amt = qty * price
        total += amt
        hs = f"<td>{line[4]}</td>" if with_hs else ""
        rows += (f"<tr><td>{i}</td><td>{desc}</td>{hs}<td class='n'>{qty}</td><td>{uom}</td>"
                 f"<td class='n'>{money(price)}</td><td class='n'>{money(amt)}</td></tr>")
    span = 6 if with_hs else 5
    rows += f"<tr class='tot'><td colspan='{span}'>TOTAL, {cur}</td><td class='n'>{money(total)}</td></tr>"
    table = f"<table><tr>{head}</tr>{rows}</table>"
    b = d["buyer"]
    left = f"<b>Bill to:</b><br>{b['name']}<br>{b['address']}<br>{b['tax']}"
    right = (f"<b>Invoice No.:</b> {inv['no']}<br><b>Date:</b> {inv['date']}<br><b>{d['contract']}</b><br>"
             f"<b>Terms of delivery:</b> {d['terms']}<br><b>Country of origin:</b> {d['origin']}")
    after = f"<p class='small'><b>Payment:</b> {d['payment']}<br><b>Beneficiary bank:</b> {d['bank']}</p>"
    return page(d["seller"], "COMMERCIAL INVOICE", left, right, table, after), total


def packing_list(d):
    pl = d["packing_list"]
    rows = ""
    for c in pl["packages"]:
        no, content, qty, nw, gw, dims, vol = c
        rows += (f"<tr><td class='n'>{no}</td><td>{content}</td><td class='n'>{qty}</td>"
                 f"<td class='n'>{money(nw)}</td><td class='n'>{money(gw)}</td><td>{dims}</td>"
                 f"<td class='n'>{vol:.2f}</td></tr>")
    nw = sum(c[3] for c in pl["packages"])
    gw = sum(c[4] for c in pl["packages"])
    vol = sum(c[6] for c in pl["packages"])
    rows += (f"<tr class='tot'><td colspan='3'>TOTAL: {pl['total_label']}</td><td class='n'>{money(nw)}</td>"
             f"<td class='n'>{money(gw)}</td><td></td><td class='n'>{vol:.2f}</td></tr>")
    table = ("<table><tr><th>Pkg No.</th><th>Contents</th><th>Qty</th><th>N.W., kg</th><th>G.W., kg</th>"
             f"<th>Dimensions, m</th><th>Volume, m³</th></tr>{rows}</table>")
    b = d["buyer"]
    left = f"<b>To:</b><br>{b['name']}<br>{b['address']}<br><br><b>Consignee:</b><br>{d['consignee']}"
    invs = ", ".join(i["no"] for i in d["invoices"])
    right = (f"<b>Packing List No.:</b> {pl['no']}<br><b>Date:</b> {pl['date']}<br>"
             f"<b>To invoice(s):</b> {invs}<br><b>Terms of delivery:</b> {d['terms']}<br>"
             f"<b>Method of packing:</b> {pl['method']}<br><b>Shipping marks:</b> {pl['marks']}")
    return page(d["seller"], "PACKING LIST", left, right, table), (len(pl["packages"]), nw, gw, vol)


def to_pdf(html, path):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={path}", f.name], check=True, capture_output=True)


def main(data_path):
    data_path = Path(data_path)
    d = json.loads(data_path.read_text(encoding="utf-8"))
    out = data_path.parent
    for inv in d["invoices"]:
        html, total = invoice(d, inv)
        to_pdf(html, out / f"invoice-{inv['no']}.pdf")
        print(f"invoice {inv['no']}: {money(total)} {d['currency']}")
    html, tot = packing_list(d)
    to_pdf(html, out / f"packing-list-{d['packing_list']['no']}.pdf")
    print("packing list: packages=%d NW=%.2f GW=%.2f volume=%.2f" % tot)


if __name__ == "__main__":
    main(sys.argv[1])
