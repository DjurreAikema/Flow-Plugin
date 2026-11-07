# Step 01: Quick setup in adopt

Date: 28 October 2026

## Goal
`/flow:adopt` offers a quick setup that shows the found values and the defaults in one block, and `README.md` explains how to test the plugin from a copy.

## Context to read
- `docs/tasks/0002-quick-setup/README.md`
- `plugins/flow/skills/adopt/SKILL.md`
- `plugins/flow/templates/CONFIG.md`
- `plugins/flow/reference/WORKFLOW.md` section 1
- `README.md`

## Files touched
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `README.md` (changed)

## Work
1. In `/flow:adopt`: after "Inspect", show one quick setup block. It lists the found values (base branch, host, repository, verify command) and the defaults of task decision 3, each with its source or "default".
2. In `/flow:adopt`: when no verify command is found, the block suggests `git diff --check`, and asks the developer for a better command. This is the only question.
3. In `/flow:adopt`: "go" accepts the block and continues with "Write the setup". The developer can instead pick the full conversation. Keep the full conversation as it is.
4. In `/flow:adopt`: when a config exists, the review uses the full conversation, as today.
5. In `WORKFLOW.md` section 1: the row of `/flow:adopt` names the quick setup.
6. In `README.md`: "Set up a project" names the quick setup. Add a section "Try it without an install": copy `plugins/flow` and start Claude Code with `claude --plugin-dir <path>`.

## Review checklist
- [x] Copy `plugins/flow` to a test repository. Run `/flow:adopt` with the quick setup. Then run a small task from `/flow:discuss` to an open pull request.
  Why: Project rule 4 tests a skill change on a test project, and the agent cannot reach the work environment.
  Checked: 28 October 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The other skills.
- A verify command "none".
- The repository docs. Step 02 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The quick setup block uses the icon 🧠, because workflow guide section 11 allows no other icons. The defaults are assumptions that the developer accepts.
- The block lists the files of "Write the setup" step 4 as `AGENTS.md, CLAUDE.md`, because that step can write or change either file.
- The Inspect section now reads the repository value from the remote URL, and maps every other host to `other`. The quick setup needs both values without a question.
- A review of an existing config always uses the full setup.
- The README section "Try it without an install" sits under "Install", because it is an alternative to the install.

### Deviations
none
