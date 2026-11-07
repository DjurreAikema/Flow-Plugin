# Brief: quick setup for any project

Date: 28 October 2026

## Why
A colleague wants to try the loop from discuss to pull request in a project at work. Today, `/flow:adopt` asks about 10 questions before the first task can run. The repository also names the earlier project, which is no longer relevant here.

## What
A developer copies the plugin folder, runs `/flow:adopt` in a project, and accepts one block of found values and defaults. After one pull request, the project can run `/flow:discuss` through `/flow:finish-task`. When no host CLI is available, the manual fallback opens the pull requests.

## Decisions

1. The host needs no plugin change. On Azure DevOps without `az`, the manual fallback opens the pull request. The brief `azure-devops-trial` stays in the backlog.
2. To test without an install, a developer loads a copy of `plugins/flow` with `claude --plugin-dir <path>`. `README.md` describes this. The repository stays private.
3. `/flow:adopt` starts with a quick setup. It reads the base branch, the host, the repository and the verify command from the project. It sets the other settings to defaults: tracker `none`, task ID `slug`, changelog `none`, writing style `none`, git hooks off, releases off. It shows everything in one block. "go" accepts it. The developer can pick the full conversation instead, now or later as a review.
4. Remove the name of the earlier project: delete the migration brief, rewrite `docs/DESIGN.md` sections 1 and 2 without the project name, and reword the unreleased "Added" entry of the changelog. The archived task 0001 stays as it is.
5. The decision log gets a new row for the quick setup. Decision 6 stays.

## Out of scope
- Tests of the `az` commands.
- A public repository.
- A mode without a config.
- Changes to the archived tasks.
- A release.

## How to check the result
1. In a test repository without a config, the quick setup opens one pull request with `CONFIG.md` and `AGENTS.md`. The developer answers at most one question.
2. A small task runs from `/flow:discuss` to an open pull request in that repository.
3. A search for the name of the earlier project finds only the archived task 0001.

## Open questions
1. What does the quick setup do when the project has no build or test command? Every step runs the verify command, so the config needs one, or the workflow must accept "none".
