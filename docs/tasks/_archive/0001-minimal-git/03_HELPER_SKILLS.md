# Step 03: Helper skills

Date: 28 October 2026

## Goal
`/flow:adopt` asks only about the base branch, the host and the extras, `/flow:release` runs only when the config switches it on, and the plugin description and the README match the minimal core.

## Context to read
- `docs/tasks/0001-minimal-git/README.md`
- `plugins/flow/reference/GIT.md` and `plugins/flow/templates/CONFIG.md`, as step 01 left them
- `plugins/flow/skills/adopt/SKILL.md`
- `plugins/flow/skills/whats-next/SKILL.md`
- `plugins/flow/skills/release/SKILL.md`
- `plugins/flow/skills/tutorial/SKILL.md`
- `plugins/flow/.claude-plugin/plugin.json`
- `README.md`

## Files touched
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/skills/release/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `plugins/flow/.claude-plugin/plugin.json` (changed)
- `README.md` (changed)

## Work
1. In `/flow:adopt`: find the base branch from the repository. Ask about the host only when the remote does not answer it. Ask about the extras as optional choices. Remove the questions about the git model and branch protection.
2. In `/flow:whats-next`: use the commands of `reference/GIT.md`.
3. In `/flow:release`: stop when the config does not switch releases on. Use the release steps of `reference/GIT.md`.
4. In `/flow:tutorial`: the git lesson explains the base branch, the feature branch and the pull request, and the extras of this project.
5. In `plugin.json` and `README.md`: describe git as "any git project", and list GitHub and Azure DevOps as hosts with extra support.

## Review checklist
none

## Docs to update
none

## Out of scope
- `/flow:checklist`.
- The repository docs. Step 04 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `/flow:adopt` reads the base branch from the "HEAD branch" of `origin`. A `develop` branch next to `main` is a hint, not a rule.
- `/flow:adopt` asks about the extras last, as optional choices, both off by default.
- `/flow:release` stops when the config does not switch releases on, and says why.
- A project with its own release process, for example git flow, follows its project rules in `/flow:release`. The skill keeps the changelog work and every approval.
- `/flow:whats-next` skips the host source for the host `other`.

### Deviations
none
