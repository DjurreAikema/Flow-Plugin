# Task 0009: cut repeated reads and copies

Date: 2 November 2026
Status: ready for PR
Mode: inline
Roadmap card: none

## Goal
Skills read each file once per session, the pull request holds only what a reviewer needs, and a script checks the writing style.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. `AGENTS.md` and `templates/AGENTS.md` stop saying that the workflow guide is read "Always". The skills read the sections that they cite.
2. Each skill and the step builder skip a file that the session already holds and did not edit.
3. The pull request keeps the deviations, the summary, the coverage, the review items and the link to the task. It drops the steps table, the choices and the changelog entry. The task file keeps its copy of the decisions, because the step builder reads only the task file.
4. A script of the plugin checks sentence length and filler words for the writing style `ste`. `/flow:finish-task` runs it on the changed Markdown files. Its findings join the Conflict questions. Without Python 3, the skill skips the check with a ⚠️ line.
5. The verify script of this repository runs the style script on the plugin files. The task fixes the 4 long sentences there.
6. `/flow:plan-task` checks that each step passes the verify command at its own end.
7. The skip rule is principle 11 of the workflow guide, "Read once". Each read item of a skill also states it in one line, because most skills do not read section 2.
8. The mode is `inline`. The rule gives `agents` (4 steps), but the `flow:step-builder` agent cannot load in the cloud session that builds this task.

## Out of scope
- A compact question form for `/flow:discuss`.
- Narrower section lists in the skills.
- Reading the decision log by section.
- `docs/tasks/_new/` in `.gitignore`.
- The files in `docs/tasks/_archive/`.

## Tests
none. The test rule of the config is `none`. The verify script is the check.

## Changelog
### Changed
- The workflow reads and writes less text. `AGENTS.md` no longer tells the agent to read the whole workflow guide. Each skill and the step builder skip a file that the session already holds and did not edit. The pull request of `/flow:finish-task` drops the steps table, the choices and the changelog entry. `/flow:finish-task` checks the writing style `ste` with a script of the plugin, when Python 3 is installed. `/flow:plan-task` checks that each step passes the verify command at its own end. A project with an `AGENTS.md` from the template changes the row of the workflow guide in "Read these first". Task: [0009-read-once](docs/tasks/_archive/0009-read-once/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Read rules, part 1](01_READ_RULES_ONE.md) | verified |
| 02 | [Read rules, part 2](02_READ_RULES_TWO.md) | verified |
| 03 | [Style script and pull request](03_STYLE_SCRIPT_PR.md) | verified |
| 04 | [Style check in verify](04_VERIFY_STYLE_CHECK.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0009 cut repeated reads and copies

✅ Facts I checked
   1. The working tree is clean, origin/main exists,
      and the branch guard is on.                          git status, ls-remote, core.hooksPath
   2. The plugin has 4 sentences over 25 words: one each in
      WORKFLOW.md, whats-next, adopt and REQUEST.md.       scan before the plan
   3. The only filler words in the plugin are "just" in
      plan-task and the examples of WRITING_STYLE.md.     grep -w
   4. scripts/ holds only review_server.py. style_check.py
      is new, and check 5 of verify compiles it.           ls, tools/verify.sh

📁 Files I will touch
   ~ AGENTS.md                                             step 01
   ~ plugins/flow/templates/AGENTS.md                      step 01
   ~ plugins/flow/reference/WORKFLOW.md                    step 01, step 04
   ~ plugins/flow/skills/discuss/SKILL.md                  step 01
   ~ plugins/flow/skills/plan-task/SKILL.md                step 01
   ~ plugins/flow/agents/step-builder.md                   step 01
   ~ implement-task, roadmap, checklist, tutorial          step 02
   ~ whats-next, adopt                                     step 02, step 04
   + plugins/flow/scripts/style_check.py                   step 03
   ~ plugins/flow/skills/finish-task/SKILL.md              step 03
   ~ tools/verify.sh                                       step 04
   ~ plugins/flow/templates/REQUEST.md                     step 04
   ~ CHANGELOG.md                                          step 04

👉 No questions. Reply "go" to start.
```

Answer: "go".
