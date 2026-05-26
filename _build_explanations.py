#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import zipfile, re, json, os

DOCX = os.path.join(os.path.dirname(__file__), "11505學測第2回試題解析(教版).docx")
OUT = os.path.join(os.path.dirname(__file__), "11505-explanations.js")

def extract_text():
    with zipfile.ZipFile(DOCX) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="replace")
    text = re.sub(r"<w:tab[^>]*/>", "\t", xml)
    text = re.sub(r"</w:p>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&amp;", "&")
    return text

def split_answer_blocks(sec, letter_range="A-D"):
    pat = rf"(?m)^([{letter_range}])\s*(\d+)\.\s*(?:說明\s*)?"
    return re.split(pat, sec)

def parse_vocab(sec):
    out = {}
    parts = split_answer_blocks(sec, "A-D")
    for k in range(1, len(parts), 3):
        letter, num, body = parts[k], parts[k + 1], parts[k + 2]
        n = int(num)
        lines = [ln.strip() for ln in body.strip().split("\n") if ln.strip()]
        zh = lines[0] if lines else ""
        opts, phrases, cur, buf = {}, [], None, []
        for line in lines[1:]:
            om = re.match(r"^\(([A-D])\)\s*(.*)$", line)
            if om:
                if cur:
                    opts[cur] = "\n".join(buf).strip()
                cur, buf = om.group(1), [om.group(2).strip()]
            elif line.startswith("重要字詞"):
                if cur:
                    opts[cur] = "\n".join(buf).strip()
                cur, buf = None, []
                phrases.append(line)
            elif cur:
                buf.append(line)
            else:
                phrases.append(line)
        if cur:
            opts[cur] = "\n".join(buf).strip()
        out[str(n)] = {"answer": letter, "zh": zh, "options": opts, "phrases": "\n".join(phrases)}
    return out

def parse_steps(sec, lo, hi, letters="A-D"):
    out = {}
    parts = split_answer_blocks(sec, letters if len(letters) <= 4 else "A-J")
    if letters == "A-J":
        pat = r"(?m)^([A-J])\s*(\d+)\.\s*(?:說明\s*)?"
        parts = re.split(pat, sec)
    for k in range(1, len(parts), 3):
        letter, num, body = parts[k], parts[k + 1], parts[k + 2]
        n = int(num)
        if n < lo or n > hi:
            continue
        body = re.split(r"重要字詞|第\d+至\d+題|第\d+題", body)[0]
        steps, choices, reason, cur, buf = [], {}, "", None, []
        for line in [ln.strip() for ln in body.split("\n") if ln.strip()]:
            if line == "說明":
                continue
            sm = re.match(r"^([a-z])\.\s*(.*)$", line)
            om = re.match(r"^\(([A-JA-D])\)\s*(.*)$", line)
            if om:
                if cur:
                    choices[cur] = "\n".join(buf).strip()
                cur, buf = om.group(1), [om.group(2).strip()]
            elif sm:
                tag, chunk = sm.group(1), sm.group(2)
                om2 = re.match(r"^\(([A-JA-D])\)\s*(.*)$", chunk)
                if om2:
                    if cur:
                        choices[cur] = "\n".join(buf).strip()
                    cur, buf = om2.group(1), [om2.group(2).strip()]
                elif tag == "b" and not om2:
                    if cur:
                        choices[cur] = "\n".join(buf).strip()
                        cur, buf = None, []
                    reason = (reason + "\n" + chunk).strip() if reason else chunk
                elif cur:
                    buf.append(chunk)
                else:
                    steps.append(chunk)
            elif cur:
                buf.append(line)
            else:
                steps.append(line)
        if cur:
            choices[cur] = "\n".join(buf).strip()
        out[str(n)] = {"answer": letter, "steps": steps, "choices": choices, "reason": reason}
    return out

def parse_reading(sec):
    out = {}
    parts = split_answer_blocks(sec, "A-D")
    for k in range(1, len(parts), 3):
        letter, num, body = parts[k], parts[k + 1], parts[k + 2]
        n = int(num)
        if n < 35 or n > 46:
            continue
        lines = [ln.strip() for ln in body.strip().split("\n") if ln.strip()]
        prompt = lines[0] if lines else ""
        explain, note_lines = {}, []
        in_note = False
        for line in lines[1:]:
            if line == "說明":
                in_note = True
                continue
            om = re.match(r"^\(([A-D])\)\s*(.+)$", line)
            if om and not in_note:
                explain[om.group(1)] = om.group(2).strip()
            elif in_note:
                note_lines.append(line)
        out[str(n)] = {
            "answer": letter,
            "prompt": prompt,
            "explain": explain,
            "note": "\n".join(note_lines),
        }
    return out

def parse_vocab_sel_choices(sec):
    opts = {}
    i = sec.find("選項說明")
    if i < 0:
        return opts
    chunk = sec[i : sec.find("G\t21") if "G\t21" in sec else sec.find("G 21")]
    for m in re.finditer(r"^\(([A-J])\)\s*(.+)$", chunk, re.M):
        opts[m.group(1)] = m.group(2).strip()
    return opts

def parse_mixed(sec):
    mixed = {"49": {"answer": ["B", "D"], "options": {}}, "50": {"answer": "local twists"}}
    m = re.search(r"47\.\s*(\S+)\s*48\.\s*(\S+)", sec)
    fill_note = ""
    fm = re.search(r"47-48.*?說明\s*(.*?)\s*49\.", sec, re.S)
    if fm:
        fill_note = fm.group(1).strip()
    mixed["47"] = {"answer": "strictly", "pair": m.group(1) if m else "strictly"}
    mixed["48"] = {"answer": "inspiration", "pair": m.group(2) if m else "inspiration"}
    mixed["fillNote"] = fill_note
    for m in re.finditer(r"\(([A-F])\)\s*(.+?)（", sec):
        mixed["49"]["options"][m.group(1)] = m.group(2).strip()
    m50 = re.search(r"50\..*?說明\s*(.*?)(?:重要字詞|第參)", sec, re.S)
    if m50:
        mixed["50"]["note"] = m50.group(1).strip()
    return mixed

def main():
    text = extract_text()
    data = {
        "vocab": parse_vocab(text[text.find("一、詞彙題") : text.find("二、綜合測驗")]),
        "cloze": parse_steps(text[text.find("二、綜合測驗") : text.find("三、文意選填")], 11, 20),
        "vocabSelChoices": parse_vocab_sel_choices(
            text[text.find("三、文意選填") : text.find("四、篇章結構")]
        ),
        "vocabSel": parse_steps(text[text.find("三、文意選填") : text.find("四、篇章結構")], 21, 30, "A-J"),
        "paragraph": parse_steps(text[text.find("四、篇章結構") : text.find("五、閱讀測驗")], 31, 34, "A-E"),
        "reading": parse_reading(text[text.find("五、閱讀測驗") : text.find("第貳部分")]),
        "mixed": parse_mixed(text[text.find("第貳部分") : text.find("第參部分")]),
    }
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// Auto-generated from 11505學測第2回試題解析(教版).docx\nwindow.EXP11505 = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print("OK", {k: len(v) if isinstance(v, dict) else 0 for k, v in data.items()})

if __name__ == "__main__":
    main()
