# Task 0006: configurable testing

Date: 2 November 2026
Status: ready for PR
Mode: inline

## Goal
A project sets in its config which code gets automated tests and of which type. The skills plan, check and report tests by that setting.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. The config gets a section "Testing" with the settings "Rule" and "Types". It replaces the testing rule in "Project rules".
2. "Rule" is `none`, `critical` or `logic`. The workflow guide section 7 defines each level exactly. `critical` is the current default rule: high-impact logic only.
3. "Types" are project-defined. Each type has a name, a one-line meaning and an optional command. The config template gives unit, integration and end-to-end as the default types.
4. "Coverage" is an optional command under "Commands". It reports the coverage of the changed lines only. It never blocks a task.
5. `/flow:adopt` finds the test framework, the test folders and a coverage tool. It proposes the rule and the types from what it finds. The quick setup sets "Rule" to `critical` when it finds a test framework, and to `none` when it finds none.
6. `/flow:plan-task` names, for each test, the code it covers, its type and a reason that names the rule.
7. When a task changes an untested function that falls under the rule, `/flow:plan-task` plans a test for that function as a question of the kind Assumption. The developer accepts or drops each one. The test covers only the changed function.
8. `/flow:finish-task` checks that each test has its planned type. It shows the coverage figure in the summary and in the pull request description. Without a coverage command, it skips the figure.
9. This repository sets "Rule" to `none`. Project rule 4 keeps only the part about a test project as a review item.
10. The mode is `inline`. The task has 2 steps, and no step changes code.

## Out of scope
- A coverage gate in the verify command.
- Tests or skill evals for this repository.
- Changes to `/flow:implement-task`, `/flow:checklist`, `/flow:whats-next`, `/flow:discuss` and the step builder. They already follow the "Tests" section of the task file.
- The archived tasks.

## Tests
none. The "Testing" section of this repository sets "Rule" to `none`. The verify script is the check.

## Changelog
### Changed
- The config has a section "Testing". "Rule" sets which code gets automated tests: `none`, `critical` or `logic`. "Types" names the test types of the project, each with its meaning and an optional command. `/flow:adopt` proposes both from the tests of the project. `/flow:plan-task` plans each test with its code, type and reason, and asks before it adds a test for an untested function that the task changes. An optional "Coverage" command reports the coverage of the changed lines in `/flow:finish-task`. It never blocks. A project with a config moves its testing rule from "Project rules" to the "Testing" section, and adds "Coverage" under "Commands", or `none`. Task: [0006-configurable-tests](docs/tasks/_archive/0006-configurable-tests/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Testing in the guide and the loop](01_GUIDE_AND_LOOP.md) | verified |
| 02 | [Adopt, tutorial and repo records](02_ADOPT_AND_RECORDS.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0006 configurable testing

✅ Facts I checked
   1. Verify passes on the branch.             sh tools/verify.sh
   2. The branch guard is on.                  core.hooksPath
   3. The session runs Opus. Mode inline.      task file
   4. The testing rule appears in 6 places:
      WORKFLOW.md sections 2 and 7, plan-task
      Plan 4 and Check 3, finish-task Order 3,
      adopt Conversation 6, CONFIG.md template.  grep
   5. implement-task and the step builder only
      read "Tests" of the task file, so they
      need no change.                          implement-task, step-builder

📁 Files I will touch
   ~ plugins/flow/reference/WORKFLOW.md              step 01
   ~ plugins/flow/templates/CONFIG.md                step 01
   ~ plugins/flow/templates/TASK.md                  step 01
   ~ plugins/flow/skills/plan-task/SKILL.md          step 01
   ~ plugins/flow/skills/finish-task/SKILL.md        step 01
   ~ plugins/flow/skills/adopt/SKILL.md              step 02
   ~ plugins/flow/skills/tutorial/SKILL.md           step 02
   ~ docs/workflow/CONFIG.md                         step 02
   ~ CHANGELOG.md                                    step 02

👉 No questions. Reply "go" to start.
```

Answer: "go".
