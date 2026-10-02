"""Extract mathematical displays, without textbook prose or illustrations.

The source PDF is supplied by the user and is never copied into the website.
Raster output preserves mathematical glyphs that lack Unicode mappings in the
2004 PDF. Every crop carries its original chapter, equation number, and page.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium
from PIL import Image, ImageChops, ImageDraw

STARTS = [1, 23, 47, 89, 105, 131, 161, 185, 221, 257, 297, 321,
          361, 393, 427, 453, 487, 515, 565, 583, 597, 619, 641]
SCALE = 2.6
# Numbered definitions and displays with inset margins, checked against source.
INCLUDE = {(3,63,"21"), (7,172,"26"), (8,192,"7"),
           (8,194,"17"), (8,195,"18"), (8,195,"19"),
           (8,196,"20"), (8,196,"21"), (8,196,"22"), (8,196,"23"),
           (10,274,"11"), (10,274,"12"), (10,281,"27"),
           (11,300,"3"), (11,304,"20"), (13,371,"24"), (13,373,"29"),
           (14,395,"2"), (14,395,"3"), (14,396,"3b"), (14,396,"3c"),
           (14,396,"3d"), (14,396,"3e"), (15,439,"27"), (16,456,"3"), (16,457,"6"),
           (17,506,"34")}


def prose_rows(words: list[dict]) -> list[tuple[float, float]]:
    rows: list[list[dict]] = []
    for word in sorted(words, key=lambda w: (w["top"], w["x0"])):
        match = next((row for row in reversed(rows[-8:])
                      if abs(row[0]["top"] - word["top"]) < 2.3), None)
        if match is None:
            rows.append([word])
        else:
            match.append(word)
    result = []
    for row in rows:
        ordinary = sum(bool(re.fullmatch(r"[A-Za-z][A-Za-z'-]{3,}[.,;:]?", w["text"])) and w["text"].strip(".,;:") not in {"cosh","sinh","tanh","sech","sqrt","const","gauss","tesla","curl","ctnh","nearest","neighbors","otherwise"} for w in row)
        sentinel = any(w["text"].lower().strip(".,;:") in {"the","where","which","with","from","this","that","given","here","using","dimension","wavevector","satisfy","outside","obtain","identity","then","therefore","thus","have","found","total","number","we","for","at","and","whence","provided","whence","figure"} for w in row)
        row_text = " ".join(w["text"] for w in row)
        plain_prose = ordinary >= 1 and not re.search(r"[=+×∑∫]|\(cid:|\(\d+[a-z]?\)", row_text)
        length = sum(len(w["text"]) for w in row)
        if sentinel and length >= 4 or ordinary >= 5 or plain_prose:
            result.append((min(w["top"] for w in row), max(w["bottom"] for w in row)))
    return sorted(result)


def labels_on_page(page, chapter=0, printed=0) -> list[dict]:
    labels = []
    words = page.extract_words(x_tolerance=1.3, y_tolerance=2)
    for word in words:
        match = re.fullmatch(r"\(([0-9]{1,3}[a-z]?)\)", word["text"])
        # Display labels align to the same right margin throughout this PDF.
        manual = bool(match and (chapter,printed,match.group(1)) in INCLUDE)
        if match and (chapter,printed,match.group(1)) == (10,274,"11") and abs(word["top"]-241.34)<1:
            continue
        if match and (manual or abs(word["x1"]-504) < 1 or abs(word["x1"]-444) < 1) and word["x0"] > 400:
            row = [w for w in words if abs(w["top"]-word["top"]) < 3]
            prose = sum(bool(re.fullmatch(r"[A-Za-z]{3,}[.,;:]?", w["text"])) and w["text"].strip(".,;:") not in {"CGS", "exp", "cos", "sin", "cosh", "sinh", "tanh", "log", "const", "max", "min", "det"} for w in row)
            if prose >= 2 and not manual:
                continue
            labels.append({**word, "number": match.group(1)})
    return sorted(labels, key=lambda item: item["top"])


def equation_box(page, label, labels, rows):
    index = labels.index(label)
    before = [bottom for top, bottom in rows if bottom < label["top"] - 1]
    after = [top for top, bottom in rows if top > label["bottom"] + 1]
    top = max(before, default=label["top"] - 70) + 2
    bottom = min(after, default=label["bottom"] + 70) - 2
    top = max(top, label["top"] - 140, page.bbox[1] + 16)
    bottom = min(bottom, label["bottom"] + 140, page.bbox[3] - 35)
    if index > 0:
        top = max(top, (labels[index-1]["bottom"] + label["top"]) / 2)
    if index + 1 < len(labels):
        bottom = min(bottom, (label["bottom"] + labels[index+1]["top"]) / 2)
    # Exclude neighboring illustration rectangles without touching boxes that
    # enclose a mathematical display (e.g. the inset hole definitions).
    for rect in page.rects:
        if rect["width"] > 100 and rect["height"] > 55:
            if rect["top"] > label["bottom"] + 8:
                bottom = min(bottom, rect["top"] - 3)
            elif rect["bottom"] < label["top"] - 8:
                top = max(top, rect["bottom"] + 3)
    return (40, top, 509, bottom)


def transparent_crop(image: Image.Image, box: tuple[float, float, float, float], origin: tuple[float, float]) -> Image.Image:
    translated = (box[0]-origin[0], box[1]-origin[1], box[2]-origin[0], box[3]-origin[1])
    crop = image.crop(tuple(round(value * SCALE) for value in translated)).convert("RGB")
    gray = crop.convert("L")
    # Preserve antialiased glyph edges; pure page white has alpha zero.
    alpha = ImageChops.invert(gray)
    bounds = alpha.point(lambda p: 255 if p > 24 else 0).getbbox()
    if bounds:
        bounds = (max(0, bounds[0]-9), max(0, bounds[1]-9),
                  min(crop.width, bounds[2]+9), min(crop.height, bounds[3]+9))
        alpha = alpha.crop(bounds)
    result = Image.new("RGBA", alpha.size, (0, 0, 0, 0))
    result.putalpha(alpha)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path, default=Path("public/formulas"))
    parser.add_argument("--audit", type=Path, default=Path("tmp/formula-audit"))
    parser.add_argument("--chapters", type=int, nargs="+", default=list(range(3, 23)))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    args.audit.mkdir(parents=True, exist_ok=True)
    source = pdfplumber.open(args.pdf)
    renderer = pdfium.PdfDocument(args.pdf)
    index_path = args.output / "index.json"
    # A selected-chapter repair must not remove the other chapters' entries.
    manifest = [entry for entry in json.loads(index_path.read_text(encoding="utf-8"))
                if entry["chapter"] not in args.chapters] if index_path.exists() else []
    numbers = defaultdict(list)
    for chapter in args.chapters:
        start, end = STARTS[chapter-1], STARTS[chapter]
        for printed in range(start, end):
            page_index = printed + 19
            page = source.pages[page_index]
            labels = labels_on_page(page, chapter, printed)
            if not labels:
                continue
            words = page.extract_words(x_tolerance=1.3, y_tolerance=2)
            rows = prose_rows(words)
            rendered = renderer[page_index].render(scale=SCALE).to_pil()
            for label in labels:
                number = label["number"]
                identifier = f"c{chapter:02d}-e{number.zfill(3)}"
                box = equation_box(page, label, labels, rows)
                crop = transparent_crop(rendered, box, (page.bbox[0], page.bbox[1]))
                crop.save(args.output / f"{identifier}.png", optimize=True)
                manifest.append({"id": identifier, "chapter": chapter, "number": number,
                                 "page": printed, "src": f"formulas/{identifier}.png",
                                 "width": crop.width, "height": crop.height})
                numbers[chapter].append(number)
        print(f"Chapter {chapter}: {len(numbers[chapter])} displays", flush=True)
    if len({item["id"] for item in manifest}) != len(manifest):
        for identifier in {item["id"] for item in manifest}:
            duplicates = [item for item in manifest if item["id"] == identifier]
            if len(duplicates) > 1:
                print("Duplicate", identifier, [item["page"] for item in duplicates], flush=True)
        raise ValueError("Duplicate equation labels require manual review")
    manifest.sort(key=lambda item: (item["chapter"], int(re.match(r"\d+", item["number"]).group()), item["number"]))
    (args.output / "index.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    # Contact sheets are private audit artifacts, not published source pages.
    for chapter in args.chapters:
        entries = [item for item in manifest if item["chapter"] == chapter]
        for batch_index in range(0, len(entries), 24):
            batch = entries[batch_index:batch_index+24]
            sheet = Image.new("RGB", (1600, 1400), "white")
            draw = ImageDraw.Draw(sheet)
            for index, item in enumerate(batch):
                x, y = (index % 2) * 800, (index // 2) * 115
                draw.text((x+8, y+5), f"Ch {chapter} Eq {item['number']} p.{item['page']}", fill="black")
                crop = Image.open(args.output / f"{item['id']}.png")
                crop.thumbnail((780, 88))
                sheet.paste(crop, (x+8, y+23), crop)
            sheet.save(args.audit / f"chapter-{chapter:02d}-{batch_index//24+1}.jpg", quality=88)
    source.close()
    renderer.close()


if __name__ == "__main__":
    main()
