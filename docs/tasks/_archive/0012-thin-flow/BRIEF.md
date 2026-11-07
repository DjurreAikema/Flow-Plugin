# Brief: thin flow, brief then autopilot build

Date: 7 November 2026
Roadmap card: none

## Why
The benchmark ran 15 times on the feature `holds` (`bench/RESULTS.md`). The flow loop cost 3.2x to 4.5x the tokens of `lean`, with the same code quality. Three things cause the cost. `/flow:plan-task` reads the whole project. About 35 bookkeeping requests read the full context again. The loop runs in four skills.

The developer wants a good brief and then an autopilot build. The discussion settles the work. After the brief, the agent builds without approvals.

## What
The loop has two skills. `/flow:discuss` talks the work through, explores the code once and writes the brief. `/flow:build` builds the brief in a new session and opens a pull request. The developer approves the brief, and reviews the pull request with its human checklist.

## Decisions

1. The brief gets three new sections:
   - Map: the files and functions to change, and the patterns to follow.
   - Parts: the parts of the work. The build makes one commit per part.
   - Human checklist: checks that are cheap for a human and expensive for an agent.
   The brief also holds the planned tests and the changelog entry.
2. `/flow:discuss` does the exploration and fills in the map. It plans the tests by the section "Testing" of the config. It asks before it plans a test for an untested function that the work changes.
3. `/flow:build` runs in a new session. It gives the task its ID, starts the feature branch and reads the brief. It reads only the files of the map, and uses a search before it reads a file. It builds the parts, runs the verify command, and commits once per part. Then it archives the brief, pushes the branch and opens the pull request.
4. The build stops and asks the developer only in these cases:
   - The verify command fails, and the agent cannot fix it.
   - The work needs something out of scope.
   - The work contradicts a decision of the brief.
   Every other change is a deviation. The pull request lists each deviation.
5. The pull request description holds the deviations, a summary, and the human checklist as checkboxes. The developer ticks the checklist during the review.
6. The record of a task is `docs/tasks/_archive/<task ID>/BRIEF.md`. The build adds a section "Outcome" only when the task has deviations. `/flow:whats-next` and `/flow:roadmap` read this record.
7. These parts of the plugin go away:
   - The skills `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist` and `/flow:finish-task`.
   - The step builder, agents mode and the setting "Mode threshold".
   - The review page, its server, and the templates `TASK.md` and `STEP.md`.
8. Each skill holds the rules that it needs. No skill reads `reference/WORKFLOW.md`, `reference/GIT.md` or `reference/WRITING_STYLE.md` when it runs. The style check stays a script. `/flow:whats-next`, `/flow:roadmap`, `/flow:tutorial` and `/flow:adopt` change to fit the new loop.
9. The decision log gets new rows. They replace decisions 20, 27, 30, 31 and 32, and move decision 25 to `/flow:discuss`. The changelog gets an entry under "Changed" that says what a project must do.
10. The benchmark gets the setup `flow-thin`. The brief of the feature `holds` gets a map and parts. `lean` and `flow-thin` run 3 times each with that brief. `bench/RESULTS.md` records the result. The task sets no target for the ratio against `lean`.
11. The setups `flow-inline`, `flow-agents`, `flow-inline-fresh` and `flow-agents-fresh` leave `bench/setups/setups.json`, because their skills go away. `bench/RESULTS.md` keeps their figures.

## Out of scope
- A strict path next to the thin flow.
- A benchmark of `/flow:discuss`.
- A release of the plugin.

## How to check the result
1. `sh tools/verify.sh` passes.
2. A `flow-thin` run ends with the brief in `docs/tasks/_archive/` and a pull request description with the human checklist.
3. `python bench/report.py` shows `flow-thin` next to `lean`, with 3 runs each.

## Open questions
none
