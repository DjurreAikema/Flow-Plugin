# Step 01: Icon rules in the guide and the loop skills

Date: 2 November 2026

## Goal
The workflow guide defines the new icon set and the question form, and every prompt of the loop skills that waits for the developer ends with one 👉 line.

## Context to read
- `docs/tasks/0005-streamline-icons/README.md`
- `plugins/flow/reference/WORKFLOW.md` sections 5.8, 6.1, 6.4 and 11
- `plugins/flow/skills/discuss/SKILL.md`
- `plugins/flow/skills/plan-task/SKILL.md`
- `plugins/flow/skills/implement-task/SKILL.md`
- `plugins/flow/skills/checklist/SKILL.md`
- `plugins/flow/skills/finish-task/SKILL.md`

## Files touched
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)
- `plugins/flow/skills/implement-task/SKILL.md` (changed)
- `plugins/flow/skills/checklist/SKILL.md` (changed)
- `plugins/flow/skills/finish-task/SKILL.md` (changed)

## Work
1. In `WORKFLOW.md` section 11: replace the icon table with the set of decision 6, one meaning per icon. Add the markers ● and ○. Add the rules: 👉 once per message, on the last line, only when the skill waits; ▶️ on the last line of a session summary.
2. In `WORKFLOW.md` section 11: add the question form of decisions 4 and 5. It applies to every question with options, in a Discovery block or alone.
3. In `WORKFLOW.md` section 6.1: rewrite the example and the rules. Put the questions in a "❓ Questions" section with kind words and ● ○ markers. Remove the top 👉 line. End with the 👉 line of decision 5, with the number of questions. Keep the line for zero questions, at the end only.
4. In `WORKFLOW.md` section 6.4 rule 1: the Opus check is a question of the kind Blocker, in the question form.
5. In `/flow:discuss`: end the brief summary with a 👉 approval line. Put the 4 options in a list, and end with the 👉 line.
6. In `/flow:plan-task`: show the mode as a question in the question form. End the plan with one 👉 line for the plan and the ● answers.
7. In `/flow:implement-task`: write the Opus check in the question form. At a ⏸️ blocking item, end the message with a 👉 line.
8. In `/flow:checklist`: end the messages of both fallbacks and the open-item options with a 👉 line.
9. In `/flow:finish-task`: the findings use the question form of section 6.1, with one 👉 line at the end.

## Review checklist
- [x] Read the Discovery example in `WORKFLOW.md` section 6.1. You see the questions and their defaults at a glance.
  Why: Readability needs a human reader.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- `/flow:adopt`, `/flow:whats-next`, `/flow:tutorial`, `tools/verify.sh` and `CHANGELOG.md`. Step 02 does these.
- The archived tasks.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Section 11 has four parts now: 11.1 Summaries, 11.2 Icons, 11.3 The last line, 11.4 Questions. Every reference to "section 11" stays correct.
- 🔍 means "what the agent found", so it fits both the Discovery block and the quick setup block of step 02.
- The review page of `/flow:checklist` waits for a check in the browser, not for a reply in the chat. Its message ends with a 👀 line, and section 11.3 has a rule for this. This follows decision 3.
- `/flow:discuss` shows the brief summary and the 4 options in one message, with one 👉 line. Options 1 and 2 approve the summary. Before, the skill asked for the approval and the option in two messages.
- Each round of questions in `/flow:discuss` ends with a 👉 line, because the skill waits for the reply.
- A ⏸️ pause in `/flow:implement-task` ends with `👉 Reply "done" when the item passed, or tell me what failed.`
- Section 5.8 rule 1 names the mode as a question of the kind Assumption, to match `/flow:plan-task`.

### Deviations
none
