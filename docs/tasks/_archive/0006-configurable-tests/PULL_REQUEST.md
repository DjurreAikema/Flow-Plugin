# 0006: configurable testing

Date: 2 November 2026

Base: `main` · Head: `feature/0006-configurable-tests`

## Deviations and open points
none

## Summary
The config has a section "Testing". "Rule" sets which code gets automated tests (`none`, `critical` or `logic`), and "Types" names the test types of the project. `/flow:adopt` proposes both, `/flow:plan-task` plans each test with its code, type and reason, and asks before it tests an untested function that a task changes. An optional "Coverage" command reports the coverage of the changed lines in `/flow:finish-task`, and never blocks.

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | Testing in the guide and the loop | verified |
| 02 | Adopt, tutorial and repo records | verified |

## Review checklist
- Run `/flow:plan-task` on a test project with a "Testing" section and an untested function that the task changes. Each test shows its code, type and reason, and the old-code test shows as a question.
- Run `/flow:finish-task` on that test project with a coverage command. The figure shows in the summary and in the pull request description.
- Run `/flow:adopt` on a test project that has tests and a coverage tool. The quick setup proposes a rule, types and a coverage command that match the project.

## Choices made
- Section 7 of the workflow guide has four parts: the test rule, test types, planning tests and coverage.
- The terms table names "testing policy", "test level" and "coverage gate" as words not to use.
- The config template puts "Coverage" under "Commands", and "Testing" right after it.
- `/flow:plan-task` finds the old code in a new plan item 5. A dropped old-code test leaves the task file.
- The coverage figure stands third in the pull request description, after the summary.
- `/flow:adopt` has a new Inspect item "Tests" and a new quick setup rule 3. The later numbers moved down.
- The conversation of `/flow:adopt` asks about testing before the project rules.
- The review split a sentence of 30 words in tutorial lesson 6 (writing style rule 2).
- `docs/DESIGN.md` has decisions 23 to 25.

## Changelog
### Changed
- The config has a section "Testing". "Rule" sets which code gets automated tests: `none`, `critical` or `logic`. "Types" names the test types of the project, each with its meaning and an optional command. `/flow:adopt` proposes both from the tests of the project. `/flow:plan-task` plans each test with its code, type and reason, and asks before it adds a test for an untested function that the task changes. An optional "Coverage" command reports the coverage of the changed lines in `/flow:finish-task`. It never blocks. A project with a config moves its testing rule from "Project rules" to the "Testing" section, and adds "Coverage" under "Commands", or `none`. Task: [0006-configurable-tests](docs/tasks/_archive/0006-configurable-tests/README.md).

## Task
[docs/tasks/_archive/0006-configurable-tests/README.md](README.md)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01Wz6SeQVkUBsKm48kXZbXAV
