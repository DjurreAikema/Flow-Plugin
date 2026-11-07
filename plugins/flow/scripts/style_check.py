#!/usr/bin/env python3
"""Style check of the writing style `ste` of the flow workflow.

Python 3 standard library only.

Usage:
    python3 style_check.py <Markdown file> [<Markdown file> ...]

Checks:
    Rule 2   A sentence has 25 words or fewer.
    Rule 11  No filler words: simply, just, basically, actually, very.

The check skips code blocks, inline code, the front matter and HTML comments.
It splits table rows into cells, and treats each cell as its own text.
Hedging and vague words need a reader. This script does not check them.

Output: one line per finding, `<file>:<line>: <finding>`.

Exit codes:
    0  No findings.
    1  One or more findings.
    2  A file cannot be read.
"""

import re
import sys

MAX_WORDS = 25
FILLERS = ("simply", "just", "basically", "actually", "very")

INLINE_CODE = re.compile(r"`[^`]*`")
LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
SENTENCE_END = re.compile(r"(?<=[.!?])\s+")
FILLER = re.compile(r"\b(" + "|".join(FILLERS) + r")\b", re.IGNORECASE)


def texts(line):
    """Return the plain-text parts of one Markdown line."""
    line = INLINE_CODE.sub("X", line)
    line = LINK.sub(r"\1", line)
    if line.lstrip().startswith("|"):
        return [cell for cell in line.split("|") if cell.strip()]
    return [line]


def check(path):
    findings = []
    try:
        with open(path, encoding="utf-8") as handle:
            lines = handle.read().split("\n")
    except (OSError, UnicodeDecodeError) as error:
        print(f"{path}: cannot read: {error}", file=sys.stderr)
        return None

    in_code = False
    in_comment = False
    in_front = bool(lines) and lines[0].strip() == "---"
    for number, line in enumerate(lines, 1):
        stripped = line.strip()
        if in_front:
            if number > 1 and stripped == "---":
                in_front = False
            continue
        if stripped.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if in_comment or stripped.startswith("<!--"):
            in_comment = "-->" not in stripped
            continue
        if stripped.startswith("#"):
            continue
        for text in texts(line):
            for sentence in SENTENCE_END.split(text):
                words = len(sentence.split())
                if words > MAX_WORDS:
                    start = " ".join(sentence.split()[:6])
                    findings.append(f"{path}:{number}: {words} words (rule 2): {start} ...")
            for word in sorted(set(m.lower() for m in FILLER.findall(text))):
                findings.append(f"{path}:{number}: filler word \"{word}\" (rule 11)")
    return findings


def main(paths):
    if not paths:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    found = False
    for path in paths:
        findings = check(path)
        if findings is None:
            return 2
        for finding in findings:
            print(finding)
        found = found or bool(findings)
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
