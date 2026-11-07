# Step 01: Sample source

Date: 5 November 2026

## Goal
`bench/sample/src/` holds the source of a library lending system in TypeScript, with 6 modules.

## Context to read
- `docs/tasks/0010-benchmark/README.md`, decisions 2 to 4.
- `docs/tasks/0010-benchmark/BRIEF.md`.

## Files touched
- `bench/sample/src/dates.ts` (new)
- `bench/sample/src/catalog.ts` (new)
- `bench/sample/src/members.ts` (new)
- `bench/sample/src/fees.ts` (new)
- `bench/sample/src/loans.ts` (new)
- `bench/sample/src/reports.ts` (new)

## Work
General rules for every file:
- Use only erasable TypeScript syntax: no `enum`, no `namespace`, no parameter properties, no decorators. Use string literal unions and `as const` objects.
- Import with the `.ts` extension, for example `import { addDays } from "./dates.ts";`. Use `import type` for types.
- Use no package outside the Node standard library.
- Give each exported function and class a short doc comment.
- Each module throws its own error class, for example `class CatalogError extends Error`. Set `name` in the constructor.
- Keep money in integer cents. Keep dates as ISO strings `YYYY-MM-DD` (type `IsoDate`), and compute in UTC.
- Aim for 1,500 to 2,000 lines in the 6 files together. Do not pad. Reach the size with real rules, input checks and doc comments.

1. Write `dates.ts`: `type IsoDate = string`, `parseDate`, `formatDate`, `isValidDate`, `addDays(date, days)`, `daysBetween(from, to)` (whole days, negative when `to` is earlier), `isBefore`, `isAfter`, `maxDate`. `parseDate` throws `DateError` on an invalid date.
2. Write `catalog.ts`:
   - `interface Book { id; title; author; year; tags: string[] }`.
   - `type CopyStatus = "available" | "on-loan" | "lost" | "repair"`.
   - `interface Copy { id; bookId; status: CopyStatus; acquired: IsoDate }`. A copy id is `<bookId>-c<n>`, with `n` from 1.
   - `class Catalog` with `addBook(input)`, `getBook(id)`, `listBooks()`, `addCopy(bookId, acquired)`, `getCopy(id)`, `copiesOf(bookId)`, `availableCopies(bookId)`, `setCopyStatus(copyId, status)`, `removeCopy(copyId)` (only an available copy), and `search(query)`.
   - `search` takes `{ text?, author?, tag?, yearFrom?, yearTo? }`. Text matches the title or the author, without case. The result is sorted by title.
   - Check the input: a non-empty title and author, a year from 1450 to the current year, and no duplicate book id.
3. Write `members.ts`:
   - `type Tier = "standard" | "premium"`, `type MemberStatus = "active" | "suspended"`.
   - `interface Member { id; name; email; tier; joined: IsoDate; status }`.
   - `const TIER_RULES = { standard: { maxLoans: 5, loanDays: 14, maxRenewals: 2, feeDiscount: 0 }, premium: { maxLoans: 10, loanDays: 21, maxRenewals: 3, feeDiscount: 0.5 } } as const`.
   - `class MemberRegistry` with `register(input)`, `get(id)`, `list(filter?)`, `suspend(id, reason)`, `reactivate(id)`, `changeTier(id, tier)`, `rulesFor(id)`.
   - Check the input: a non-empty name, an email with one `@` and a dot after it, and no duplicate id or email.
4. Write `fees.ts`:
   - Constants: `DAILY_LATE_FEE_CENTS = 25`, `MAX_LATE_FEE_CENTS = 1000` per loan, `SUSPEND_THRESHOLD_CENTS = 500`, `LOST_COPY_FEE_CENTS = 2000`.
   - `calculateLateFee(daysLate, tier)`: 0 for 0 or fewer days. Apply the cap, then the discount of the tier. Round down to whole cents.
   - `class FeeLedger` with `charge(memberId, cents, reason, date)`, `pay(memberId, cents, date)`, `balance(memberId)`, `entries(memberId)`, `waive(entryId, date)` and `isOverThreshold(memberId)`. `pay` throws on a payment above the balance.
5. Write `loans.ts`:
   - `interface Loan { id; copyId; bookId; memberId; start: IsoDate; due: IsoDate; returned?: IsoDate; renewals: number; lost?: boolean }`. A loan id is `L<n>`, with `n` from 1.
   - `class LoanService` with the constructor `(catalog, members, ledger)`.
   - `checkout(memberId, bookId, today)`: lends the first available copy. Refuse when the member is suspended, has `maxLoans` active loans, has an overdue loan, or is over the fee threshold. Refuse when the book has no available copy. Due date: `today` plus `loanDays` of the tier.
   - `renew(loanId, today)`: refuse when the loan is returned, overdue, or has `maxRenewals` renewals. The new due date is `today` plus `loanDays`.
   - `returnCopy(loanId, today)`: sets `returned`, sets the copy to available, and charges the late fee. When the member is over the threshold after the charge, suspend the member. Returns `{ loan, feeCents }`.
   - `reportLost(loanId, today)`: marks the loan lost and the copy lost, and charges `LOST_COPY_FEE_CENTS`.
   - `getLoan`, `activeLoans(memberId)`, `overdueLoans(today)`, `history(bookId)`, `allLoans()`.
6. Write `reports.ts`:
   - `formatTable(rows, columns)`: plain text with padded columns and a header line. A column has a key, a title and an alignment.
   - `overdueReport(loans, catalog, members, today)`: rows of title, member name, due date and days late, sorted by days late with the highest first.
   - `popularBooks(loans, catalog, since, limit)`: the books with the most loans since a date. Equal counts sort by title.
   - `memberSummary(memberId, loans, ledger, members)`: the active loans, the overdue count and the balance.
   - `feesReport(ledger, members)`: the members with a balance above 0, with the highest balance first.
7. Check that each module loads: `node -e "import('./bench/sample/src/reports.ts')"` for each file.

## Review checklist
none

## Docs to update
none

## Out of scope
- Tests and `package.json`. Step 02 adds them.
- Holds, reservations or a waiting list. The pilot feature adds them later.
- A user interface, a server, files or a database. The data stays in memory.
- Any file outside `bench/sample/src/`.

## Outcome
Status: implemented
Verify: passed. The only failure is the known check 7 ("sections") on 3 archive lines of task 0003 (Discovery answer 1).

### Choices made
- Each module has helpers beyond the plan, for example `minDate`, `dateRange`, `dueSoon` and `formatCents`. They reach the size with real code instead of padding. The 6 files hold 1,536 lines.
- `memberSummary` takes an optional fifth argument `today`. Without it, the overdue count uses the latest start date of the active loans.
- A waiver can leave a negative balance when the charge was paid. `pay` then throws for any amount.
- `reportLost` marks the loan `lost` but not `returned`. `activeLoans` and `overdueLoans` skip lost loans. `returnCopy` and `renew` refuse a lost loan.
- `overdueReport` breaks ties in days late by title, then by member name.
- Book tags are stored trimmed, in lower case and without duplicates.
- `Catalog.search` throws `CatalogError` for a year that is not an integer, or for `yearFrom` above `yearTo`.
- Copy numbers come from a counter per book. A removed copy does not free its number.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | `memberSummary` has an optional fifth argument `today`. | The plan gives the function no date for the overdue count. | none |
