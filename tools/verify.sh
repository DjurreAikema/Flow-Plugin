#!/bin/sh
# Verify script of the flow plugin repository.
# Exit code 0 means pass. Any other exit code means fail.
# Checks:
#   1. The marketplace and the plugin pass `claude plugin validate`.
#   2. Every ${CLAUDE_PLUGIN_ROOT}/<path> in the plugin points to a file or folder that exists.
#   3. The plugin documents have no em dashes (writing style rule 1).
#   4. The git hook scripts have valid sh syntax.
#   5. The Python scripts of the plugin compile.
#   6. The plugin files use only the icons of the workflow guide, section 11.2.
#   7. Every cited section of the workflow guide exists.
#   8. The plugin documents pass the style script (writing style rules 2 and 11).
# See docs/workflow/CONFIG.md.

set -u
cd "$(dirname "$0")/.." || exit 1

plugin=plugins/flow
failed=0
line=""

# 1. Validation
if command -v claude >/dev/null 2>&1; then
    if claude plugin validate . >/dev/null 2>&1 && claude plugin validate "$plugin" >/dev/null 2>&1; then
        line="✅ validate"
    else
        line="❌ validate"
        failed=1
        claude plugin validate . 2>&1 | tail -5
        claude plugin validate "$plugin" 2>&1 | tail -5
    fi
else
    line="⚠️ validate (claude CLI not installed)"
fi

# 2. Plugin paths
missing=$(grep -rhoE '\$\{CLAUDE_PLUGIN_ROOT\}/[A-Za-z0-9_./-]+' "$plugin" \
    | sed -e 's#^\${CLAUDE_PLUGIN_ROOT}/##' -e 's#[.]$##' | sort -u \
    | while read -r p; do [ -e "$plugin/$p" ] || echo "$p"; done)
if [ -z "$missing" ]; then
    line="$line  ✅ paths"
else
    line="$line  ❌ paths"
    failed=1
    echo "Missing plugin paths:"
    echo "$missing"
fi

# 3. Em dashes
# The writing style guide shows an em dash on purpose, as an example of what not to write.
dashes=$(grep -rln '—' "$plugin" docs AGENTS.md README.md 2>/dev/null | grep -v 'reference/WRITING_STYLE.md')
if [ -z "$dashes" ]; then
    line="$line  ✅ style"
else
    line="$line  ❌ style"
    failed=1
    echo "Files with em dashes:"
    echo "$dashes"
fi

# 4. Hook syntax
hooks_ok=1
for h in "$plugin"/templates/git-hooks/* tools/git-hooks/*; do
    [ -f "$h" ] || continue
    sh -n "$h" || hooks_ok=0
done
if [ "$hooks_ok" -eq 1 ]; then
    line="$line  ✅ hooks"
else
    line="$line  ❌ hooks"
    failed=1
fi

# 5. Python scripts
if command -v python3 >/dev/null 2>&1; then
    py_ok=1
    for s in "$plugin"/scripts/*.py; do
        [ -f "$s" ] || continue
        python3 -c 'import sys; compile(open(sys.argv[1]).read(), sys.argv[1], "exec")' "$s" || py_ok=0
    done
    if [ "$py_ok" -eq 1 ]; then
        line="$line  ✅ python"
    else
        line="$line  ❌ python"
        failed=1
    fi
else
    line="$line  ⚠️ python (python3 not installed)"
fi

# 6. Icons
# The set of plugins/flow/reference/WORKFLOW.md section 11.2, with the markers ● and ○.
if command -v python3 >/dev/null 2>&1; then
    icons=$(python3 - "$plugin" <<'PY'
import os, re, sys
allowed = set("✅❌⚠⏸👉👀❓🔍🤖📁▶●○")
icon = re.compile("[\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\U0001F000-\U0001FAFF]")
for folder, _, files in os.walk(sys.argv[1]):
    for name in sorted(files):
        path = os.path.join(folder, name)
        try:
            text = open(path, encoding="utf-8").read()
        except (UnicodeDecodeError, OSError):
            continue
        bad = sorted(set(c for c in icon.findall(text) if c not in allowed))
        if bad:
            print(path + ": " + " ".join(bad))
PY
)
    if [ -z "$icons" ]; then
        line="$line  ✅ icons"
    else
        line="$line  ❌ icons"
        failed=1
        echo "Icons outside the set:"
        echo "$icons"
    fi
else
    line="$line  ⚠️ icons (python3 not installed)"
fi

# 7. Sections
# A citation is "workflow guide section <N>" or "WORKFLOW.md` section <N>", with one or more numbers.
if command -v python3 >/dev/null 2>&1; then
    sections=$(python3 - <<'PY'
import os, re
guide = "plugins/flow/reference/WORKFLOW.md"
heading = re.compile(r"^#{2,3} (\d+(?:\.\d+)?)\.? ")
known = set()
for text in open(guide, encoding="utf-8"):
    m = heading.match(text)
    if m:
        known.add(m.group(1))
num = r"\d+(?:\.\d+)?"
cite = re.compile(r"(?:workflow guide|WORKFLOW\.md`?),? sections? (" + num + r"(?:(?:, | and )" + num + r")*)")
files = ["AGENTS.md", "README.md", "CHANGELOG.md"]
for top in ("plugins/flow", ".claude/skills", "docs"):
    for folder, dirs, names in os.walk(top):
        dirs[:] = [d for d in dirs if os.path.join(folder, d).replace(os.sep, "/") != "docs/tasks/_archive"]
        files += [os.path.join(folder, n) for n in sorted(names) if n.endswith(".md")]
for path in files:
    if not os.path.isfile(path):
        continue
    for number, text in enumerate(open(path, encoding="utf-8"), 1):
        for m in cite.finditer(text):
            for n in re.findall(num, m.group(1)):
                if n not in known:
                    print(path + ":" + str(number) + ": section " + n)
PY
)
    if [ -z "$sections" ]; then
        line="$line  ✅ sections"
    else
        line="$line  ❌ sections"
        failed=1
        echo "Sections that the workflow guide does not have:"
        echo "$sections"
    fi
else
    line="$line  ⚠️ sections (python3 not installed)"
fi

# 8. Wording
# The writing style guide shows bad text on purpose, as an example of what not to write.
if command -v python3 >/dev/null 2>&1; then
    wording=$(find "$plugin" -name '*.md' ! -path '*/reference/WRITING_STYLE.md' | sort \
        | xargs python3 "$plugin/scripts/style_check.py")
    if [ -z "$wording" ]; then
        line="$line  ✅ wording"
    else
        line="$line  ❌ wording"
        failed=1
        echo "Style findings:"
        echo "$wording"
    fi
else
    line="$line  ⚠️ wording (python3 not installed)"
fi

echo "$line"
exit "$failed"
