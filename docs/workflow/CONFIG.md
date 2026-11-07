# Workflow config

Date: 2 November 2026

The choices of this repository for the `flow` workflow. This repository holds the `flow` plugin and uses it on itself. The skills read this file. Change a setting only with a task, so that the change has a record.

## Project
- Name: flow (AI Workflow Plugin)
- Summary: A Claude Code plugin that runs a fenced, documented AI workflow in any project. It works in any git project.

## Git
- Base branch: main
- Host: github
- Repository: DjurreAikema/Flow-Plugin

## Tasks
- Task ID: number

## Commands
- Verify: `sh tools/verify.sh`
- Setup: `git config core.hooksPath tools/git-hooks`
- Coverage: none

## Testing
- Test plan: docs/workflow/TESTING.md

## Docs
- Scope: `docs/DESIGN.md` section 2
- Design: `docs/DESIGN.md`, `plugins/flow/reference/WORKFLOW.md`
- Roadmap: none
- Decision log: `docs/DESIGN.md` section 4

## Records
- Changelog: direct
- Changelog file: CHANGELOG.md
- Writing style: ste
- Release: docs/workflow/RELEASE.md

## Project rules
1. The plugin in `plugins/flow/` must stay generic. Never name a project that uses it, a person, or a team in the plugin files. Examples in the plugin use neutral subjects.
2. Every skill reads the plugin files through `${CLAUDE_PLUGIN_ROOT}`. The verify script checks that each such path exists.
3. A command for a host that nobody tested has the `[Verify]` marker. Remove the marker only after a real project ran the command.
4. Test a change of a skill by running it on a test project, as a review checklist item.
5. Release rule: `/flow:release` makes a release, by the recipe `docs/workflow/RELEASE.md`. It sets `version` in `plugins/flow/.claude-plugin/plugin.json` to the new version number, in the release commit. Users stay on that version until the next release.
6. A skill change that changes how a project must be set up needs an entry under "Changed" that says what a project must do.
