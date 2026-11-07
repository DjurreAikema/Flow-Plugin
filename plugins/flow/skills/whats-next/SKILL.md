---
name: whats-next
description: Show where a flow project stands and recommend a good next step. Read-only. Use when the developer returns after a break, or asks what is going on or what to do next.
---

# /flow:whats-next

Show where the project stands, and recommend one next step.

## Rules

1. Never change a file. Never commit, push, create a branch or merge. Only read.
2. Base every claim on a file, a commit or a result of the host. Never report from memory.
3. Report every inconsistency that you find.
4. Keep the short status short. The details come only on request.
5. Use only these icons: ⚠️ a risk or an inconsistency, ▶️ the next command.

## Gather

1. `docs/workflow/CONFIG.md`. Stop when it does not exist, and recommend `/flow:adopt`.
2. The roadmap of the config, when it names one. Read every milestone. Derive the status of each card from the `Roadmap card` line of the briefs:
   - Done: an archived brief in `docs/tasks/_archive/` names the card without `(part)`.
   - In progress: the brief of an active task names the card.
   - Open: every other card.
   The current milestone is the first one with a card that is not done.
3. Git: the current branch, uncommitted changes, and whether the branch guard is on (`git config core.hooksPath`). The active tasks are the feature branches that are not merged into the base branch: `git branch -a --no-merged origin/<base> --list '*feature/*'`. For each `feature/<task ID>` branch, read its brief: `git show <branch>:docs/tasks/<task ID>/BRIEF.md`.
4. A brief in `docs/tasks/_new/`: it waits for `/flow:build`.
5. The host: open pull requests. With the host `github`, use `${CLAUDE_PLUGIN_ROOT}/reference/hosting/GITHUB.md`. With the host `azure-devops`, use `${CLAUDE_PLUGIN_ROOT}/reference/hosting/AZURE_DEVOPS.md`. With the host `other`, or when the tool is not installed or not logged in, skip this source and say so in one line.

Read these sources only for "details":

6. The changelog: the newest entries.
7. The backlog: every `docs/tasks/_backlog/<slug>/BRIEF.md`, and open pull requests from `feature/backlog-*` branches.
8. Loose ends: the "Outcome" sections of the archived briefs that name an open point, and `[Verify]` markers in the documents of the config.

## Inconsistencies

Look for these, and report each one that you find:

1. A `feature/<task ID>` branch has no `docs/tasks/<task ID>/BRIEF.md` and no archived brief. A `feature/backlog-*` or `feature/roadmap-*` branch is not a task. Leave it out of this check.
2. A pull request is open for a branch that no longer exists.
3. A task folder exists on the base branch outside `_backlog/` and `_archive/`. Tasks reach the base branch only archived.
4. A brief names a card that the roadmap does not hold.
5. The branch guard is off: `git config core.hooksPath` does not print the hooks folder of the setup command of the config. Recommend the setup command.

## Recommend

Pick one next step. Use this order:

1. Finish open work first: an open pull request to review, or a brief in `docs/tasks/_new/` to build with `/flow:build docs/tasks/_new`.
2. Fix an inconsistency that blocks the next step.
3. Otherwise, start the next card of the current milestone: the first open card whose dependencies are done. Recommend `/flow:discuss <card title>`. Without a roadmap, or when no card can start, recommend `/flow:discuss`, or `/flow:roadmap` when the developer has new client requests.

Give the command to run, and the reason in one sentence.

## Short status (default)

Use this format. Leave out a line when it has nothing to report.

```
Where things stand: <project name>, <date>

Roadmap          <the current milestone: done cards / all cards, and its target date>
Active tasks     <task ID and branch>, or "none"
Open work        <open pull requests, a brief to build>, or "none"
⚠️ Heads up      <each inconsistency, one line each, and a target date within 14 days with open cards>

Say "details" for the roadmap, recent changes, the backlog, loose ends and other options.

Why: <the reason for the next step, in one sentence>
▶️ Next: <the command>
```

Never put the status inside a code block in your reply. The ▶️ line is the last line of the message.

## Details (on request)

When the developer says "details", add:

1. **Roadmap:** each milestone with its done cards out of all cards and its target date. The open cards of the current milestone, each with its dependencies. Open pull requests from `feature/roadmap-*` branches.
2. **Recent changes:** the newest changelog entries, one line each.
3. **Backlog:** each backlog brief, with its title and `/flow:build docs/tasks/_backlog/<slug>`. Each open backlog pull request, with its link. Write "none" when the backlog is empty.
4. **Loose ends:** the open points and the `[Verify]` markers, each with its file.
5. **Other options:** other realistic next steps, each with its reason and command. Never add a filler option.
