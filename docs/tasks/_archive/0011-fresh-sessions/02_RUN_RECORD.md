# Step 02: Run and record the results

Date: 6 November 2026

## Goal
The two fresh setups have 3 finished runs each, and `bench/RESULTS.md` records the report of the 15 runs with its findings.

## Context to read
- `docs/tasks/0011-fresh-sessions/README.md`, decisions 2, 5 and 6, and the section "Changelog".
- `bench/README.md`, the sections "Run" and "Report".
- `CHANGELOG.md`.

## Files touched
- `bench/RESULTS.md` (new)
- `CHANGELOG.md` (changed)

## Work
1. Run `python bench/run.py --setup flow-inline-fresh --plugin plugins/flow --runs 3`. Then run the same command for `flow-agents-fresh`. At a usage limit, stop and report to the developer.
2. Check that each new run has the status `done` and `cost.sessions` of 4.
3. Run `python bench/report.py`.
4. Write `bench/RESULTS.md`: the date, the plugin commit, the two tables of the report, the context per request of the main session, and the findings. Mark each estimate as an estimate.
5. Copy the entry of the section "Changelog" of the task file to `## [Unreleased]` of `CHANGELOG.md`, under `### Added`.
6. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [x] Read `bench/RESULTS.md`. The findings follow from the figures.
  Why: Judging the text needs a human, and the findings decide the next task of the plugin.
  Checked: 7 November 2026

## Docs to update
- `bench/RESULTS.md`
- `CHANGELOG.md`

## Out of scope
- A change of the plugin, of the driver or of the report.
- A new row in the decision log.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The 4 result files of the runs that stopped early are in `bench/results/_broken/`, not deleted. The report does not read that folder.
- `bench/RESULTS.md` copies the two tables of the report as they are, and adds the context per session from the session logs of Claude Code.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | `bench/run.py` (not under "Files touched"): `last_line` can skip closing code fences. The driver uses this to pick its reply. The workflow figures still count a fenced last line as a violation. | 3 of the first 4 runs of the fresh setups stopped early. The agent put the 👉 line in a code block, and the driver read the fence as the last line. The developer chose to fix the driver and run these runs again. | none |
| 2 | Work item 1: the runs ran in two calls. `flow-agents-fresh-holds-2` stopped at the 5-hour usage limit, and ran again after the reset. | The usage limit of the subscription. | none |
