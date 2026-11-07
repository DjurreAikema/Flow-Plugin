# Step 05: Release skill of this repository

Date: 2 November 2026

## Goal
This repository makes its releases with its own project skill `/release`, and its config and agent rules match the core.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `plugins/flow/skills/release/SKILL.md` on `main`: `git show main:plugins/flow/skills/release/SKILL.md`
- `plugins/flow/reference/GIT.md` on `main`, section "Releases"
- `plugins/flow/reference/WORKFLOW.md` on `main`, section 13.4
- `docs/workflow/CONFIG.md`
- `AGENTS.md`

## Files touched
- `.claude/skills/release/SKILL.md` (new)
- `docs/workflow/CONFIG.md` (changed)
- `AGENTS.md` (changed)

## Work
1. Write `.claude/skills/release/SKILL.md`. Base it on the release skill, the release steps and the SemVer rules on `main`. Remove the check of the config extras and the `fragments` work. Add project rule 5: the release commit sets `version` in `plugins/flow/.claude-plugin/plugin.json`. Use paths of this repository, not `${CLAUDE_PLUGIN_ROOT}`.
2. In `docs/workflow/CONFIG.md`: remove the sections "Tracker" and "Extras", and the setting "Extra records". In project rule 5, name the skill `/release`.
3. In `AGENTS.md`: add `.claude/skills/` to the layout, and `/release` to the commands.
4. Write the skill in the writing style of the config, without em dashes. The verify script does not scan `.claude/`.

## Review checklist
- [x] Read `.claude/skills/release/SKILL.md`. It matches how you release this plugin.
  Why: The release process is a decision of the developer.
  Checked: 2 November 2026

## Docs to update
The files under "Files touched".

## Out of scope
- A release.
- The plugin files.
- The verify script.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The project skill holds the SemVer rules of the old workflow guide section 13.4, because the plugin no longer has them.
- The skill releases from `main` through a `release/<version number>` branch and a pull request, as the old git guide did. It sets the plugin version in the same commit as the changelog (project rule 5).
- The skill runs the verify script before the release commit, because the version change touches the plugin manifest.
- The skill names the session summary format by its path in this repository, because a project skill cannot use `${CLAUDE_PLUGIN_ROOT}`.
- Project rule 3 of the config no longer names a tracker.
- `AGENTS.md` lists `.claude/skills/` in the layout and `/release` in the commands, and says that the setup command switches on the branch guard.

### Deviations
none
