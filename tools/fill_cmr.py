"""Fill a table-style CMR template (.docx) from a field map.

The field map (JSON) addresses values by the index of the paragraph in the
document body, which is how a template's 'map of boxes' is stored:

  {
    "fields":  {"38": "SENDER NAME", ...},          # whole paragraph replaced
    "match":   {"189": ["EXW", "EXW NINGBO, CHINA"]}, # only the text run that contains "EXW"
    "marker_cell": "Besondere Vereinbarungen",        # box that gets the SAMPLE mark
    "title": "CMR demo-01 (fictitious data)"
  }

Formatting of the first run of each paragraph is kept. Author/title metadata
inherited from the template is replaced with neutral values.
Usage: python3 tools/fill_cmr.py <template.docx> <fields.json> <out.docx>
"""
import json
import os
import sys
import zipfile

import docx
from docx.oxml.ns import qn

CORE_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    '<dc:title>{title}</dc:title><dc:creator>demo</dc:creator>'
    '<cp:lastModifiedBy>demo</cp:lastModifiedBy>'
    '<dcterms:created xsi:type="dcterms:W3CDTF">2026-11-20T00:00:00Z</dcterms:created>'
    '<dcterms:modified xsi:type="dcterms:W3CDTF">2026-11-20T00:00:00Z</dcterms:modified>'
    '</cp:coreProperties>'
)


def set_text(p, value):
    ts = list(p.iter(qn("w:t")))
    if not ts:
        raise SystemExit("paragraph has no text run to fill")
    ts[0].text = value
    ts[0].set(qn("xml:space"), "preserve")
    for t in ts[1:]:
        t.text = ""


def replace_run(p, needle, value, idx):
    for t in p.iter(qn("w:t")):
        if t.text and needle in t.text:
            t.text = value
            t.set(qn("xml:space"), "preserve")
            return
    raise SystemExit(f"no run containing {needle!r} in paragraph {idx}")


def add_marker(d, cell_text):
    cell = next(c for r in d.tables[0].rows for c in r.cells if cell_text in c.text)
    run = cell.add_paragraph().add_run("SAMPLE — FICTITIOUS DATA")
    run.font.size = docx.shared.Pt(8)
    run.font.bold = True
    run.font.color.rgb = docx.shared.RGBColor(0xB0, 0x00, 0x20)


def scrub_core_properties(path, title):
    with zipfile.ZipFile(path) as z:
        items = [(i.filename, z.read(i.filename)) for i in z.infolist()]
    seen, tmp = set(), path + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in items:
            if name in seen:
                continue
            seen.add(name)
            if name == "docProps/core.xml":
                data = CORE_XML.format(title=title).encode()
            z.writestr(name, data)
    os.replace(tmp, path)


def main(src, spec_path, dst):
    with open(spec_path, encoding="utf-8") as f:
        spec = json.load(f)
    d = docx.Document(src)
    paras = list(d.element.body.iter(qn("w:p")))
    for idx, value in spec.get("fields", {}).items():
        set_text(paras[int(idx)], value)
    for idx, (needle, value) in spec.get("match", {}).items():
        replace_run(paras[int(idx)], needle, value, idx)
    if spec.get("marker_cell"):
        add_marker(d, spec["marker_cell"])
    d.save(dst)
    scrub_core_properties(dst, spec.get("title", "CMR (fictitious data)"))


if __name__ == "__main__":
    main(*sys.argv[1:4])
