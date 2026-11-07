# Step 03: Loop skills

Date: 2 November 2026

## Goal
The skills of the loop have no tracker, no extra records, no fragments and no milestones, and they name the new section numbers of the workflow guide.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `plugins/flow/reference/WORKFLOW.md`, as step 02 left it
- `plugins/flow/skills/discuss/SKILL.md`
- `plugins/flow/skills/plan-task/SKILL.md`
- `plugins/flow/skills/implement-task/SKILL.md`
- `plugins/flow/skills/finish-task/SKILL.md`

## Files touched
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)
- `plugins/flow/skills/implement-task/SKILL.md` (changed)
- `plugins/flow/skills/finish-task/SKILL.md` (changed)

## Work
1. In `/flow:discuss`: remove the Azure Boards item of "Backlog".
2. In `/flow:plan-task`: remove the work item from "Plan" step 2, from "Show and write" step 4 and from the commit. Remove the entries of the extra records. Remove `fragments` from "Plan" step 9.
3. In `/flow:implement-task`: remove `AB#` from both commit items. In "Changelog and extra records", remove `fragments` and the extra records, and rename the section to "Changelog".
4. In `/flow:finish-task`: remove the fragment check and the extra records check. Remove "Order" step 5 (the roadmap update). Remove the work item link and the extra records from the pull request description. Renumber the steps of "Order".
5. In all four skills: change every reference to workflow guide section 13 to section 12.
6. In all four skills: replace the game examples with the neutral examples of step 02.

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- `/flow:checklist`: it names none of the removed features.
- The helper skills. Step 04 does this.
- The deletion of files. Step 04 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `/flow:discuss` "Backlog" and `/flow:finish-task` "Order" are renumbered after the removed items. The task link check of `/flow:finish-task` now names step 5, the archive step.
- `/flow:implement-task` "Changelog" keeps two rules: copy the `direct` entry, and never invent an entry.
- `/flow:finish-task` keeps "Never target a release branch". A project can still have release branches through its own release process, so the rule stays useful.
- Only `/flow:implement-task` had a game example: `0003-movement-prototype` became `0003-password-reset`.

### Deviations
none
