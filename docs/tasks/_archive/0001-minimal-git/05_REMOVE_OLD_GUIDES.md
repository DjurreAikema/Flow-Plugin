# Step 05: Remove the old git guides

Date: 28 October 2026

## Goal
The folder `plugins/flow/reference/git/` is gone, and no file refers to it.

## Context to read
- `docs/tasks/0001-minimal-git/README.md`

## Files touched
- `plugins/flow/reference/git/TRUNK.md` (deleted)
- `plugins/flow/reference/git/GIT_FLOW.md` (deleted)

## Work
1. Check that no file outside `docs/tasks/` refers to `reference/git/`.
2. Delete `plugins/flow/reference/git/`.

## Review checklist
none

## Docs to update
none

## Out of scope
- Every other file.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Decision 12 in `docs/DESIGN.md` still names `reference/git/`. It records the replacement, so it stays. No other file outside `docs/tasks/` names the folder.

### Deviations
none
