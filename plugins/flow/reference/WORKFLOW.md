# The flow workflow

Date: 7 November 2026

This guide describes how work happens in a project that uses the `flow` plugin. The work can be code or documents. Each project sets its own choices in one file: `docs/workflow/CONFIG.md`.

The guide is for a person. The skills hold the rules that they need, so an agent does not read this guide to do a task. `/flow:adopt` and `/flow:tutorial` read it, because they explain the whole workflow.

When this guide says "the config", it means `docs/workflow/CONFIG.md`. When a rule depends on the config, this guide names the setting.

## 1. Summary

The workflow has one loop of two skills:

| # | Phase | Skill | Result |
|---|-------|-------|--------|
| 1 | Discuss | `/flow:discuss` | `BRIEF.md`: the decisions, the map, the parts, the tests and the human checklist. |
| 2 | Build | `/flow:build` | The parts built and committed, the brief archived, and a pull request open. |

A reviewer reviews and merges the pull request on the host, and ticks the human checklist in it.

The discussion settles the work. After the brief, the build runs on autopilot, in a new session. It stops only for a problem that the brief cannot answer (section 6.2).

At the end of `/flow:discuss`, the developer picks one option:

| Option | What the agent does |
|--------|---------------------|
| Build now | Writes the brief to `docs/tasks/_new/BRIEF.md`. The developer then runs `/flow:build docs/tasks/_new` in a new session. |
| Backlog | Puts the brief in the backlog, through a pull request (section 5.7). |
| Keep discussing | Continues the discussion. |
| Drop | Writes nothing. |

These skills help outside the loop:

| Skill | Use |
|-------|-----|
| `/flow:adopt` | Sets up the workflow in a project. It inspects the project and offers a quick setup: the found values and defaults in one block. The full setup asks the developer questions. |
| `/flow:whats-next` | Shows where the project stands, and recommends a next step. Read-only. |
| `/flow:tutorial` | Explains the project, the workflow, or both. |
| `/flow:roadmap` | Turns client requests into a roadmap of milestones and cards (section 5.9). |
| `/flow:release` | Makes a release by the recipe of the project. The first run writes the recipe (section 13). |

A small fix does not need the loop. An example is a one-line change. The developer makes it by hand, on the branch `fix/<slug>`, and opens a pull request into the base branch. The branch guard still applies (section 9).

## 2. Principles

1. **Fence the scope.** Every brief has an "Out of scope" section. Build only what the brief names.
2. **Respect the project scope.** When the config names a scope document, build only what it allows. Put other ideas in the backlog or under "Later" in that document.
3. **Explore once.** `/flow:discuss` reads the code and writes the map. The build reads the map, not the whole project.
4. **Agree first, then build.** The brief is the agreement. The build asks no approval.
5. **Test only what matters.** Follow the section "Testing" of the config (section 7).
6. **Record only what the diff cannot show.** The brief records the decisions. The build records only the deviations.
7. **Put bad news first.** A failed check or a deviation is the first item in every summary.
8. **The repository is the only source of truth.** A fresh session knows only what the repository tells it.
9. **Write in the project style.** Follow the writing style of the config.
10. **Ask only what matters.** Ask a question only when the answer changes the work. Never aim for a fixed number. Zero questions is a valid result.
11. **Read once.** Every request of a session reads the whole context again. Read a file once, and only the part that you need.

## 3. Terms

| Term | Meaning | Do not use |
|------|---------|------------|
| Developer | The human who runs a skill. Makes every important decision about the work. | user, owner |
| Reviewer | The human who reviews and merges a pull request. Can be the developer in a solo project. | approver |
| Agent | Claude, when it runs a skill. | AI, bot |
| Config | The file `docs/workflow/CONFIG.md`. It holds the choices of the project. | settings |
| Brief | The file `BRIEF.md`. The only plan of a task (section 5.8). | spec, story |
| Map | The section of the brief that names the files to read and change. | file list |
| Part | One part of the work in the brief. One commit. | step, phase |
| Human checklist | The checks of the brief that are cheap for a human and expensive for an agent. | manual tests, todo |
| Backlog | The folder `docs/tasks/_backlog/`. It holds briefs for later, without a task ID. | icebox, todo list |
| Task | One goal. One brief, one branch, one pull request. | ticket, feature |
| Task ID | The unique name of a task. The config sets its form (section 5.1). | ticket number |
| Deviation | A difference between the brief and the work. | drift |
| Outcome | The section that the build adds to the brief when the task has deviations. | result, log |
| Verify command | The command of the config that answers: does the project build and do the tests pass? | build script |
| Test rule | The setting "Rule" of the config. It sets which code gets automated tests (section 7.1). | testing policy |
| Test type | A kind of automated test that the config names, for example unit (section 7.2). | test level |
| Coverage command | The command of the config that prints the coverage of the changed lines (section 7.4). | coverage gate |
| Base branch | The branch that pull requests merge into. The config sets it. | trunk (alone) |
| Feature branch | The branch of one task: `feature/<task ID>`. | task branch |
| Roadmap | The folder `docs/roadmap/`. It holds the milestones and the request summaries (section 5.9). | plan, backlog |
| Milestone | One file of the roadmap. A group of cards with an order and an optional target date. | phase, epic, sprint |
| Card | One goal in a milestone. A task or more builds it. | item, story, ticket |
| Card name | The stable name of a card: `<milestone file name>/<card slug>`. | card ID |
| Request summary | A file in `docs/roadmap/requests/`. It records one client request in the words of the agent. | request, mail |

## 4. Repository layout

The plugin holds the skills, this guide and the templates. A project holds only these files:

```
AGENTS.md                      The agent rules of the project. Short and binding.
docs/workflow/CONFIG.md        The choices of the project.
docs/tasks/
  _new/BRIEF.md                A brief between /flow:discuss and /flow:build. Never committed.
  <task ID>/BRIEF.md           The brief of the active task. It exists only on its feature branch.
  _backlog/<slug>/BRIEF.md     One backlog brief.
  _archive/<task ID>/BRIEF.md  One finished task.
docs/roadmap/                  Optional. Written by /flow:roadmap (section 5.9).
  NN-<slug>.md                 One milestone with its cards.
  requests/<date>-<slug>.md    One request summary.
tools/git-hooks/               The branch guard (section 9).
```

The config can name more files: a scope document, design documents, a roadmap, a decision log.

## 5. Tasks and briefs

### 5.1 Task IDs and names

The config sets the form of the task ID:

| Task ID | Form | Example | Use it when |
|---------|------|---------|-------------|
| `number` | Four digits and a slug | `0003-password-reset` | One developer works on the project. |
| `slug` | A slug only | `password-reset` | A team works on the project. Two developers never pick the same number. |

Rules:

1. A `number` is the next free number in `docs/tasks/` and `docs/tasks/_archive/`.
2. A `slug` must not exist as a task folder, a backlog folder or a branch, local or remote.
3. Feature branch: `feature/<task ID>`.
4. Never renumber. Use the next free number.
5. Markdown file of the workflow: an UPPERCASE name with `_` between words. Folder and branch: lowercase with `-` between words.
6. Commit subject: `<task ID> part <N>: <change>`, or `<task ID> archive`. With the `number` form, the task ID in the subject is the number only. Example: `0003 part 2: add the reset email`.

### 5.2 Part size

A part is the right size when all of these are true:

1. It changes one system, or one part of one system.
2. It ends in a state where the verify command passes.

Use as few parts as possible. A small task has one part.

### 5.3 Document tasks

A task can produce documents instead of code. The same loop applies. The parts change documents, and the human checklist holds the checks of a reader.

### 5.4 Templates

The templates are in the plugin, in `templates/`:

| Template | Written by |
|----------|------------|
| `BRIEF.md` | `/flow:discuss` |
| `CONFIG.md`, `AGENTS.md` | `/flow:adopt` |
| `MILESTONE.md`, `REQUEST.md` | `/flow:roadmap` |

### 5.5 The record

The record of a finished task is `docs/tasks/_archive/<task ID>/BRIEF.md`. When the task has deviations, the build adds a section "Outcome" to the brief: what changed, why, and what it affects. The diff and the pull request show the rest.

### 5.6 Active tasks

The project keeps no table of active tasks. A shared table conflicts in every pull request of a team.

An active task is a feature branch that is not merged into the base branch. Its brief is on that branch. `/flow:whats-next` reads the branches and the open pull requests.

### 5.7 The backlog

The backlog holds briefs for later. The developer puts a brief there at the end of `/flow:discuss`.

1. A backlog folder has a slug and no task ID. Example: `docs/tasks/_backlog/reset-email/BRIEF.md`.
2. `/flow:discuss` commits the brief on the branch `feature/backlog-<slug>` and opens a pull request into the base branch. The pull request holds only the brief.
3. `/flow:build` accepts a backlog folder as input. It gives the task its ID and moves the brief into the new task folder.
4. The backlog has no order and no priority. `/flow:whats-next` lists the backlog briefs under "details".

### 5.8 The brief

The brief is the only plan of a task. `/flow:discuss` writes it from `templates/BRIEF.md`:

| Section | Holds |
|---------|-------|
| Why, What | What the developer wants and why. |
| Decisions | The confirmed decisions. The build does not change them. |
| Out of scope | What the task must not do. |
| Map | The files to read and change, with the functions and the patterns to follow. |
| Parts | The parts of the work, in order. One commit each. |
| Tests | The automated tests, by the section "Testing" of the config. |
| Human checklist | The checks that are cheap for a human and expensive for an agent (section 8). |
| Changelog | The entry of the task (section 12). |
| Open questions | Questions that the discussion did not settle. The build does not start while one is open. |

The map is the most important section for the cost of a task. The build reads only its files. To find anything else, the build searches first.

### 5.9 The roadmap

The roadmap holds the long-term goals of a project. `/flow:roadmap` writes it from client requests: mails, exports of a tracker or reports that the developer pastes or names. The config "Roadmap" names the folder `docs/roadmap/`, or `none`.

1. A milestone is one file: `docs/roadmap/NN-<slug>.md`, for example `01-client-portal.md`. The number sets the order. Never renumber a milestone.
2. A milestone has a goal, an "Out of scope" section, an optional target date and its cards. Only the developer sets the date. The agent never estimates a date or an effort.
3. A card has a title, one to three sentences on what and why, its source, and the cards that it depends on. Its card name is `<milestone file name>/<card slug>`, for example `01-client-portal/export-csv`.
4. A request summary records one client request in the words of the agent. It names its source: a date and the role of the sender, or a link to the tracker. It never holds the raw text, the names of people or private details.
5. The status of a card is derived, never written. A brief names its card on the line `Roadmap card`. A card is done when an archived brief names it without the marker `(part)`. A task that builds only part of a card writes `Roadmap card: <card name> (part)`. A card is in progress when the brief of an active task names it.
6. Never change the text of a card that a brief names. Add a new card instead.
7. `/flow:roadmap` commits a roadmap change on the branch `feature/roadmap-<slug>` and opens a pull request into the base branch.
8. `/flow:discuss <card title>` turns a card into a brief. `/flow:whats-next` shows the progress per milestone and suggests a card whose dependencies are done.

## 6. The build

### 6.1 Order

`/flow:build` runs in a new session, so that its context holds only the brief and the files of the map.

1. It checks the working tree, the base branch and the branch guard.
2. It gives the task its ID, starts the feature branch and moves the brief.
3. It builds the parts in order. After each part, it runs the verify command and commits.
4. It copies the changelog entry in the last part.
5. It runs the style check on the changed documents, and the coverage command when the config has one.
6. It adds "Outcome" to the brief for deviations, archives the task folder and commits.
7. It pushes the branch and opens the pull request (section 10).

### 6.2 Stops

The build stops and asks the developer only in these cases:

1. The verify command fails, and the agent cannot fix it.
2. The work needs something out of scope.
3. The work contradicts a decision of the brief.

The build does not commit the part that caused the stop.

### 6.3 Deviations

Every other difference between the brief and the work is a deviation. The build records it and continues. The pull request lists each deviation first, and the archived brief holds it under "Outcome".

## 7. Testing

The section "Testing" of the config sets which code gets automated tests, and of which type. The command "Coverage" of the config reports how much of the changed code the tests run.

### 7.1 The test rule

"Rule" sets which code gets a test:

| Rule | Which code gets a test |
|------|------------------------|
| `none` | No code. The project has no automated tests. |
| `critical` | Only high-impact logic. Logic is high-impact when it can break without a visible sign, when many parts depend on it, or when a bug ruins the whole result. |
| `logic` | Every function with a branch, a calculation or a rule. Not plain data, wiring or layout. |

Keep tests small. Test the rules, not every value.

### 7.2 Test types

"Types" lists the test types of the project. Each type has a name, a one-line meaning and an optional command. The project picks the names. Example:

```markdown
## Testing
- Rule: critical
- Types:
  - unit: one function or class, without files, network or a database. `npm test -- unit`
  - integration: code that talks to the database or an external service. `npm test -- integration`
```

With the rule `none`, "Types" is `none`.

### 7.3 Planning tests

1. `/flow:discuss` plans a test only for code that falls under the rule.
2. Each test in the brief names the code it covers, its type from the config, and a reason that names the rule.
3. Old code: the work changes a function that has no test, and the function falls under the rule. `/flow:discuss` asks the developer whether to add a test for that function. The test covers only the changed function.
4. `/flow:build` writes only the tests of the brief.

### 7.4 Coverage

The command "Coverage" is optional. It prints the share of the changed lines, against the base branch, that the tests run.

1. `/flow:build` runs it after the verify command, and shows the figure in the session summary and in the pull request description.
2. The figure is a report. It never blocks a task. A failure of the command is a ⚠️ line, not a stop.
3. Without the command, the build skips the figure.

## 8. The human checklist

A check goes on the human checklist only when it is cheap for a human and expensive for an agent:

1. It needs a sense or taste: look at a screen, judge a feel, judge a text.
2. It needs something that the agent cannot reach: an editor, a device, an external service, other people.
3. It needs a decision of the developer.

The agent does every other check itself. Keep the checklist short. A long checklist trains people to tick without looking.

Format in the brief:

```markdown
- [ ] Open the settings page on a phone. The layout has no horizontal scroll.
  Why: The page is new, and the agent cannot test on a phone.
```

The pull request description shows the items as checkboxes. The reviewer ticks them during the review.

## 9. Git

The workflow needs four things from git. These are a base branch, a feature branch per task, a pull request when the task is done, and a branch guard. The agent uses plain `git` commands, so every git project works. `reference/GIT.md` holds the commands and the checks.

1. Never commit on the base branch. Every task runs on its feature branch.
2. `/flow:build` creates the feature branch from an up-to-date base branch, and commits once per part. It archives the task, pushes the branch and opens a pull request.
3. `/flow:discuss` commits a backlog brief on `feature/backlog-<slug>`, pushes it and opens a pull request.
4. `/flow:roadmap` commits a roadmap change on `feature/roadmap-<slug>`, pushes it and opens a pull request.
5. A reviewer reviews and merges the pull request on the host.

The branch guard is core. Two git hooks in `tools/git-hooks/` refuse a commit on the base branch and a push to it. Each clone runs the setup command of the config once (`reference/GIT.md`, "Branch guard").

## 10. Hosting

The config sets the host. For a host with a guide, the skills open pull requests and read comments with the tool of the host:

| Host | Guide |
|------|-------|
| `github` | `reference/hosting/GITHUB.md` |
| `azure-devops` | `reference/hosting/AZURE_DEVOPS.md` |
| `other` | none |

For `other`, or when the tool of the host is missing, the agent pushes the branch. The developer then opens the pull request by hand. The loop works the same way.

## 11. Summaries and icons

### 11.1 Summaries

Every skill ends with a session summary of 8 lines or fewer. The last line is the ▶️ line with the next command.

```
✅ Task 0003 built: password reset

⚠️ Deviations        1: the reset email uses the existing mail template
🤖 Verify            ✅ build   ✅ tests
👀 Human checklist   2 items in the pull request

▶️ Next: review and merge the pull request
```

### 11.2 Icons

Each icon has one meaning. Do not use other icons in workflow output.

| Icon | Meaning |
|------|---------|
| ✅ | Done or passed. |
| ❌ | Failed. |
| ⚠️ | Read this: a heads up or a risk. Never a question. |
| 👉 | The skill waits for your reply in this chat. |
| ▶️ | The skill is done. Run this command next. |
| 👀 | A check that a human does outside the chat. |
| ❓ | Questions that need your answer. |
| 🔍 | What the agent found: a setup block or a set of findings. |
| 🤖 | Automated checks. |
| 📁 | The files that the agent will write or change. |

Two markers show the answers of a question: ● marks the default answer, and ○ marks every other answer.

### 11.3 The last line

The developer reads the last line of a message and knows what to do.

1. A message that waits for the developer ends with one 👉 line. The line says what to reply. 👉 appears nowhere else in the message.
2. An approval ends with `👉 Reply "go" to <what "go" does>, or name the changes.`
3. A session summary ends with one ▶️ line. The line names the next command.
4. A message has only one of these last lines: 👉, 👀 or ▶️.
5. Never put the last line inside a code block. The examples in this guide stand in code blocks only to show their form.

### 11.4 Questions

Every question with answers to pick uses this form:

```
❓ Questions
   1. <Kind>: <the question>
      ● a) <the default answer>
      ○ b) <another answer>

👉 Reply "go" for the ● answers, or the number and your answer, e.g. "1b".
```

1. The kind word is one of these:
   - Conflict: a document or the brief disagrees with what the agent found.
   - Assumption: the agent fills a gap.
   - Blocker: the work must not start as it is.
2. Every question has exactly one ● answer. Put it first.
3. Number the questions from 1 in each message.

## 12. Changelog

### 12.1 The changelog

The config "Changelog" sets the style:

| Style | How it works | Use it when |
|-------|--------------|-------------|
| `direct` | Each task adds its entry to the `Unreleased` section of the changelog file. | One developer works on the project. |
| `none` | The project keeps no changelog. | A team works on the project, or the project has no changelog. |

With `direct`, the pull requests of a team edit the same lines of the changelog, so they conflict. A team picks `none`, or adds changelog fragments with a project skill.

Rules:

1. The changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Categories: Added, Changed, Removed and Fixed.
2. Write one entry per task, not per part. Name the change, not the work.
3. End the entry with a link to the archived brief: `Task: [<task ID>](docs/tasks/_archive/<task ID>/BRIEF.md).`

### 12.2 Who writes the entries

| Skill | What it does |
|-------|--------------|
| `/flow:discuss` | Writes the entry in the brief, under "Changelog". The developer approves it with the brief. |
| `/flow:build` | Copies the entry to the changelog in the last part, and fills in the task ID. |

The agent never invents an entry. When the work changes what the entry says, the build records a deviation and updates the entry in the brief first.

## 13. Releases

How a project releases is specific to the project. So the project writes its own recipe, and `/flow:release` follows it.

### 13.1 The setup

1. The first run of `/flow:release` finds no recipe. The recipe is missing when the config line `Release` under "Records" is `none`, absent, or names a file that does not exist.
2. The skill then talks the release through with the developer, like `/flow:discuss`. It gives guidance per topic. The developer decides every choice.
3. The skill writes the recipe to `docs/workflow/RELEASE.md`, from the template `templates/RELEASE.md`. It sets the config line `Release: docs/workflow/RELEASE.md`.
4. The skill commits on the branch `feature/release-setup`, and opens a pull request into the base branch. The first release runs after the merge.
5. `/flow:release setup` starts the conversation again from the current recipe. It uses the same branch and pull request.

`/flow:adopt` does not ask about releases. It writes `Release: none` in the config.

### 13.2 The recipe

The recipe has these sections. Each section can say "none", and each can hold free text of the developer.

| Section | Holds |
|---------|-------|
| Version scheme | SemVer, CalVer, none, or a rule in free text. |
| Version files | The files that hold the version number. |
| Changelog | Whether the release dates the `Unreleased` section. |
| Branch and pull request | A release branch, a tag on the base branch, or a pull request into a release target branch. |
| Tag | The tag format, and whether the tag is annotated. |
| Extra steps | The steps after the tag, such as a host release or a publish command. |
| Stops | The steps where a run waits for approval. |

### 13.3 The run

1. A run checks first: a clean working tree, the base branch equal to `origin`, the branch guard on, and the checks of the recipe. It stops when a check fails.
2. The run follows the steps of the recipe, in order.
3. When a step fails, the run stops and reports. It never runs a failed publish step again on its own.
4. The summary names the version number, the pull request link and the tag.

### 13.4 Stops

The recipe decides where a run waits for approval. The setup always asks about the stops. It recommends a stop before each step that cannot be undone, such as a tag push or a publish command.

### 13.5 The branch guard

The branch guard stays in every recipe (section 9). A run never commits on a protected branch, and never pushes to one. A release reaches a protected branch only through a pull request. A recipe can release into a branch that is not protected, for example `main` next to the base branch `develop`. The setup then adds that branch to `PROTECTED` in both hooks.
