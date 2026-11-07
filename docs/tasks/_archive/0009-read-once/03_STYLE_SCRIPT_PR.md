# Step 03: Style script and pull request

Date: 2 November 2026

## Goal
A script of the plugin checks the writing style `ste`, and `/flow:finish-task` runs it, skips files it holds, and writes a shorter pull request.

## Context to read
- `docs/tasks/0009-read-once/README.md`
- `plugins/flow/reference/WRITING_STYLE.md`, rules 2 and 11
- `plugins/flow/skills/finish-task/SKILL.md`
- `plugins/flow/scripts/review_server.py`, for the style of a plugin script

## Files touched
- `plugins/flow/scripts/style_check.py` (new)
- `plugins/flow/skills/finish-task/SKILL.md` (changed)

## Work
1. Write `scripts/style_check.py`. It takes one or more Markdown files. It flags each sentence of more than 25 words (rule 2) and each filler word of rule 11. It skips code blocks and inline code, and splits table rows into cells. It prints `<file>:<line>: <finding>` and exits with code 1 when it finds something, and 0 otherwise. It uses only the Python 3 standard library.
2. In `finish-task`, the read item: add the sentence "Skip a file that this session already holds and did not edit."
3. In `finish-task`, order item 3: with the writing style `ste`, run `python3 ${CLAUDE_PLUGIN_ROOT}/scripts/style_check.py` on the changed Markdown files. Each finding is a Conflict question of item 4, with the default fix as the ● answer. Without `python3`, record a ⚠️ line and continue.
4. In `finish-task`, "Pull request description": keep the deviations and open points, the summary, the coverage, the review items and the link to the archived task. Remove the steps, the choices and the changelog entry.

## Review checklist
- [x] On a test project, run `/flow:finish-task`. The pull request has no steps table and no changelog entry. A long sentence in a changed document becomes a Conflict question.
  Why: Project rule 4. Only a human can run the plugin on a test project.
  Checked: 2 November 2026

## Docs to update
none

## Out of scope
- The verify script of this repository. Step 04 does this.
- Checks of hedging and vague words. They need a reader.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The script also skips headings, the front matter and HTML comments. A colon does not end a sentence, so a list after a colon counts as one sentence.
- A link counts as its text only, so a long URL adds no words.
- The style check stands in the existing check list of order item 3. Its findings reach the Conflict questions of item 4 like the other findings.
- A test file confirmed that the script skips code blocks and inline code, and flags "simply".
- The script finds 3 long sentences in the plugin, not 4. The fourth of the scan before the plan is in the front matter of `adopt`.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | Step 04 has 3 long sentences to fix, not 4. `adopt` needs no fix. | The script skips the front matter, where the fourth sentence is. | Step 04 |
