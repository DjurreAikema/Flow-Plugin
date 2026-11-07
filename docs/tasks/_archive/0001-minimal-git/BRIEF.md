# Brief: minimal git core

Date: 28 October 2026

## Why
The loop is the valuable part of the workflow: discuss, plan, implement, check, finish. The developer wants git to be the bare minimum, so that the workflow works in any project. Version 0.1.0 makes git models, branch protection and releases part of the setup.

## What
A project needs three git facts: its base branch, a feature branch per task, and a pull request when the task is done. The agent uses plain `git`. When the agent cannot open the pull request, it pushes the branch and gives the developer the link.

## Decisions

1. The core needs the base branch, the branch `feature/<task ID>` per task, and a pull request when the task is done.
2. The core uses plain `git` commands only. It never needs git-flow-next. A git flow project sets its base branch to `develop`.
3. The rule "never commit on the base branch" stays in the core.
4. The config "Host" is `github`, `azure-devops` or `other`. When the host CLI is missing, or the host is `other`, the agent pushes the branch and gives the developer the link to open the pull request by hand.
5. Git hooks and `/flow:release` are optional extras. The config switches them on.
6. The config settings "Model" and "Branch protection" are removed. `reference/git/TRUNK.md` and `reference/git/GIT_FLOW.md` become one short `reference/GIT.md`.

## Out of scope
- New hosts.
- Changes to the loop itself.

## How to check the result
A reader can follow `reference/GIT.md` and `templates/CONFIG.md` for a project on a host that the plugin does not know.

## Open questions
none
