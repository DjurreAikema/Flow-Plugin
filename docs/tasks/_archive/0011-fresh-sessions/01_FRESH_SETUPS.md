# Step 01: Add the fresh setups

Date: 6 November 2026

## Goal
The driver runs the setups `flow-inline-fresh` and `flow-agents-fresh` with a new session at each `/flow:` command, and the report shows them.

## Context to read
- `docs/tasks/0011-fresh-sessions/README.md`, decisions 1 to 4.
- `bench/setups/setups.json`.
- `bench/run.py`, the functions `conversation`, `cost_figures` and `run_one`.
- `bench/report.py`.
- `bench/README.md`.

## Files touched
- `bench/setups/setups.json` (changed)
- `bench/run.py` (changed)
- `bench/report.py` (changed)
- `bench/README.md` (changed)

## Work
1. In `bench/setups/setups.json`, add `flow-inline-fresh` and `flow-agents-fresh`. Each is a copy of `flow-inline` or `flow-agents`, with `"fresh_session": true`.
2. In `conversation` of `bench/run.py`, set the session ID to none before a message that starts with `/flow:`, when the setup has `fresh_session`.
3. In `run_one`, record the number of session IDs of the run as `cost.sessions`.
4. In `bench/report.py`, add the two setups to `SETUPS`, after `flow-agents`. Add the figure `sessions` from `cost.sessions`.
5. In `bench/README.md`, add the two setups to the list of setups. Describe the field `fresh_session`, and the figure `sessions`.
6. Run `python bench/run.py --setup flow-inline-fresh --plugin plugins/flow --dry-run`. Run `python bench/report.py`. Run `sh tools/verify.sh`. Each passes.

## Review checklist
none

## Docs to update
- `bench/README.md`

## Out of scope
- Real runs of the new setups. Step 02 does them.
- A change of the existing setups or of the plugin.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `report.py` counts the session IDs of `cost.calls` when a result file has no `cost.sessions`. The 9 pilot runs then show 1 session, not "-".
- The check for fewer than 3 runs lists every setup of `SETUPS`, so it also names a fresh setup with 0 runs.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | `tools/verify.sh` (not under "Files touched"): the sections check compares the folder path with `/` separators. | On Windows, `os.path.join` uses `\`, so the check never skipped `docs/tasks/_archive` and failed on archived task 0003. The verify command failed on `main` too. The developer chose to fix it in this task. | none |
