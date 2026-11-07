# Brief: lower token use

Date: 2 November 2026
Roadmap card: none

## Why
A task of the workflow costs more tokens than its work needs. The main costs are `agents` mode on small code tasks, full reads of the workflow guide in every skill, and the broad reads of `/flow:plan-task`. The developer wants the same loop at a lower cost.

## What
A 2-step code task runs in `inline` mode by default. Each skill reads only the sections of the workflow guide that it needs. `/flow:plan-task` reads only the documents that guard the rules, plus the documents that the task touches. The workflow guide says that a small fix does not need the loop.

## Decisions

1. The mode depends only on the number of steps. The clause "or a step changes code" goes. The developer can still pick `agents` when the plan asks for approval.
2. Each skill reads only the sections of `reference/WORKFLOW.md` that it cites. The verify script checks that each cited section exists.
3. `/flow:plan-task` always reads the scope document and the decision log of the config. It reads the other documents of "Docs" only when the task touches them.
4. No fast path. A small fix, for example a one-line change, is done outside the loop. The workflow guide says this, and says that the git rules still apply: a branch of its own and a pull request.

## Out of scope
- A change of the value of "Mode threshold".
- A split of `reference/WORKFLOW.md` into more files.
- A new skill for small tasks.

## How to check the result
1. The verify script passes, with the new section check.
2. No skill reads the whole workflow guide without a reason.
3. On a test project, `/flow:plan-task` for a 2-step code task proposes `inline`.

## Open questions
none
