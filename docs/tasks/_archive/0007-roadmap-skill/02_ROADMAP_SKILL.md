# Step 02: The roadmap skill

Date: 2 November 2026

## Goal
`/flow:roadmap` exists. It turns client input into request summaries and milestone cards, and opens a pull request with them.

## Context to read
- `docs/tasks/0007-roadmap-skill/README.md`
- `plugins/flow/reference/WORKFLOW.md` sections 5.7, 5.9 and 11, as step 01 left them
- `plugins/flow/reference/GIT.md`, as step 01 left it
- `plugins/flow/templates/MILESTONE.md` and `plugins/flow/templates/REQUEST.md`
- `plugins/flow/skills/discuss/SKILL.md`, for the conversation and the question format
- `plugins/flow/.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `README.md`

## Files touched
- `plugins/flow/skills/roadmap/SKILL.md` (new)
- `plugins/flow/.claude-plugin/plugin.json` (changed)
- `.claude-plugin/marketplace.json` (changed)
- `README.md` (changed)

## Work
1. Write `skills/roadmap/SKILL.md`. Input: pasted text, a file, or none. Sections:
   - Before you start: read the config, the guide and the writing style. Stop without a config. Read the existing roadmap and the request summaries.
   - Read the input: write a request summary per request. Keep names of people and private details out.
   - The conversation: like `/flow:discuss`, with the same question format. Ask how the requests split into milestones and cards, the order, the dependencies and the target dates. Never estimate a date or an effort.
   - Write the roadmap: show the summaries, the new and changed milestones and the cards. Wait for approval. Write them on `feature/roadmap-<slug>`, commit, push and open the pull request by `reference/GIT.md`. Set the config "Roadmap" to `docs/roadmap/` when it is `none`, in the same pull request.
   - A new request on an existing roadmap: add cards and milestones. Never change a card that a task names already. Never renumber a milestone.
   - Summary: the session summary, with `▶️ Next: review and merge the pull request, then /flow:discuss <card title>`.
2. In `plugin.json` and `marketplace.json`: name the roadmap in the descriptions.
3. In `README.md`: add `/flow:roadmap` to the skills, with one sentence on its use.

## Review checklist
- [x] Run `/flow:roadmap` on a test project with two sample requests. The roadmap has milestones with cards and two request summaries. No summary holds the raw text or a personal name.
  Why: Project rule 4. The agent cannot judge a skill by reading it.
  Checked: 2 November 2026

## Docs to update
`README.md`.

## Out of scope
- Changes to the other skills. Step 03 does this.
- An analysis of an existing application, and connectors for mail or trackers.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `/flow:roadmap` points to the conversation rules of `/flow:discuss` instead of a copy, so the two skills keep the same rules.
- The skill derives the status of the existing cards before the conversation, so it never proposes work that a task did already.
- A new card that extends a card that a task names says so in its "what and why". This keeps rule 6 of section 5.9 without losing the link.
- The commit subject is `roadmap <slug>: <change>`, like `backlog <slug>: add brief`.
- `README.md` got a section "Long-term planning" after the loop table, as the Discovery named.

### Deviations
none
