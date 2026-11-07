# Brief: benchmark fixes from round 3

Date: 7 November 2026
Roadmap card: none

## Why
Round 3 showed three gaps in the benchmark. The figure "questions" counts an old format and is 0 everywhere. The simulated developer sometimes says more than the agent asks. `flow-thin` on `holds` rose from 1.3x to 1.6x, and the result files cannot explain why.

## What
The report shows how often each setup asked the developer, and whether it asked before it changed the code. The simulated developer answers only what the agent asks, and never steers the workflow. A replay checks the new developer against the logs of round 3. Each result counts the tool calls of the run by kind. Round 4 runs `lean-raw` and `flow` on `closing` again, with the fixed developer.

## Decisions
1. The figure "questions" and `QUESTION_RE` leave the driver and the report.
2. New figure "question rounds": the number of agent messages that got an answer from the simulated developer. The answer to the option question of `/flow:discuss` does not count. That message holds the text "What do you want to do with this brief?".
3. New figure "asked before code": yes when the first answer of the simulated developer came while `src/` had no change against the first commit. After each call, the driver records whether `src/` changed. It checks the working tree, the untracked files and the commits of every branch. Without any answer, the figure is "no".
4. The prompt of the simulated developer gets strict rules:
   - Answer only the questions of the message, each with a short answer.
   - Never give a fact of the intent card that the message does not ask for.
   - Never comment on a choice that the message describes but does not ask about.
   - Never tell the agent to build, continue, skip or approve, except where the message asks for exactly that.
   - At the option question of `/flow:discuss`, reply with the number of the option only.
   The prompt holds two short examples: a good answer, and an answer that leaks a fact.
5. A replay checks the prompt without full runs: `python bench/run.py --replay-developer <run ID>`. It reads `results/<run ID>.log`. It sends each agent message that got a developer answer to the new prompt, with the intent card of the feature. It writes `results/<run ID>.replay.md`, with the old and the new answer of each message side by side.
6. The build runs the replay on the 6 runs of `closing` from round 3. The three leaks of round 3 must be gone: the corrections in `lean-raw-closing-2` and `lean-raw-closing-3`, and "Go ahead and build it" in `flow-closing-3`. When a leak stays after two changes of the prompt, the developer model becomes `sonnet`. The setup field `developer` then holds `sonnet`, and the driver accepts `haiku` and `sonnet`.
7. Each result gets `workflow.tool_calls`: the number of tool calls of the main sessions by kind. The kinds are read (`Read`), edit (`Edit`, `Write`), shell (`Bash`, `PowerShell`), search (`Grep`, `Glob`) and other. The driver reads them from the session logs that it already opens. The report shows one row per kind.
8. `bench/RESULTS.md` round 3 gets a note on the rise of `flow-thin`. The build sessions of round 2 made 53 or 54 tool calls with 20 to 23 edits. Those of round 3 made 55 to 57 tool calls with 24 to 26 edits. No run of round 3 read `docs/RULES.md` or `TESTING.md`. The rise comes from more fixing edits, not from new reads. Treat it as variation until the tool breakdown shows a cause.
9. Round 4 runs `lean-raw` and `flow` on `closing`, 3 runs each. The 6 result files of `closing` from round 3 move to `bench/results/2026-11-07-round-3/` first. At a usage limit, the build stops and reports to the developer.
10. `bench/RESULTS.md` gets a section "Round 4" above round 3, with the report of `closing`, the context per request, the replay result and the findings. The report of round 4 leaves out `holds`. Rounds 1 to 3 keep their text, except the note of decision 8.

## Out of scope
- New runs of `lean` and `flow-thin` on `holds`.
- A leak check by a second model call.
- Any change to `plugins/flow/`, including the way `/flow:discuss` handles a developer who says "build it".
- Changes to the feature `closing`, its traps and its hidden tests.
- A new feature.

## Map
- `bench/run.py`:
  - `QUESTION_RE` (line 47) and its use in `quality_and_workflow`: remove.
  - `DEVELOPER_PROMPT` (line 59) and `FINISH_RULE`: the rules and the examples of decision 4. Keep the placeholders `{finish}`, `{intent}` and `{message}`.
  - `DEVELOPER_FLAGS` (line 52) and `simulated_developer`: take the model from the setup field `developer`.
  - `conversation`: after each call, record whether `src/` changed against the first commit. Record for each developer answer whether it answered the option question. Return these records with the results.
  - `quality_and_workflow`: the figures "question rounds" and "asked before code".
  - `read_jsonl` and `session_figures`: count the tool calls by kind, from the `tool_use` items of the assistant messages.
  - `main`: the option `--replay-developer <run ID>`. It needs no `--setup` and no `--plugin`. It reads the feature from the result file of the run.
  - The log format stays: `=== SENT n ===`, `=== RESULT n ===` and `=== DEVELOPER ===`. The replay reads it.
- `bench/report.py`: remove the row "questions". Add the rows "question rounds", "asked before code" and one row per tool kind. Keep the other rows.
- `bench/setups/setups.json`: the field `developer`, only when decision 6 changes the model.
- `bench/README.md`: the new figures, the replay command and the developer rules.
- `bench/RESULTS.md`: the note of decision 8, and the section "Round 4".
- `CHANGELOG.md`: the entry of this brief.

## Parts
1. The figures: remove "questions", and add "question rounds", "asked before code" and the tool calls by kind, in the driver and the report. A dry run of `flow` on `closing` with `--apply-reference` passes. Files: `bench/run.py`, `bench/report.py`.
2. The developer: the strict prompt, the model from the setup, and the replay. The replay of the 6 runs of round 3 shows no leak. Files: `bench/run.py`, `bench/setups/setups.json`.
3. The docs: the readme of the benchmark, the note on round 3, and the changelog. Files: `bench/README.md`, `bench/RESULTS.md`, `CHANGELOG.md`.
4. Round 4: 3 runs of `lean-raw` and `flow` on `closing`, the report, and the section "Round 4". Files: `bench/RESULTS.md`.

## Tests
none. The test plan of this repository has no automated tests. The verify script is the check. The dry run and the replay check the driver.

## Human checklist
- [ ] Read the replay files of round 3 in `bench/results/`. The new answers answer only what the agent asked.
  Why: Only a person can judge whether an answer leaks a fact.
- [ ] Read the findings of round 4 in `bench/RESULTS.md`. They follow from the figures.
  Why: Judging a text needs a human.

## Changelog
Changed: The benchmark report replaces "questions" with "question rounds" and "asked before code", and counts the tool calls of each run by kind. The simulated developer answers only what the agent asks. `python bench/run.py --replay-developer <run ID>` checks it against the log of a run. `bench/RESULTS.md` holds round 4: `lean-raw` and `flow` on `closing` again. Task: [<task ID>](docs/tasks/_archive/<task ID>/BRIEF.md).

## Open questions
none
