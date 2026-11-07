# Step 01: Roadmap in the guides and templates

Date: 2 November 2026

## Goal
The workflow guide and the git guide describe the roadmap, and templates exist for a milestone file and a request summary.

## Context to read
- `docs/tasks/0007-roadmap-skill/README.md`
- `plugins/flow/reference/WORKFLOW.md`
- `plugins/flow/reference/GIT.md`
- `plugins/flow/templates/CONFIG.md`
- `plugins/flow/templates/TASK.md`
- `plugins/flow/reference/WRITING_STYLE.md`

## Files touched
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/reference/GIT.md` (changed)
- `plugins/flow/templates/MILESTONE.md` (new)
- `plugins/flow/templates/REQUEST.md` (new)
- `plugins/flow/templates/CONFIG.md` (changed)
- `plugins/flow/templates/TASK.md` (changed)

## Work
1. In `WORKFLOW.md` section 1: add `/flow:roadmap` to the table of helper skills.
2. In `WORKFLOW.md` section 3: add the terms Roadmap, Milestone, Card, Card name and Request summary, each with the words not to use.
3. In `WORKFLOW.md` section 4: add `docs/roadmap/` to the layout, with the milestone files and `requests/`.
4. In `WORKFLOW.md`: add section 5.9 "The roadmap". It holds decisions 2 to 7 and 11 of the task file: the folder, the milestone, the card and its name, the target date, the derived status with `(part)`, the request summaries and the roadmap branch.
5. In `WORKFLOW.md` section 5.4: add the two new templates. In section 9: add the roadmap branch of `/flow:roadmap`.
6. In `GIT.md`: add the branch `feature/roadmap-<slug>` to the list of branches and to the commands table.
7. Write `templates/MILESTONE.md`: the title with its number, the date, the target date or "none", the goal, "Out of scope", and the cards. Each card has a heading with its title, its slug, one to three sentences on what and why, the source, and "Depends on".
8. Write `templates/REQUEST.md`: the title, the date, the source reference, the summary in the words of the agent, and the cards that came from it. Add a rule line: never paste the raw text.
9. In `templates/CONFIG.md`: change the "Roadmap" line. It names `docs/roadmap/` or none, and `/flow:roadmap` writes it.
10. In `templates/TASK.md`: add the line `Roadmap card: <card name>, <card name> (part), or none` under "Mode".

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The skills. Steps 02 and 03 do this.
- `docs/DESIGN.md` and `CHANGELOG.md`. Step 04 does this.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The request summaries live in `docs/roadmap/requests/<date>-<slug>.md`, so a milestone file and a summary never share a name.
- A card has a "Name" line in the milestone file, so `/flow:discuss` and the task file use the same text.
- The workflow guide says "exports of a tracker" and "a link to the tracker", not "tracker cards". The word "card" has one meaning (writing style rule 6).
- A card is "in progress" when an active task names it. The brief named only "done", and `/flow:whats-next` needs both.
- The request template leaves out names of people, addresses, prices and contract terms, so the rule of decision 7 has examples.

### Deviations
none
