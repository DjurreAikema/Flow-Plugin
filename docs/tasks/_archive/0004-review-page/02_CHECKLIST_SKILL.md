# Step 02: Checklist skill

Date: 2 November 2026

## Goal
`/flow:checklist` records the review through the review page, with the file fallback and the prose fallback, and writes `Note:` lines.

## Context to read
- `docs/tasks/0004-review-page/README.md`
- `docs/tasks/0004-review-page/01_REVIEW_PAGE.md`, with its Outcome
- `plugins/flow/scripts/review_server.py`
- `plugins/flow/templates/review-page.html`
- `plugins/flow/skills/checklist/SKILL.md`
- `plugins/flow/reference/WORKFLOW.md` sections 3 and 8

## Files touched
- `plugins/flow/skills/checklist/SKILL.md` (changed)
- `plugins/flow/reference/WORKFLOW.md` (changed)

## Work
1. In `/flow:checklist`, "Flow": replace the multiple-choice question with the review page. Make a temporary folder with `mktemp -d`, outside the repository. Write the unticked items to a JSON file in it. Start `${CLAUDE_PLUGIN_ROOT}/scripts/review_server.py` in the background. Repeat its wait command with at most 540 seconds, until the results file exists.
2. Add the fallback for exit code 2 or a missing `python3`: fill `${CLAUDE_PLUGIN_ROOT}/templates/review-page.html` with the items, write it to the temporary folder, and open it. Ask the developer to reply "done" after "Finish". Read `checklist-results.json` from the folder that the developer names, or from the downloads folder.
3. Add the fallback for exit code 3: list the items as a numbered list. Ask the developer to reply in prose. Repeat an item back when its result is not clear.
4. Write the results: `[x]` and `Checked: <D Month YYYY>` for a passed item, then `Note: <comment>` when it has a comment. `Open: <reason>` for a failed item.
5. Change the skill description: it no longer names a multiple-choice question.
6. In `WORKFLOW.md` section 3: add the term "Note": a comment on a passed review item. In section 8: show a ticked item with `Checked:` and `Note:`, and an open item with `Open:`.

## Review checklist
- [x] Run `/flow:checklist` on a test project 3 times: with Python 3, without Python 3, and in a session without a browser. Each run records the same results in the step files.
  Why: The flow depends on a browser, the Bash tool and the machine. The agent cannot test it on a real desktop.
  Checked: 2 November 2026

## Docs to update
`plugins/flow/reference/WORKFLOW.md`, under "Files touched".

## Out of scope
- The page and the server. Step 01 built them. Report a problem with them as a deviation.
- `/flow:discuss` and `/flow:adopt`. Step 03 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The skill names the form of `items.json` and the item id `<step number>-<item number>`. Each run then writes the same file for the server.
- ⏸️ blocking items come first within each step. The page groups the items by step, so a global order would split the steps.
- The skill handles the timeout of the server (exit code 4, from step 01): it asks the developer whether to open the page again.
- When the developer writes in the chat during the wait, the agent answers and waits again.
- The page file fallback reads the newest file in `~/Downloads` whose name starts with `checklist-results`. A browser renames a second download, for example to `checklist-results (1).json`.
- Section 1 of `/flow:checklist` reads the workflow guide sections 3 and 8, for the term "Note".

### Deviations
none
