# Task 0001: minimal git core

Date: 28 October 2026
Status: ready for PR
Milestone: none
Mode: inline
Work item: none

## Goal
Reduce the git part of the workflow to a base branch, a feature branch per task and a pull request, so that the workflow works in any project.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. The core needs the base branch, the branch `feature/<task ID>` per task, and a pull request when the task is done.
2. The core uses plain `git` commands only. It never needs git-flow-next.
3. The rule "never commit on the base branch" stays in the core.
4. The config "Host" is `github`, `azure-devops` or `other`. Without a host CLI, or with `other`, the agent pushes the branch and gives the link for a manual pull request.
5. Git hooks and `/flow:release` are optional extras. The config switches them on under "Extras".
6. The config settings "Model" and "Branch protection" are removed. One guide `reference/GIT.md` replaces `reference/git/`. Step 05 deletes `reference/git/`, after the other steps changed every reference to it.
7. The mode is `inline`. The rule gives `agents` (4 steps), but the `flow:step-builder` agent cannot load in the cloud session that builds this task.

## Out of scope
- New hosts.
- Changes to the loop itself.
- Changes to the commands of the host guides, other than branch protection.

## Tests
none. The project rules allow no automated tests. The verify script is the check.

## Changelog
### Changed
- The core of the workflow needs only a base branch, one feature branch per task and a pull request. It uses plain `git`, so it works in any project. Git hooks and `/flow:release` are optional extras. A project with a config removes the settings "Model" and "Branch protection", and sets "Host" to `github`, `azure-devops` or `other`. Task: [0001-minimal-git](docs/tasks/_archive/0001-minimal-git/README.md).

## Extra records
none

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Minimal git in the guides](01_GIT_GUIDES.md) | verified |
| 02 | [Loop skills](02_LOOP_SKILLS.md) | verified |
| 03 | [Helper skills](03_HELPER_SKILLS.md) | verified |
| 04 | [Repo docs and changelog](04_REPO_DOCS.md) | verified |
| 05 | [Remove the old git guides](05_REMOVE_OLD_GUIDES.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0001 minimal git core

⚠️ 1. Step 01 touches 7 files, counting the two deletions. The step size rule allows 6.
      a) Keep it. The deletions are part of the replacement
      b) Move the two host guides to step 02, which then has 6 files      ← default

✅ Facts I checked
   1. Verify passes on the branch.                         sh tools/verify.sh
   2. The git hooks are on in this clone.                  core.hooksPath
   3. 20 files name the git model, branch protection or the release skill.   grep
```

Answer: "go". Answer 1b: the host guides moved from step 01 to step 02.
