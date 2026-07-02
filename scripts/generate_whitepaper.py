from pathlib import Path
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "WHITEPAPER.md"
OUTPUT = ROOT / "output" / "pdf" / "tokenlucid-whitepaper.pdf"
PUBLIC = ROOT / "public" / "whitepaper.pdf"

regular = Path("C:/Windows/Fonts/arial.ttf")
bold = Path("C:/Windows/Fonts/arialbd.ttf")
pdfmetrics.registerFont(TTFont("AR", str(regular)))
pdfmetrics.registerFont(TTFont("AR-Bold", str(bold)))

PAGE_W, PAGE_H = A4
MINT = colors.HexColor("#42D99A")
INK = colors.HexColor("#10211B")
MUTED = colors.HexColor("#61746D")
PAPER = colors.HexColor("#F4F7F5")
LINE = colors.HexColor("#D9E5DF")

styles = getSampleStyleSheet()
body = ParagraphStyle("Body", fontName="AR", fontSize=9.2, leading=14, textColor=INK, spaceAfter=7)
h1 = ParagraphStyle("H1", fontName="AR-Bold", fontSize=22, leading=27, textColor=INK, spaceBefore=10, spaceAfter=12)
h2 = ParagraphStyle("H2", fontName="AR-Bold", fontSize=13.5, leading=17, textColor=INK, spaceBefore=10, spaceAfter=7)
small = ParagraphStyle("Small", fontName="AR", fontSize=7.5, leading=10, textColor=MUTED)
quote = ParagraphStyle("Quote", fontName="AR", fontSize=8.5, leading=13, leftIndent=10, rightIndent=8, borderColor=MINT, borderWidth=0, borderPadding=8, backColor=colors.HexColor("#EAF8F1"), textColor=INK, spaceAfter=10)
bullet = ParagraphStyle("Bullet", parent=body, leftIndent=13, firstLineIndent=-8, bulletIndent=2, spaceAfter=4)

def esc(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r"<font name='AR-Bold'>\1</font>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return text

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#07110E"))
    canvas.rect(0, PAGE_H - 14*mm, PAGE_W, 14*mm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(MINT)
    canvas.drawString(18*mm, PAGE_H - 9*mm, "TOKENLUCID / TLCD")
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#9CB0A7"))
    canvas.drawRightString(PAGE_W-18*mm, PAGE_H-9*mm, "Pre-genesis project paper - v0.9")
    canvas.setStrokeColor(LINE)
    canvas.line(18*mm, 15*mm, PAGE_W-18*mm, 15*mm)
    canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 10*mm, "Not an investment offer or a MiCA filing.")
    canvas.drawRightString(PAGE_W-18*mm, 10*mm, f"{doc.page}")
    canvas.restoreState()

doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=22*mm, bottomMargin=20*mm, title="TokenLucid / TLCD White Paper", author="TokenLucid")
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
doc.addPageTemplates(PageTemplate(id="content", frames=[frame], onPage=header_footer))

story = []
story.append(Spacer(1, 34*mm))
story.append(Paragraph("TOKENLUCID", ParagraphStyle("CoverBrand", fontName="AR-Bold", fontSize=12, textColor=MINT, leading=14, alignment=TA_CENTER, spaceAfter=12)))
story.append(Paragraph("Zincir üstü riskleri<br/>anlaşılır kılan açık analiz katmanı", ParagraphStyle("CoverTitle", fontName="AR-Bold", fontSize=32, leading=38, textColor=INK, alignment=TA_CENTER, spaceAfter=18)))
story.append(Paragraph("TLCD UTILITY TOKEN", ParagraphStyle("CoverTag", fontName="AR-Bold", fontSize=10, textColor=colors.white, backColor=INK, borderPadding=8, alignment=TA_CENTER, spaceAfter=28)))
story.append(Paragraph("Sürüm 0.9  |  2 Temmuz 2026  |  Beta - halka satış yok", ParagraphStyle("CoverMeta", fontName="AR", fontSize=9, textColor=MUTED, alignment=TA_CENTER, spaceAfter=55)))
cover_box = Table([[Paragraph("Şeffaflık ilkesi", h2), Paragraph("Sabit arz", h2), Paragraph("Açık metodoloji", h2)], [Paragraph("Her risk puanının nedeni görünür.", small), Paragraph("10.000.000 TLCD; mint ve freeze yetkileri kaldırılır.", small), Paragraph("Kod, puanlama ve sınırlamalar yayımlanır.", small)]], colWidths=[doc.width/3]*3)
cover_box.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#EAF8F1")),("BOX",(0,0),(-1,-1),0.5,LINE),("INNERGRID",(0,0),(-1,-1),0.5,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story.append(cover_box)
story.append(PageBreak())
story.append(Paragraph("ÖNEMLİ HUKUKİ NOT", h1))
story.append(Paragraph("Bu belge yatırım teklifi, izahname, hukuki görüş veya herhangi bir getiri vaadi değildir. TLCD henüz oluşturulmamış ve halka arz edilmemiştir. Offeror/issuer tüzel kişiliği ve kayıtlı adresi belirlenmeden, hukuk incelemesi tamamlanmadan ve gerekli düzenleyici bildirimler yapılmadan halka satış veya işlem platformuna kabul talep edilmeyecektir. Bu PDF, MiCA iXBRL bildiriminin yerine geçmez.", quote))
story.append(Spacer(1, 5))

lines = SOURCE.read_text(encoding="utf-8").splitlines()
in_table = False
table_rows = []
skip_cover = True

def flush_table():
    global table_rows
    if not table_rows: return
    widths = [doc.width / len(table_rows[0])] * len(table_rows[0])
    data = [[Paragraph(esc(cell), small if r else ParagraphStyle("TH", parent=small, fontName="AR-Bold", textColor=colors.white)) for cell in row] for r, row in enumerate(table_rows)]
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),INK),("BACKGROUND",(0,1),(-1,-1),colors.white),("GRID",(0,0),(-1,-1),0.45,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.append(table); story.append(Spacer(1, 7)); table_rows=[]

for line in lines:
    if skip_cover:
        if line.startswith("## 1."): skip_cover = False
        else: continue
    if line.startswith("|"):
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if all(set(c) <= set("-: ") for c in cells): continue
        table_rows.append(cells); in_table = True; continue
    if in_table:
        flush_table(); in_table = False
    if not line.strip(): story.append(Spacer(1, 3)); continue
    if line.startswith("## "): story.append(Paragraph(esc(line[3:]), h1)); continue
    if line.startswith("### "): story.append(Paragraph(esc(line[4:]), h2)); continue
    if line.startswith("> "): story.append(Paragraph(esc(line[2:]), quote)); continue
    if re.match(r"^\d+\. ", line): story.append(Paragraph(esc(line), bullet, bulletText="•")); continue
    if line.startswith("- "): story.append(Paragraph(esc(line[2:]), bullet, bulletText="•")); continue
    story.append(Paragraph(esc(line), body))
flush_table()

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.build(story)
PUBLIC.write_bytes(OUTPUT.read_bytes())
print(OUTPUT)
