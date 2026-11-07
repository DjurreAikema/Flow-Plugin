# Brief: standalone core

Date: 2 November 2026

## Why
The plugin must be generic and stand on its own. Its main goal is the loop from discuss to pull request, with branch guarding that the project imposes on itself. Project-specific features do not belong in the core. A project adds them later with the loop.

## What
The plugin and this repository name no other project. The core is the loop, the guarded base branch and the pull request. Project-specific features are gone from the plugin. A project builds them as project rules and project skills.

## Decisions

1. No file names the earlier project. Task 0002 removed the name from the living docs. This task also removes it from the archived tasks 0001 and 0002. Nothing is released yet, so no published record changes.
2. The examples in the plugin use neutral subjects instead of the examples of a game.
3. Branch guarding is core. `/flow:adopt` always installs the git hooks, with `PROTECTED` set to the base branch. `pre-push` refuses every push to the base branch, with no `v*` exception. The checks before work always check `core.hooksPath`. A project cannot switch the hooks off.
4. `/flow:release`, the SemVer rules and the `fragments` changelog are removed. The changelog styles are `direct` and `none`.
5. Azure Boards, the "Tracker" section, the `work-item` task ID and `AB#` are removed. The task ID is `number` or `slug`.
6. Extra records are removed.
7. "Roadmap" stays as a read-only document in the config. `/flow:whats-next` suggests its next part. The `Milestone` line of the task file and the roadmap update of `/flow:finish-task` are removed.
8. These stay: agents mode, `/flow:whats-next`, `/flow:tutorial`, and the host guides `github` and `azure-devops`.
9. A project adds a removed feature with project rules and project skills. The core has no extension points.
10. This repository moves its release process into its own skill, `.claude/skills/release/`. Project rule 5 stays. The config of this repository loses its "Extras" section.
11. The decision log marks decisions 5 and 11 as replaced, and adds new rows. Scope section 2 changes to match.
12. The changelog entry says what a project with a config must do (project rule 6).
13. The brief `azure-devops-trial` loses its decision about git hooks, its decision about Azure Boards and its question about Azure Boards.

## Out of scope
- New hosts.
- Extension points.
- Changes to the loop itself.
- The migration of any other project.

## How to check the result
1. A search for the name of the earlier project finds nothing.
2. The plugin has no `release` skill, no `fragments`, no `azure-boards`, no `work-item` and no "Extra records".
3. `sh tools/verify.sh` passes.
4. `/flow:adopt` on a test project installs the hooks, and a direct push to the base branch fails.

## Open questions
none
