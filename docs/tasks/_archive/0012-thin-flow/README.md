# Task 0012: thin flow, brief then autopilot build

Date: 7 November 2026
Status: ready for PR
Mode: inline
Roadmap card: none

## Goal
The loop has two skills. `/flow:discuss` writes a brief with a map, parts and a human checklist. `/flow:build` builds the brief on autopilot and opens the pull request. The benchmark measures `flow-thin` against `lean`.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. The brief gets the sections "Map", "Parts", "Tests" and "Human checklist", next to the changelog entry (brief decision 1).
2. `/flow:discuss` explores the code once and fills in the map. It reads the scope document and the decision log, and plans the tests by the section "Testing" of the config. It asks before it plans a test for an untested function that the work changes.
3. `/flow:build` runs in a new session. It gives the task its ID and starts the feature branch. It reads the brief and only the files of the map, with a search before each read. It builds the parts, runs the verify command, commits once per part, archives the brief, pushes and opens the pull request.
4. `/flow:build` stops only in three cases. The verify command fails and it cannot fix it. The work needs something out of scope. The work contradicts a decision of the brief. Every other change is a deviation.
5. The pull request description holds the deviations, a summary, the coverage when the config has a coverage command, and the human checklist as checkboxes.
6. The record of a task is `docs/tasks/_archive/<task ID>/BRIEF.md`. The build adds a section "Outcome" only when the task has deviations. `/flow:whats-next` and `/flow:roadmap` read this record, and its line `Roadmap card`.
7. Removed: `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist`, `/flow:finish-task`, the step builder, agents mode, "Mode threshold", the review page and its server, and the templates `TASK.md` and `STEP.md`.
8. Each skill holds the rules that it needs. No skill reads `reference/WORKFLOW.md`, `reference/GIT.md` or `reference/WRITING_STYLE.md` when it runs. Exception: `/flow:adopt` and `/flow:tutorial` read the workflow guide and the git guide. The skills still read the host guides and the templates. (Plan answer 2.)
9. Decision log rows 35 to 41 replace decisions 20, 27, 28, 30, 31 and 32, and move decisions 25 and 29 to `/flow:discuss`. (Plan answer 3.)
10. The benchmark gets the setup `flow-thin`. The brief of the feature `holds` gets a map and parts. `lean` and `flow-thin` run 3 times each. The old flow setups leave `bench/setups/setups.json`. The 15 old result files move to `bench/results/2026-11-06/`, and `bench/RESULTS.md` keeps their figures. (Plan answer 4.)
11. The task sets no target for the ratio against `lean`.

## Out of scope
- A strict path next to the thin flow.
- A benchmark of `/flow:discuss`.
- A release of the plugin.
- Changes to the host guides and the git hooks.

## Tests
none

## Changelog
Changed:
- The loop has two skills. `/flow:discuss` writes a brief with a map, parts and a human checklist. `/flow:build` builds the brief on autopilot in a new session and opens the pull request, with the human checklist in its description. `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist`, `/flow:finish-task`, agents mode, the step builder and the review page are removed. Each skill holds its own rules. A project with a config removes "Mode threshold" from "Tasks". It changes "the current step" to "the brief" in hard rule 1 of its `AGENTS.md`. It finishes its active tasks with the old version first. Task: [0012-thin-flow](docs/tasks/_archive/0012-thin-flow/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Add the thin loop](01_THIN_LOOP.md) | implemented |
| 02 | [Remove the old loop skills](02_REMOVE_LOOP.md) | verified |
| 03 | [Remove agents mode and the templates](03_REMOVE_AGENTS.md) | verified |
| 04 | [Fit the helper skills](04_HELPER_SKILLS.md) | implemented |
| 05 | [Rewrite the guide and the docs](05_GUIDE_DOCS.md) | implemented |
| 06 | [Fit the benchmark](06_FIT_BENCH.md) | verified |
| 07 | [Run and record](07_RUN_RECORD.md) | implemented |

## Discovery answers

```
🔍 Discovery: Task 0012 thin flow, brief then autopilot build

❓ Questions
   1. Conflict: templates/MILESTONE.md says the card status comes from "the task files". After this task it comes from the archived briefs.
      ● a) Add templates/MILESTONE.md to step 04
      ○ b) Leave it, and record it as an open point

✅ Facts I checked
   1. The verify script checks each plugin path, the icon set and each cited guide section.   tools/verify.sh
   2. adopt, roadmap and whats-next cite the guide sections 5.9, 7 and 11.   adopt:76, roadmap:17, whats-next:21
   3. The branch is feature/0012-thin-flow, the tree is clean, and the guard is on.   git status
```

Answer: "go". Question 1: a). Step 04 also touches `plugins/flow/templates/MILESTONE.md`.
