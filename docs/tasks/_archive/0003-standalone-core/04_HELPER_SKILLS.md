# Step 04: Helper skills and removals

Date: 2 November 2026

## Goal
`/flow:adopt` always installs the hooks, the helper skills describe only the core, and the release skill and the tracker guide are gone.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `plugins/flow/reference/GIT.md`, as step 01 left it
- `plugins/flow/reference/WORKFLOW.md` and `plugins/flow/templates/CONFIG.md`, as step 02 left them
- `plugins/flow/skills/adopt/SKILL.md`
- `plugins/flow/skills/whats-next/SKILL.md`
- `plugins/flow/skills/tutorial/SKILL.md`

## Files touched
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `plugins/flow/skills/release/SKILL.md` (deleted)
- `plugins/flow/reference/tracker/AZURE_BOARDS.md` (deleted)

## Work
1. In `/flow:adopt` "Inspect": read `git config core.hooksPath`. Read whether the project has hooks of its own.
2. In `/flow:adopt` "Quick setup": remove the tracker, the git hooks and the releases from the defaults. Show the setup command. List both hook files under "Files I will write". When `core.hooksPath` is set already, the block reports it and asks the developer (task decision 4).
3. In `/flow:adopt` "The conversation" and "Guidance per setting": remove the tracker, the `work-item` task ID, `fragments` and the extras. Add the hooks as a fact, not a choice.
4. In `/flow:adopt` "Write the setup": always copy the hooks, set `PROTECTED` and name the setup command. Remove the `fragments` step. Run the setup command in the clone after the copy.
5. In `/flow:whats-next`: remove the line "Release" and the newest `v*` tag. Keep the roadmap as a read-only source. Remove the check of the `Milestone` line.
6. In `/flow:tutorial`: remove `/flow:release`, the extras and `fragments`. The git lesson names the branch guard. Change every reference to workflow guide section 13 to section 12.
7. Delete `plugins/flow/skills/release/` and `plugins/flow/reference/tracker/`.
8. Search the plugin for `release`, `fragments`, `azure-boards`, `work-item`, `AB#`, "extra records" and `Milestone`. Fix each match that a step of this task owns, or report it.

## Review checklist
- [x] Copy `plugins/flow` to a test repository. Run `/flow:adopt` with the quick setup. Check that it installs the hooks and that a direct push to the base branch fails. Then run a small task from `/flow:discuss` to an open pull request.
  Why: Project rule 4 tests a skill change on a test project, and the agent cannot reach the work environment.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- The loop skills. Step 03 does this.
- The repository docs. Steps 05 and 06 do this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The quick setup block of `/flow:adopt` has a section "Branch guard" with the hook folder, `PROTECTED` and the setup command. The two hook files are under "Files I will write".
- Inspect reads `core.hooksPath` and looks for a hook tool such as `.husky/` or `lefthook.yml`. It no longer checks for `git flow`, because the core never uses it.
- When `core.hooksPath` is set, the developer picks: add the two hooks to that folder, or replace the setting (task decision 4). This is the second possible question of the quick setup.
- "Write the setup" makes the hooks executable and runs the setup command in the clone after the copy.
- The guidance per setting says that releases, a tracker and records like patch notes are project work, built as project rules or project skills.
- `/flow:whats-next` shows a "Roadmap" line instead of "Milestone", and reads the roadmap only. Its inconsistency 4 is now "the branch guard is off", because no task file names a roadmap part any more.
- The tutorial lists `/flow:tutorial` itself as the second helper, in place of `/flow:release`.
- The search of work item 8 found only intended matches: "a release process" as an example of a project rule, the `pre-commit` comment (Discovery answer 1a), "Never target a release branch" (step 03), and the advice to add fragments with a project skill.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | `reference/GIT.md` (step 01) changed again: check 3 and the "Branch guard" section follow the hooks folder of the setup command, not a fixed `tools/git-hooks`. | When a project keeps its own hooks folder (task decision 4), a fixed path makes the check fail in every skill. | Step 01. The file is outside "Files touched" of this step. |
