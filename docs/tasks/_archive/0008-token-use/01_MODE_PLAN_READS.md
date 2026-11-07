# Step 01: Mode rule and plan reads

Date: 2 November 2026

## Goal
The mode depends only on the number of steps, and `/flow:plan-task` reads only the sections and documents that it needs. The workflow guide says when to skip the loop.

## Context to read
- `docs/tasks/0008-token-use/README.md`
- `plugins/flow/reference/WORKFLOW.md`
- `plugins/flow/skills/plan-task/SKILL.md`

## Files touched
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)

## Work
1. In `WORKFLOW.md` section 5.8: the `agents` row depends only on "Mode threshold". Remove "or a step changes code".
2. In `WORKFLOW.md` section 1: add a short paragraph after the helper table. A small fix, for example a one-line change, does not need the loop. The developer makes it by hand, on the branch `fix/<slug>`, through a pull request. The branch guard still applies.
3. In `plan-task/SKILL.md`, "Before you start" item 1: read only sections 2, 3, 5, 7, 8, 11 and 12 of the workflow guide.
4. In `plan-task/SKILL.md`, "Before you start" item 4: always read the scope document and the decision log of the config. Read the other documents of "Docs" only when the task touches them. Read every file that the task touches.
5. In `plan-task/SKILL.md`, "Plan" item 10 and the mode question: the mode depends only on the number of steps.

## Review checklist
- [x] Run `/flow:plan-task` on a test project for a code task of 2 steps. It proposes `inline`, and reads the scope document and the decision log.
  Why: Project rule 4. The agent cannot run the plugin on a test project.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The other skills. Step 03 does this.
- The verify script. Step 02 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The mode question of `/flow:plan-task` now gives its reason as "the number of steps, against the mode threshold". The old reason named the steps that change code.
- The small-fix paragraph stands after the helper table of section 1, and points to section 9 for the branch guard.

### Deviations
none
