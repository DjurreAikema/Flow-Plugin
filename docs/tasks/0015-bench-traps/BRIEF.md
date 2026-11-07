# Brief: benchmark round 3, from a raw request with traps

Date: 7 November 2026
Roadmap card: none

## Why
Every run of rounds 1 and 2 passed 25 of 25 hidden tests, so quality did not separate the setups. Both setups got a ready brief, so the value of `/flow:discuss` was never measured. The developer wants a benchmark that shows these gaps.

## What
The benchmark has a second feature, `closing`, that starts from a raw request with traps. `lean-raw` gets the request in a plain session. `flow` runs `/flow:discuss`, then `/flow:build`. A simulated developer on Haiku answers their questions from a hidden intent card. The report shows the traps caught, the extra exports, the test rule and the weighted tokens. `holds` stays as the control. Round 3 runs all four setups.

## Decisions
1. The feature `closing` closes a member account. It touches `members.ts`, `loans.ts`, `fees.ts` and `reports.ts` of the sample. Its folder holds `request.md`, `intent.md`, `feature.json`, hidden tests and a reference patch.
2. `request.md` is a raw request of 3 to 5 sentences, in the words of a developer. It names the goal, not every rule.
3. `intent.md` is the intent card: the real answers of the developer, the API that the developer expects, and what is out of scope.
4. The feature has at least three traps, one of each kind. The build designs the details. Each trap is fair: a good question or a careful read of the project reveals it.
   - An unstated edge case. Examples: a member with active loans or an open balance, or a closed member who tries to borrow.
   - A project rule that conflicts with the obvious solution. It stands in the new sample document `docs/RULES.md`, which the sample config names under "Design". Example: the fee ledger is append-only.
   - A scope temptation: work that the request hints at and the intent card rules out.
5. `feature.json` gains the fields `mode` (`brief` or `request`), `request` and `intent`. It also gains `traps`, each with its ID, kind and hidden test names. `exports` lists the new public symbols that the intent card expects. `holds` gets `mode: brief`, and keeps its other fields.
6. Two new setups run `closing`. `lean-raw`: a plain session with `setups/lean/CLAUDE.md`, and the start message is the text of `request.md`. `flow`: the start message is `/flow:discuss` with the text of the request. After the ▶️ line of the discussion, `/flow:build docs/tasks/_new` runs in a new session. `lean` and `flow-thin` stay as they are, on `holds`.
7. The simulated developer is a call of `claude -p --model haiku`, with the intent card and the last message of the agent. It answers only what the message asks. It never reveals an answer that the message does not ask for. It picks option 1 "Build now" when the brief matches the intent card. It says no to work against the intent card.
8. In `flow`, the simulated developer answers each 👉 line. In `lean-raw`, it reads each message and replies `DONE` when the message waits for nothing. The driver then stops the run.
9. The tokens of the simulated developer count apart, under the model `haiku`. The report shows them in their own row, and leaves them out of "total tokens against lean".
10. New quality figures:
    - Traps caught: for each trap, whether all its hidden tests pass. The report shows "x of y".
    - Extra exports: the exported symbols of `src/` after the run, minus those before the run, minus the `exports` of the feature.
    - Test rule followed: no new or changed test file calls `new Date()` without an argument, `Date.now()` or `currentYear()`.
11. A new cost figure: weighted tokens. Input counts 1, cache write 1.25, cache read 0.1, and output 5. The weights are a constant in `run.py`, marked `[Verify]` against the price list.
12. The sample test plan gets one custom rule under "How tests are written": tests never use the real date, and pass `today` explicitly. `setups/lean/CLAUDE.md` gets the same rule, so both setups know it.
13. Round 3 runs `lean` and `flow-thin` on `holds`, and `lean-raw` and `flow` on `closing`, 3 runs each. At a usage limit, the build stops and reports to the developer. The next build session continues the runs.
14. `bench/RESULTS.md` gets a section "Round 3" above round 2, with the report, the context per request and the findings. Rounds 1 and 2 keep their text.
15. Decision 44 of `docs/DESIGN.md` records the method. `/flow:discuss` added the row.

## Out of scope
- A mutation score of the tests of the agent.
- A second new feature, and a benchmark of several tasks in a row.
- Any change to `plugins/flow/`.
- An API key. The runs use the subscription of the developer.
- A change to the hidden tests and the reference patch of `holds`.

## Map
- `bench/run.py`:
  - `prepare`: with `mode: request`, copy no brief. With `mode: brief`, keep the copy of today.
  - `conversation` and `next_message`: the start message comes from the setup, with `{request}` replaced by the text of `request.md`. Replies come from the simulated developer when the setup has `"developer": "haiku"`. Otherwise keep the scripted replies.
  - `next_message`: in `flow`, the ▶️ line of `/flow:discuss` names `/flow:build`. Start it in a new session, the same way as `fresh_session`. The run finishes after `/flow:build`, as today.
  - A new function `simulated_developer(intent, message)`: one `claude -p --model haiku` call, with the isolation flags, no plugin and no session. It returns the reply and its usage.
  - `quality_and_workflow`: add the traps caught, the extra exports and the test rule. Read exports with a regular expression on `export` lines, like the list of `grep "^export"`.
  - `cost_figures`: add the weighted tokens, and keep the tokens of the simulated developer apart.
  - `QUESTION_RE` and `brief_figures` stay as they are.
- `bench/report.py`: `SETUPS` gets `lean-raw` and `flow`. New rows: traps caught, extra exports, test rule followed, weighted tokens, developer tokens. "total tokens against lean" compares `lean-raw` and `flow` with `lean-raw`, and `flow-thin` with `lean`, per feature.
- `bench/setups/setups.json`: the setups `lean-raw` and `flow`, each with `"developer": "haiku"` and a `max_messages` of 20.
- `bench/setups/lean/CLAUDE.md`: the test rule of decision 12.
- `bench/features/closing/` (new): `request.md`, `intent.md`, `feature.json`, `hidden/closing.test.ts`, `reference.patch`. Follow the form of `bench/features/holds/`.
- `bench/features/holds/feature.json`: add `mode: brief`.
- `bench/sample/docs/RULES.md` (new), `bench/sample/docs/workflow/CONFIG.md` (name `docs/RULES.md` under "Design"), and `bench/sample/docs/workflow/TESTING.md` (the custom rule).
- `bench/README.md`: the four setups, the two modes, the simulated developer, the new figures and the weights.
- `bench/RESULTS.md`: the section "Round 3".
- `CHANGELOG.md`: the entry of this brief.

## Parts
1. The feature `closing` and the sample: the request, the intent card, the traps, the hidden tests and the reference patch. Also the rules document, and the test rule in the sample plan and the lean `CLAUDE.md`. `python bench/run.py --setup lean --feature holds --plugin plugins/flow --dry-run --apply-reference` still passes. Files: `bench/features/closing/*`, `bench/features/holds/feature.json`, `bench/sample/docs/RULES.md`, `bench/sample/docs/workflow/CONFIG.md`, `bench/sample/docs/workflow/TESTING.md`, `bench/setups/lean/CLAUDE.md`.
2. The driver and the report: the request mode, the simulated developer, the setups `lean-raw` and `flow`, and the new figures. A dry run with `--apply-reference` passes for each setup on its feature. It shows every trap caught, 0 extra exports and the test rule followed. Files: `bench/run.py`, `bench/report.py`, `bench/setups/setups.json`.
3. The docs: the readme of the benchmark and the changelog. Files: `bench/README.md`, `CHANGELOG.md`.
4. Round 3: 3 runs of each of the four setups, `python bench/report.py`, and the section "Round 3" of `bench/RESULTS.md`. Files: `bench/RESULTS.md`.

## Tests
none. The test plan of this repository has no automated tests. The verify script is the check. The dry runs check the driver.

## Human checklist
- [ ] Read `bench/features/closing/request.md`, `intent.md` and the traps in `feature.json`. Each trap is fair: a good question or a careful read of the project reveals it.
  Why: Only a person can judge whether a trap is fair.
- [ ] Read the findings of round 3 in `bench/RESULTS.md`. They follow from the figures.
  Why: Judging a text needs a human, and the findings decide the next change of the plugin.

## Changelog
Added: The benchmark has the feature `closing`, with a raw request, an intent card and three traps. A simulated developer on Haiku answers the questions of the setups `lean-raw` and `flow` from the intent card. The report adds the traps caught, the extra exports, the test rule and the weighted tokens. `bench/RESULTS.md` holds round 3. Task: [0015-bench-traps](docs/tasks/_archive/0015-bench-traps/BRIEF.md).

## Open questions
none
