# Step 02: Helper skills and the icon check

Date: 2 November 2026

## Goal
The helper skills follow the icon rules of `WORKFLOW.md` section 11, and the verify script fails on an icon outside the set.

## Context to read
- `docs/tasks/0005-streamline-icons/README.md`
- `plugins/flow/reference/WORKFLOW.md` sections 6.1 and 11, as step 01 left them
- `plugins/flow/skills/adopt/SKILL.md`
- `plugins/flow/skills/whats-next/SKILL.md`
- `plugins/flow/skills/tutorial/SKILL.md`
- `plugins/flow/agents/step-builder.md`
- `tools/verify.sh`
- `CHANGELOG.md`

## Files touched
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `tools/verify.sh` (changed)
- `CHANGELOG.md` (changed)

## Work
1. In `/flow:adopt`: change the header of the quick setup block to `🔍 Quick setup`. Write the question about an existing `core.hooksPath` in the question form. End the full setup summary with a 👉 approval line.
2. In `/flow:whats-next`: move the "details" hint above the ▶️ line, so that ▶️ is the last line.
3. In `/flow:tutorial`: end the messages that ask the track and the level of the reader with a 👉 line.
4. In `tools/verify.sh`: add check 6. With `python3`, scan every file in `plugins/flow` for icons. Fail when a file holds an icon outside the set of `WORKFLOW.md` section 11, and name the file and the icon. Allow ● and ○. Warn and pass when `python3` is missing. Update the comment at the top.
5. Check that `plugins/flow/agents/step-builder.md` passes the new check without a change.
6. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
- [x] Run `/flow:plan-task` and `/flow:implement-task` on a test project with `claude --plugin-dir plugins/flow`. Each message that waits ends with one 👉 line. The Discovery block shows "❓ Questions" with ● on each default.
  Why: Project rule 4. Only a session with the plugin loaded shows the real output.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The files of step 01.
- `plugins/flow/agents/step-builder.md`, unless the new check fails on it.
- The messages of the git hooks and of the verify script.
- The archived tasks.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `/flow:adopt` writes the question about an existing `core.hooksPath` as a Conflict, with ● on "add the two hooks to that folder". The old text gave no default, and adding is the safe answer.
- `/flow:adopt` ends the review question of an existing config, each round of the full setup, and the setup summary with a 👉 line.
- `/flow:whats-next` puts the reason on a "Why:" line above the ▶️ line, so that ▶️ is the last line.
- Check 6 scans the Unicode blocks of arrows, technical symbols, geometric shapes, symbols, dingbats and emoji. It allows the set of section 11.2 and the markers ● and ○. The git hook templates and the review page pass it.
- A test with 🧠 and ← added to a skill made check 6 fail with the file and both icons. The test change was undone.
- `plugins/flow/agents/step-builder.md` passes check 6 without a change.

### Deviations
none
