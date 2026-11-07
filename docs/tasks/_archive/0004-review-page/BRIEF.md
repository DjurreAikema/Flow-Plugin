# Brief: a review page for the checklist, and no question limit

Date: 2 November 2026

## Why
The multiple-choice question of `/flow:checklist` is too small, and it has no room for feedback. The developer wants to review each item in a clear page and comment on it. Separately, the limit of 4 questions per round in `/flow:discuss` and `/flow:adopt` anchors the agent. The agent tends to produce 4 questions.

## What
1. `/flow:checklist` opens an HTML page in the browser. The page shows each step and its review items. The developer marks each item as passed or failed, and can add a comment to each item. The button "Finish" sends the results back. The skill then continues without a message from the developer.
2. `/flow:discuss` and `/flow:adopt` ask every question that changes the result. They ask first the questions whose answers shape other questions.

## Decisions

1. A local server serves the page and receives the results. It uses Python 3 with the standard library only. It listens on `127.0.0.1` only.
2. When the server cannot start, the button "Finish" downloads the file `checklist-results.json`. The developer then tells the agent "done", and the agent reads the file.
3. When no browser can open, for example in a cloud session or an SSH session, the agent lists the items. The developer replies in prose, for example "1 pass, 2 fail: the layout breaks". The multiple-choice question is removed.
4. A passed item with a comment gets a line `Note: <comment>`. A failed item gets a line `Open: <reason>`, as before. "Note" becomes a term in the workflow guide.
5. The page and the server are in the plugin, and they stay generic (project rule 1). The skill reads them through `${CLAUDE_PLUGIN_ROOT}`, so the verify script checks their paths.
6. `/flow:discuss` and `/flow:adopt` have no limit on the number of questions per round. They order the questions by impact. A question that depends on another answer waits for the next round. Decision 6 of the design log still applies.
7. Both changes are in one task, with one pull request. The developer chose this.

## Out of scope
- The Discovery of `/flow:implement-task`, and other question flows.
- A page for the review of a pull request.

## How to check the result
1. Run `/flow:checklist` on a test project 3 times: with Python 3, without Python 3, and in a session without a browser. Each run records the same results in the step files.
2. Run `/flow:discuss` on a topic with few unknowns. The round has fewer than 4 questions.

## Open questions
1. Can the skill run the server in the background and wait for the result file, within the time limit of the Bash tool? [Verify]
2. Does this change how a project is set up? When it does, project rule 6 needs an entry under "Changed".
