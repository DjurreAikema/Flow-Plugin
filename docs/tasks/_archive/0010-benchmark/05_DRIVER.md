# Step 05: Driver

Date: 5 November 2026

## Goal
One command runs one setup on the pilot feature, plays the developer, and writes a result file with every figure of decision 15.

## Context to read
- `docs/tasks/0010-benchmark/README.md`, decisions 6 to 20.
- `plugins/flow/reference/WORKFLOW.md` sections 5.5, 11.3 and 11.4.
- `plugins/flow/scripts/review_server.py`, the function `browser_possible` and the `webbrowser.open` call.
- `bench/features/holds/feature.json` and `bench/setups/setups.json`.
- The output of `claude --help`.

## Files touched
- `bench/run.py` (new)
- `bench/.gitignore` (new)
- `bench/README.md` (new)

## Work
1. Write `bench/run.py` with Python 3 and the standard library only. It runs on Windows, macOS and Linux. Command line: `python bench/run.py --setup <name> --plugin <folder> [--feature holds] [--runs 3] [--keep]`.
2. Run ID: `<setup>-<feature>-<n>`, with `n` from 1 to `--runs`. Skip a run when `bench/results/<run ID>.json` exists with `"status": "done"`.
3. Prepare the copy:
   1. Make a temporary folder with the prefix `flow-bench-`, outside the repository. Copy `bench/sample/` to `<tmp>/work`.
   2. Apply `remove` and `files` of the setup.
   3. Run `git init -b main` and commit everything as "Sample project". Make a bare repository `<tmp>/origin.git`, add it as `origin`, and push `main`.
   4. Only then run `git config core.hooksPath tools/git-hooks`. The hooks would refuse the first commit and push.
   5. Copy the brief of the feature to `docs/tasks/_new/BRIEF.md`. Do not commit it.
4. Run Claude Code in `<tmp>/work`:
   - First call: `claude -p <start> --output-format json --model opus --permission-mode bypassPermissions`. Add `--plugin-dir <absolute plugin folder>` for a flow setup.
   - Each next call adds `--resume <session_id>`.
   - Isolation (decision 18): find the flags that stop a user-level `CLAUDE.md` and the user-level plugins from loading, for example `--setting-sources project` [Verify]. Use them. Record the flags and what you found in `bench/README.md`.
   - Set the environment variable `BROWSER=flow-bench-no-browser` (decision 13).
   - Stop a call after 3,600 seconds.
5. Decide the next message from the last non-empty line of each result:
   - A 👉 line: send the first matching reply of the setup, or "go".
   - A ▶️ line with a `/flow:` command: send that command. When the last command was `/flow:finish-task`, stop.
   - Any other last line: stop.
   - Stop at `max_messages`.
6. Usage limit: when a result has `is_error` and its text names a limit, write the result with `"status": "stopped"` and the reason, and exit with code 2. Keep no partial figures as a finished run.
7. Record the cost: add up `modelUsage` of every JSON result, per model: input, cache write, cache read and output tokens. Add up `num_turns` and `duration_ms`. Record the wall time of the whole run too.
8. Read the session log of Claude Code for the run: `~/.claude/projects/<encoded work path>/<session_id>.jsonl` [Verify] the encoding. Count each `Agent` tool use with `subagent_type` `flow:step-builder`. When step builders ran and `modelUsage` has no Sonnet entry, add the usage of the subagent logs of the session [Verify] their location. Record which source gave the tokens.
9. Record the quality:
   - Run the verify command on the final state, before the hidden tests go in. Record pass or fail.
   - Copy the hidden tests by `hidden_tests` of the feature. Run `node --test` on each of them. Record the passed and the total count from the summary lines.
   - List the files that changed since the first commit, on every branch and in the working tree. Record each file that matches no `allowed` pattern.
10. Record the workflow figures:
    - The commits since the first commit, and the steps of the task file. For `lean`, record the commits only.
    - For the flow setups: each step status in the task file is `verified`, and the task status.
    - Last-line rules: the number of messages whose last line is not a 👉, ▶️ or 👀 line, except the final message of `lean`.
    - Questions: the number of lines like `1. Assumption:`, `1. Conflict:` or `1. Blocker:` in all messages.
11. Write `bench/results/<run ID>.json` with `"status": "done"`, the setup, the feature, the plugin folder, the commit of the plugin folder, the date, the flags, and every figure. Write each exchange to `bench/results/<run ID>.log`: the message sent and the full result text.
12. Delete the temporary folder, unless `--keep` is set.
13. Write `bench/.gitignore` with the line `results/`.
14. Write `bench/README.md` in the style `ste`: what the benchmark measures, the layout of `bench/`, the requirements (Node 22.18 or later, Python 3, Claude Code with a subscription), the run command, the isolation flags, and what a usage limit does.
15. Check the parts that need no model: run the preparation and the quality checks with a flag `--dry-run` that skips Claude Code. The hidden tests fail on the untouched copy, and the result file is complete.
16. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [x] ⏸️ Run `python bench/run.py --setup flow-agents --plugin plugins/flow --runs 1` on your subscription. Check that the run loads no user-level `CLAUDE.md`, that the result counts the step builders, and that their tokens are in the result file.
  Why: A real run costs subscription use, and only a real run shows the step builders. Step 06 reads these result files.

## Docs to update
- `bench/README.md` (new).

## Out of scope
- The report. Step 06 writes it.
- Parallel runs, runs in the cloud, or an API key.
- Changes to `plugins/flow/`. When the BROWSER trick fails, record it as a problem.

## Outcome
Status: implemented
Verify: passed. The only failure is the known check 7 ("sections") on 3 archive lines of task 0003 (Discovery answer 1). A dry run of `flow-agents` prepares the copy, finds that the hooks refuse a commit on `main`, passes 166 sample tests, and fails the hidden tests on the untouched copy.

### Choices made
- The driver sends each message to `claude -p` on standard input, not as an argument. A shell on Windows would change the quotes in a reply.
- Isolation uses `--setting-sources project,local`. The help of Claude Code does not say that this keeps a user-level `CLAUDE.md` out, so `bench/README.md` marks it [Verify]. `--bare` and `--safe-mode` switch off plugins and skills, so they do not fit.
- `--apply-reference` works only with `--dry-run`. It applies the reference patch, so that the passing path of the quality checks is tested. The hidden tests then pass 25 of 25.
- A dry run writes `<run ID>.dry-run.json` with the status `dry-run`. It never counts as a finished run.
- The driver finds the session log with the pattern `~/.claude/projects/*/<session_id>.jsonl`, so it does not need the path encoding. Subagent logs are in `<session_id>/subagents/agent-*.jsonl`, with the agent type in a `.meta.json` file. The driver adds their tokens only when step builders ran and `modelUsage` has no Sonnet entry. `cost.token_source` records the source.
- The driver forces LF in the hooks of the copy, and sets `core.autocrlf false` before the first commit. After the setup, it tries an empty commit on `main`, and records `hooks_refuse_main`.
- A failed call or a timeout writes the status `failed` with no figures, so the next call runs it again. A usage limit writes `stopped` and exits with code 2.
- A 👀 last line stops the conversation. It does not count as a last-line violation. A reply matches the 👉 line first, then the full message.
- `bench/.gitignore` also ignores `__pycache__/`.

- The fake browser is a `.cmd` file on Windows and a `sh` script elsewhere. The `sh` branch is untested.
- The orchestrator checked the fake browser without Claude Code: `review_server.py` wrote `results.json` with every item passed, and exited 0.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | The driver has the flags `--dry-run` and `--apply-reference`. | Work item 15 needs a run without Claude Code, and the passing path needs a check too. | none |
| 2 | The driver no longer sets `BROWSER` to a missing command (task decision 13). It writes a fake browser into the temporary folder, which records the URL and exits 0. A watcher thread posts "passed" for every item to the review server, like the "Finish" button. A 👀 last line then gets the reply "I clicked Finish." | The first real run opened the real review page on Windows. Python `webbrowser` falls back to the default browser when the `BROWSER` command fails, and `review_server.py` assumes a browser on Windows and macOS. The developer approved the fix. | Task decision 13. The ⏸️ review item runs again. |
| 3 | Dry runs write `<run ID>.dry-run.log`. | A dry run during the fix overwrote the log of the first real run. | none |
| 4 | The driver keeps the last `modelUsage` of a session, and no longer adds up the `modelUsage` of each call. `cost.calls` records the raw figures of each call. Orchestrator fix. | With `--resume`, `modelUsage` holds the totals of the whole session so far. The review run showed it: the Sonnet sum was exactly 4 times the logs of the step builders, one count per call from `/flow:implement-task` on. | Task decision 14. |
