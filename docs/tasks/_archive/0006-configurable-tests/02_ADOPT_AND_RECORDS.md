# Step 02: Adopt, tutorial and repo records

Date: 2 November 2026

## Goal
`/flow:adopt` proposes the "Testing" section, `/flow:tutorial` explains it, and this repository uses it, with the changelog entry of the task.

## Context to read
- `docs/tasks/0006-configurable-tests/README.md`
- `plugins/flow/reference/WORKFLOW.md` section 7, and `plugins/flow/templates/CONFIG.md`, as step 01 left them
- `plugins/flow/skills/adopt/SKILL.md`
- `plugins/flow/skills/tutorial/SKILL.md`
- `docs/workflow/CONFIG.md`
- `CHANGELOG.md`

## Files touched
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `docs/workflow/CONFIG.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. In `adopt/SKILL.md` "Inspect": add an item "Tests". Find the test framework, the test folders, the test commands and a coverage tool, in the files of the stack and the CI config.
2. In `adopt/SKILL.md` "Quick setup": show "Rule", "Types" and "Coverage" in the block. Show found values with their source. Set "Rule" to `critical` when a test framework exists, and to `none` when not. Without a coverage tool, "Coverage" is `none`.
3. In `adopt/SKILL.md` "The conversation" step 6: replace "the project rules, for example a testing rule" with "the testing rule and the test types", and "the project rules".
4. In `adopt/SKILL.md` "Guidance per setting": add "Testing" with the facts of the levels, the project-defined types, and coverage as a report on the changed lines.
5. In `tutorial/SKILL.md` lesson 6: explain the rule, the types and the coverage report of this project.
6. In `docs/workflow/CONFIG.md`: add "Coverage: none" under "Commands". Add the section "Testing" with "Rule: none" and "Types: none". Rewrite project rule 4: test a change of a skill by running it on a test project, as a review checklist item. Keep the numbers of the other rules.
7. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
- [x] Run `/flow:adopt` on a test project that has tests and a coverage tool. The quick setup proposes a rule, types and a coverage command that match the project.
  Why: Project rule 4. A skill change needs a run on a test project.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The files of step 01.
- `README.md` and `AGENTS.md`.
- Every skill that the task file names as out of scope.

## Outcome

Status: implemented
Verify: passed

### Choices made
- "Tests" is a new Inspect item 7 of `/flow:adopt`. "Hooks" moved to item 8.
- The quick setup block has its own "Testing" part, between the found values and the defaults. Each testing value shows its source, like the other found values.
- The testing rule of the quick setup is a new rule 3. The later rules moved one number down. No other file names these numbers.
- The conversation asks about the testing section before the project rules, because a project rule can depend on it.
- The "Rule" line of this repository keeps a short reason: the verify script is the check.

### Deviations
none
