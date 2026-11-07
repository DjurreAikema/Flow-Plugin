# Step 04: Repo docs and changelog

Date: 28 October 2026

## Goal
The design, the config and the backlog briefs of this repository match the minimal core, and the changelog holds the entry of the task.

## Context to read
- `docs/tasks/0001-minimal-git/README.md`
- `plugins/flow/reference/GIT.md` and `plugins/flow/templates/CONFIG.md`, as step 01 left them
- `docs/DESIGN.md`
- `docs/workflow/CONFIG.md`
- `docs/tasks/_backlog/azure-devops-trial/BRIEF.md`
- the migration brief
- `CHANGELOG.md`

## Files touched
- `docs/DESIGN.md` (changed)
- `docs/workflow/CONFIG.md` (changed)
- `docs/tasks/_backlog/azure-devops-trial/BRIEF.md` (changed)
- the migration brief (changed)
- `CHANGELOG.md` (changed)

## Work
1. In `docs/DESIGN.md`: update the scope and section 3.3 for the minimal core. Add decision rows for decisions 1 to 6 of the task file. Mark decision 4 of the log as replaced, without deleting it.
2. In `docs/workflow/CONFIG.md`: use the new settings. This repository keeps git hooks on.
3. In both backlog briefs: replace "Model" and "Branch protection" with the new settings.
4. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
- [x] Read `plugins/flow/reference/GIT.md` and `plugins/flow/templates/CONFIG.md`. A project on a host that the plugin does not know can follow them.
  Why: This is the goal of the task, and it needs a human reader.
  Checked: 28 October 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The plugin files. Steps 01 to 03 do this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Decision 4 of the design log stays, marked as replaced by decisions 8 and 10. The log keeps its history.
- The design log got decisions 8 to 12, one per decision of the task, with the same meaning.
- This repository switches both extras on: git hooks, because GitHub cannot protect a private repository on a free plan, and releases, because of project rule 5.
- The migration brief now says that its git flow release process goes into its project rules.
- In the changelog, "Changed" comes after "Added", the order of Keep a Changelog.

### Deviations
none
