# Brief: Holds

Date: 5 November 2026
Roadmap card: none

## Why
A member cannot borrow a book when all its copies are on loan. The member must check the library again and again. A member can place a hold instead. The library then keeps the next returned copy for the member.

## What
A member places a hold on a book that has no available copy. The holds of a book form a queue. When a copy comes back, the library keeps it for the first member in the queue for 3 days. The member borrows the held copy in that time. After 3 days, or when the member cancels, the copy goes to the next member in the queue. A report lists the open holds.

## Decisions
1. A new module `src/holds.ts` exports `class HoldService`, `class HoldError`, `interface Hold` and `type HoldStatus = "waiting" | "ready" | "fulfilled" | "cancelled" | "expired"`. `HoldError` extends `Error`. Every refusal and every bad input of `HoldService` throws a `HoldError`. This includes an unknown member, book or hold, and an invalid date.
2. `Hold` has `id`, `memberId`, `bookId`, `placed`, `status`, and the optional `copyId` and `readyUntil`. The `id` is `H<n>`, counted from 1 in the order of placement. `placed` is the date of `placeHold`. A hold keeps its `copyId` and `readyUntil` when it leaves the status `ready`.
3. The constructor is `new HoldService(catalog, members)`. `LoanService` takes an optional fourth argument `holds`. A `LoanService` with `holds` works together with it: the hold service sees the loans of that loan service. Without `holds`, `LoanService` behaves as before.
4. `placeHold(memberId, bookId, today)` returns the new hold with the status `waiting`. It throws a `HoldError` in these cases, in this order: the member is suspended, the book has an available copy, the member has a waiting or ready hold on the book, the member has the book on loan, the member is at the hold limit.
5. `TIER_RULES` gets `maxHolds`: 3 for `standard`, 6 for `premium`. The limit counts the waiting and ready holds of a member.
6. `CopyStatus` gets `"on-hold"`. `Catalog.statusCounts` counts `"on-hold"` as a key, and the `total` of `stockOverview` includes it. A copy that is `on-hold` is not available.
7. `LoanService.returnCopy`: when the book has a waiting hold, the copy becomes `on-hold`. The first waiting hold becomes `ready`, with the `copyId` of the copy and `readyUntil` = `today` plus 3 days. When no hold waits, the copy becomes `available`, as before.
8. `LoanService.checkout`: a member with a ready hold on the book gets the held copy, and the hold becomes `fulfilled`. All other checks still apply. A member without a ready hold cannot borrow a copy that is `on-hold`.
9. `cancelHold(holdId, today)` returns the cancelled hold. A waiting hold becomes `cancelled`. A ready hold becomes `cancelled`, and its copy passes to the first waiting hold of the book, as in decision 7. When no hold waits, the copy becomes `available`. A hold with any other status throws a `HoldError`.
10. `expireHolds(today)`: each ready hold with `readyUntil` before `today` becomes `expired`. Its copy passes on like the copy of a cancelled hold. The method returns the expired holds. A ready hold stays valid until `expireHolds` expires it.
11. `queue(bookId)` returns the waiting holds of the book in the order of placement. `position(holdId)` returns the 1-based place of a waiting hold in that queue, or `null` when the hold does not wait.
12. `getHold(holdId)` returns one hold. `allHolds()` returns every hold in the order of placement. Both return copies, so that a caller cannot change the state of the service.
13. `src/reports.ts` exports `holdsReportRows(holds, catalog, members, today)`. It returns one row for each waiting or ready hold, with `title`, `memberName`, `status`, `position` and `readyUntil`. A ready hold has `position` 0 and its `readyUntil`. A waiting hold has its 1-based place among the waiting holds of its book in `holds`, in the order of the input, and `readyUntil` is `""`. Sort by `title`, then by `position`, so that ready holds come first. Equal rows keep the order of the input. An invalid `today` throws a `ReportError`.
14. Write tests for the new behaviour in `test/`. Update the existing tests that the new behaviour changes.

## Out of scope
- Notifications to members.
- Fees for holds.
- Changes to the other reports.
- Other new features, for example a hold on a book with an available copy.
- Changes to files outside the map, other than the files of the task in `docs/tasks/`.

## Map
- `src/members.ts`: `TIER_RULES` (line 23). Add `maxHolds`. `TierRules` follows from it, and `MemberRegistry.rulesFor` returns it.
- `src/catalog.ts`: `CopyStatus` and `COPY_STATUSES` (lines 32 to 35), `availableCopies` (line 182), `statusCounts` (line 273) and `stockOverview` (line 310).
- `src/loans.ts`: the `LoanService` constructor (line 62), `checkout` (line 76) and `returnCopy` (line 145). Follow the error pattern of `LoanError` (line 15).
- `src/holds.ts`: new. Follow the module pattern of `src/loans.ts`: an error class, the interfaces, then the service class. Use `addDays` and `isValidDate` of `src/dates.ts`.
- `src/reports.ts`: `ReportError` (line 14). Add `holdsReportRows` after `stockReport` (line 258), in the style of the other row functions.
- `test/catalog.test.ts`: the test "counts the copies per status" (line 194) expects the old keys of `statusCounts`.
- `test/loans.test.ts`, `test/reports.test.ts`: add tests in the style of the existing ones. `test/holds.test.ts`: new.

## Parts
1. Copy status and hold limit: `"on-hold"` in the catalog, `maxHolds` in the tier rules (decisions 5 and 6). Files: `src/catalog.ts`, `src/members.ts`, `test/catalog.test.ts`.
2. Hold service: `src/holds.ts`, and the changes to `returnCopy` and `checkout` (decisions 1 to 4 and 7 to 12). Files: `src/holds.ts`, `src/loans.ts`, `test/holds.test.ts`, `test/loans.test.ts`.
3. Holds report: `holdsReportRows` (decision 13). Files: `src/reports.ts`, `test/reports.test.ts`.

## Tests
- `HoldService` (unit): every refusal of `placeHold` and its order, `cancelHold`, `expireHolds`, `queue`, `position`, `getHold` and `allHolds`. Rule `logic`: rules with branches.
- `LoanService.returnCopy` and `checkout` with holds (unit): the copy goes to the first waiting hold, and a ready hold gets the held copy. Rule `logic`: changed branches.
- `Catalog.statusCounts` and `stockOverview` (unit): the key `"on-hold"` and the total. Rule `logic`: a changed calculation.
- `holdsReportRows` (unit): positions, `readyUntil`, the sort, and a `ReportError` for a bad date. Rule `logic`: a calculation and a sort rule.

## Human checklist
none

## Changelog
none

## Open questions
none
