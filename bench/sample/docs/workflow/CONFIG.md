# Workflow config

Date: 5 November 2026

The choices of this project for the `flow` workflow. The skills read this file. The workflow guide of the plugin explains each setting (`reference/WORKFLOW.md`). Change a setting only with a task, so that the change has a record.

## Project
- Name: Lending
- Summary: An in-memory library lending system: catalog, members, loans, fees and reports.

## Git
- Base branch: main
- Host: other
- Repository: none

## Tasks
- Task ID: number

## Commands
- Verify: `node --test "test/**/*.test.ts"`
- Setup: `git config core.hooksPath tools/git-hooks`
- Coverage: none

## Testing
The automated tests of the project. `/flow:test-plan` writes the plan (`reference/WORKFLOW.md` section 7).

- Test plan: docs/workflow/TESTING.md

## Docs
The documents that the agent reads before it plans. Write "none" for a document that the project does not have.

- Scope: none
- Design: none
- Roadmap: none
- Decision log: none

## Records
- Changelog: none
- Changelog file: CHANGELOG.md
- Writing style: ste

## Project rules
Rules that only this project has. The agent follows them like the rules of `AGENTS.md`. Examples: terms of the project, a release process.

none
