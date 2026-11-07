# Step 02: Read rules, part 2

Date: 2 November 2026

## Goal
Every other skill except finish-task skips a file that the session already holds and did not edit.

## Context to read
- `docs/tasks/0009-read-once/README.md`
- `plugins/flow/reference/WORKFLOW.md` section 2, principle 11, as step 01 left it
- The read items of the six skills under "Files touched"

## Files touched
- `plugins/flow/skills/implement-task/SKILL.md` (changed)
- `plugins/flow/skills/roadmap/SKILL.md` (changed)
- `plugins/flow/skills/checklist/SKILL.md` (changed)
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `plugins/flow/skills/adopt/SKILL.md` (changed)

## Work
1. In the read item of each skill: add the sentence of step 01. "Skip a file that this session already holds and did not edit."
2. `whats-next` reads the config in "Gather" item 1. Add the sentence there.

## Review checklist
none

## Docs to update
none

## Out of scope
- `finish-task`. Step 03 does this.
- Any other change of these skills.

## Outcome

Status: implemented
Verify: passed

### Choices made
- In `whats-next`, the sentence follows "Gather" item 1, the first read of the skill. Its rules forbid edits, so every held file counts as unedited.

### Deviations
none
