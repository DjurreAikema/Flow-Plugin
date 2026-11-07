# Step 07: Archive without the project name

Date: 2 November 2026

## Goal
No file of the repository names the earlier project, and the archived tasks keep their meaning.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `docs/tasks/_archive/0001-minimal-git/04_REPO_DOCS.md`
- `docs/tasks/_archive/0002-quick-setup/BRIEF.md`
- `docs/tasks/_archive/0002-quick-setup/README.md`
- Step file 02 of `docs/tasks/_archive/0002-quick-setup/`

## Files touched
- `docs/tasks/_archive/0001-minimal-git/04_REPO_DOCS.md` (changed)
- `docs/tasks/_archive/0002-quick-setup/BRIEF.md` (changed)
- `docs/tasks/_archive/0002-quick-setup/README.md` (changed)
- `docs/tasks/_archive/0002-quick-setup/02_REMOVE_PROJECT_NAME.md` (renamed from step file 02, changed)

## Work
1. Rename step file 02 of task 0002 to `02_REMOVE_PROJECT_NAME.md` with `git mv`. Update the link in the step table of the task file of 0002.
2. In the four files: write "the earlier project" instead of its name, and "the migration brief" instead of the folder name of that brief. Keep every other word.
3. Search the whole repository for the name and the repository of the earlier project, case-insensitive, in the file contents and the file names. Fix each match that this task owns, or report it.

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- Every other change to the archived tasks.
- The task files of this task. They name no project.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The renamed step file of task 0002 has the title "Remove the project name", to match its new file name.
- Work item 5 of that step quoted the old changelog text. It now says "replace the name of the project with an earlier project", because a literal quote would name the project.
- A search of the file contents and the file names, case-insensitive, for the name and the repository of the earlier project finds nothing.

### Deviations
none
