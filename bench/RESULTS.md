# Benchmark results

Date: 7 November 2026

This file records the results of the benchmark runs of the feature `holds`, one section per round. The result files stay in `bench/results/`, and git ignores that folder. `bench/README.md` explains the setups, the figures and the commands.

## Round 2: thin flow, 7 November 2026

### The runs

- Feature: `holds`, with the new brief: a map with line numbers, 3 parts and the planned tests. Both setups got this brief.
- Setups: `lean` and `flow-thin`. Each ran 3 times, with Claude Code 2.1.318 and the model `opus`.
- Plugin: commit `7cc5559` (task 0012). `flow-thin` runs `/flow:build` only. The brief comes ready, so the cost of `/flow:discuss` is not part of the figures.

### Report

#### Runs

| Setup | Run ID | Tokens per model | Turns | Wall time (s) | Hidden tests | Verify | Files outside | Commits | Parts | Last-line errors | Questions | Step builders |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lean | lean-holds-1 | opus 1.6M | 45 | 223.0 | 25/25 | pass | 0 | 3 | - | 0 | 0 | 0 |
| lean | lean-holds-2 | opus 1.7M | 46 | 214.9 | 25/25 | pass | 0 | 3 | - | 0 | 0 | 0 |
| lean | lean-holds-3 | opus 1.5M | 41 | 205.5 | 25/25 | pass | 0 | 3 | - | 0 | 0 | 0 |
| flow-thin | flow-thin-holds-1 | opus 2.1M | 54 | 223.4 | 25/25 | pass | 0 | 5 | 3 | 0 | 0 | 0 |
| flow-thin | flow-thin-holds-2 | opus 2.1M | 54 | 232.6 | 25/25 | pass | 0 | 5 | 3 | 0 | 0 | 0 |
| flow-thin | flow-thin-holds-3 | opus 2.0M | 55 | 222.8 | 25/25 | pass | 0 | 6 | 3 | 0 | 0 | 0 |

#### Setups

Each cell is `median (minimum to maximum)`.

| Figure | lean | flow-thin |
|---|---|---|
| total tokens | 1.6M (1.5M to 1.7M) | 2.1M (2.0M to 2.1M) |
| total tokens against lean | 1.0x | 1.3x |
| output tokens | 26226 (25801 to 27276) | 26498 (26083 to 26944) |
| turns | 45 (41 to 46) | 54 (54 to 55) |
| wall time (s) | 214.9 (205.5 to 223) | 223.4 (222.8 to 232.6) |
| sessions | 1 (1 to 1) | 1 (1 to 1) |
| hidden tests passed | 25 (25 to 25) | 25 (25 to 25) |
| verify passed (1 = yes) | 1 (1 to 1) | 1 (1 to 1) |
| files outside allowed | 0 (0 to 0) | 0 (0 to 0) |
| commits | 3 (3 to 3) | 5 (5 to 6) |
| parts | - | 3 (3 to 3) |
| last-line errors | 0 (0 to 0) | 0 (0 to 0) |
| questions | 0 (0 to 0) | 0 (0 to 0) |
| step builders | 0 (0 to 0) | 0 (0 to 0) |

### Context per request

The main session of each run, from the session logs of Claude Code.

| Run | Requests | Context at the start | Median context | Context at the end |
|-----|----------|----------------------|----------------|--------------------|
| lean-holds-1 | 19 | 36k | 85k | 104k |
| lean-holds-2 | 22 | 36k | 86k | 95k |
| lean-holds-3 | 17 | 36k | 91k | 106k |
| flow-thin-holds-1 | 26 | 39k | 85k | 103k |
| flow-thin-holds-2 | 26 | 39k | 86k | 101k |
| flow-thin-holds-3 | 25 | 39k | 80k | 100k |

### Findings

1. `flow-thin` costs 1.3x of `lean`: 2.1M tokens against 1.6M. In round 1, the loop of five skills cost 3.4x to 4.5x. The thin flow cuts the cost of a build by about two thirds against `flow-inline` (6.0M).
2. Quality is the same. Every run passes 25 of 25 hidden tests and the verify command, and changes no file outside the allowed list.
3. The context per request is the same as `lean`: a median of 80k to 86k. The map works: the build reads 11 to 13 files, and `lean` reads 9 or 10.
4. The extra cost comes from about 6 more requests per run. They move the brief, run the style check, archive the task and write the pull request description. `flow-thin` makes 5 or 6 commits, against 3 for `lean`.
5. Each run follows the parts: one commit per part, in the order of the brief. One run made a fix commit for part 2 after part 3.
6. The build asked no question, and broke no last-line rule. The rule "never put the last line in a code block" works.
7. Each run reports 2 deviations: `HoldService` has public methods that decision 1 of the brief does not name, so that `LoanService` can use it. Each run records them in an "Outcome" section of the archived brief.
8. The style check flags 2 long sentences in the text of the `holds` brief. Each run leaves that text as it is, because the task did not write it.
9. `lean` also uses the new brief: 3 commits in each run, one per part. Its cost is about the same as in round 1: 1.6M against 1.7M.

### Limits

- The figures leave out `/flow:discuss`. A real task also pays for the discussion and the exploration of the code. [Verify] its cost with a benchmark of the discussion.
- One feature only, with a brief that settles every decision.

## Round 1: five skills, 6 November 2026

The setups of this round no longer exist: task 0012 removed `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist`, `/flow:finish-task` and agents mode. Their result files are in `bench/results/2026-11-06/`.

### The runs

- Feature: `holds`. Each setup ran 3 times. All 15 runs ran on 6 November 2026, with Claude Code 2.1.318 and the model `opus`.
- Plugin: every flow run used the same files in `plugins/flow/`. The runs of `flow-inline` and `flow-agents` record the commit `c6c73d6`. The runs of the fresh setups record the commit `db133fb`. `plugins/flow/` has no difference between the two commits.
- Driver: the runs of the fresh setups, except `flow-agents-fresh-holds-1`, used the driver that reads past a closing code fence. See "Last-line errors".

### Report

The output of `python bench/report.py`.

#### Runs

| Setup | Run ID | Tokens per model | Turns | Wall time (s) | Hidden tests | Verify | Files outside | Commits | Steps | Last-line errors | Questions | Step builders |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| lean | lean-holds-1 | opus 1.5M | 40 | 202.5 | 25/25 | pass | 0 | 4 | - | 0 | 0 | 0 |
| lean | lean-holds-2 | opus 1.7M | 34 | 202.2 | 25/25 | pass | 0 | 4 | - | 0 | 0 | 0 |
| lean | lean-holds-3 | opus 2.3M | 37 | 230.9 | 25/25 | pass | 0 | 6 | - | 0 | 0 | 0 |
| flow-inline | flow-inline-holds-1 | opus 6.0M | 94 | 428.5 | 25/25 | pass | 0 | 9 | 3 | 0 | 5 | 0 |
| flow-inline | flow-inline-holds-2 | opus 5.8M | 96 | 447.9 | 25/25 | pass | 0 | 10 | 4 | 0 | 3 | 0 |
| flow-inline | flow-inline-holds-3 | opus 6.3M | 76 | 420.0 | 25/25 | pass | 0 | 9 | 3 | 0 | 3 | 0 |
| flow-agents | flow-agents-holds-1 | opus 6.4M, sonnet 1.0M | 73 | 447.9 | 25/25 | pass | 0 | 9 | 3 | 0 | 3 | 3 |
| flow-agents | flow-agents-holds-2 | opus 6.6M, sonnet 1.1M | 78 | 445.2 | 25/25 | pass | 0 | 11 | 4 | 0 | 3 | 4 |
| flow-agents | flow-agents-holds-3 | opus 7.3M, sonnet 2.0M | 69 | 539.2 | 25/25 | pass | 0 | 10 | 3 | 0 | 3 | 3 |
| flow-inline-fresh | flow-inline-fresh-holds-1 | opus 6.0M | 133 | 501.3 | 25/25 | pass | 0 | 9 | 3 | 1 | 5 | 0 |
| flow-inline-fresh | flow-inline-fresh-holds-2 | opus 5.3M | 149 | 547.2 | 25/25 | pass | 0 | 10 | 4 | 3 | 3 | 0 |
| flow-inline-fresh | flow-inline-fresh-holds-3 | opus 6.0M | 144 | 517.1 | 25/25 | pass | 0 | 9 | 3 | 1 | 5 | 0 |
| flow-agents-fresh | flow-agents-fresh-holds-1 | opus 4.5M, sonnet 1.1M | 112 | 520.0 | 25/25 | pass | 0 | 9 | 3 | 1 | 7 | 3 |
| flow-agents-fresh | flow-agents-fresh-holds-2 | opus 4.7M, sonnet 909.1k | 124 | 543.6 | 25/25 | pass | 0 | 9 | 3 | 2 | 5 | 3 |
| flow-agents-fresh | flow-agents-fresh-holds-3 | opus 4.4M, sonnet 1.4M | 120 | 539.6 | 25/25 | pass | 0 | 9 | 3 | 1 | 5 | 3 |

#### Setups

Each cell is `median (minimum to maximum)`.

| Figure | lean | flow-inline | flow-agents | flow-inline-fresh | flow-agents-fresh |
|---|---|---|---|---|---|
| total tokens | 1.7M (1.5M to 2.3M) | 6.0M (5.8M to 6.3M) | 7.8M (7.5M to 9.3M) | 6.0M (5.3M to 6.0M) | 5.6M (5.6M to 5.9M) |
| total tokens against lean | 1.0x | 3.4x | 4.5x | 3.4x | 3.2x |
| output tokens | 23926 (23641 to 26691) | 45019 (43411 to 46204) | 53238 (52048 to 60249) | 55641 (53795 to 59269) | 63291 (62546 to 65818) |
| turns | 37 (34 to 40) | 94 (76 to 96) | 73 (69 to 78) | 144 (133 to 149) | 120 (112 to 124) |
| wall time (s) | 202.5 (202.2 to 230.9) | 428.5 (420 to 447.9) | 447.9 (445.2 to 539.2) | 517.1 (501.3 to 547.2) | 539.6 (520 to 543.6) |
| sessions | 1 (1 to 1) | 1 (1 to 1) | 1 (1 to 1) | 4 (4 to 4) | 4 (4 to 4) |
| hidden tests passed | 25 (25 to 25) | 25 (25 to 25) | 25 (25 to 25) | 25 (25 to 25) | 25 (25 to 25) |
| verify passed (1 = yes) | 1 (1 to 1) | 1 (1 to 1) | 1 (1 to 1) | 1 (1 to 1) | 1 (1 to 1) |
| files outside allowed | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) |
| commits | 4 (4 to 6) | 9 (9 to 10) | 10 (9 to 11) | 9 (9 to 10) | 9 (9 to 9) |
| steps | - | 3 (3 to 4) | 3 (3 to 4) | 3 (3 to 4) | 3 (3 to 3) |
| last-line errors | 0 (0 to 0) | 0 (0 to 0) | 0 (0 to 0) | 1 (1 to 3) | 1 (1 to 2) |
| questions | 0 (0 to 0) | 3 (3 to 5) | 3 (3 to 3) | 5 (3 to 5) | 5 (5 to 7) |
| step builders | 0 (0 to 0) | 0 (0 to 0) | 3 (3 to 4) | 0 (0 to 0) | 3 (3 to 3) |

### Context per request

Each request of a session reads the whole context again. The tokens of a session are about the number of requests times the size of the context. Cache reads are more than 90 percent of the tokens of each run. The figures below come from the session logs of Claude Code, for the main session only.

#### One session per run

| Run | Requests | Context at the start | Median context | Context at the end | Tokens |
|-----|----------|----------------------|----------------|--------------------|--------|
| lean-holds-1 | 19 | 36k | 82k | 103k | 1.5M |
| flow-inline-holds-1 | 50 | 40k | 133k | 159k | 6.0M |
| flow-agents-holds-1 | 46 | 40k | 148k | 172k | 6.4M |

In the flow runs, `/flow:plan-task` reads the config, the workflow guide, the brief, every source file, the test files and the templates. After the plan, the context holds 110k to 130k tokens. About 35 later requests then read 130k to 170k tokens each. Most of these requests do bookkeeping: they tick a step, commit, push or edit the task file.

#### A new session per skill

The median of the 3 runs of each fresh setup, per session. "Tokens" is the Opus tokens of the main session.

| Session | `flow-inline-fresh` requests | Median context | Tokens | `flow-agents-fresh` requests | Median context | Tokens |
|---------|------------------------------|----------------|--------|------------------------------|----------------|--------|
| plan | 10 | 94k | 0.84M | 10 | 110k | 0.92M |
| implement | 30 | 121k | 3.32M | 24 | 92k | 2.06M |
| checklist | 11 | 60k | 0.64M | 10 | 55k | 0.55M |
| finish | 16 | 79k | 1.19M | 14 | 79k | 1.10M |

Each session starts at about 39k tokens. A new session reads the config, the guide sections and the task files again. The inline implement session also reads every source file again, so its context climbs back to about 140k. The agents orchestrator does not read the source, so its context stays under 110k.

### Findings

1. Quality is the same in each setup. Every run passes 25 of 25 hidden tests and the verify command, and changes no file outside the allowed list. On this feature, the workflow does not change the quality of the code.
2. A new session per skill does not cut the cost of `inline` mode. `flow-inline-fresh` and `flow-inline` both use 6.0M tokens. The smaller context of the checklist and finish sessions saves tokens. The extra requests and the second read of the source in the implement session cost the same amount.
3. Agents mode pays off only with a new session per skill. `flow-agents-fresh` uses 5.6M tokens: 28 percent less than `flow-agents`, and 7 percent less than `flow-inline`. Its Opus tokens are 4.5M, against 6.0M for `flow-inline`. The orchestrator of a fresh implement session holds the task files, not the source.
4. Agents mode in one long session costs the most: 7.8M tokens, or 4.5x of `lean`. The plan session already holds the whole project when the step builders start, so the step builders add tokens and save none.
5. A fresh session breaks the last-line rule (workflow guide section 11.3) 1 to 3 times per run. The agent puts the whole message in a code block. The last line is then the closing fence, not the 👉 line or the ▶️ line. The runs with one session have no such error. The workflow guide shows its message formats in code blocks. [Verify] that the agent copies these blocks when the session has no earlier message.
6. A fresh session needs more turns and more time. `flow-inline-fresh` needs 144 turns against 94, and 517 seconds against 429. The agent asks 5 questions against 3.
7. The best flow setup still costs 3.2x of `lean`. The largest costs are the implement session and the bookkeeping requests in each step.

### Limits

- One feature only. A feature where `lean` fails can show a difference in quality that these runs cannot show.
- The fresh setups start a new session at each `/flow:` command. A developer who uses `/clear` before each command gets the same effect. [Verify] that `/clear` gives the same start context as a new session.
- The tokens are not a price. Cache reads cost less than input tokens and output tokens. [Verify] how cache reads count against the limits of a subscription.
- The first runs of `flow-inline-fresh` and `flow-agents-fresh-holds-2` stopped early: 3 runs at a fenced 👉 line, and 1 run at the usage limit. The driver now reads past a closing fence, and these 4 runs ran again. Their old result files are not part of the report.
