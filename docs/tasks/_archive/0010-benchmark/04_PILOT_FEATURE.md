# Step 04: Pilot feature and setups

Date: 5 November 2026

## Goal
The pilot feature "holds" has a brief, hidden tests, an allowed list and a reference patch, and each setup has its files and scripted replies.

## Context to read
- `docs/tasks/0010-benchmark/README.md`, decisions 7 to 13.
- `plugins/flow/templates/BRIEF.md`.
- `plugins/flow/reference/WORKFLOW.md` sections 11.3 and 11.4.
- Every file in `bench/sample/src/` and `bench/sample/test/`.

## Files touched
- `bench/features/holds/BRIEF.md` (new)
- `bench/features/holds/hidden/holds.test.ts` (new)
- `bench/features/holds/reference.patch` (new)
- `bench/features/holds/feature.json` (new)
- `bench/setups/lean/CLAUDE.md` (new)
- `bench/setups/setups.json` (new)

## Work
1. Write `bench/features/holds/BRIEF.md` from the template, in the style `ste`. It has no open questions, so that every run starts from the same facts. Its decisions fix this behaviour and this public API:
   - A new module `src/holds.ts` exports `class HoldService`, `class HoldError`, `interface Hold` and `type HoldStatus = "waiting" | "ready" | "fulfilled" | "cancelled" | "expired"`.
   - `Hold` has `id` (`H<n>`, from 1), `memberId`, `bookId`, `placed`, `status`, and the optional `copyId` and `readyUntil`.
   - The constructor is `new HoldService(catalog, members)`. `LoanService` takes an optional fourth argument `holds`.
   - `placeHold(memberId, bookId, today)`: refuse when the member is suspended, when the book has an available copy, when the member has a waiting or ready hold on the book, when the member has the book on loan, or at the hold limit.
   - `TIER_RULES` gets `maxHolds`: 3 for `standard`, 6 for `premium`. The limit counts waiting and ready holds.
   - `CopyStatus` gets `"on-hold"`.
   - `returnCopy`: when the book has a waiting hold, the copy becomes `on-hold`. The first waiting hold becomes `ready`, with the `copyId` and `readyUntil` = `today` plus 3 days.
   - `checkout`: a member with a ready hold on the book gets the held copy, and the hold becomes `fulfilled`. Other members cannot borrow a copy that is `on-hold`.
   - `cancelHold(holdId, today)`: a waiting hold becomes `cancelled`. A ready hold becomes `cancelled`, and its copy passes to the next waiting hold, or becomes available.
   - `expireHolds(today)`: each ready hold with `readyUntil` before `today` becomes `expired`. Its copy passes on like a cancelled hold. Returns the expired holds.
   - `queue(bookId)`: the waiting holds in the order of placement. `position(holdId)`: the 1-based place in the queue, or `null` when the hold does not wait.
   - `reports.ts` exports `holdsReportRows(holds, catalog, members, today)`: one row per waiting or ready hold, with `title`, `memberName`, `status`, `position` and `readyUntil`. Sort by title, then by position, with ready holds first.
   - Out of scope of the feature: notifications, fees for holds, and changes to the other reports.
2. Write `bench/features/holds/hidden/holds.test.ts`: 15 to 25 tests with `node:test` that use only the API of the brief. It imports from `../src/` paths, because the driver copies it to `test/holds.hidden.test.ts`.
3. Build the reference solution in a temporary copy of `bench/sample/`. Run `git init` and commit the sample. Build the feature, and add tests for it to `test/`. Then run `git diff --binary > reference.patch` and copy the patch to `bench/features/holds/reference.patch`. Aim for about 300 changed lines. Delete the temporary copy.
4. Check the hidden tests in two fresh temporary copies:
   - On the untouched sample, `node --test test/holds.hidden.test.ts` fails.
   - With `git apply reference.patch`, the hidden tests and the full verify command pass.
5. Write `bench/features/holds/feature.json`:
   - `"name": "holds"`, `"brief": "BRIEF.md"`, `"reference": "reference.patch"`.
   - `"hidden_tests": { "hidden/holds.test.ts": "test/holds.hidden.test.ts" }`. The key is the source path, and the value is the target path in the copy.
   - `"allowed"`: glob patterns `src/holds.ts`, `src/catalog.ts`, `src/members.ts`, `src/loans.ts`, `src/reports.ts`, `test/**`, `docs/tasks/**`.
6. Write `bench/setups/lean/CLAUDE.md`, 10 to 15 lines. It holds the core rules and nothing more:
   - Work on a feature branch `feature/<slug>`. Never commit on `main`.
   - Build only what the brief asks. Respect its "Out of scope" section.
   - Split the work into steps. Make one commit per step.
   - Run the verify command `node --test "test/**/*.test.ts"` before each commit. Fix each failure.
   - Ask a question only when the answer changes the work.
   - End with a short summary.
7. Write `bench/setups/setups.json`. One object per setup, with these keys:
   - `plugin`: `false` for `lean`, `true` for the flow setups.
   - `remove`: the paths that the driver deletes from the copy. `lean`: `["AGENTS.md", "docs/workflow"]`. Flow setups: `[]`.
   - `files`: the files that the driver writes, as path and source. `lean`: `CLAUDE.md` from `setups/lean/CLAUDE.md`. Flow setups: `CLAUDE.md` with the text `@AGENTS.md`.
   - `start`: the first prompt. `lean`: `Build the feature in docs/tasks/_new/BRIEF.md.` Flow setups: `/flow:plan-task docs/tasks/_new`.
   - `replies`: a list of `{ "match": <regex on the 👉 line>, "reply": <text> }`. The driver uses the first match, and "go" when nothing matches.
   - `flow-inline`: the plan approval gets `go, with answer 1 set to mode inline`. `flow-agents`: `go, with answer 1 set to mode agents`.
   - Both flow setups: the prose checklist (`Reply per item`) gets `Every item passes.` A request for a pull request link gets `This project has no host. Record "no pull request" and continue.`
   - `max_messages`: 40 for the flow setups, 20 for `lean`.

## Review checklist
- [x] Read `bench/features/holds/BRIEF.md` and `bench/setups/lean/CLAUDE.md`. Both are fair to the three setups, and the lean rules are the core rules and nothing more.
  Why: The lean baseline sets 1x. A judgement on fairness needs the developer.
  Checked: 5 November 2026

## Docs to update
none

## Out of scope
- The driver. Step 05 writes it.
- Changes to `bench/sample/`. The reference solution lives only in the patch.
- A second feature, or the step-size matrix.

## Outcome
Status: implemented
Verify: passed. The only failure is the known check 7 ("sections") on 3 archive lines of task 0003 (Discovery answer 1).

### Choices made
- The hidden tests hold 25 cases. On the untouched sample they fail. With the reference patch, all 25 hidden tests and all 200 sample tests pass.
- The patch has LF endings. It applies with `git apply` under `core.autocrlf=true`, on a copy with LF files and on a copy with CRLF files.
- The brief adds `getHold(holdId)` and `allHolds()`, so that tests can read the state. It leaves the link between `HoldService` and the loans to the builder.
- The brief adds decision 6: `Catalog.statusCounts` and `stockOverview` count `"on-hold"`. The new status changes an existing test, and the brief says to update it.
- The brief fixes details that were open: a ready hold stays valid until `expireHolds` runs, a ready hold has `position` 0 in the report, and a waiting hold has `readyUntil` `""`.
- `setups.json` is one object keyed by setup name. The plan approval matches `accept the plan`, the 👉 line of `/flow:plan-task`.
- Orchestrator fix: the lean `CLAUDE.md` got the rule for erasable TypeScript syntax. Without it, the lean setup misses a fact of the project that the flow setups get from `AGENTS.md`. It is a fact of the stack, not a workflow rule.
- Orchestrator fix: the pull request link regex is now `(?i)link.*pull request|pull request.*link`. The old regex did not match "paste the link of the new pull request" in `reference/GIT.md`.
- A failed `cd` made the step builder set `user.email` and `user.name` in the repository config. It removed both. The orchestrator checked `git config --local --list`: only the original settings remain.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | The reference patch changes about 395 lines, not about 300. `holds.ts` has 194 lines, and the tests 126. | The 13 decisions of the brief need this code. The pilot stays a medium feature. | none |
| 2 | The brief adds `getHold`, `allHolds` and decision 6 on the stock counts. | The hidden tests read the state, and the new copy status changes the counts. | none |
