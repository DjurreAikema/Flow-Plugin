# Step 02: Remove the old loop skills

Date: 7 November 2026

## Goal
The plugin has no `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist` or `/flow:finish-task`, and no review page.

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, decision 7.
- `tools/verify.sh`, checks 2 and 5.

## Files touched
- `plugins/flow/skills/plan-task/SKILL.md` (deleted)
- `plugins/flow/skills/implement-task/SKILL.md` (deleted)
- `plugins/flow/skills/checklist/SKILL.md` (deleted)
- `plugins/flow/skills/finish-task/SKILL.md` (deleted)
- `plugins/flow/scripts/review_server.py` (deleted)
- `plugins/flow/templates/review-page.html` (deleted)

## Work
1. Delete the 4 skill folders with `git rm -r`.
2. Delete `scripts/review_server.py` and `templates/review-page.html`.
3. Search the plugin for `${CLAUDE_PLUGIN_ROOT}` paths to the deleted files. Step 04 fixes a reference in a helper skill. Record each one that this step leaves.
4. Run `sh tools/verify.sh`. It passes.

## Review checklist
none

## Docs to update
none

## Out of scope
- The step builder and the templates `TASK.md` and `STEP.md`. Step 03 removes them.
- The text of the helper skills.

## Outcome

Status: implemented
Verify: passed

### Choices made
- No `${CLAUDE_PLUGIN_ROOT}` path in the plugin points to a deleted file. The helper skills name the old skills only in text. Step 04 changes that text.

### Deviations
none
