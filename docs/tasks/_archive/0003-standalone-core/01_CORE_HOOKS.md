# Step 01: Hooks in the core

Date: 2 November 2026

## Goal
The git guide makes the hooks part of the core, `pre-push` refuses every push to a protected branch, and the host guides treat host protection as an addition to the hooks.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `plugins/flow/reference/GIT.md`
- `plugins/flow/templates/git-hooks/pre-commit`
- `plugins/flow/templates/git-hooks/pre-push`
- `plugins/flow/reference/hosting/GITHUB.md`
- `plugins/flow/reference/hosting/AZURE_DEVOPS.md`

## Files touched
- `plugins/flow/reference/GIT.md` (changed)
- `plugins/flow/templates/git-hooks/pre-push` (changed)
- `tools/git-hooks/pre-push` (changed)
- `plugins/flow/reference/hosting/GITHUB.md` (changed)
- `plugins/flow/reference/hosting/AZURE_DEVOPS.md` (changed)

## Work
1. In `GIT.md`: add the guarded base branch as the fourth thing that the workflow needs. Move the git hooks out of "Extras" into a core section "Branch guard". Describe the copy to `tools/git-hooks/`, `PROTECTED` and the setup command. Add task decision 4.
2. In `GIT.md`: the third check before work always checks `core.hooksPath`.
3. In `GIT.md`: remove the section "Releases" and the section "Extras". In "Git flow projects", keep the base branch `develop`. Say that a release into `main` is project work, through project rules or a project skill.
4. In `templates/git-hooks/pre-push`: remove the `v*` exception. Refuse every push to a protected branch, and its deletion. Update the comment at the top.
5. Copy the new `pre-push` to `tools/git-hooks/pre-push`.
6. In `GITHUB.md` and `AZURE_DEVOPS.md`: the section "Protect the base branch" says that the hooks always guard the base branch, and that host protection adds a guard on the server.
7. In `AZURE_DEVOPS.md`: remove the row "Link a work item to the pull request".
8. Test both hooks in a temporary repository with a local bare remote: a commit on the base branch fails, a push to the base branch fails, a push of a feature branch and of a `v*` tag passes.

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The skills. Steps 03 and 04 do this.
- `pre-commit`. Its merge exception stays.
- New host commands.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `reference/GIT.md` calls the hooks the "branch guard", and lists it as the fourth thing that the workflow needs.
- The new `pre-push` checks only `refs/heads/` refs. A tag push and a push of another branch pass. A deletion of a protected branch is a push to it, so the same check refuses it.
- `PROTECTED` can name more branches than the base branch, for example `main` next to `develop`. A git flow project needs this for its own release process.
- A test in a scratch repository with a local bare remote confirmed: a commit on `main` fails, a push to `main` fails, a deletion of `main` fails, a feature branch push and a `v1` tag push pass, and a merge commit on `main` passes.

### Deviations
none
