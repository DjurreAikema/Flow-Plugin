# Task 0002: quick setup for any project

Date: 28 October 2026
Status: ready for PR
Milestone: none
Mode: inline
Work item: none

## Goal
A developer sets up a project with one block of found values and defaults, and the repository no longer names the earlier project.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. The host needs no plugin change. On Azure DevOps without `az`, the manual fallback opens the pull request. The brief `azure-devops-trial` stays in the backlog.
2. To test without an install, a developer loads a copy of `plugins/flow` with `claude --plugin-dir <path>`. `README.md` describes this. The repository stays private.
3. `/flow:adopt` starts with a quick setup. It reads the base branch, the host, the repository and the verify command from the project. It sets the other settings to defaults: tracker `none`, task ID `slug`, changelog `none`, writing style `none`, git hooks off, releases off. It shows everything in one block. "go" accepts it. The developer can pick the full conversation instead, now or later as a review.
4. When the project has no build or test command, the quick setup suggests `git diff --check` as the verify command. The other skills do not change.
5. Remove the name of the earlier project: delete the migration brief, rewrite `docs/DESIGN.md` sections 1 and 2 without the project name, and reword the unreleased "Added" entry of the changelog. The archived task 0001 stays as it is.
6. The decision log gets a new row for the quick setup. Decision 6 stays.

## Out of scope
- Tests of the `az` commands.
- A public repository.
- A mode without a config, or a verify command "none".
- Changes to the archived tasks.
- A release.

## Tests
none. The project rules allow no automated tests. The verify script is the check.

## Changelog
### Added
- `/flow:adopt` starts with a quick setup. It reads the base branch, the host, the repository and the verify command from the project, sets every other setting to a default, and shows them in one block to accept. The full conversation stays available. `README.md` explains how to test the plugin from a copy with `claude --plugin-dir`. Task: [0002-quick-setup](docs/tasks/_archive/0002-quick-setup/README.md).

## Extra records
none

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Quick setup in adopt](01_QUICK_SETUP.md) | verified |
| 02 | [Remove the project name](02_REMOVE_PROJECT_NAME.md) | verified |

## Discovery answers
```
🔍 Discovery: Task 0002 quick setup for any project

🧠 1. The config template also needs "Docs", "Setup" and "Project rules". Decision 3 names no default for them.
      a) Docs: the design documents that Inspect finds go under "Design", the other three are "none". Setup: none. Project rules: none.      ← default
      b) Set every Docs line to "none".
⚠️ 2. "Write the setup" step 1 shows a summary and waits for approval. After the quick setup block, that is a second approval.
      a) The quick setup block counts as the summary of step 1. One approval. The block also lists the files to write.      ← default
      b) Keep both approvals.

✅ Facts I checked
   1. The current branch is feature/0002-quick-setup, and the tree is clean.   git status
   2. Verify passes on the branch.                                             sh tools/verify.sh
   3. The git hooks are on in this clone.                                      core.hooksPath
   4. /flow:adopt already runs the verify command candidate once.              adopt/SKILL.md, "Inspect"
```

Answer: "go". Answers 1a and 2a.
