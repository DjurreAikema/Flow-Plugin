# Step 01: Minimal git in the guides

Date: 28 October 2026

## Goal
One short git guide replaces the two git model guides. The workflow guide and the config template describe the minimal git core.

## Context to read
- `docs/tasks/0001-minimal-git/README.md`
- `plugins/flow/reference/WORKFLOW.md`
- `plugins/flow/reference/git/TRUNK.md`
- `plugins/flow/reference/git/GIT_FLOW.md`
- `plugins/flow/templates/CONFIG.md`

## Files touched
- `plugins/flow/reference/GIT.md` (new)
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/templates/CONFIG.md` (changed)

## Work
1. Write `reference/GIT.md`: the three git facts, the plain `git` commands, the manual pull request, and an "Extras" section for git hooks, releases and git flow projects.
2. In `WORKFLOW.md`: rewrite section 9 for the minimal core, and section 10 for the hosts with `other`. Move `/flow:release` to the extras in section 1. Remove "Branch protection" and "Model" everywhere.
3. In `templates/CONFIG.md`: remove "Model" and "Branch protection". Add `other` to "Host". Add an "Extras" section with "Git hooks" and "Releases".

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The skills. Steps 02 and 03 do this.
- New host commands.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The manual pull request writes its title and description to `PULL_REQUEST.md` in the task folder, so the text has a record. After `/flow:finish-task`, the file is in the archived folder.
- `reference/GIT.md` has 3 rules: no commit on the base branch, no push to it, and no force-push on a shared branch. The last two make the first rule complete without tooling.
- The config template moves "Host" and "Repository" into the "Git" section, and drops the "Hosting" section. The three git facts are then in one place.
- A git flow release is a project rule, not a plugin option. `reference/GIT.md` names it as an example.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | The deletion of `reference/git/` moved from this step to a new step 05. | The skills still name `reference/git/` until steps 02 and 03 change them. With the deletion here, the path check of the verify script fails, and the step cannot commit. | Step 05 is new. |
