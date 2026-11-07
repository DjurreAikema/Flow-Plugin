# Step 07: Run and record

Date: 7 November 2026

## Goal
`lean` and `flow-thin` have 3 finished runs each with the new brief, and the records name the thin flow.

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, decisions 10 and 11, and the section "Changelog".
- `bench/README.md` and `bench/RESULTS.md`.
- `CHANGELOG.md`.

## Files touched
- `bench/RESULTS.md` (changed)
- `bench/README.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. Move the 15 result files of 6 November 2026 to `bench/results/2026-11-06/`.
2. Run `python bench/run.py --setup lean --plugin plugins/flow --runs 3`, then the same for `flow-thin`. At a usage limit, stop and report to the developer.
3. Check that each run has the status `done`, and that each `flow-thin` run archived its brief.
4. Run `python bench/report.py`.
5. In `bench/RESULTS.md`, add a section for the runs of 7 November 2026: the report, the context per request of the `flow-thin` sessions, and the findings. Keep the section of 6 November 2026, and say that its setups no longer exist.
6. In `bench/README.md`, describe the setups `lean` and `flow-thin`, and remove the old flow setups and `fresh_session` where they no longer apply.
7. Copy the entry of the section "Changelog" of the task file to `## [Unreleased]` of `CHANGELOG.md`, under `### Changed`.
8. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [ ] Read `bench/RESULTS.md`. The findings follow from the figures.
  Why: Judging the text needs a human, and the findings decide the next change of the plugin.

## Docs to update
- `bench/RESULTS.md`, `bench/README.md`, `CHANGELOG.md`.

## Out of scope
- A change of the plugin or the driver.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Work item 1 ran in step 06, before the dry run.
- `bench/RESULTS.md` has one section per round. Round 2 comes first. Round 1 keeps its text, one heading level lower, with a note that its setups no longer exist.
- `bench/README.md` keeps the field `fresh_session` and the fake browser of the driver, and says that no setup uses them now.

### Deviations
none
