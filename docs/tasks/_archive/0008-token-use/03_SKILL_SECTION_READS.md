# Step 03: Section reads in skills

Date: 2 November 2026

## Goal
Every skill of the loop reads only the sections of the workflow guide that it needs, and the changelog holds the entry of the task.

## Context to read
- `docs/tasks/0008-token-use/README.md`
- `plugins/flow/reference/WORKFLOW.md`, the section headings
- `plugins/flow/skills/discuss/SKILL.md`
- `plugins/flow/skills/implement-task/SKILL.md`
- `plugins/flow/skills/finish-task/SKILL.md`
- `plugins/flow/skills/roadmap/SKILL.md`
- `plugins/flow/skills/checklist/SKILL.md`
- `CHANGELOG.md`

## Files touched
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/implement-task/SKILL.md` (changed)
- `plugins/flow/skills/finish-task/SKILL.md` (changed)
- `plugins/flow/skills/roadmap/SKILL.md` (changed)
- `plugins/flow/skills/checklist/SKILL.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. In the "Before you start" read item of each skill, replace the full read of the workflow guide with these sections:
   - `discuss`: 1, 3, 5.7, 5.9 and 11.
   - `implement-task`: 3, 5.5, 5.8, 6, 7.3, 8, 11 and 12.
   - `finish-task`: 3, 6.1, 7.4, 8, 11 and 12.
   - `roadmap`: 3, 5.9 and 11.
   - `checklist`: 3, 8 and 11. It cites section 11 today, but does not read it.
2. Check that each skill cites no section outside its list. Add a missing section to the list, and record it under "Choices made".
3. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
- [x] Run `/flow:discuss` and `/flow:implement-task` on a test project. Each follows its formats: the question format, the Discovery block and the summary.
  Why: Project rule 4. A rule outside the cited sections can get lost, and the agent cannot run the plugin on a test project.
  Checked: 2 November 2026

## Docs to update
`CHANGELOG.md`.

## Out of scope
- `/flow:adopt`, `/flow:tutorial`, `/flow:whats-next`, `/flow:plan-task` and the step builder.

## Outcome

Status: implemented
Verify: passed

### Choices made
- A script compared the citations of each skill with its read list. No skill cites a section outside its list, so no list grew.
- The entry stands last under "Changed", after the entry of task 0006, in task order.

### Deviations
none
