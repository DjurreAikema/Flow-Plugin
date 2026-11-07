---
name: test-plan
description: Set up the automated tests of the project in a conversation with the developer, and write the test plan to docs/workflow/TESTING.md through a pull request. Offers the presets none, critical and logic as a start. Run it again to change the plan.
---

# /flow:test-plan

Set up the test plan of the project. The plan `docs/workflow/TESTING.md` says which code gets tests, the test types, and how tests are written. `/flow:discuss` plans the tests of each brief by the plan. The developer decides every rule. The plugin holds only the conversation and the guidance.

Input: none.

## Before you start

1. Read `docs/workflow/CONFIG.md`. Stop when it does not exist. Tell the developer to run `/flow:adopt`. `AGENTS.md` is in the session already.
2. Find the plan. Read the line `Test plan` under "Testing" of the config. The plan is missing when the line is absent, or names a file that does not exist.
3. Read a file only once per session, unless you edited it.

## Setup

Every run is the setup. With an existing plan, the conversation starts from that plan.

### Inspect

Read the repository before you ask anything. Ask only what the repository cannot answer.

1. The test framework: the dependencies of the package manifest or the project file, and the config files of a test framework.
2. The test folders: folders and files with a test name, for example `tests/`, `__tests__/` or `*.test.*`.
3. The test commands: the scripts of the package manifest, the verify command of the config, and the CI config.
4. The conventions: read a few existing tests. Note the location, the names, the mocks, the fixtures and the test data.
5. With an existing plan: read the plan. Report each section, and ask which sections to change.
6. With the lines "Rule" and "Types" under "Testing" of the config: start from them. The rule becomes the preset, and the types become the test types.

### The conversation

The developer leads. You explain, inform and recommend. You do not steer.

1. Report what you found, in short: the framework, the test folders, the test commands and the conventions.
2. Ask open questions in prose. Do not use the multiple-choice tool.
3. Ask every question whose answer changes the plan. Ask first the questions whose answers shape other questions. Start with the preset.
4. List every realistic direction. Never add a filler direction. Keep the recommendation separate, as one "My view" line with its reason.
5. When an answer is vague, ask a follow-up question.
6. Stop asking when every section of `${CLAUDE_PLUGIN_ROOT}/templates/TESTING.md` has a value.
7. End each round of questions with one line: `👉 Reply to the questions in your own words.`

### Question format

```markdown
**<Number>. <The question, in one sentence>**

- **What this is about:** <the subject, in simple words>
- **Why it matters:** <what the answer changes>
- **Directions:**
  - <Direction>: <what it means>. <Its trade-offs.>
- **What I need from you:** <the kind of answer that helps>

**My view:** <the recommendation, with the reason>
```

Leave out "Directions" when the question is truly open.

### Guidance per topic

Use these facts in your directions and your view. They are guidance, never a fixed choice.

- **Which code gets tests:** start with a preset, then add rules per area, folder or kind of code. A rule can change or narrow the preset.
  - `none`: no code. The project has no automated tests. It fits a project without a test framework, or a project of documents.
  - `critical`: only high-impact logic. Logic is high-impact when it can break without a visible sign, when many parts depend on it, or when a bug ruins the whole result.
  - `logic`: every function with a branch, a calculation or a rule. Not plain data, wiring or layout.
  - Example of a rule per area: `logic` for the domain folder, and no tests for the UI layout.
- **Test types:** each type has a name, a one-line meaning and an optional command. The project picks the names. Common types are unit, integration and end-to-end. Keep only the types that the project uses. With the preset `none` and no rules, the types are none.
- **How tests are written:**
  - Location and names: next to the code, or in a test folder, and the name pattern of a test file.
  - Mocks and fixtures: what a test mocks, for example the network or the clock, and the shared fixtures.
  - Test data: inline values, fixture files, or factories.
- **Tested by hand:** what a person checks instead of a test, for example a layout, a text or a device. `/flow:discuss` turns each item into an item of the human checklist.
- **Old code:** a task changes a function that has no test, and the function falls under a rule.
  - Ask the developer: the default. The developer controls the size of each task.
  - Always add a test: an untested project gains tests fast. Tasks grow.
  - Never: tasks stay small. Old code stays untested.
- **Small tests:** keep tests small. Test the rules, not every value.

### Write the plan

1. Show a short summary of the plan. End the message with `👉 Reply "go" to write this plan through a pull request, or name the changes.` Wait for the reply.
2. Run the checks before work:
   - The working tree is clean: `git status --porcelain` prints nothing.
   - The base branch of the config exists on `origin`: `git ls-remote --heads origin <base>` prints a line.
   - The branch guard is on: `git config core.hooksPath` prints the hooks folder of the setup command of the config.
3. Run `git switch <base> && git pull --ff-only origin <base>`. When `feature/test-plan-setup` exists on `origin`, switch to it and pull it. Otherwise, run `git switch -c feature/test-plan-setup <base>`.
4. Write `docs/workflow/TESTING.md` from `${CLAUDE_PLUGIN_ROOT}/templates/TESTING.md`. Write "none" in a section that does not apply. Keep the free text of the developer in each section.
5. In the config, the section "Testing" holds one line: `Test plan: docs/workflow/TESTING.md`. Remove the lines "Rule" and "Types". Keep "Coverage" under "Commands".
6. Run the verify command of the config. Fix the failures in the files of this setup.
7. Commit: `test plan setup: write the test plan`. Push with `git push -u origin feature/test-plan-setup`.
8. Open the pull request into the base branch. When a pull request of `feature/test-plan-setup` is open already, the push updates it. With the host `github` or `azure-devops`, use the command of `${CLAUDE_PLUGIN_ROOT}/reference/hosting/GITHUB.md` or `${CLAUDE_PLUGIN_ROOT}/reference/hosting/AZURE_DEVOPS.md`. With another host, or when the tool fails, give the developer the link from the push output. Use the summary of step 1 as the description.
9. Switch back to the base branch.

Do not write or change a test of the project during the setup.

## Summary

End with a session summary of 8 lines or fewer, with the pull request link. Use only these icons:

| Icon | Meaning |
|------|---------|
| ✅ ❌ | Done, failed. |
| ⚠️ | A risk. |
| 👉 | Waits for a reply. |
| ▶️ | The next command. |
| ❓ 🔍 | Questions, findings. |
| 🤖 📁 | Automated checks, files. |

The last line is `▶️ Next: merge the pull request, then /flow:discuss <topic>`.

Never put the summary, a 👉 line or a ▶️ line inside a code block. The last line of the message must be the 👉 line or the ▶️ line itself.
