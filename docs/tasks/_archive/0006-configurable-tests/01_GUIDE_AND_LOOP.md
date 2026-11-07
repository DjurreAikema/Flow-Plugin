# Step 01: Testing in the guide and the loop

Date: 2 November 2026

## Goal
The workflow guide, the config template and the task template describe the "Testing" section, and `/flow:plan-task` and `/flow:finish-task` use it.

## Context to read
- `docs/tasks/0006-configurable-tests/README.md`
- `docs/tasks/0006-configurable-tests/BRIEF.md`
- `plugins/flow/reference/WORKFLOW.md`, sections 2, 3, 7 and 11
- `plugins/flow/templates/CONFIG.md`
- `plugins/flow/templates/TASK.md`
- `plugins/flow/skills/plan-task/SKILL.md`
- `plugins/flow/skills/finish-task/SKILL.md`

## Files touched
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/templates/CONFIG.md` (changed)
- `plugins/flow/templates/TASK.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)
- `plugins/flow/skills/finish-task/SKILL.md` (changed)

## Work
1. In `WORKFLOW.md` section 7: describe the "Testing" section of the config. Give a table of the rule levels with an exact definition each:
   - `none`: no automated tests.
   - `critical`: only high-impact logic. Keep the current definition of "high-impact".
   - `logic`: every function with a branch, a calculation or a rule. Not plain data, wiring or layout.
2. In `WORKFLOW.md` section 7: describe the types (name, one-line meaning, optional command), the planning rule (each test names its code, its type and a reason that names the rule), the old-code rule of decision 7, and the coverage report of decision 4. State that a coverage figure never blocks a task.
3. In `WORKFLOW.md` section 2, principle 5: refer to the "Testing" section of the config and section 7. Remove the fallback sentence for a config without a rule.
4. In `WORKFLOW.md` section 3: add the terms "Test rule", "Test type" and "Coverage command".
5. In `templates/CONFIG.md`: add "Coverage" under "Commands", with `none` as the empty value. Add a section "Testing" after "Commands", with "Rule" and "Types". The default types are unit, integration and end-to-end, each with a meaning. Remove "a testing rule" from the examples of "Project rules".
6. In `templates/TASK.md`: in "Tests", each test names the code it covers, its type and its reason. Mark a test for old code as such.
7. In `plan-task/SKILL.md` "Plan" step 4: plan the tests by the "Testing" section (workflow guide section 7), with code, type and reason. Add the old-code tests of decision 7.
8. In `plan-task/SKILL.md` "Check the plan" step 3: every test has a reason that names the rule, and a type of the config.
9. In `plan-task/SKILL.md` "Show and write" step 1: show each old-code test as a question of the kind Assumption, after the mode question. ● a) is "add the test".
10. In `finish-task/SKILL.md` "Order" step 3: every test has the type that the task file planned.
11. In `finish-task/SKILL.md` "Order" step 2: after the verify command, run the coverage command of the config when it has one. Record the figure. A failure of the command is a ⚠️ line, not a stop.
12. In `finish-task/SKILL.md`: add the coverage figure to the pull request description, after the summary, and as a 🤖 line in the session summary.

## Review checklist
- [x] Run `/flow:plan-task` on a test project with a "Testing" section and an untested function that the task changes. Each test shows its code, type and reason, and the old-code test shows as a question.
  Why: Project rule 4. A skill change needs a run on a test project.
  Checked: 2 November 2026
- [x] Run `/flow:finish-task` on that test project with a coverage command. The figure shows in the summary and in the pull request description.
  Why: Project rule 4. The agent cannot run the plugin skills of this working tree in this session.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- `/flow:adopt`, `/flow:tutorial` and the records of this repository. Step 02 does this.
- A coverage gate.
- Every skill that the task file names as out of scope.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Section 7 of the workflow guide has four parts: 7.1 the test rule, 7.2 test types, 7.3 planning tests, 7.4 coverage. The skills point to the part that they use.
- The terms table names "testing policy", "test level" and "coverage gate" as words not to use, so one word stays for one concept.
- The config template puts "Coverage" under "Commands", and the section "Testing" right after it, so the commands and the test types stand together.
- `/flow:plan-task` finds the old code in a new plan item 5. The later plan items moved one number down.
- A dropped old-code test leaves the task file before the commit, so the task file holds only the approved tests.
- The coverage figure stands third in the pull request description, after the summary, so a reviewer sees it before the steps.

### Deviations
none
