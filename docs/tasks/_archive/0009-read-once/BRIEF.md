# Brief: cut repeated reads and copies

Date: 2 November 2026
Roadmap card: none

## Why
An analysis of task 0008 found tokens spent three ways. The agent reads the same files twice. The workflow writes the same text in several places. The agent writes a new script each time it checks the writing style. The developer wants these costs gone, without a change to the loop.

## What
No document says that the workflow guide is read in full "Always". A skill skips a file that the session already holds. The pull request holds only what a reviewer needs on the host. A script of the plugin checks the writing style in `/flow:finish-task`. The plan checks that each step passes verify at its own end.

## Decisions

1. `AGENTS.md` and `templates/AGENTS.md` stop saying that the workflow guide is read "Always". The skills read the sections that they cite.
2. Each skill and the step builder skip a file that the session already holds and did not edit.
3. The pull request keeps the deviations, the summary, the coverage, the review items and the link to the task. It drops the steps table, the choices and the changelog entry. The task file keeps its copy of the decisions, because the step builder reads only the task file.
4. A script of the plugin checks sentence length and filler words for the writing style `ste`. `/flow:finish-task` runs it on the changed Markdown files. Its findings join the Conflict questions. Without Python 3, the skill skips the check with a ⚠️ line.
5. The verify script of this repository runs the style script on the plugin files. The task fixes the 4 long sentences there.
6. `/flow:plan-task` checks that each step passes the verify command at its own end.

## Out of scope
- A compact question form for `/flow:discuss`.
- Narrower section lists in the skills.
- Reading the decision log by section.
- `docs/tasks/_new/` in `.gitignore`.

## How to check the result
1. The verify script passes, with the style check.
2. No skill or template says that the workflow guide is read "Always".
3. On a test project, the pull request of `/flow:finish-task` has no steps table and no changelog entry.

## Open questions
none
