# Step 06: Report and records

Date: 5 November 2026

## Goal
A report command prints the pilot runs and the median and spread per setup, and the records of the repository name the benchmark.

## Context to read
- `docs/tasks/0010-benchmark/README.md`, decisions 15 and 16, and the section "Changelog".
- `bench/run.py`, the code that writes the result file.
- `bench/README.md`.
- `AGENTS.md` and `CHANGELOG.md`.

## Files touched
- `bench/report.py` (new)
- `bench/README.md` (changed)
- `AGENTS.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. Write `bench/report.py` with Python 3 and the standard library only. Command: `python bench/report.py [--feature holds]`. It reads every `bench/results/*.json` with `"status": "done"`.
2. Print a Markdown table with one row per run: setup, run ID, total tokens per model, turns, wall time, hidden tests passed, verify, files outside the allowed list, commits, steps, last-line errors, questions and step builders.
3. Print a second Markdown table with one column per setup and one row per figure. Each cell is the median and the spread: `median (minimum to maximum)`. Add a row with the total tokens of each setup against the median of `lean`, for example `1.4x`.
4. Print a line per setup with fewer than 3 finished runs.
5. Add a section "Report" to `bench/README.md`: the command, and how to read the two tables.
6. In `AGENTS.md`, add the row `bench/` to "Layout", and the run and report commands to "Commands".
7. Copy the entry of the section "Changelog" of the task file to `## [Unreleased]` of `CHANGELOG.md`, under `### Added`.
8. Run `python bench/report.py` on the result files that exist. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [x] Run the 9 pilot runs: each setup with `--runs 3`. Run `python bench/report.py`, and read the two tables. They answer both questions: does agents mode work, and what does the workflow cost against `lean`?
  Why: The runs use the subscription of the developer, and the judgement of the result needs the developer.
  Checked: 5 November 2026
  Note: Moved to a new task. The 9 pilot runs have not run in this task. The next task, the step-size matrix, runs them first and reads the report.

## Docs to update
- `bench/README.md`, `AGENTS.md`, `CHANGELOG.md`.

## Out of scope
- Charts or an HTML report.
- Changes to `bench/run.py`, except a fix for a field that the report cannot read. Record it as a deviation.
- A change to the mode threshold or to the plugin, based on the results.

## Outcome
Status: implemented
Verify: passed. The only failure is the known check 7 ("sections") on 3 archive lines of task 0003 (Discovery answer 1).

### Choices made
- `report.py` has the option `--results <folder>`, with the default `bench/results/`. The test used a copy of the review run under a run ID name in a temporary folder. Both tables printed.
- A result counts only when its name is `<run ID>.json`, its `run_id` matches the name, and its status is `done`. So the report skips dry runs and `check-before-token-fix.json`.
- Without a `lean` run, the row of the total tokens against `lean` shows `n/a`. A `lean` run has no steps, so its "steps" cell shows `-`.
- The column of the tokens per model shows the model family and the sum of the 4 token kinds, for example `opus 14.7M, sonnet 3.0M`.
- Without finished runs, the report prints "No finished runs in <folder>." and exits with code 0.
- The changelog entry is a word-for-word copy of the task file, at the end of `### Added`.

### Deviations
none
