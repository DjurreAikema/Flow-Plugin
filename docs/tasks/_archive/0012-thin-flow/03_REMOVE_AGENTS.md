# Step 03: Remove agents mode and the templates

Date: 7 November 2026

## Goal
The plugin has no step builder, no task and step templates, and no setting "Mode threshold".

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, decisions 7 and 8, and the section "Changelog".
- `plugins/flow/templates/CONFIG.md` and `plugins/flow/templates/AGENTS.md`.
- `docs/workflow/CONFIG.md`.

## Files touched
- `plugins/flow/agents/step-builder.md` (deleted)
- `plugins/flow/templates/TASK.md` (deleted)
- `plugins/flow/templates/STEP.md` (deleted)
- `plugins/flow/templates/CONFIG.md` (changed)
- `plugins/flow/templates/AGENTS.md` (changed)
- `docs/workflow/CONFIG.md` (changed)

## Work
1. Delete `agents/step-builder.md`, `templates/TASK.md` and `templates/STEP.md` with `git rm`.
2. In `templates/CONFIG.md` and `docs/workflow/CONFIG.md`, remove the line "Mode threshold" from "Tasks".
3. In `templates/AGENTS.md`, change hard rule 1 to "Build only what the brief names." Change rule 3 to copy the entry of the brief. Change the row of the workflow guide in "Read these first". The skills hold their own rules. The guide explains the workflow to a person.
4. Run `sh tools/verify.sh`. It passes.

## Review checklist
none

## Docs to update
none

## Out of scope
- `AGENTS.md` of this repository. Step 05 changes it.
- The sample project of the benchmark. Step 06 changes it.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The row of the workflow guide in the `AGENTS.md` template says that the guide is for a person. The skills hold their own rules.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | `plugins/flow/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` (not under "Files touched"): the descriptions name the loop of discuss and build. The keyword `agents` became `brief`. | Both descriptions named the five phases and agents mode, which this task removes. | none |
