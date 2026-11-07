# Step 02: Sample tests

Date: 5 November 2026

## Goal
The sample project has a `package.json` and a test file per module, and its verify command passes in seconds.

## Context to read
- `docs/tasks/0010-benchmark/README.md`, decision 4.
- Every file in `bench/sample/src/`.

## Files touched
- `bench/sample/package.json` (new)
- `bench/sample/test/catalog.test.ts` (new)
- `bench/sample/test/members.test.ts` (new)
- `bench/sample/test/fees.test.ts` (new)
- `bench/sample/test/loans.test.ts` (new)
- `bench/sample/test/reports.test.ts` (new)

## Work
1. Write `package.json`: `"name": "lending"`, `"private": true`, `"type": "module"`, `"engines": { "node": ">=22.18" }` and `"scripts": { "test": "node --test \"test/**/*.test.ts\"" }`. Add no dependencies.
2. Write one test file per module, with `node:test` and `node:assert/strict`. Test the rules, not every value: the limits, the refusals, the fee cap and discount, the due dates, the renewals, the suspension and the sort order of the reports. `dates.ts` gets no file of its own. The other tests cover it.
3. Aim for 600 to 1,000 lines in the 5 test files together.
4. Run `node --test "test/**/*.test.ts"` in `bench/sample/`. Every test passes, and the run takes less than 10 seconds.
5. Count the lines of `src/` and `test/` together. The total is 2,000 to 4,000. When it is lower, add real rules or tests, not filler.

## Review checklist
none

## Docs to update
none

## Out of scope
- Changes to `bench/sample/src/`, except a fix for a bug that a test finds. Record each fix as a choice.
- A test framework or any other package.
- Tests for holds.

## Outcome
Status: implemented
Verify: passed. The only failure is the known check 7 ("sections") on 3 archive lines of task 0003 (Discovery answer 1). The sample verify command runs 166 tests in less than 1 second, and all pass.

### Choices made
- The 5 test files hold 1,503 lines, above the aim of 600 to 1,000. They cover only the rules that the step lists. `src/` and `test/` hold 3,039 lines together.
- The tests call `memberSummary` with the optional `today` argument, and test `summaryDate` on its own.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | The test files hold 1,503 lines, not 600 to 1,000. | The rules of step 01 need the tests. The total stays inside 2,000 to 4,000. | none |
