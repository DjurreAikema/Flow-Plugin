# Task 0003: standalone core

Date: 2 November 2026
Status: ready for PR
Milestone: none
Mode: inline
Work item: none

## Goal
The plugin is the loop from discuss to pull request with a guarded base branch, and nothing more. No file names the earlier project.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. No file names the earlier project. This includes the archived tasks 0001 and 0002. Step file 02 of task 0002 gets the new name `02_REMOVE_PROJECT_NAME.md`.
2. The examples in the plugin use neutral subjects instead of the examples of a game.
3. The git hooks are core. `/flow:adopt` always copies them to `tools/git-hooks/`, with `PROTECTED` set to the base branch, and names `git config core.hooksPath tools/git-hooks` as the setup command. `pre-push` refuses every push to the base branch. The checks before work always check `core.hooksPath`. A project cannot switch the hooks off.
4. When a project already sets `core.hooksPath`, `/flow:adopt` reports it and asks the developer. It never overwrites the setting.
5. `/flow:release`, the SemVer rules and the `fragments` changelog are removed. The changelog styles are `direct` and `none`.
6. Azure Boards, the "Tracker" section, the `work-item` task ID and `AB#` are removed. The task ID is `number` or `slug`.
7. Extra records are removed.
8. "Roadmap" stays as a read-only document in the config. `/flow:whats-next` suggests its next part. The `Milestone` line and the roadmap update of `/flow:finish-task` are removed.
9. Agents mode, `/flow:whats-next`, `/flow:tutorial` and both host guides stay.
10. A project adds a removed feature with project rules and project skills. The core has no extension points.
11. Workflow guide section 12 (trackers) is removed. Section 13 becomes section 12. Every reference to it changes.
12. This repository moves its release process into the project skill `.claude/skills/release/`. Project rule 5 stays.
13. The mode is `inline`. The rule gives `agents` (7 steps, and step 01 changes the hook scripts), but the `flow:step-builder` agent does not load in the cloud session that builds this task.

## Out of scope
- New hosts.
- Extension points.
- Changes to the loop itself.
- The migration of any other project.

## Tests
none. The project rules allow no automated tests. The verify script is the check.

## Changelog
### Changed
- The core of the workflow is the loop from discuss to pull request, with a guarded base branch. The git hooks are always on, and `pre-push` refuses every push to the base branch. `/flow:release`, the `fragments` changelog, Azure Boards, the `work-item` task ID, extra records and milestones are removed. A project can add them back as project rules or project skills. A project with a config must remove "Tracker", "Extras", "Extra records" and the `Milestone` line. It must change `fragments` to `direct` or `none`, and `work-item` to `number` or `slug`. It must copy the hooks of the plugin to `tools/git-hooks/`, and run `git config core.hooksPath tools/git-hooks` in each clone. Task: [0003-standalone-core](docs/tasks/_archive/0003-standalone-core/README.md).

## Extra records
none

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Hooks in the core](01_CORE_HOOKS.md) | verified |
| 02 | [Guide and templates](02_GUIDE_TEMPLATES.md) | verified |
| 03 | [Loop skills](03_LOOP_SKILLS.md) | verified |
| 04 | [Helper skills and removals](04_HELPER_SKILLS.md) | verified |
| 05 | [Release skill of this repository](05_REPO_RELEASE.md) | verified |
| 06 | [Repository docs and changelog](06_REPO_DOCS.md) | verified |
| 07 | [Archive without the project name](07_ARCHIVE_NAMES.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0003 standalone core

⚠️ 1. The comment in pre-commit says that the merge exception is "for the conflicts of a release".
      The core has no releases now. Step 01 leaves pre-commit out of scope.
      a) Keep pre-commit as it is. A release process of a project can still need the exception      ← default
      b) Reword the comment in both copies. Step 01 then touches 7 files
🧠 2. The neutral examples replace the game examples in the plugin.
      a) A web app: task 0003-password-reset, src/auth/ResetController.ts,
         and the config value ResetToken.Lifetime, in line with the examples of the writing style      ← default
      b) Name another subject
🧠 3. Without fragments, a team that keeps a changelog gets merge conflicts in it.
      a) Workflow guide 12.1 says this. A team picks none, or adds fragments with a project skill      ← default
      b) Say nothing about teams

✅ Facts I checked
   1. The branch is feature/0003-standalone-core, and the tree is clean.     git status
   2. Verify passes on the branch.                                           sh tools/verify.sh
   3. The git hooks are on in this clone.                                    core.hooksPath
   4. templates/TASK.md also names section 13. Step 02 changes the
      file, so it takes the new number too.                                  grep "section 13"
   5. A tag push goes to refs/tags/, so the new pre-push lets it through.    tools/git-hooks/pre-push
```

Answer: "go". Answers 1a, 2a and 3a.
