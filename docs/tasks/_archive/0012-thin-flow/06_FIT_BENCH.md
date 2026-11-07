# Step 06: Fit the benchmark

Date: 7 November 2026

## Goal
The benchmark runs the setup `flow-thin` from a brief with a map and parts, and reads the archived brief of the run.

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, decision 10.
- `bench/run.py`: `next_message`, `task_figures` and `quality_and_workflow`.
- `bench/report.py`, `bench/setups/setups.json` and `bench/features/holds/BRIEF.md`.
- `bench/sample/docs/workflow/CONFIG.md` and `bench/sample/AGENTS.md`.
- `plugins/flow/skills/build/SKILL.md` and `plugins/flow/templates/BRIEF.md`.

## Files touched
- `bench/run.py` (changed)
- `bench/report.py` (changed)
- `bench/setups/setups.json` (changed)
- `bench/features/holds/BRIEF.md` (changed)
- `bench/sample/docs/workflow/CONFIG.md` (changed)
- `bench/sample/AGENTS.md` (changed)

## Work
1. In `setups.json`, remove `flow-inline`, `flow-agents`, `flow-inline-fresh` and `flow-agents-fresh`. Add `flow-thin`: the plugin, `CLAUDE.md` with `@AGENTS.md`, the start message `/flow:build docs/tasks/_new`, and the reply for a pull request link.
2. In `run.py`, stop the run after `/flow:build` ends with its ▶️ line. Replace `task_figures` with figures from the archived brief: its path, and whether it has an "Outcome" section. Keep the commits, the last-line errors and the questions.
3. In `report.py`, set `SETUPS` to `lean` and `flow-thin`. Replace the figure "steps" with "parts" when the result has it. Keep the other figures.
4. In `features/holds/BRIEF.md`, add a map, the parts, the tests and a human checklist, in the form of the new template. The decisions and the public API stay the same.
5. In the sample `CONFIG.md`, remove "Mode threshold". In the sample `AGENTS.md`, change hard rule 1 and rule 3 like step 03.
6. Run `python bench/run.py --setup flow-thin --plugin plugins/flow --dry-run --apply-reference`. The hidden tests pass. Run `sh tools/verify.sh`. It passes.

## Review checklist
none

## Docs to update
none. Step 07 updates `bench/README.md`.

## Out of scope
- Real runs. Step 07 does them.
- The hidden tests and the reference patch of `holds`.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `flow-thin` has `max_messages` 10, because the build asks no approval.
- `brief_figures` replaces `task_figures`. It records the path of the brief, whether it is archived, the number of parts, and whether it has an "Outcome" section.
- The `holds` brief moves "How to check the result" into "Out of scope" and the map: the files outside the map stay out. The decisions and the public API stay the same. "Human checklist" and "Changelog" are `none`, because the sample has no screen and no changelog.
- The map names line numbers in the sample source, so that the build can read only the part that it needs.
- Work item 1 of step 07 ran here: the 15 old result files are in `bench/results/2026-11-06/`. Git ignores that folder.

### Deviations
none
