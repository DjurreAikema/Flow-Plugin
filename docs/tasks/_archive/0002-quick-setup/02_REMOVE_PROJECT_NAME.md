# Step 02: Remove the project name

Date: 28 October 2026

## Goal
Only the archived task 0001 names the earlier project, the decision log records the quick setup, and the changelog holds the entry of the task.

## Context to read
- `docs/tasks/0002-quick-setup/README.md`
- `docs/DESIGN.md`
- `CHANGELOG.md`

## Files touched
- the migration brief (deleted)
- `docs/DESIGN.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. Delete the folder of the migration brief.
2. In `docs/DESIGN.md` section 1: describe the origin as an earlier project, without its name or repository.
3. In `docs/DESIGN.md` section 2: remove the sentence about the backlog brief of the migration.
4. In `docs/DESIGN.md` section 4: add decision 13 for the quick setup (task decisions 3 and 4).
5. In `CHANGELOG.md`: in the 0.1.0 entry under "Added", replace the name of the project with "an earlier project".
6. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Added".

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The archived tasks.
- The plugin files. Step 01 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The files of this task name the earlier project too, because they record its removal. After `/flow:finish-task` they are archived, so the search of check 3 then finds only archived tasks.
- `docs/DESIGN.md` section 1 says "Twelve tasks of that project" instead of "Tasks 0001 to 0012", so the numbers do not look like tasks of this repository.
- Decision 13 names task decisions 3 and 4 in one row, because the verify suggestion is part of the quick setup.
- The new changelog entry comes after the existing "Added" entries, in the order of the work.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | The commit of this step emptied the task file `README.md`. The checklist commit restored it from the step 01 commit, with the statuses `verified` and `ready for PR`. | A script of the agent opened the file for writing before it read it. The verify script does not check the content of task files. | The task file only. |
