from pathlib import Path
import re
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "WHITEPAPER_EN.md"
OUTPUT = ROOT / "output" / "pdf" / "tokenlucid-whitepaper-en.pdf"
PUBLIC = ROOT / "public" / "whitepaper-en.pdf"
pdfmetrics.registerFont(TTFont("AR", "C:/Windows/Fonts/arial.ttf"))
pdfmetrics.registerFont(TTFont("AR-Bold", "C:/Windows/Fonts/arialbd.ttf"))

PAGE_W, PAGE_H = A4
MINT = colors.HexColor("#42D99A"); INK = colors.HexColor("#10211B")
MUTED = colors.HexColor("#61746D"); LINE = colors.HexColor("#D9E5DF")
styles = getSampleStyleSheet()
body = ParagraphStyle("Body", fontName="AR", fontSize=9.1, leading=13.6, textColor=INK, spaceAfter=6, allowWidows=0, allowOrphans=0)
h1 = ParagraphStyle("H1", fontName="AR-Bold", fontSize=20, leading=24, textColor=INK, spaceBefore=9, spaceAfter=10, keepWithNext=1)
h2 = ParagraphStyle("H2", fontName="AR-Bold", fontSize=13, leading=16, textColor=INK, spaceBefore=8, spaceAfter=6, keepWithNext=1)
small = ParagraphStyle("Small", fontName="AR", fontSize=7.2, leading=9.4, textColor=MUTED)
quote = ParagraphStyle("Quote", fontName="AR", fontSize=8.4, leading=12.5, leftIndent=10, rightIndent=8, borderPadding=8, backColor=colors.HexColor("#EAF8F1"), textColor=INK, spaceAfter=9)
bullet = ParagraphStyle("Bullet", parent=body, leftIndent=13, firstLineIndent=-8, bulletIndent=2, spaceAfter=3)

def esc(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r"<font name='AR-Bold'>\1</font>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return text

def header_footer(canvas, doc):
    canvas.saveState(); canvas.setFillColor(colors.HexColor("#07110E")); canvas.rect(0, PAGE_H-14*mm, PAGE_W, 14*mm, fill=1, stroke=0)
    canvas.setFont("Helvetica-Bold", 8); canvas.setFillColor(MINT); canvas.drawString(18*mm, PAGE_H-9*mm, "TOKENLUCID / TLCD")
    canvas.setFont("Helvetica", 7); canvas.setFillColor(colors.HexColor("#9CB0A7")); canvas.drawRightString(PAGE_W-18*mm, PAGE_H-9*mm, "English project paper - v0.9")
    canvas.setStrokeColor(LINE); canvas.line(18*mm, 15*mm, PAGE_W-18*mm, 15*mm); canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 10*mm, "Not an offer, legal opinion or regulatory filing."); canvas.drawRightString(PAGE_W-18*mm, 10*mm, str(doc.page)); canvas.restoreState()

doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=22*mm, bottomMargin=20*mm, title="TokenLucid / TLCD English White Paper", author="TokenLucid")
doc.addPageTemplates(PageTemplate(id="content", frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")], onPage=header_footer))
story = [Spacer(1, 34*mm), Paragraph("TOKENLUCID", ParagraphStyle("CoverBrand", fontName="AR-Bold", fontSize=12, textColor=MINT, alignment=TA_CENTER, spaceAfter=12)), Paragraph("Explainable on-chain<br/>risk intelligence for Solana", ParagraphStyle("CoverTitle", fontName="AR-Bold", fontSize=32, leading=38, textColor=INK, alignment=TA_CENTER, spaceAfter=18)), Paragraph("TLCD UTILITY TOKEN", ParagraphStyle("CoverTag", fontName="AR-Bold", fontSize=10, textColor=colors.white, backColor=INK, borderPadding=8, alignment=TA_CENTER, spaceAfter=28)), Paragraph("Version 0.9  |  2 July 2026  |  Pre-genesis - no public sale", ParagraphStyle("CoverMeta", fontName="AR", fontSize=9, textColor=MUTED, alignment=TA_CENTER, spaceAfter=55))]
cover = Table([[Paragraph("Explainable", h2), Paragraph("Fixed supply", h2), Paragraph("Product first", h2)], [Paragraph("Every score has visible reasons and limits.", small), Paragraph("10,000,000 TLCD with permanently revoked authorities.", small), Paragraph("Utility features and legal gates precede distribution.", small)]], colWidths=[doc.width/3]*3)
cover.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#EAF8F1")),("BOX",(0,0),(-1,-1),0.5,LINE),("INNERGRID",(0,0),(-1,-1),0.5,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),9),("RIGHTPADDING",(0,0),(-1,-1),9),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story.extend([cover, PageBreak(), Paragraph("IMPORTANT NOTICE", h1), Paragraph("TLCD has not been minted or offered to the public. The issuer, registered address, management, target jurisdictions and final regulatory disclosures are unresolved. This paper is not a MiCA iXBRL filing and must not be used as permission to market or sell the token.", quote)])

rows=[]; in_table=False; started=False
def flush_table():
    global rows
    if not rows: return
    widths=[doc.width/len(rows[0])]*len(rows[0]); data=[]
    for i,row in enumerate(rows): data.append([Paragraph(esc(cell), ParagraphStyle("TH", parent=small, fontName="AR-Bold", textColor=colors.white) if i==0 else small) for cell in row])
    table=Table(data,colWidths=widths,repeatRows=1,hAlign="LEFT"); table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),INK),("GRID",(0,0),(-1,-1),0.45,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)])); story.extend([table,Spacer(1,6)]); rows=[]

for line in SOURCE.read_text(encoding="utf-8").splitlines():
    if not started:
        if line.startswith("## 1."): started=True
        else: continue
    if line.startswith("|"):
        cells=[c.strip() for c in line.strip().strip("|").split("|")]
        if all(set(c)<=set("-: ") for c in cells): continue
        rows.append(cells); in_table=True; continue
    if in_table: flush_table(); in_table=False
    if not line.strip(): story.append(Spacer(1,3)); continue
    if line.startswith("## "): story.append(Paragraph(esc(line[3:]),h1)); continue
    if line.startswith("### "): story.append(Paragraph(esc(line[4:]),h2)); continue
    if line.startswith("> "): story.append(Paragraph(esc(line[2:]),quote)); continue
    if re.match(r"^\d+\. ",line) or line.startswith("- "): story.append(Paragraph(esc(re.sub(r"^(?:\d+\. |- )", "", line)),bullet,bulletText="-")); continue
    story.append(Paragraph(esc(line),body))
flush_table(); OUTPUT.parent.mkdir(parents=True,exist_ok=True); doc.build(story); PUBLIC.write_bytes(OUTPUT.read_bytes()); print(OUTPUT)
