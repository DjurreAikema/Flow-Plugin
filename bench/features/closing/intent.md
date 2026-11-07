# Intent card: closing

The real intent of the developer behind `request.md`. Only the simulated developer reads this card. The agent never sees it.

## What the developer wants

- `LoanService.closeAccount(memberId, today)` closes the account of a member and returns a copy of the member.
- `MemberStatus` gets `"closed"`. `Member` gets the optional field `closed`, the date of the closing.
- `MemberRegistry.close(id, today)` sets the status and the date. `closeAccount` calls it after its checks.
- A closed member cannot borrow: `checkout` throws a `LoanError`.
- A closed account stays closed. Closing it again throws a `LoanError`. `suspend` and `reactivate` of a closed member throw a `MemberError`.

## The answers of the developer

- Active loans: a member with an active loan cannot close the account. `closeAccount` throws a `LoanError` and changes nothing. The member returns the copies first, or reports them lost.
- Small fees: a balance of $5.00 or less is written off when the account closes. This is the same limit as the suspension threshold, `SUSPEND_THRESHOLD_CENTS`. Use that constant, and do not add a new one.
- Big fees: a balance above $5.00 blocks the closing. `closeAccount` throws a `LoanError` and changes nothing. The member pays first.
- How the write-off works: the ledger is append-only (`docs/RULES.md`). Never remove or change an entry. Add one new entry of the new kind `"write-off"` for the open balance, with `FeeLedger.writeOff(memberId, date)`. A balance of 0 or less adds no entry.
- Deleting the member: no. A member record is never deleted (`docs/RULES.md`). The loans and the ledger keep pointing at it.
- Error class: the refusals of `closeAccount` throw a `LoanError`, like every refusal of the loan service.
- Tests: in `test/`, in the style of the existing tests. Tests pass `today` as a fixed date.

## The API that the developer expects

- `src/members.ts`: `MemberStatus` with `"closed"`, the field `closed?: IsoDate` of `Member`, the method `MemberRegistry.close`.
- `src/fees.ts`: `EntryKind` with `"write-off"`, the method `FeeLedger.writeOff`.
- `src/loans.ts`: the method `LoanService.closeAccount`, and the check of a closed member in `checkout`.
- No new exported functions, classes, constants or types.

## Out of scope

- Forgetting a member: no anonymizing, no change to the name or the email of a closed member. Privacy requests go through a separate process with the legal team, later.
- Reports: no new report and no change to the existing reports. The developer reads closed accounts with `members.list({ status: "closed" })` for now.
- Opening a closed account again.
- Emails or notifications to the member.

## Practical

- The project has no git host. When the agent asks for a pull request link, there is none.
- The developer approves a plan or a brief that matches this card.
