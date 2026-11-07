# Workflow config

Date: <D Month YYYY>

The choices of this project for the `flow` workflow. The skills read this file. The workflow guide of the plugin explains each setting (`reference/WORKFLOW.md`). Change a setting only with a task, so that the change has a record.

## Project
- Name: <project name>
- Summary: <one or two sentences: what the project is>

## Git
- Base branch: <the branch that pull requests merge into, for example main or develop>
- Host: <github | azure-devops | other>
- Repository: <owner/repo for GitHub, organization/project/repo for Azure DevOps, or none>

## Tasks
- Task ID: <number | slug>

## Commands
- Verify: `<the command that builds and runs the tests; exit code 0 means pass>`
- Setup: `git config core.hooksPath tools/git-hooks`
- Coverage: <`<the command that prints the coverage of the changed lines against the base branch>` or none>

## Testing
The automated tests of the project. `/flow:test-plan` writes the plan (`reference/WORKFLOW.md` section 7).

- Test plan: docs/workflow/TESTING.md

## Docs
The documents that the agent reads before it plans. Write "none" for a document that the project does not have.

- Scope: <the document that says what is in scope, or none>
- Design: <the design documents, or none>
- Roadmap: <`docs/roadmap/`, or none. `/flow:roadmap` writes it (`reference/WORKFLOW.md` section 5.9).>
- Decision log: <the document that records design decisions, or none>

## Records
- Changelog: <direct | none>
- Changelog file: CHANGELOG.md
- Writing style: <ste | none | path to the project style>
- Release: <`docs/workflow/RELEASE.md` | none. `/flow:release` writes the recipe.>

## Project rules
Rules that only this project has. The agent follows them like the rules of `AGENTS.md`. Example: terms of the project.

- <rule>
