# Design of the flow plugin

Date: 2 November 2026

This document records why the `flow` plugin is built the way it is. Read it before you change the plugin.

## 1. Origin

The workflow started in an earlier project. There it lived as project skills in `.claude/skills/`, with Git Flow, GitHub and rules of that project. Twelve tasks of that project built it up: briefs, tasks and steps, the Discovery, the backlog, and the agents mode.

A colleague asked whether other projects can use it. Most of the value is generic. The project-specific parts sit at the edges: git, the host, the commands, the documents and some rules. This repository extracts the generic core into a plugin. Each project keeps only a config, its own rules and its tasks.

## 2. Scope

Version 0.x of the plugin does these things:

1. Runs the loop: discuss, then build. Plus the backlog, `whats-next` and `tutorial`.
2. Sets up a project with `/flow:adopt`: it inspects the repository and talks the choices through with the developer.
3. Works in any git project. It needs a base branch, a feature branch per task and a pull request.
4. Guards the base branch with two git hooks, in every project.
5. Gives extra support to two hosts: `github` and `azure-devops`. On every other host, the developer opens the pull request by hand.
6. Works for one developer and for a team.
7. Keeps the long-term goals of a project in a roadmap of milestones and cards, written by `/flow:roadmap` from client requests.

Out of scope for now:

- Extra support for GitLab, Bitbucket and other hosts. They work through the manual pull request. Add a host guide when a real project needs it.
- Releases, version numbers, trackers, changelog fragments, and extra records such as patch notes. They are specific to a project. A project adds them as project rules, or builds a project skill for them with a task.
- Extension points, through which the skills of the plugin call the project skills.
- A migration skill for projects that have the old project-skill version of the workflow.
- An analysis of the features of an existing application. A separate plugin can write such a report, and `/flow:roadmap` reads it like any other input.
- Connectors for mail and trackers, and estimates of effort or dates.

## 3. Design

### 3.1 Core and config

The plugin holds everything that is the same in every project. That is the skills, the workflow guide, the writing style and the templates. It also holds the git guide, the git hooks of the branch guard, and one guide per host.

A project holds `docs/workflow/CONFIG.md` and its copy of the git hooks in `tools/git-hooks/`. The skills read it. Each skill holds its own rules, and reads only the host guides and the templates of the plugin through `${CLAUDE_PLUGIN_ROOT}`. The config is Markdown, because agents read it, not programs.

Updates of the plugin reach every project. A project changes its own behaviour through its config, its project rules and its project skills.

### 3.2 Built for a team

The old workflow assumed one person. These choices make it work for a team:

| Problem | Choice |
|---------|--------|
| Two developers pick the same task number on separate branches. | The task ID is configurable: `number` or `slug`. |
| A shared table of active tasks conflicts in every pull request. | The active tasks are derived from the unmerged feature branches. |
| Every pull request edits the `Unreleased` section of the changelog. | A team picks the changelog style `none`, or adds fragments with a project skill. |
| "The maintainer" makes every decision. | The developer runs the skills. A reviewer reviews the pull request. |

### 3.3 Minimal git

The loop is the valuable part of the workflow. Git is the bare minimum: a base branch, a feature branch per task, a pull request when the task is done, and a branch guard. The agent uses plain `git`, so every git project works.

The host part is small: open a pull request, read its comments, reply. A guide per host does this with the tool of the host. Without a guide or a tool, the agent pushes the branch and the developer opens the pull request by hand.

The branch guard is two git hooks. `pre-commit` refuses a commit on the base branch, and `pre-push` refuses a push to it. The project imposes the guard on itself, so it works on every host and every plan. Host protection, such as a branch policy, adds a guard on the server.

Version 0.1.0 had git models (`trunk`, `git-flow`) and a setting for branch protection. Task 0001 removed them. A git flow project sets its base branch to `develop`. Task 0003 made the git hooks core and removed the releases from the plugin.

### 3.4 The roadmap

Client requests arrive over months, and a task plans only one goal. The roadmap holds the goals between the request and the task: milestones in `docs/roadmap/`, each with short cards.

| Problem | Choice |
|---------|--------|
| A status that people edit goes stale. | The status of a card is derived from the briefs that name it, like the active tasks. |
| One roadmap file conflicts in the pull requests of a team. | One file per milestone. |
| Client mails hold names and private details, and git keeps them for good. | The repository holds a summary of each request in the words of the agent. |
| An agent estimate reads as a promise to a client. | Only the developer sets a target date. The agent never estimates. |

A card is short on purpose: one to three sentences, a source and its dependencies. `/flow:discuss <card title>` adds the detail when the work comes close.

### 3.5 Adopt like discuss

`/flow:adopt` works like `/flow:discuss`. It reads the repository first, reports what it found, and asks open questions with directions and a separate recommendation. A project is often a partial fit. The question is which parts fit, with which settings, not yes or no.

### 3.6 This repository uses its own plugin

The repository is a marketplace with one plugin, and it uses the workflow on itself. A change to the plugin goes through a task like any other work. To work on the repository with the skills of the working tree, start Claude Code with `claude --plugin-dir plugins/flow`.

## 4. Decision log

| # | Date | Decision | Reason |
|---|------|----------|--------|
| 1 | 28 October 2026 | The plugin is named `flow`. Skills run as `/flow:<skill>`. | Short to type. Every plugin skill has the plugin name as a prefix. |
| 2 | 28 October 2026 | The repository is a marketplace and holds the plugin in `plugins/flow/`. | One repository to install from and to work on. |
| 3 | 28 October 2026 | The config is one Markdown file per project: `docs/workflow/CONFIG.md`. | Agents read it. People can read and review it in a pull request. |
| 4 | 28 October 2026 | First git models: `trunk` and `git-flow`. First hosts: `github` and `azure-devops`. Replaced by decisions 8 and 10. | These are the two real projects. More options without a real project add settings that nobody uses. |
| 5 | 28 October 2026 | Azure Boards is optional, through the setting "Tracker". Replaced by decision 16. | The team does not use it yet. The repository stays the source of truth for the content. |
| 6 | 28 October 2026 | `/flow:adopt` asks questions with directions and a recommendation, like `/flow:discuss`. | The developer wants to understand each choice, not accept a list of defaults. |
| 7 | 28 October 2026 | The first commit goes straight to `main`, without a pull request. | The repository was empty, so no branch existed to open a pull request against. Every later change goes through a pull request. |
| 8 | 28 October 2026 | The core needs only a base branch, a feature branch per task and a pull request. It uses plain `git`. | The loop is the valuable part. The workflow must work in any project (task 0001). |
| 9 | 28 October 2026 | The rule "never commit on the base branch" stays in the core. | It needs no tool, and it keeps every task reviewable as one pull request. |
| 10 | 28 October 2026 | The config "Host" is `github`, `azure-devops` or `other`. Without a host tool, the developer opens the pull request by hand. | Every host works, and a host guide is a convenience. |
| 11 | 28 October 2026 | Git hooks and `/flow:release` are optional extras of the config. Replaced by decisions 14 and 15. | Most projects protect branches on the host, and not every project releases versions. |
| 12 | 28 October 2026 | The settings "Model" and "Branch protection" are removed. One guide `reference/GIT.md` replaces `reference/git/`. | A git flow project is a project with the base branch `develop`. |
| 13 | 28 October 2026 | `/flow:adopt` starts with a quick setup: the found values and a default for every other setting, in one block. Without a build or test command, it suggests `git diff --check` as the verify command. The full conversation of decision 6 stays available. | A new project can run its first task after one approval. Every setting can change later (task 0002). |
| 14 | 2 November 2026 | The branch guard is core. `/flow:adopt` always installs the git hooks. `pre-push` refuses every push to the base branch. A project cannot switch the hooks off. | The main goal of the plugin is the loop from discuss to pull request with a guarded base branch. A guard that a project can switch off is an extra (task 0003). |
| 15 | 2 November 2026 | `/flow:release`, the SemVer rules and the changelog style `fragments` are removed. The changelog styles are `direct` and `none`. | How a project releases is specific to the project. Only a release collects fragments (task 0003). |
| 16 | 2 November 2026 | Azure Boards, the "Tracker" section, the task ID `work-item` and `AB#` are removed. | A tracker is specific to a project. A project rule restores the commit link (task 0003). |
| 17 | 2 November 2026 | Extra records and milestones are removed. The roadmap stays as a read-only document of the config. Replaced by decision 26. | Records and milestones are specific to a project. Reading a roadmap is generic (task 0003). |
| 18 | 2 November 2026 | A project adds a removed feature with project rules and project skills. The plugin has no extension points. | The loop can build a project skill. Extension points are a design to maintain without a real need (task 0003). |
| 19 | 2 November 2026 | No file of this repository names the earlier project, the archived tasks included. | The plugin and this repository stand on their own. Nothing was released, so no published record changes (task 0003). |
| 20 | 2 November 2026 | `/flow:checklist` records the review in a page in the browser, through a local Python 3 server. Without the server, the page downloads a result file. Without a browser, the developer replies in prose. A comment on a passed item becomes a `Note:` line. Replaced by decision 37. | A multiple-choice question has no room for feedback. Each fallback keeps the skill usable on every machine (task 0004). |
| 21 | 2 November 2026 | `/flow:discuss` and `/flow:adopt` have no limit on questions per round. They ask the questions with the most impact first. | A fixed number anchors the agent to that number (task 0004). |
| 22 | 2 November 2026 | Each icon of the workflow output has one meaning. 👉 is the last line of a message that waits for a reply. ▶️ is the last line of a session summary. Questions stand in a "❓ Questions" section, with ● on the default. The verify script checks the icon set. | The developer reads the last line and knows what to do. A check stops the set from drifting (task 0005). |
| 23 | 2 November 2026 | The config has a section "Testing". "Rule" is `none`, `critical` or `logic`. "Types" are project-defined, each with a meaning and an optional command. | A named level is easy to review and to raise later. Test types differ too much per stack for one fixed list (task 0006). |
| 24 | 2 November 2026 | An optional "Coverage" command reports the coverage of the changed lines in `/flow:finish-task`. It never blocks a task. | A coverage figure measures what is untested, not quality. A task is one diff, so the changed lines are the fair measure (task 0006). |
| 25 | 2 November 2026 | `/flow:plan-task` asks before it adds a test for an untested function that a task changes. The test covers only that function. Moved to `/flow:discuss` by decision 41. | An untested project gains tests with real work, and the developer controls the size of each task (task 0006). |
| 26 | 2 November 2026 | `/flow:roadmap` is a core skill. It writes the roadmap in `docs/roadmap/`: one file per milestone, with short cards and an optional target date, and a summary of each client request. The status of a card is derived from the archived tasks that name it. | Long-term planning from client requests is generic. A derived status stays true without edits, and works for a team (task 0007). |
| 27 | 2 November 2026 | The mode depends only on the number of steps. A step that changes code no longer makes a task `agents`. Replaced by decision 38. | `agents` mode costs the most tokens, because each step builder starts cold. The step count tracks the size of a task (task 0008). |
| 28 | 2 November 2026 | Each skill reads only the sections of the workflow guide that it cites. `/flow:adopt` and `/flow:tutorial` read the whole guide. The verify script checks that every cited section exists. Replaced by decision 39. | The full guide in every skill run repeats thousands of tokens. Adopt and tutorial explain the whole workflow, and run rarely (task 0008). |
| 29 | 2 November 2026 | `/flow:plan-task` always reads the scope document and the decision log. It reads the other documents of the config only when the task touches them. Moved to `/flow:discuss` by decision 41. | These two documents guard the rules of the project. The other documents matter only when the task touches them (task 0008). |
| 30 | 2 November 2026 | A small fix is done outside the loop, on the branch `fix/<slug>` and through a pull request. The plugin has no fast path. Replaced by decision 35. | A one-line fix does not need a brief, a plan and a Discovery. One loop is easier to maintain than two (task 0008). |
| 31 | 2 November 2026 | Each skill and the step builder skip a file that the session already holds and did not edit. `AGENTS.md` no longer orders a full read of the workflow guide. Replaced by decision 39. | `CLAUDE.md` loads `AGENTS.md` before any skill runs, and skills in one session read the same files. An edit is the main way a held copy goes stale (task 0009). |
| 32 | 2 November 2026 | The pull request holds the deviations, the summary, the coverage, the review items and a link to the task. The task file keeps its copy of the decisions. Replaced by decision 40. | The diff shows the steps and the changelog. The step builder reads only the task file, so its copy earns its place (task 0009). |
| 33 | 2 November 2026 | A script of the plugin checks sentence length and filler words for the style `ste`. `/flow:finish-task` runs it on the changed documents. This repository's verify script runs it on the plugin. | A script costs no tokens to rerun. Hedging and vague words still need a reader (task 0009). |
| 34 | 5 November 2026 | The repository holds a benchmark in `bench/`. It is not part of the plugin, and the verify script does not run it. It compares a lean setup with `flow` in the modes `inline` and `agents`, on cost, quality and workflow. | Nobody measured the token use or the quality of the workflow. A repeatable benchmark measures each later change of the plugin against a lean baseline (task 0010). |
| 35 | 7 November 2026 | The loop has two skills. `/flow:discuss` writes the brief, and `/flow:build` builds it and opens the pull request. `/flow:plan-task`, `/flow:implement-task`, `/flow:checklist` and `/flow:finish-task` are removed. A small fix still goes outside the loop. | In 15 benchmark runs, the loop of five skills cost 3.2x to 4.5x the tokens of a lean setup. The code quality was the same (task 0011). |
| 36 | 7 November 2026 | `/flow:build` runs in a new session, on autopilot. It stops in three cases only. The verify command fails and it cannot fix it. The work needs something out of scope. The work contradicts a decision of the brief. | The discussion settles the work. Each approval is a round trip that reads the whole context again (task 0012). |
| 37 | 7 November 2026 | The brief holds a map, the parts and a human checklist. The build reads only the files of the map, and makes one commit per part. The pull request holds the human checklist as checkboxes. | The discussion explores the code once. The checklist holds checks that are cheap for a human and expensive for an agent. A human looks at the pull request anyway (task 0012). |
| 38 | 7 November 2026 | Agents mode, the step builder and the setting "Mode threshold" are removed. | Agents mode cost the most tokens in the benchmark. It saved tokens only with a new session per skill, and then only 7 percent (task 0011). |
| 39 | 7 November 2026 | Each skill holds the rules that it needs. No skill reads `reference/WORKFLOW.md`, `reference/GIT.md` or `reference/WRITING_STYLE.md` when it runs. `/flow:adopt` and `/flow:tutorial` still read the workflow guide and the git guide. | Every request reads the whole context again, so each read file costs tokens many times. Adopt and tutorial explain the whole workflow, and run rarely (task 0012). |
| 40 | 7 November 2026 | The record of a task is its archived brief. The build adds a section "Outcome" only when the task has deviations. The pull request holds the deviations, a summary, the coverage and the human checklist. | Step files and status edits cost a request each. The diff and the pull request show the rest (task 0012). |
| 41 | 7 November 2026 | `/flow:discuss` reads the scope document and the decision log, and plans the tests by the section "Testing" of the config. It asks before it plans a test for an untested function that the work changes. | `/flow:plan-task` did this before. The brief is now the only plan (task 0012). |

## 5. Open questions

1. Can a cloud session (Claude Code on the web) load the plugin of the repository that it works on? A local session can, with `--plugin-dir`. [Verify]
2. Do the Azure DevOps commands work as the guide says? Every one has the `[Verify]` marker.
