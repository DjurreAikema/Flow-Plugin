---
name: adopt
description: Set up the flow workflow in a project. Inspect the repository, offer a quick setup with defaults or talk the choices through with the developer, and write the config and the agent rules through a pull request. Use once per project, or to review the setup later.
---

# /flow:adopt

Set up the `flow` workflow in a project. The result is `docs/workflow/CONFIG.md`, `AGENTS.md`, the task folders and the branch guard, in one pull request. The skill never changes the code of the project.

The skill offers two routes. The quick setup shows the found values and the defaults in one block. The full setup talks each choice through with the developer.

## Before you start

1. Read `${CLAUDE_PLUGIN_ROOT}/reference/WORKFLOW.md` and `${CLAUDE_PLUGIN_ROOT}/reference/WRITING_STYLE.md`. Skip a file that this session already holds and did not edit.
2. When `docs/workflow/CONFIG.md` exists, the project uses the workflow already. Show its settings. End the message with `👉 Name the settings to review, or reply "none".` Then work only on the settings that the developer names. A review always uses the full setup.
3. Stop when the working tree has uncommitted changes. Report them.

## Inspect

Read the repository before you ask anything. Ask only what the repository cannot answer.

1. **Host:** the remote URL (`git remote -v`). `github.com` means `github`. `dev.azure.com` or `visualstudio.com` means `azure-devops`. Every other host means `other`. Read the repository from the URL: `<owner>/<repo>` for GitHub, `<organization>/<project>/<repo>` for Azure DevOps, `none` for `other`.
2. **Base branch:** the default branch of `origin` (`git remote show origin`, the line "HEAD branch"). A `develop` branch next to `main` suggests that pull requests merge into `develop`.
3. **Commands:** the build and test commands. Read the files of the stack, such as `package.json`, `*.sln`, `pyproject.toml`, `Makefile` or `go.mod`. Read the CI config, such as `.github/workflows/` or `azure-pipelines.yml`.
4. **Docs:** `README.md`, `docs/`, `CLAUDE.md`, `AGENTS.md`, a changelog, design documents, a roadmap.
5. **Team:** the authors of the recent commits (`git shortlog -sn --since="6 months ago"`). More than one active author suggests a team.
6. **Tools:** whether `gh` and `az` are installed.
7. **Tests:** the test framework, the test folders, the test commands and a coverage tool. Read the files of the stack and the CI config. A coverage tool that reports on a diff, or on the changed lines, gives the coverage command.
8. **Hooks:** `git config core.hooksPath`, and a hook folder or a hook tool of the project, such as `.husky/` or `lefthook.yml`. When `core.hooksPath` is set, the setup cannot install the branch guard without a decision of the developer.

Run the verify command candidate once, when it is safe and fast. Record whether it passes.

## Quick setup

Show one block with every setting of `${CLAUDE_PLUGIN_ROOT}/templates/CONFIG.md`. Use this format:

```
🔍 Quick setup: <project name>

Found in the repository
   Base branch      <value>                    <source>
   Host             <value>                    <source>
   Repository       <value>                    <source>
   Verify           <command>                  <source, and ✅ passed, ❌ failed or not run>
   Design docs      <the design documents that Inspect found, or none>

Testing
   Rule             <critical or none>          <the test framework that Inspect found, or "no test framework">
   Types            <each type with its command, or none>   <source>
   Coverage         <command or none>          <source>

Defaults
   Task ID slug · Changelog none · Writing style none · Release none
   Scope, roadmap, decision log, project rules: none

Branch guard
   Hooks            tools/git-hooks/, PROTECTED=<base branch>
   Setup            git config core.hooksPath tools/git-hooks

📁 Files I will write
   + docs/workflow/CONFIG.md
   <+ or ~> AGENTS.md, CLAUDE.md               (the files of "Write the setup" step 4)
   + docs/tasks/_backlog/README.md
   + docs/tasks/_archive/README.md
   + tools/git-hooks/pre-commit
   + tools/git-hooks/pre-push

👉 Reply "go" to write this setup through a pull request,
   "full" to talk each choice through, or name the settings to change.
```

Rules:

1. Show a value from the repository with its source, for example the file or the command.
2. When Inspect finds no verify command, suggest `git diff --check`. It catches whitespace errors and leftover conflict markers. Ask for a better command.
3. Testing (workflow guide section 7): set "Rule" to `critical` when Inspect finds a test framework, and to `none` when it finds none. Name a type for each kind of test that the project has, with its command. With the rule `none`, "Types" is `none`. Without a coverage tool, "Coverage" is `none`.
4. When `core.hooksPath` is set already, show its value in the block with ⚠️. Add a question about the branch guard in the question form (workflow guide section 11.4), above the 👉 line. Never overwrite the setting without an answer.

   ```
   ❓ Questions
      1. Conflict: `core.hooksPath` is <value> already.
         ● a) Add the two hooks to that folder
         ○ b) Replace the setting with tools/git-hooks
   ```

   The 👉 line then starts with `👉 Reply "go" to write this setup with the ● answer`.
5. Ask no other question. The block ends with one 👉 line (workflow guide section 11.3).
6. "go" accepts the block. Continue with "Write the setup", from step 2. The block is the summary of step 1.
7. "full" continues with "Report" and "The conversation".
8. When the developer names settings to change, change them and show the block again.
9. Tell the developer that a later run of `/flow:adopt` reviews the setup with the full conversation.

## Report

This section and "The conversation" are the full setup.

Report what you found, in short:

1. What exists today: host, base branch, commands, docs, team size.
2. What maps cleanly to the workflow.
3. What needs a decision.
4. What does not fit, and why. Example: a repository without tests or builds has no verify command yet.

## The conversation

The developer leads. You explain, inform and recommend. You do not steer.

1. Ask open questions in prose. Do not use the multiple-choice tool. The developer answers in their own words.
2. Ask every question whose answer changes the setup. Never aim for a number of questions. Ask first the questions whose answers shape other questions. A question that depends on another answer waits for the next round.
3. Use the question format below. Explain every question in simple language.
4. List every direction that is realistic and useful, however many that is. Never add a filler direction. Never drop a real direction.
5. Keep the recommendation separate. Give it after the directions, as one short "My view" line with its reason. Base it on what you found in the repository.
6. Cover what applies, in this order:
   - the base branch
   - the host, only when the remote does not answer it
   - the task ID
   - the changelog
   - the writing style
   - the verify command
   - the docs that the agent must read
   - the test rule, the test types and the coverage command
   - the project rules
   - the branch guard, only when `core.hooksPath` is set already
7. Do not ask about a setting that the repository answers clearly. State the answer as a fact in the report. The developer can correct it.
8. When an answer is vague, ask a follow-up question. Explain what is still unclear.
9. Stop asking when every setting of `${CLAUDE_PLUGIN_ROOT}/templates/CONFIG.md` has a value.
10. End each round of questions with one line: `👉 Reply to the questions in your own words.`

### Question format

```markdown
**<Number>. <The question, in one sentence>**

- **What this is about:** <the subject, in simple words>
- **Why it matters:** <what the answer changes>
- **Directions:**
  - <Direction>: <what it means>. <Its trade-offs.>
  - <Direction>: <what it means>. <Its trade-offs.>
- **What I need from you:** <the kind of answer that helps>

**My view:** <the recommendation, in one or two sentences, with the reason>
```

### Guidance per setting

Use these facts in your directions and your view:

- **Task ID:** `number` is short and ordered, but two developers on separate branches pick the same number. `slug` is safe for a team.
- **Changelog:** `direct` is simple for one developer. With a team, every pull request edits the same lines and conflicts. A team picks `none`, or adds fragments later with a project skill.
- **Host:** `github` and `azure-devops` let the agent open pull requests and read comments. Every other host is `other`: the agent pushes, and the developer opens the pull request by hand.
- **Branch guard:** always on. It is not a choice. Host protection, such as a branch policy, adds a guard on the server.
- **Roadmap:** `none` by default. A project that plans client requests over months runs `/flow:roadmap` after the setup. It writes `docs/roadmap/` and sets this setting. An existing roadmap document of the project stays a design document: name it under "Design".
- **Releases:** the setup does not ask about releases. `/flow:release` sets up the release of the project later, with its own conversation.
- **Project-specific features:** a tracker, patch notes and similar records are not part of the plugin. A project adds them as project rules, or builds a project skill for them with a task.
- **Testing:** `none` writes no automated tests. `critical` tests only high-impact logic, and suits most projects with tests. `logic` tests every function with a branch, a calculation or a rule, at a higher cost per task. The project names its own test types, because they differ per stack. The coverage command reports the changed lines only. It never blocks a task.
- **Writing style:** `ste` makes the workflow documents short and exact. A team that does not want it picks `none`.
- **Existing agent rules:** when `CLAUDE.md` or `AGENTS.md` exists, add the workflow rules to it. Never remove the rules that are there.

## Write the setup

1. Show a short summary of every setting and every file that you will write or change. End the message with `👉 Reply "go" to write this setup through a pull request, or name the changes.` Wait for the reply. After the quick setup, skip this step: its block is the summary.
2. Update the base branch from `origin`. Create the branch `feature/adopt-flow` with the command of `${CLAUDE_PLUGIN_ROOT}/reference/GIT.md`.
3. Write `docs/workflow/CONFIG.md` from `${CLAUDE_PLUGIN_ROOT}/templates/CONFIG.md`. Remove the comments of settings that do not apply. Write `Release: none` under "Records".
4. Write `AGENTS.md` from `${CLAUDE_PLUGIN_ROOT}/templates/AGENTS.md`. When `AGENTS.md` exists, add a "Workflow" section instead. When `CLAUDE.md` exists without `AGENTS.md`, add the section to `CLAUDE.md`. When neither exists, also write `CLAUDE.md` with the one line `@AGENTS.md`.
5. Create `docs/tasks/_backlog/` and `docs/tasks/_archive/`, each with a `README.md` of one or two sentences, so that git keeps the folders.
6. With the changelog `direct`: when no changelog file exists, create it with an empty `Unreleased` section.
7. Install the branch guard by `${CLAUDE_PLUGIN_ROOT}/reference/GIT.md`, "Branch guard". Copy `${CLAUDE_PLUGIN_ROOT}/templates/git-hooks/` to `tools/git-hooks/`, or to the existing hooks folder when the developer chose it. Set `PROTECTED` in both hooks to the base branch. Make both hooks executable. Name the setup command in the config. Then run the setup command in this clone.
8. Commit: `adopt: set up the flow workflow`. Push the branch. Open the pull request into the base branch by `${CLAUDE_PLUGIN_ROOT}/reference/GIT.md`, "Open a pull request". The description holds the summary of step 1.
9. Tell the developer how the team installs the plugin. Add the marketplace and install `flow` at the project scope. The project settings then enable it for everyone. Tell the developer that each clone runs the setup command once.

## Summary

End with a session summary (workflow guide section 11), with the pull request link. The last line is:

`▶️ Next: merge the pull request, then /flow:discuss <topic>, /flow:roadmap for client requests, or /flow:tutorial`
