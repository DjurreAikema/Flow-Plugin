# Lending: agent rules

Date: 5 November 2026

Lending is an in-memory library lending system in TypeScript on Node. It has the modules catalog, members, loans, fees and reports.

This project uses the `flow` workflow plugin. The choices of this project are in `docs/workflow/CONFIG.md`.

## Read these first

| Document | When to read it |
|----------|-----------------|
| `docs/workflow/CONFIG.md` | Always. The choices and rules of this project. |
| The workflow guide of the `flow` plugin | How work happens here, for a person. The `/flow:` skills hold their own rules, so an agent does not read the guide to do a task. |

## Commands

| Command | Use |
|---------|-----|
| `node --test "test/**/*.test.ts"` | Run the tests. Exit code 0 means pass. |

## Hard rules

1. Build only what the brief names. Respect every "Out of scope" section.
2. Follow the project rules in `docs/workflow/CONFIG.md`.
3. Never invent a changelog entry. Copy the entry of the brief.
4. Use only erasable TypeScript syntax: no `enum`, no `namespace`, no parameter properties. Imports name the `.ts` extension.

## Workflow rules

1. Never commit on the base branch. Work on the feature branch of the task.
2. Commit only through the `/flow:` skills, or when the developer asks. Never skip git hooks with `--no-verify`.
3. When the code and the docs disagree, report the difference. Do not silently change either one.
4. Mark a fact that you cannot verify with `[Verify]`.
5. Ask only the questions that matter. Zero questions is a valid result.
