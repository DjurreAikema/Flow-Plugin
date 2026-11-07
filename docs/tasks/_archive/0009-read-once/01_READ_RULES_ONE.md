# Step 01: Read rules, part 1

Date: 2 November 2026

## Goal
The agent rules no longer order a full read of the workflow guide. The guide has the principle "Read once", and discuss, plan-task and the step builder follow it.

## Context to read
- `docs/tasks/0009-read-once/README.md`
- `AGENTS.md` and `plugins/flow/templates/AGENTS.md`, the table "Read these first"
- `plugins/flow/reference/WORKFLOW.md` section 2
- The read items of `plugins/flow/skills/discuss/SKILL.md`, `plugins/flow/skills/plan-task/SKILL.md` and `plugins/flow/agents/step-builder.md`
- `plugins/flow/skills/plan-task/SKILL.md`, "Check the plan"

## Files touched
- `AGENTS.md` (changed)
- `plugins/flow/templates/AGENTS.md` (changed)
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)
- `plugins/flow/agents/step-builder.md` (changed)

## Work
1. In both `AGENTS.md` files: the row of the workflow guide says that each `/flow:` skill reads the sections it cites. Read the whole guide only to explain the workflow. Remove "Every `/flow:` skill reads it" from the template.
2. In `WORKFLOW.md` section 2: add principle 11, "Read once". Skip a file that this session already holds and did not edit. A file that the session edited, or that changed on disk, is read again.
3. In the read item of `discuss`, `plan-task` and `step-builder.md`: add one sentence. "Skip a file that this session already holds and did not edit."
4. In `plan-task`, "Check the plan": add item 7. Each step passes the verify command at its own end, not only at the end of the task.
5. In `plan-task`, the "Input" line: replace "a brief that `/flow:discuss` just wrote" with "a brief that `/flow:discuss` wrote in this session". The style check of step 04 flags "just".

## Review checklist
- [x] On a test project, run `/flow:discuss` and pick "Plan now". In the same session, `/flow:plan-task` does not read `AGENTS.md` or the config again.
  Why: Project rule 4. Only a human can watch the tool calls of a plugin run.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The other skills. Step 02 and step 03 do this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Principle 11 also says when to read a file again: after an edit by the session, or a change on disk.
- The skip sentence stands at the end of the read item, so the list of files and sections stays first.

### Deviations
none
