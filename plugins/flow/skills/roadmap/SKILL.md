---
name: roadmap
description: Turn client requests into a roadmap of milestones and cards, or add new requests to an existing roadmap. Use for long-term planning, before any card becomes a task.
---

# /flow:roadmap

Turn client requests into a roadmap. The result is request summaries and milestone files in `docs/roadmap/`, through a pull request.

Input: the text of one or more requests that the developer pastes, a file with requests or a report, or none. Without input, ask the developer for it.

## Before you start

1. Read `docs/workflow/CONFIG.md`. `AGENTS.md` is in the session already. Read a file only once per session, unless you edited it.
2. Stop when `docs/workflow/CONFIG.md` does not exist. Tell the developer to run `/flow:adopt`.
3. Read the existing roadmap, when the config names one: every milestone and every request summary.
4. Derive the status of each existing card from the `Roadmap card` line of the briefs. A card is done when an archived brief in `docs/tasks/_archive/` names it without `(part)`. It is in progress when the brief of an active task names it. The active tasks are the branches of `git branch -a --no-merged origin/<base> --list '*feature/*'`.
5. Read the scope document and the design documents of the config, and the code that the requests touch.

## Read the input

1. Split the input into requests. One request is one question or wish of the client, from one source.
2. For each request, draft a request summary from `${CLAUDE_PLUGIN_ROOT}/templates/REQUEST.md`. Write it in your own words. Never copy the raw text. Leave out the names of people and private details.
3. Find what the roadmap holds already: a request that an existing card covers, or a request that conflicts with a card.

## The conversation

The developer leads. You explain, inform and recommend. You do not steer.

1. Report what you found, in short: the requests, what the roadmap and the code hold already, and what is still open.
2. Ask open questions in prose, with the question format of `/flow:discuss`. List every realistic direction, and give your recommendation apart, as one "My view" line. End each round of questions with one line: `👉 Reply to the questions in your own words.`
3. Cover what applies:
   - How the requests split into cards. A card is one goal that one task, or a few tasks, can build.
   - How the cards group into milestones. A milestone is something that the client can use when every card of it is done.
   - The order of the milestones, and the dependencies between the cards.
   - A target date for each milestone. Ask for it. Never propose a date, and never estimate an effort.
   - A request that conflicts with the scope document, or with an existing card.
4. Stop asking when every card has a title, a "what and why", a source and its dependencies.

## Show the roadmap

Show a short summary:

1. The request summaries, one line each.
2. Each new or changed milestone, with its number, title and target date, and its cards: the card name, the title and "Depends on".
3. The files that you will write, under 📁.

End with: `👉 Reply "go" to write the roadmap through a pull request, or name the changes.`

## Write the roadmap

1. Stop when the working tree has uncommitted changes. Report them.
2. Check that the base branch exists on `origin` (`git ls-remote --heads origin <base>`), and that the branch guard is on (`git config core.hooksPath`).
3. Pick a slug for the change, for example the topic of the requests. The branch `feature/roadmap-<slug>` must not exist, local or remote.
4. Run `git switch <base> && git pull --ff-only origin <base>`, then `git switch -c feature/roadmap-<slug> <base>`.
5. Write each request summary to `docs/roadmap/requests/<YYYY-MM-DD>-<slug>.md`.
6. Write each new milestone from `${CLAUDE_PLUGIN_ROOT}/templates/MILESTONE.md`, as `docs/roadmap/NN-<slug>.md`. NN is the next free number.
7. Add new cards to an existing milestone at the end of its "Cards" section.
8. When the config "Roadmap" is `none`, set it to `docs/roadmap/`.
9. Commit: `roadmap <slug>: <change>`.
10. Push the branch. Open the pull request into the base branch. With the host `github` or `azure-devops`, use `${CLAUDE_PLUGIN_ROOT}/reference/hosting/GITHUB.md` or `${CLAUDE_PLUGIN_ROOT}/reference/hosting/AZURE_DEVOPS.md`. Otherwise, give the developer the link from the push output. Use the summary of "Show the roadmap" as the description.
11. Switch back to the base branch.

## Rules for an existing roadmap

1. Never renumber a milestone. Never rename a card.
2. Never change the text of a card that a brief names. Add a new card, and say in its "what and why" which card it extends.
3. Change a card that no brief names only when the developer approves it in "Show the roadmap".
4. Never write a status in the roadmap. The status is derived.
5. Only the developer sets a target date. Never estimate a date or an effort.
6. Write in the writing style of the config. For `ste`: one idea per sentence, at most 25 words, active voice, no filler words.

## Summary

End with a session summary of 8 lines or fewer, with the pull request link. Use only the icons ✅, ⚠️, 📁 and ▶️. Never put the summary in a code block. The last line is:

`▶️ Next: review and merge the pull request, then /flow:discuss <card title>`
