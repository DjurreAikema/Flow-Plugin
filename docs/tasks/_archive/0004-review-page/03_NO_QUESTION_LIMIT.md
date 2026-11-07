# Step 03: No question limit

Date: 2 November 2026

## Goal
`/flow:discuss` and `/flow:adopt` ask every question that matters, the questions with the most impact first, and the changelog holds the entry of the task.

## Context to read
- `docs/tasks/0004-review-page/README.md`
- `plugins/flow/skills/discuss/SKILL.md`
- `plugins/flow/skills/adopt/SKILL.md`
- `CHANGELOG.md`

## Files touched
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. In `/flow:discuss`, "The conversation" rule 3: remove the limit of 4 questions. Write: ask every question whose answer changes the design. Ask first the questions whose answers shape other questions. A question that depends on another answer waits for the next round.
2. In `/flow:adopt`, "The conversation" rule 2: make the same change, for the setup.
3. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
- [x] Run `/flow:discuss` on a topic with few unknowns. The round has fewer than 4 questions, and no question is filler.
  Why: The goal is a change in the behaviour of the agent. Only a real run shows it.
  Checked: 2 November 2026

## Docs to update
none

## Out of scope
- The Discovery of `/flow:implement-task`.
- Other rules of the conversation.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Both skills keep the words "Never aim for a number of questions", in line with principle 10 of the workflow guide.
- `/flow:discuss` and `/flow:adopt` use the same wording, except "the design" and "the setup". Decision 6 of the design log stays true.
- The changelog entry is the last entry under "Changed", after the entry of task 0003.

### Deviations
none
