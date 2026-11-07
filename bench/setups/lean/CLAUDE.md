# Lending: rules

Date: 5 November 2026

Lending is an in-memory library lending system in TypeScript on Node.

1. Work on a feature branch `feature/<slug>`. Never commit on `main`.
2. Build only what the brief asks. Respect its "Out of scope" section.
3. Split the work into steps. Make one commit per step.
4. Run the verify command `node --test "test/**/*.test.ts"` before each commit. Fix each failure.
5. Ask a question only when the answer changes the work.
6. Use only erasable TypeScript syntax: no `enum`, no `namespace`, no parameter properties. Imports name the `.ts` extension.
7. Tests never use the real date. A test passes `today` explicitly, as a fixed date such as `"2024-06-01"`. A new test never calls `new Date()` without an argument, `Date.now()` or `currentYear()`.
8. End with a short summary.
