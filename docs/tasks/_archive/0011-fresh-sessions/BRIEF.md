# Brief: fresh session per skill in the benchmark

Date: 6 November 2026
Roadmap card: none

## Why
The 9 pilot runs of the benchmark show that `flow` costs 3.4x (`flow-inline`) and 4.5x (`flow-agents`) the tokens of `lean`. The quality is the same in each setup. The session logs show the cause. The driver resumes one session for the whole loop, so the context only grows. After `/flow:plan-task`, the context holds 110k to 130k tokens. About 35 later requests each read 130k to 170k tokens again. Agents mode cannot save tokens, because the Opus session already holds the whole project when the step builders start.

The developer wants to know if a new session per skill cuts this cost, and if agents mode then pays off.

## What
The benchmark has two more setups: `flow-inline-fresh` and `flow-agents-fresh`. They run the same loop as `flow-inline` and `flow-agents`. The driver starts a new Claude Code session at each `/flow:` command. A reply such as "go" stays in the current session. The report shows the five setups side by side.

## Decisions

1. A new session starts at each `/flow:` command: `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist` and `/flow:finish-task`. A run then has 4 sessions.
2. Both modes get a fresh setup: `flow-inline-fresh` and `flow-agents-fresh`. Each setup runs 3 times.
3. A field in `bench/setups/setups.json` switches the behaviour on: `"fresh_session": true`. The other setups keep one session.
4. The cost figures of a run are the sum of the totals of each session of the run.
5. Only `bench/` changes. The plugin and decision 31 of `docs/DESIGN.md` stay as they are. A plugin change waits for the results.

## Out of scope
- A change of the plugin: a hint to start a new session, a change of decision 31, or a new mode threshold.
- A setup with a new session only after `/flow:plan-task`.
- The step-size matrix.
- Fewer bookkeeping requests per step, and a lighter read in `/flow:plan-task`.

## How to check the result
1. A run of a fresh setup records 4 session IDs. Its tokens are the sum of the tokens of those sessions.
2. A run of an existing setup records 1 session ID, as before.
3. The 6 new runs finish with the status `done`, and the result files hold the quality figures and the workflow figures.
4. `python bench/report.py` shows a column for each of the 5 setups.

## Open questions
none
