# Step 03: Loop and helper skills

Date: 2 November 2026

## Goal
`/flow:discuss` starts from a card, `/flow:plan-task` carries the card into the task, `/flow:whats-next` derives the progress of the roadmap, and `/flow:adopt` and `/flow:tutorial` name `/flow:roadmap`.

## Context to read
- `docs/tasks/0007-roadmap-skill/README.md`
- `plugins/flow/reference/WORKFLOW.md` sections 3 and 5.9, as step 01 left them
- `plugins/flow/skills/roadmap/SKILL.md`, as step 02 left it
- `plugins/flow/skills/discuss/SKILL.md`
- `plugins/flow/skills/plan-task/SKILL.md`
- `plugins/flow/skills/whats-next/SKILL.md`
- `plugins/flow/skills/adopt/SKILL.md`
- `plugins/flow/skills/tutorial/SKILL.md`
- `plugins/flow/templates/BRIEF.md`

## Files touched
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `plugins/flow/templates/BRIEF.md` (changed)

## Work
1. In `templates/BRIEF.md`: add the line `Roadmap card: <card name>, or none` under the date.
2. In `/flow:discuss`: accept a card title or a card name as input. Read the card and its request summary, and start the report from them. Write the card name in the brief. Stop when two cards match the title, and ask which one.
3. In `/flow:plan-task`: copy the card line from the brief into the task file. Without a brief, ask for the card only when the config names a roadmap. Ask whether the task completes the card or does a part.
4. In `/flow:whats-next`:
   - Gather: read the milestones and derive the status of each card from the archived task files and the active task files.
   - Short status: show the progress of the current milestone, and a ⚠️ line when a target date is within 14 days and cards are open.
   - Recommend: suggest a card whose dependencies are done, with `/flow:discuss <card title>`.
   - Inconsistencies: a task names a card that does not exist. Leave `feature/roadmap-*` branches out of the task checks, like `feature/backlog-*`.
5. In `/flow:adopt`: keep the roadmap `none` in the quick setup. Name `/flow:roadmap` in the guidance for the roadmap and in the last line.
6. In `/flow:tutorial`: add `/flow:roadmap` to the helpers of lesson 2. In the project track, lesson 3 shows the milestone progress when the config names a roadmap.

## Review checklist
- [x] On the test project of step 02, run `/flow:discuss <card title>` and `/flow:whats-next`. The brief names the card. `/flow:whats-next` shows the milestone progress and suggests a card that can start.
  Why: Project rule 4. The skills work together, and only a run shows it.
  Checked: 2 November 2026

## Docs to update
none

## Out of scope
- `/flow:implement-task`, `/flow:checklist` and `/flow:finish-task`.
- The guides and templates of step 01, other than `templates/BRIEF.md`.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `/flow:discuss` treats its input as a card only when the config names a roadmap and a card matches. Otherwise the input is a topic, as before.
- `/flow:plan-task` shows the card line as a question of the kind Assumption, after the mode: whole card, `(part)` or none. The developer accepts it with "go".
- `/flow:whats-next` names the current milestone: the first one with a card that is not done. The short status shows its done cards out of all cards. The other milestones are under "details".
- The ⚠️ line for a target date uses 14 days, as the step named.
- `/flow:whats-next` recommends `/flow:roadmap` when no card can start and the developer has new client requests.
- `/flow:adopt` says that an existing roadmap document of a project stays a design document. `/flow:roadmap` writes only `docs/roadmap/`.
- The tutorial got lesson 9 "The roadmap" in the workflow track, after the changelog.

### Deviations
none
