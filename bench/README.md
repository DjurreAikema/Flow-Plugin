# Benchmark of the workflow

Date: 7 November 2026

This folder holds a repeatable benchmark of the `flow` workflow. It compares four setups on two features.

## What it measures

Each run records three groups of figures.

| Group | Figures |
|-------|---------|
| Cost | Tokens per model (input, cache write, cache read, output), weighted tokens, turns, wall time, sessions. The tokens of the simulated developer, apart. |
| Quality | Hidden tests that pass, result of the verify command, files changed outside the allowed list. Traps caught, extra exports and the test rule. |
| Workflow | Commits, the parts and the archive of the brief, last-line rule violations, number of questions. |

## Features and modes

A feature has one of two modes, in the field `mode` of its `feature.json`:

| Mode | Start | Feature |
|------|-------|---------|
| `brief` | A ready brief in `docs/tasks/_new/BRIEF.md`, with its map and its parts. | `holds`: a hold queue for books. It is the control. |
| `request` | A raw request of 3 to 5 sentences, `request.md`. The run gets no brief. | `closing`: close a member account. It has traps. |

A feature in the mode `request` also has these files and fields:

- `intent.md`: the intent card. It holds the real answers of the developer, the API that the developer expects, and what is out of scope. Only the simulated developer reads it.
- `traps`: each trap has an ID, a kind and the names of its hidden tests. The kinds are "edge case", "project rule" and "scope temptation". Each trap is fair: a good question or a careful read of the project reveals it.
- `exports`: the new exported symbols that the intent card expects. The list can be empty.

The traps of `closing`:

| Trap | Kind | What the agent must find |
|------|------|--------------------------|
| `open-obligations` | edge case | A member with an active loan, or with a balance above $5.00, cannot close the account. A refused close changes nothing. |
| `append-only` | project rule | `sample/docs/RULES.md`: the fee ledger is append-only, and a member record is never deleted. |
| `no-forgetting` | scope temptation | The request mentions members who ask to be forgotten, and a report of who left. The intent card rules out both. |

## Setups

The setups are in `setups/setups.json`:

| Setup | Feature | Start |
|-------|---------|-------|
| `lean` | `holds` | Plain Claude Code with a short `CLAUDE.md`. The baseline of `holds`. |
| `flow-thin` | `holds` | `/flow:build` on the ready brief. `/flow:discuss` is not part of the run. |
| `lean-raw` | `closing` | Plain Claude Code with the `CLAUDE.md` of `lean`. The start message is the text of `request.md`. The baseline of `closing`. |
| `flow` | `closing` | `/flow:discuss` with the text of the request. After the ▶️ line of the discussion, `/flow:build docs/tasks/_new` runs in a new session. |

`{request}` in the field `start` of a setup becomes the text of `request.md`.

The field `"fresh_session": true` of a setup starts a new Claude Code session before each message that starts with `/flow:`. A reply stays in the current session. Without the field, the driver resumes one session for the whole run. `flow` uses the field. The result file records the number of sessions in `cost.sessions`.

## Simulated developer

A setup with `"developer": "haiku"` gets its replies from a simulated developer, not from the scripted `replies`. `lean-raw` and `flow` use it.

- Each reply is one call of `claude -p --model haiku`, with the isolation flags, no plugin, no tools (`--tools ""`) and no saved session (`--no-session-persistence`). It runs in an empty folder, so no `CLAUDE.md` loads.
- The prompt holds the intent card and the last message of the agent. The developer answers only what the message asks, and never reveals a fact that the message does not ask about. It picks option 1 "Build now" when the brief matches the intent card. It says no to work that the card rules out.
- In `flow`, the developer answers each 👉 line. The ▶️ and 👀 lines work as before.
- In `lean-raw`, the developer reads each message. When the message waits for nothing, it replies `DONE`, and the driver stops the run.
- The log of the run holds each reply after `=== DEVELOPER ===`.
- The tokens of the developer count apart, in `cost.developer`. They are not part of `cost.tokens_by_model`.

`RESULTS.md` records the results of each benchmark round, with the setups of that time.

## Layout

| Path | Holds |
|------|-------|
| `sample/` | The sample project: a TypeScript library lending system, set up for `flow`. |
| `features/holds/` | The control feature: brief, hidden tests, allowed files, reference patch. |
| `features/closing/` | The feature with traps: request, intent card, traps, hidden tests, allowed files, reference patch. |
| `setups/` | The setups. |
| `run.py` | The driver. |
| `report.py` | The report. |
| `results/` | The result files of the runs. Git ignores this folder. |
| `RESULTS.md` | The results of each benchmark round. |

## Requirements

- Node 22.18 or later. The tests need no `npm install`.
- Python 3.
- Claude Code, signed in with a subscription. The benchmark uses no API key.
- `git` on the PATH.

## Run

```
python bench/run.py --setup flow-thin --plugin plugins/flow --runs 3
python bench/run.py --setup flow --feature closing --plugin plugins/flow --runs 3
```

| Option | Meaning |
|--------|---------|
| `--setup` | A setup of `setups/setups.json`: `lean`, `flow-thin`, `lean-raw` or `flow`. |
| `--plugin` | The plugin folder. Only the flow setups load it. |
| `--feature` | The feature: `holds` or `closing`. The default is `holds`. |
| `--runs` | The number of runs. The default is 3. |
| `--keep` | Keep the temporary folder. |
| `--dry-run` | Skip Claude Code. Prepare the copy and run the quality checks. Write `<run ID>.dry-run.json`. Never run a real session. |
| `--apply-reference` | With `--dry-run`: apply the reference patch first. The hidden tests then pass. |

A run has the ID `<setup>-<feature>-<n>`. The driver skips a run when `results/<run ID>.json` has `"status": "done"`.

Each run:

1. Copies `sample/` to a temporary folder outside the repository, with its own local bare `origin`. Nothing reaches GitHub.
2. Sets the branch guard only after the first commit and push.
3. Plays the developer. It answers each 👉 line with the scripted reply of the setup, or with the simulated developer. It follows each ▶️ line, until `/flow:build` ends.
4. Runs the verify command and the hidden tests, computes the figures below, and writes `results/<run ID>.json` and `results/<run ID>.log`.
5. Deletes the temporary folder.

## Figures for the traps and the cost

| Figure | Result field | Meaning |
|--------|--------------|---------|
| Traps caught | `quality.traps`, `quality.traps_caught` | A trap is caught when all its hidden tests pass. The report shows "x of y". |
| Extra exports | `quality.extra_exports` | The exported symbols of `src/` after the run, minus those of the first commit, minus the `exports` of the feature. A regular expression reads the `export` lines. Only a feature with `exports` has this figure. |
| Test rule followed | `quality.test_rule_followed`, `quality.test_rule_violations` | No line that the run adds to a test file calls `new Date()` without an argument, `Date.now()` or `currentYear()`. The check reads the added lines of the diff, and every line of a new test file. |
| Weighted tokens | `cost.weighted_tokens` | Input counts 1, cache write 1.25, cache read 0.1 and output 5. The weights are the constant `TOKEN_WEIGHTS` in `run.py`. [Verify] the weights against the price list. |
| Developer tokens | `cost.developer` | The tokens, the calls and the weighted tokens of the simulated developer, under the model `haiku`. |

The test rule stands in the sample test plan (`sample/docs/workflow/TESTING.md`) and in `setups/lean/CLAUDE.md`, so that both kinds of setup know it. An existing test file of the sample calls `currentYear()`, so the check reads only the lines that the run adds.

## Isolation

A run loads no `CLAUDE.md` of this repository, and no user-level `CLAUDE.md` or plugin. The driver uses these flags and settings:

| Flag or setting | Purpose |
|-----------------|---------|
| `--setting-sources project,local` | Skip the user settings, with the user-level plugins. [Verify] |
| `--plugin-dir <folder>` | Load the plugin, flow setups only. |
| `BROWSER=<tmp>/fake-browser` | Send a review page to the driver. The plugin has no review page now. See below. |
| `--model opus --permission-mode bypassPermissions --output-format json` | Fixed model, no prompts, one JSON result per call. |

Findings:

- The Claude Code help lists `--setting-sources` as "user, project, local". It does not say that the user-level `CLAUDE.md` stays out. [Verify] Check the first real run for it.
- Python `webbrowser` tries the `BROWSER` command first. On Windows and macOS it then falls back to the default browser, so a missing command does not stop the review page. The driver writes a fake browser into the temporary folder instead: a `.cmd` file on Windows, a `sh` script elsewhere. It writes its first argument, the URL, to `browser-url.txt` and exits 0. The review server then prints the URL and waits.
- A thread of the driver polls for `browser-url.txt` while a call runs. It fetches the page, reads the items, and posts `passed` for every item to the finish path, like the "Finish" button. It deletes the file, so a second review round works. The driver answers the 👀 line with "I clicked Finish." The log records each posted page, with its URL and item IDs. `workflow.review_pages` of the result records it too. When no page was posted, a 👀 line stops the run.
- Linux without a display has no browser. The review server prints `no-browser`, the skill uses the prose fallback, and the scripted reply "Every item passes." answers it.
- The temporary folder is outside this repository, so the `CLAUDE.md` of this repository does not load.
- The driver sends each message on standard input. A shell on Windows would change the quotes of a command-line argument.
- `--bare` and `--safe-mode` also stop the loading of `CLAUDE.md`, but they disable the plugin and the skills too. They do not fit.
- Session logs: `~/.claude/projects/<encoded work path>/<session ID>.jsonl`. The driver finds the file with a wildcard on the folder. Subagent logs: `<session ID>/subagents/agent-*.jsonl`. [Verify] on other versions of Claude Code.
- With `--resume`, `modelUsage` in each JSON result holds the totals of the whole session so far. The driver keeps the last one of each session, and adds up the sessions. `cost.calls` holds the raw figures of each call.
- When the JSON result has no Sonnet entry and step builders ran, the driver adds the tokens of the subagent logs. The result file names the source in `cost.token_source`.

## Usage limit

When a result reports a usage limit, the driver writes the result with `"status": "stopped"` and the reason. It keeps no figures of that run. It exits with code 2. Call the driver again later. It skips the finished runs and runs the rest.

A call that takes more than 3,600 seconds gives `"status": "failed"`. The driver runs that run again at the next call.

## Report

```
python bench/report.py [--feature holds]
```

| Option | Meaning |
|--------|---------|
| `--feature` | Only the runs of this feature. |
| `--results` | The results folder. The default is `bench/results/`. |

The report reads each file `results/<run ID>.json` with `"status": "done"`. It skips every other file, with `*.dry-run.json`.

It prints two Markdown tables and a list:

1. "Runs": one row per run. It shows the setup, the run ID, the tokens per model, the turns and the wall time. It also shows the quality figures and the workflow figures of the run. Use it to find a run that went wrong.
2. "Setups": one column per setup and one row per figure. Each cell is `median (minimum to maximum)`. The row "total tokens against lean" divides the median total tokens of the setup by the median of the plain setup of its feature. That is `lean` for `flow-thin`, and `lean-raw` for `flow`. A value of `1.4x` means 40 percent more tokens. "total tokens" leaves out the simulated developer. The row "developer tokens" shows it. Use it to see what the workflow costs. Compare the quality rows to see if the extra cost buys a better result.
3. A line for each setup with fewer than 3 finished runs. Do not trust the median of such a setup.

Does `flow-thin` follow the workflow? Look at its columns: the hidden tests, the verify result, the commits, the parts and the last-line errors.
