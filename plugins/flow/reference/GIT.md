# Git

Date: 2 November 2026

The workflow needs four things from git, and nothing more:

1. **A base branch.** Pull requests merge into it. The config names it, for example `main`, `master` or `develop`.
2. **A feature branch per task:** `feature/<task ID>`. A backlog brief uses `feature/backlog-<slug>`, and a roadmap change uses `feature/roadmap-<slug>`.
3. **A pull request** from the feature branch into the base branch, when the task is done.
4. **A branch guard.** Two git hooks refuse a commit on the base branch and a push to it.

The agent uses plain `git` commands. Every git host works.

## Rules

1. Never commit on the base branch. Every task runs on its feature branch.
2. Never push to the base branch. Work reaches it only through a pull request.
3. Never force-push a branch that someone else works on.

## Branch guard

The project guards its own base branch. It needs no setting on the host.

1. `/flow:adopt` copies `templates/git-hooks/` of the plugin to `tools/git-hooks/` in the project.
2. `PROTECTED` in both hooks names the branches to protect. The default is the base branch. A project can add more branches, for example `main` next to the base branch `develop`.
3. Each clone runs `git config core.hooksPath tools/git-hooks` once. The config names this as its setup command.
4. When a project already sets `core.hooksPath`, for example for another hook tool, `/flow:adopt` reports it and asks the developer. It never overwrites the setting. When the developer keeps the existing folder, the hooks go into that folder, and the setup command of the config names it.

The hooks:

| Hook | Refuses | Allows |
|------|---------|--------|
| `pre-commit` | A commit on a protected branch. | The commit that ends a merge. |
| `pre-push` | A push to a protected branch, and its deletion. | Every other push, including tags. |

A host can add a guard on the server, for example a branch policy. That guard is an addition. The hooks stay on.

## Checks before work

A skill that creates a branch or commits runs these checks first:

1. The working tree is clean: `git status --porcelain` prints nothing. The skill says when it allows an exception.
2. The base branch exists on `origin`: `git ls-remote --heads origin <base>` prints a line.
3. The branch guard is on: `git config core.hooksPath` prints the hooks folder of the setup command of the config, by default `tools/git-hooks`. When it does not, tell the developer to run the setup command.

## Commands

| Action | Command |
|--------|---------|
| Update the base branch | `git switch <base> && git pull --ff-only origin <base>` |
| Start a feature branch | `git switch -c feature/<task ID> <base>` |
| Start a backlog branch | `git switch -c feature/backlog-<slug> <base>` |
| Start a roadmap branch | `git switch -c feature/roadmap-<slug> <base>` |
| Check that a branch name is free | `git branch --list <name>` and `git ls-remote --heads origin <name>` print nothing |
| Bring the base branch in | `git fetch origin <base> && git rebase origin/<base>` |
| Push a feature branch | `git push -u origin <branch>` |
| List the active tasks | `git branch -a --no-merged origin/<base> --list '*feature/*'` |
| Read a file on another branch | `git show <branch>:<path>` |

## Open a pull request

Use the host guide when the config names a host with a guide, and its tool is installed and logged in:

| Host | Guide |
|------|-------|
| `github` | `reference/hosting/GITHUB.md` |
| `azure-devops` | `reference/hosting/AZURE_DEVOPS.md` |

Otherwise, use the manual fallback. It works on every host:

1. Push the feature branch.
2. Write the title and the description of the pull request to a file in the task folder: `PULL_REQUEST.md`. Commit and push it.
3. Give the developer the link to create the pull request. Many hosts print it in the output of the push. When the push prints no link, name the host page where the developer creates a pull request.
4. Ask the developer to paste the link of the new pull request. Record it in the session summary.

The same fallback applies when the host tool fails and its guide has no other route.

## Git flow projects

A project that uses Git Flow sets its base branch to `develop`. The core needs no git flow tool: a feature branch from `develop` and a pull request into `develop` are plain git.

A release into `main` follows the recipe of `/flow:release`. The recipe names `main` as the release target, and the setup adds `main` to `PROTECTED`.
