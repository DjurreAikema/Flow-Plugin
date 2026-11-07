# Task 0008: lower token use

Date: 2 November 2026
Status: ready for PR
Mode: inline
Roadmap card: none

## Goal
Lower the token use of the workflow without a change to the loop. Small tasks run inline, skills read only the sections of the workflow guide that they need, and small fixes stay outside the loop.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. The mode depends only on the number of steps. The clause "or a step changes code" goes. The developer can still pick `agents` when the plan asks for approval.
2. Each skill reads only the sections of `reference/WORKFLOW.md` that it cites. The verify script checks that each cited section exists.
3. `/flow:plan-task` always reads the scope document and the decision log of the config. It reads the other documents of "Docs" only when the task touches them.
4. No fast path. A small fix, for example a one-line change, is done outside the loop. The workflow guide says this, and says that the git rules still apply: a branch of its own and a pull request.
5. `/flow:adopt` and `/flow:tutorial` keep the full read of the workflow guide. Tutorial teaches the whole guide, and adopt explains every setting. Both run rarely.
6. A small fix uses the branch `fix/<slug>`. `/flow:whats-next` treats only `feature/*` branches as tasks, so it does not flag a fix branch.
7. The section check covers the plugin, the project skills in `.claude/skills/`, and the documents of this repository. Step 02 fixes the wrong section number in `CHANGELOG.md`, so that its verify passes.
8. The mode is `inline`. The rule gives `agents` (3 steps), but the `flow:step-builder` agent cannot load in the cloud session that builds this task.

## Out of scope
- A change of the value of "Mode threshold".
- A split of `reference/WORKFLOW.md` into more files.
- A new skill for small tasks.
- The reads of `/flow:adopt`, `/flow:tutorial`, `/flow:whats-next` and the step builder.
- The files in `docs/tasks/_archive/`.

## Tests
none. The test rule of the config is `none`. The verify script is the check.

## Changelog
### Changed
- The workflow uses fewer tokens. A task picks `agents` mode only by its number of steps. Each skill reads only the sections of the workflow guide that it cites. `/flow:adopt` and `/flow:tutorial` still read the whole guide. `/flow:plan-task` always reads the scope document and the decision log, and the other documents of the config only when the task touches them. The workflow guide says that a small fix is done outside the loop, on its own branch and through a pull request. The verify script checks that every cited section of the workflow guide exists. Task: [0008-token-use](docs/tasks/_archive/0008-token-use/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Mode rule and plan reads](01_MODE_PLAN_READS.md) | verified |
| 02 | [Section check](02_SECTION_CHECK.md) | verified |
| 03 | [Section reads in skills](03_SKILL_SECTION_READS.md) | verified |

## Discovery answers
```
🔍 Discovery: Task 0008 lower token use

✅ Facts I checked
   1. The working tree is clean, origin/main exists,
      and the branch guard is on.                         git status, ls-remote, core.hooksPath
   2. The guide has sections 1 to 12, with 5.1 to 5.9,
      6.1 to 6.4, 7.1 to 7.4, 11.1 to 11.4, 12.1 and 12.2.   WORKFLOW.md headings
   3. Every section that the five skills of step 03 cite
      falls inside their planned lists.                   grep of the skills
   4. CHANGELOG.md cites section 13. The changelog
      is section 12.                                      CHANGELOG.md line 5

📁 Files I will touch
   ~ plugins/flow/reference/WORKFLOW.md                   step 01
   ~ plugins/flow/skills/plan-task/SKILL.md               step 01
   ~ tools/verify.sh                                      step 02
   ~ CHANGELOG.md                                         step 02, step 03
   ~ plugins/flow/skills/discuss/SKILL.md                 step 03
   ~ plugins/flow/skills/implement-task/SKILL.md          step 03
   ~ plugins/flow/skills/finish-task/SKILL.md             step 03
   ~ plugins/flow/skills/roadmap/SKILL.md                 step 03
   ~ plugins/flow/skills/checklist/SKILL.md               step 03

👉 No questions. Reply "go" to start.
```

Answer: "go".
