# Lending: design rules

Date: 7 November 2026

The rules of the data in Lending. Every change to the code follows them.

1. Money is in integer cents. Format an amount only for display, with `formatCents`.
2. The fee ledger is append-only. Code never removes or changes a ledger entry. A correction is a new entry, for example a waiver that cancels a charge. The history of a member must always add up to the balance.
3. A member record is never deleted. Loans, ledger entries and reports refer to members by their id, so the record must stay.
4. A function that depends on the date takes `today` as an argument. Only `currentYear` in `src/dates.ts` reads the clock.
5. Each module has its own error class. A refusal of a service throws the error class of that service.
