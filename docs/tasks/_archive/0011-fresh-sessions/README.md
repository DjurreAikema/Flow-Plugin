# Task 0011: fresh session per skill in the benchmark

Date: 6 November 2026
Status: ready for PR
Mode: inline
Roadmap card: none

## Goal
The benchmark has the setups `flow-inline-fresh` and `flow-agents-fresh`. They start a new Claude Code session at each `/flow:` command. `bench/RESULTS.md` records the results of the 15 runs of the feature `holds`.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. A new session starts at each `/flow:` command: `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist` and `/flow:finish-task`. A run then has 4 sessions. A reply such as "go" stays in the current session.
2. Both modes get a fresh setup: `flow-inline-fresh` and `flow-agents-fresh`. Each setup runs 3 times.
3. A field in `bench/setups/setups.json` switches the behaviour on: `"fresh_session": true`. The other setups keep one session.
4. The cost figures of a run are the sum of the totals of each session of the run. The result file records the number of sessions in `cost.sessions`.
5. Only `bench/` and the records of this repository change. The plugin and decision 31 of `docs/DESIGN.md` stay as they are. A plugin change waits for the results.
6. `bench/RESULTS.md` records the report of the 15 runs and the analysis of the context per request. The result files stay in `bench/results/`, which git ignores.

## Out of scope
- A change of the plugin: a hint to start a new session, a change of decision 31, or a new mode threshold.
- A setup with a new session only after `/flow:plan-task`.
- The step-size matrix.
- Fewer bookkeeping requests per step, and a lighter read in `/flow:plan-task`.
- A new row in the decision log of `docs/DESIGN.md`. Decision 34 covers the benchmark.

## Tests
none

## Changelog
Added:
- The benchmark has the setups `flow-inline-fresh` and `flow-agents-fresh`. They start a new Claude Code session at each `/flow:` command. `bench/RESULTS.md` holds the results of the 15 runs of the feature `holds`. Task: [0011-fresh-sessions](docs/tasks/_archive/0011-fresh-sessions/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Add the fresh setups](01_FRESH_SETUPS.md) | verified |
| 02 | [Run and record the results](02_RUN_RECORD.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0011 fresh session per skill in the benchmark

✅ Facts I checked
   1. `cost_figures` keeps the last `modelUsage` of each session ID and adds up the sessions.   `bench/run.py:365`
   2. `session_figures` reads a list of session IDs, so it counts the step builders of each session.   `bench/run.py:419`
   3. `report.py` shows a setup outside `SETUPS` last, without the check for fewer than 3 runs.   `bench/report.py:9`
   4. The branch is `feature/0011-fresh-sessions`, the working tree is clean, and the branch guard is on.   `git status`

📁 Files I will touch
   ~ bench/setups/setups.json      step 01
   ~ bench/run.py                  step 01
   ~ bench/report.py               step 01
   ~ bench/README.md               step 01
   + bench/RESULTS.md              step 02
   ~ CHANGELOG.md                  step 02
```

Answer: "go". No questions.
