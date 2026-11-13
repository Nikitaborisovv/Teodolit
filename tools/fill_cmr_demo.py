"""Fill a RU/DE table-style CMR template (.docx) with the fictitious demo-01 data.

Values are addressed by the index of the paragraph in the document body
(the 'field map' of this template). Formatting of the first run is kept.
Usage: python3 tools/fill_cmr_demo.py <template.docx> <out.docx>
"""
import os
import sys
import zipfile

import docx
from docx.oxml.ns import qn

# paragraph index -> value (whole paragraph replaced)
FIELDS = {
    10: "DEMO-01/2026",                                           # CMR No. (text box)
    27: "DEMO-01/2026",                                           # same text box, VML fallback copy
    38:"NINGBO HARBORLIGHT MACHINERY CO., LTD.",                 # 1 Sender
    40: "No. 18 Demo Industrial Road, Beilun District, ",
    41: "Ningbo, Zhejiang, China",
    45: "BY ORDER OF Golden Dune Trading FZ-LLC",                 # 1 By order of
    47: "Office 1204, Bay Square Tower 7, Business Bay, ",
    49: "Dubai, UAE",
    57: '"STEPPE INDUSTRIAL SYSTEMS" LLP',                        # 2 Consignee
    59: "15 Abay Avenue, office 210,",
    61: "Almaty, Republic of Kazakhstan",
    63: "BIN 990000000001",
    58: "SILK LINE LOGISTICS LLP",                                # 16 Carrier
    60: "BIN 990000000002",
    72: "Almaty",                                                 # 3 Place of delivery
    75: "Republic of Kazakhstan",
    84: "Khorgos",                                                # 4 Taking over
    87: "China",
    92: "20.11.2026",
    98: "Invoices No.: NHM-2611-01 dated: 03.11.2026 and NHM-2611-02 dated: 03.11.2026",  # 5
    123: "PARTS OF CONVEYOR LINE",                                # 9 Nature of goods
    124: "84313900",                                              # 10 HS code
    125: "2474,00",                                               # 11 Gross weight
    135: "TOTAL: 6",                                              # 7 Packages
    137: "2474,00",
    162: 'Temporary storage warehouse "DEMO TERMINAL" LLP,',      # 13 Sender's instructions
    163: "7 Sample Street, Almaty, 050000",
    172: "Customs post code: 39800000",
    204: "Khorgos ",                                              # 21 Established in
    207: "20.11.2026",
    236: "123ABC02 / 45DEF02",                                    # 25 Registration numbers
}
# paragraph index -> (old fragment, new fragment): value shares the paragraph with a label
PARTIAL = {189: ("EXW SHANGHAI,CHINA", "EXW NINGBO, CHINA")}     # 15 Incoterms


def set_text(p, value):
    ts = list(p.iter(qn("w:t")))
    ts[0].text = value
    ts[0].set(qn("xml:space"), "preserve")
    for t in ts[1:]:
        t.text = ""


def main(src, dst):
    d = docx.Document(src)
    paras = list(d.element.body.iter(qn("w:p")))
    for i, v in FIELDS.items():
        set_text(paras[i], v)
    for i, (old, new) in PARTIAL.items():
        for t in paras[i].iter(qn("w:t")):
            if t.text and old in t.text:
                t.text = t.text.replace(old, new)
                break
        else:
            raise SystemExit(f"fragment not found in paragraph {i}")
    # mark the document as a sample in box 20 (Special agreements)
    cell = next(c for r in d.tables[0].rows for c in r.cells if "Besondere Vereinbarungen" in c.text)
    run = cell.add_paragraph().add_run("SAMPLE — FICTITIOUS DATA")
    run.font.size = docx.shared.Pt(8)
    run.font.bold = True
    run.font.color.rgb = docx.shared.RGBColor(0xB0, 0x00, 0x20)
    d.save(dst)
    scrub_core_properties(dst)


CORE_XML = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
    '<dc:title>CMR demo-01 (fictitious data)</dc:title><dc:creator>demo</dc:creator>'
    '<cp:lastModifiedBy>demo</cp:lastModifiedBy>'
    '<dcterms:created xsi:type="dcterms:W3CDTF">2026-11-20T00:00:00Z</dcterms:created>'
    '<dcterms:modified xsi:type="dcterms:W3CDTF">2026-11-20T00:00:00Z</dcterms:modified>'
    '</cp:coreProperties>'
)


def scrub_core_properties(path):
    """Replace author/title metadata inherited from the template with neutral values."""
    with zipfile.ZipFile(path) as z:
        items = [(i, z.read(i.filename)) for i in z.infolist()]
    tmp = path + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for info, data in items:
            if info.filename == "docProps/core.xml":
                data = CORE_XML.encode()
            z.writestr(info.filename, data)
    os.replace(tmp, path)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
