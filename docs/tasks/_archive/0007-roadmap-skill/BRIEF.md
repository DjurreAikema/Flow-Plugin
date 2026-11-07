# Brief: roadmap skill

Date: 2 November 2026

## Why
Client requests arrive by mail or in a tracker, and the team must plan them over months. The workflow plans one task at a time, so the long-term goals of a project have no place in the repository. The developer wants a skill that turns client input into a roadmap of milestones, so that a project keeps track of its goals without planning each task right away.

## What
`/flow:roadmap` takes client input that the developer pastes or names, for example a mail, an exported card or a report. It talks the input through with the developer, like `/flow:discuss`, and writes a roadmap: milestones with short cards. A new request later adds cards to the same roadmap. `/flow:discuss <card title>` turns one card into a brief. `/flow:whats-next` shows the progress per milestone and suggests the next card that can start.

## Decisions

1. `/flow:roadmap` is a core skill of the plugin. It replaces decision 17 of the decision log, and changes scope section 2 of `docs/DESIGN.md`.
2. The roadmap is the folder `docs/roadmap/`. It holds one file per milestone, for example `01-client-portal.md`, and the summaries of the client requests. The config "Roadmap" names this folder.
3. A milestone holds cards. A card has a title, one to three sentences on what and why, the source, and the cards that it depends on.
4. A milestone has an order and an optional target date. Only the developer sets the date. The agent never estimates a date or an effort.
5. The status of a card is derived. A task names its card in the task file. A card is done when that task is in `docs/tasks/_archive/`. Nobody edits a status by hand.
6. The repository holds a summary of each client request, in the words of the agent, with a source reference: for example a date and a sender role, or a card link. It never holds the raw mail or card.
7. `/flow:discuss <card title>` reads the card and its source summary, and starts the conversation from them. The brief names the card.
8. `/flow:plan-task` copies the card from the brief into the task file.
9. `/flow:whats-next` shows the progress per milestone. It suggests only cards whose dependencies are done. It warns when a target date is near and cards are open.
10. A roadmap change goes through a pull request from the branch `feature/roadmap-<slug>`, like a backlog brief.
11. `/flow:tutorial` explains `/flow:roadmap` in the workflow track.
12. `/flow:adopt` keeps the roadmap `none` by default, and names `/flow:roadmap` as the way to start one.

## Out of scope
- The feature analysis of an existing application. A separate plugin can do it later. `/flow:roadmap` reads its report like any other input.
- Connectors for mail, Trello or other trackers. The developer pastes the input.
- Estimates of effort or dates.

## How to check the result
1. Run `/flow:roadmap` on a test project with two sample requests. The roadmap has milestones with cards and two request summaries, and no raw text.
2. Run `/flow:discuss <card title>` on one card. The brief names the card.
3. Run `/flow:whats-next`. It shows the progress per milestone and suggests a card that can start.

## Open questions
1. A card can need more than one task. How does the derived status know when such a card is done?
