# Step 04: Style check in verify

Date: 2 November 2026

## Goal
The verify script of this repository runs the style script on the plugin documents, and they pass it.

## Context to read
- `docs/tasks/0009-read-once/README.md`
- `tools/verify.sh`
- `plugins/flow/scripts/style_check.py`, as step 03 left it

## Files touched
- `tools/verify.sh` (changed)
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/templates/REQUEST.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. Add check 8 "wording" to `tools/verify.sh`. It runs `plugins/flow/scripts/style_check.py` on the Markdown files of `plugins/flow/`, without `reference/WRITING_STYLE.md`, which shows bad text on purpose. Skip it with a ⚠️ when `python3` is missing. Add it to the comment block at the top.
2. Split each sentence of more than 25 words in `WORKFLOW.md`, `whats-next` and `templates/REQUEST.md`. Keep the meaning. `adopt` has no finding (step 03, deviation 1).
3. Fix any other finding of the script in these files. When a finding is in a file outside "Files touched", stop and report it.
4. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
none

## Docs to update
`CHANGELOG.md`.

## Out of scope
- The documents outside `plugins/flow/`.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Each long sentence became two. The `REQUEST.md` example moved into its own sentence after the choice.
- A test line with "just" in `templates/BRIEF.md` made check 8 fail. The test line is removed.
- Step 03 deviation 1 applies: `adopt` needed no fix, and it is not touched in this step.

### Deviations
none
