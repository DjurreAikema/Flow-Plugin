# Task 0007: roadmap skill

Date: 2 November 2026
Status: ready for PR
Mode: inline

## Goal
A project keeps its long-term goals in a roadmap of milestones and cards. `/flow:roadmap` writes the roadmap from client requests, and the loop and `/flow:whats-next` use it.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. `/flow:roadmap` is a core skill of the plugin. It replaces decision 17 of the decision log (decision 26), and changes scope section 2 of `docs/DESIGN.md`.
2. The roadmap is the folder `docs/roadmap/`. It holds one file per milestone, for example `01-client-portal.md`, and the summaries of the client requests in `docs/roadmap/requests/`. The config "Roadmap" names this folder.
3. A milestone holds cards. A card has a title, one to three sentences on what and why, the source, and the cards that it depends on.
4. A card has a stable name: `<milestone file name>/<card slug>`, for example `01-client-portal/export-csv`.
5. A milestone has an order and an optional target date. Only the developer sets the date. The agent never estimates a date or an effort.
6. The status of a card is derived. A task names its card in the task file: `Roadmap card: <card name>`. A card is done when an archived task names it without the marker `(part)`. A task that does only part of a card writes `Roadmap card: <card name> (part)`. Nobody edits a status by hand.
7. The repository holds a summary of each client request, in the words of the agent, with a source reference. It never holds the raw mail or card.
8. `/flow:discuss <card title>` reads the card and its source summary, and starts the conversation from them. The brief names the card.
9. `/flow:plan-task` copies the card from the brief into the task file.
10. `/flow:whats-next` shows the progress per milestone. It suggests only cards whose dependencies are done. It warns when a target date is near and cards are open.
11. A roadmap change goes through a pull request from the branch `feature/roadmap-<slug>`, like a backlog brief.
12. `/flow:tutorial` explains `/flow:roadmap` in the workflow track.
13. `/flow:adopt` keeps the roadmap `none` by default, and names `/flow:roadmap` as the way to start one.
14. The mode is `inline`. The rule gives `agents` (4 steps), but the `flow:step-builder` agent cannot load in the cloud session that builds this task.

## Out of scope
- The feature analysis of an existing application. `/flow:roadmap` reads such a report like any other input.
- Connectors for mail, Trello or other trackers.
- Estimates of effort or dates.
- Changes to `/flow:implement-task`, `/flow:checklist` and `/flow:finish-task`.

## Tests
none. The test rule of the config is `none`. The verify script is the check.

## Changelog
### Added
- `/flow:roadmap` turns client requests into a roadmap of milestones in `docs/roadmap/`. Each milestone holds short cards, an order and an optional target date. The repository keeps a summary of each request, never the raw text. `/flow:discuss <card title>` turns a card into a brief, and the task file names its card. `/flow:whats-next` derives the progress per milestone from the archived tasks, and suggests the next card that can start. Task: [0007-roadmap-skill](docs/tasks/_archive/0007-roadmap-skill/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Roadmap in the guides and templates](01_GUIDES_TEMPLATES.md) | verified |
| 02 | [The roadmap skill](02_ROADMAP_SKILL.md) | verified |
| 03 | [Loop and helper skills](03_LOOP_HELPERS.md) | verified |
| 04 | [Repository docs and changelog](04_REPO_DOCS.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0007 roadmap skill

✅ Facts I checked
   1. Verify passes on the branch.                                   sh tools/verify.sh
   2. The branch guard is on in this clone.                          core.hooksPath
   3. Decision 26 replaces decision 17 in the log.                   docs/DESIGN.md section 4
   4. README.md has no list of helper skills, so step 02 adds a short "Long-term planning" section.   README.md
   5. /flow:discuss treats its input as a card when it matches a card title or card name in the roadmap, and as a topic otherwise.   step 03, work item 2

📁 Files I will touch
   18 files in steps 01 to 04, as listed in the step files.

👉 No questions. Reply "go" to start.
```

Answer: "go".
