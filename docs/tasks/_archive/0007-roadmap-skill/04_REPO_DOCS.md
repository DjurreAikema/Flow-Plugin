# Step 04: Repository docs and changelog

Date: 2 November 2026

## Goal
The design of this repository matches the roadmap skill, and the changelog holds the entry of the task.

## Context to read
- `docs/tasks/0007-roadmap-skill/README.md`
- `docs/DESIGN.md`
- `CHANGELOG.md`

## Files touched
- `docs/DESIGN.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. In `docs/DESIGN.md` section 2: add the roadmap to what version 0.x does. Remove milestones from the out-of-scope list.
2. In `docs/DESIGN.md` section 3: add a short section on the roadmap: why the status is derived, and why requests are summaries.
3. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Added".

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The decision log. The plan commit added decision 26.
- The plugin files. Steps 01 to 03 do this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The new design section is 3.4 "The roadmap", before "Adopt like discuss". It explains the choices in a problem and choice table, like section 3.2. Sections 3.4 and 3.5 became 3.5 and 3.6. No file refers to them by number.
- Scope section 2 also names the feature analysis, the connectors and the estimates as out of scope, as the brief says.
- The changelog entry is the last item under "Added", in the order of the tasks.

### Deviations
none
