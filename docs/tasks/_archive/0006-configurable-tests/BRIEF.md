# Brief: configurable testing

Date: 2 November 2026

## Why
The plugin has one fixed testing rule in free text, so the agent writes few or no tests. A project needs to set which code gets tests, of which type, and see the coverage of its changes. Industry practice pairs a risk rule with a coverage figure, and treats the figure as a check, not a target.

## What
The config has a section "Testing". It sets which code gets automated tests and of which type. `/flow:adopt` proposes the section from the tests that a project has. `/flow:plan-task` plans each test with its code, its type and its reason. `/flow:finish-task` checks the tests and reports the coverage of the changed lines.

## Decisions

1. The config gets a section "Testing" with the settings "Rule" and "Types". It replaces the testing rule in "Project rules".
2. "Rule" is `none`, `critical` or `logic`. The workflow guide section 7 defines each level exactly. `critical` is the current default rule: high-impact logic only.
3. "Types" are project-defined. Each type has a name, a one-line meaning and an optional command. The config template gives unit, integration and end-to-end as the default types.
4. "Coverage" is an optional command under "Commands". It reports the coverage of the changed lines only. It never blocks a task.
5. `/flow:adopt` finds the test framework, the test folders and a coverage tool. It proposes the rule and the types from what it finds.
6. `/flow:plan-task` names, for each test, the code it covers, its type and a reason that names the rule.
7. When a task changes an untested function that falls under the rule, `/flow:plan-task` plans a test for that function as a default item. The developer accepts or drops each item. The test covers only the changed function.
8. `/flow:finish-task` checks that each test has its planned type. It shows the coverage figure in the summary and in the pull request description. Without a coverage command, it skips the figure.
9. This repository sets "Rule" to `none`. A "Changed" entry tells existing projects what to add to their config (project rule 6).

## Out of scope
- A coverage gate in the verify command.
- Tests or skill evals for this repository.

Later:
- A coverage gate on the changed lines.
- A pattern for how the workflow expands itself, for example a ladder of levels.
- Skill evals for this repository, as a backlog brief.

## How to check the result
1. A reader can set up the "Testing" section from the config template and the workflow guide alone.
2. On a test project with tests, `/flow:adopt` proposes a rule and types that match what exists.
3. A planned task lists each test with its code, type and reason, and each old-code test as an item to accept or drop.
4. `/flow:finish-task` shows the coverage of the changed lines when the config has a coverage command.

## Open questions
none
