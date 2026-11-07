# Test plan

Date: 7 November 2026

The automated tests of this project. `/flow:discuss` plans the tests of each brief by this plan. `/flow:test-plan` changes it through a pull request. Write "none" in a section that does not apply. Add free text to any section.

## Which code gets tests
Preset: logic

Every function with a branch, a calculation or a rule. Not plain data, wiring or layout.

## Test types
- unit: one function or class, in memory. `node --test "test/**/*.test.ts"`

## How tests are written
Tests never use the real date. A test passes `today` explicitly, as a fixed date such as `"2024-06-01"`. A new test never calls `new Date()` without an argument, `Date.now()` or `currentYear()`.

## Tested by hand
none

## Old code
Policy: ask the developer

## Notes
none
