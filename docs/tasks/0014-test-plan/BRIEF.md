# Brief: /flow:test-plan, the test rules of a project

Date: 7 November 2026
Roadmap card: none

## Why
The test rule of a project is one of three fixed levels. The developer wants more control: rules in their own words, per area, with their own conventions. A setup conversation, like `/flow:release`, gives that control.

## What
A project runs `/flow:test-plan`. The skill talks the tests through with the developer and writes the test plan to `docs/workflow/TESTING.md` through a pull request. `/flow:discuss` plans the tests of each brief from that plan. `/flow:adopt` writes a first plan from a preset, so every project has a plan. Running `/flow:test-plan` again reopens the conversation from the current plan.

## Decisions
1. `/flow:test-plan` is a skill of the plugin. Every run is the setup conversation. With an existing plan, the conversation starts from that plan.
2. The test plan is `docs/workflow/TESTING.md`. The "Testing" section of the config holds one line: `Test plan: docs/workflow/TESTING.md`. "Rule" and "Types" leave the config. "Coverage" stays under "Commands".
3. The template `templates/TESTING.md` gives the plan its sections. They are: which code gets tests, the test types, how tests are written, tested by hand, old code, and notes. Each section can say "none". The developer can write free text in each section.
4. The setup is a conversation like `/flow:discuss` and `/flow:release`. It uses the same question format: directions, then one "My view" line. The developer decides every choice. The skill holds guidance per topic, never a fixed choice.
5. `none`, `critical` and `logic` are presets. The setup offers them as a starting point for "which code gets tests". Their meanings are those of the workflow guide section 7.1 today. The developer then changes, adds or narrows the rules, for example per folder or per area.
6. The guidance per topic:
   - Which code gets tests: a preset, then rules per area, folder or kind of code.
   - Test types: a name, a one-line meaning and an optional command for each type.
   - How tests are written: the location and the names of test files, the use of mocks and fixtures, and the test data.
   - Tested by hand: what a person checks instead of a test. `/flow:discuss` turns these into items of the human checklist.
   - Old code: ask the developer, always add a test, or never. The default is to ask, as today.
7. The setup inspects the project first: the test framework, the test folders, the test commands, and a few existing tests for the conventions. With a "Rule" and "Types" in the config, the setup starts from them.
8. The setup commits the plan and the config line on the branch `feature/test-plan-setup`, and opens a pull request into the base branch. Each later run uses the same branch name and pull request flow.
9. Only `/flow:discuss` reads the plan. It plans the tests of the brief by the plan. It copies the conventions that a test needs into the brief. The build does not read the plan. When a task needs the full conventions, the map of the brief names `docs/workflow/TESTING.md`.
10. Each test in a brief names the code it covers, a type of the plan, and a reason that names a rule of the plan.
11. `/flow:adopt` keeps its quick setup row for the tests: `critical` with a test framework, `none` without one. It writes `docs/workflow/TESTING.md` from the template with that preset and the found types. Its guidance names `/flow:test-plan` for more control.
12. The summary of a run gives the pull request link. Its last line is `▶️ Next: merge the pull request, then /flow:discuss <topic>`.
13. This repository gets a plan with no automated tests: the verify script is the check. The benchmark sample gets a plan with the preset `logic` and its type `unit`, with the same command as today.
14. Decision 43 of `docs/DESIGN.md` replaces decision 23. `/flow:discuss` added the row.

## Out of scope
- Running the tests outside the verify command, and test commands per task.
- A gate on the coverage figure. Coverage stays a report.
- Writing or changing tests of a project during the setup.
- Changes to `/flow:build`, `/flow:release`, `/flow:roadmap` and `/flow:whats-next`.
- A migration skill. The changelog entry says what a project must do.

## Map
- `plugins/flow/skills/test-plan/SKILL.md`: new. Follow the structure of `plugins/flow/skills/release/SKILL.md`: "Before you start", "Setup" with "Inspect", "The conversation", "Question format", "Guidance per topic" and "Write the plan", then "Summary". Paths into the plugin use `${CLAUDE_PLUGIN_ROOT}` (project rule 2).
- `plugins/flow/templates/TESTING.md`: new. The sections of decision 3, with placeholders in the style of `plugins/flow/templates/RELEASE.md`. Show the three presets in the section "Which code gets tests".
- `plugins/flow/templates/CONFIG.md`: the section "Testing" becomes the one line of decision 2.
- `plugins/flow/templates/BRIEF.md`: the section "Tests" names the test plan instead of the section "Testing" of the config.
- `plugins/flow/skills/discuss/SKILL.md`: the section "Tests". Replace the table of rules. The skill reads the test plan of the config, plans by its rules, and follows its old-code policy. It copies the needed conventions into the brief, and turns "Tested by hand" into human checklist items. Without a plan, plan no tests and name `/flow:test-plan` once.
- `plugins/flow/skills/adopt/SKILL.md`: the quick setup row "Rule", and step 3 of the quick setup. "Write the setup" writes `docs/workflow/TESTING.md`. The guidance "Testing" names the presets and `/flow:test-plan`.
- `plugins/flow/skills/tutorial/SKILL.md`: lesson 5 explains the test plan and `/flow:test-plan`. Lesson 2 names `/flow:test-plan` among the helpers.
- `plugins/flow/reference/WORKFLOW.md`: section 1, a row for `/flow:test-plan` in the helper table. Section 3, the term "Test rule" becomes "Test plan". Section 7: 7.1 the test plan and its presets, 7.2 the test types in the plan, 7.3 planning tests, 7.4 coverage. Keep the section numbers. The tree of section 4 lists `TESTING.md` beside `RELEASE.md`, when it lists the files of `docs/workflow/`.
- `README.md`: a row for `/flow:test-plan` in the table "Commands".
- `docs/workflow/CONFIG.md` and `docs/workflow/TESTING.md` (new): the plan of decision 13 for this repository.
- `bench/sample/docs/workflow/CONFIG.md` and `bench/sample/docs/workflow/TESTING.md` (new): the plan of decision 13 for the sample.
- `docs/DESIGN.md`: decision 41 names the test plan instead of the section "Testing" of the config. Add "Replaced in part by decision 43." to it. Section 2 adds the test plan to the scope.
- `tools/verify.sh`: read only. It checks the plugin paths, the icons and the style of the new files.

## Parts
1. The skill and the templates: `/flow:test-plan`, the plan template, and the config and brief templates. Files: `plugins/flow/skills/test-plan/SKILL.md`, `plugins/flow/templates/TESTING.md`, `plugins/flow/templates/CONFIG.md`, `plugins/flow/templates/BRIEF.md`.
2. The skills and the docs that read the plan: `discuss`, `adopt`, `tutorial`, the workflow guide and the README. Files: `plugins/flow/skills/discuss/SKILL.md`, `plugins/flow/skills/adopt/SKILL.md`, `plugins/flow/skills/tutorial/SKILL.md`, `plugins/flow/reference/WORKFLOW.md`, `README.md`.
3. This repository and the benchmark: the two plans and configs, the design and the changelog. Files: `docs/workflow/CONFIG.md`, `docs/workflow/TESTING.md`, `bench/sample/docs/workflow/CONFIG.md`, `bench/sample/docs/workflow/TESTING.md`, `docs/DESIGN.md`, `CHANGELOG.md`.

## Tests
none. The test rule of this repository is `none`. The verify script is the check.

## Human checklist
- [ ] Run `/flow:test-plan` in a test project with tests. It starts from the found framework, offers the presets, and writes the plan through a pull request.
  Why: A skill change needs a run on a test project (project rule 4), and only a person can judge the conversation.
- [ ] Run `/flow:discuss` on a small topic in that test project after the merge. The brief plans its tests by the plan, with its conventions.
  Why: Only a run shows that the brief follows the plan.

## Changelog
Changed: `/flow:test-plan` sets up the tests of the project in a conversation, and writes the test plan to `docs/workflow/TESTING.md` through a pull request. `none`, `critical` and `logic` are now presets. `/flow:discuss` plans the tests by the plan. `/flow:adopt` writes a first plan. A project with a config runs `/flow:test-plan`, which starts from its "Rule" and "Types". The pull request replaces them with the line `Test plan: docs/workflow/TESTING.md`. Task: [0014-test-plan](docs/tasks/_archive/0014-test-plan/BRIEF.md).

## Open questions
none
