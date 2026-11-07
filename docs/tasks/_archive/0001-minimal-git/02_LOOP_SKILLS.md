# Step 02: Loop skills

Date: 28 October 2026

## Goal
The skills of the loop use `reference/GIT.md` and plain `git`, and `/flow:finish-task` falls back to a manual pull request.

## Context to read
- `docs/tasks/0001-minimal-git/README.md`
- `plugins/flow/reference/GIT.md`, as step 01 left it
- `plugins/flow/skills/discuss/SKILL.md`
- `plugins/flow/skills/plan-task/SKILL.md`
- `plugins/flow/skills/implement-task/SKILL.md`
- `plugins/flow/skills/finish-task/SKILL.md`
- `plugins/flow/reference/hosting/GITHUB.md`
- `plugins/flow/reference/hosting/AZURE_DEVOPS.md`

## Files touched
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/plan-task/SKILL.md` (changed)
- `plugins/flow/skills/implement-task/SKILL.md` (changed)
- `plugins/flow/skills/finish-task/SKILL.md` (changed)
- `plugins/flow/reference/hosting/GITHUB.md` (changed)
- `plugins/flow/reference/hosting/AZURE_DEVOPS.md` (changed)

## Work
1. Replace every reference to `reference/git/` and to "the git model guide" with `reference/GIT.md`.
2. Replace the setup checks of the git model with the checks of `reference/GIT.md`.
3. In both host guides: replace the "Branch protection" section with a short note, and name the manual fallback of `reference/GIT.md`.
4. In `/flow:discuss` and `/flow:finish-task`: open the pull request by the host guide when it can, and by the manual fallback of `reference/GIT.md` otherwise.

## Review checklist
none

## Docs to update
none

## Out of scope
- `/flow:checklist`: it names no git model.
- The helper skills. Step 03 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `/flow:discuss` and `/flow:finish-task` name the section "Open a pull request" of `reference/GIT.md`. That section decides between the host guide and the manual fallback, so the rule is in one place.
- `/flow:finish-task` reads `reference/GIT.md` first, and then only the host guide that it names.
- With the host `other`, `/flow:finish-task` asks the developer to paste the review comments, because no tool can read them.
- Both host guides got a section "When this guide does not apply", which points to the manual fallback.

### Deviations
none
