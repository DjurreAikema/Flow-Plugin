---
name: discuss
description: Talk a feature or a design topic through with the developer, explore the code once, and write a brief with a map, parts and a human checklist. The developer then builds it with /flow:build or puts it in the backlog. Start every task here.
---

# /flow:discuss

Work out a feature or a design topic with the developer. The result is `BRIEF.md`: the only plan of the task. After the brief, `/flow:build` builds the task without approvals. So the brief must settle every question that changes the work.

Input: a topic, or a card of the roadmap: its title or its card name.

## Before you start

1. Read `docs/workflow/CONFIG.md`. Stop when it does not exist. Tell the developer to run `/flow:adopt`. `AGENTS.md` is in the session already.
2. When the config names a roadmap, look for a card whose title or card name matches the input. When one card matches, read it, its request summary and the cards that it depends on. The topic is that card. When more than one card matches, list them, end with `👉 Reply with the card name.`, and wait. When no card matches, the input is a topic.
3. Read the scope document and the decision log of the config. Read its other documents only when the topic touches them.
4. Explore the code that the topic touches. Search first, then read only the files and the parts of files that matter. Note the files to change, the functions, and the patterns to follow. This exploration fills in the map of the brief. The build does not explore again.
5. Read a file only once per session, unless you edited it.

## The conversation

The developer leads. You explain, inform and recommend. You do not steer.

1. Report what exists today, what that means for the topic, and what is still open. Keep it short. Do not propose a full design, unless the developer asks for one.
2. Ask open questions in prose. Do not use the multiple-choice tool.
3. Ask every question whose answer changes the work. Never aim for a number of questions. Ask first the questions whose answers shape other questions.
4. List every realistic direction. Never add a filler direction. Keep the recommendation separate, as one "My view" line with its reason.
5. Point out a conflict with a document of the config or with the decision log. Point out a consequence that the developer can miss. Point out scope beyond the scope document, and propose the backlog for it.
6. When an answer is vague, ask a follow-up question.
7. Cover what applies: the why, the user experience, the scope, the rules and data, the edge cases, and the tests.
8. Stop asking when the brief has no important unknowns.
9. End each round of questions with one line: `👉 Reply to the questions in your own words.`

### Question format

```markdown
**<Number>. <The question, in one sentence>**

- **What this is about:** <the subject, in simple words>
- **Why it matters:** <what the answer changes>
- **Directions:**
  - <Direction>: <what it means>. <Its trade-offs.>
- **What I need from you:** <the kind of answer that helps>

**My view:** <the recommendation, with the reason>
```

Leave out "Directions" when the question is truly open.

## Tests

Plan tests only by the section "Testing" of the config:

| Rule | Which code gets a test |
|------|------------------------|
| `none` | No code. |
| `critical` | Only logic that can break without a visible sign, that many parts depend on, or that ruins the whole result. |
| `logic` | Every function with a branch, a calculation or a rule. Not plain data, wiring or layout. |

1. Name for each test the code that it covers, a type of the config, and a reason that names the rule.
2. The work can change a function that has no test, under the rule. Ask the developer whether to add a test for that function only.

## The brief

Fill in every section of `${CLAUDE_PLUGIN_ROOT}/templates/BRIEF.md`:

1. Map: each file to read or change, with the function and the pattern to follow. Name only what the build needs.
2. Parts: as few as possible. Each part ends in a state where the verify command passes.
3. Human checklist: only checks that are cheap for a human and expensive for an agent. For example: look at a screen, try a device, judge a text, ask a person. The build does every other check itself.
4. Changelog: one entry in the style of the config, under Added, Changed, Removed or Fixed. End it with `Task: [<task ID>](docs/tasks/_archive/<task ID>/BRIEF.md).` Write `<task ID>` as is. The build fills it in.

Write in the writing style of the config. For `ste`:

- One idea per sentence, at most 25 words. Active voice, present tense.
- No em dashes and no filler words. Code in backticks.
- `[Verify]` on a fact that you cannot check.

## Show the brief

1. Show a short summary of the brief: the decisions, the map, the parts, the tests and the human checklist.
2. In the same message, ask the developer to pick one option. Options 1 and 2 also approve the brief:

   ```
   What do you want to do with this brief?
      1. Build now: write the brief, then run /flow:build in a new session.
      2. Backlog: put the brief in the backlog, through a pull request.
      3. Keep discussing.
      4. Drop: write nothing.

   👉 Reply with the number of the option. Options 1 and 2 also approve the brief.
   ```

### Build now

1. Write the brief to `docs/tasks/_new/BRIEF.md`. For a card, write its card name on the line `Roadmap card`.
2. When a decision changes the design and the config names a decision log, add a row to it. Use the next free number and the date of today.
3. Do not commit. Do not create a branch. `/flow:build` does both.

### Backlog

1. Stop when the working tree has uncommitted changes. Report them.
2. Check that the base branch exists on `origin`: `git ls-remote --heads origin <base>` prints a line.
3. Pick a slug that is not used in `docs/tasks/_backlog/`, and not used by a branch.
4. Run `git switch <base> && git pull --ff-only origin <base>`, then `git switch -c feature/backlog-<slug> <base>`.
5. Write `docs/tasks/_backlog/<slug>/BRIEF.md`. Do not change the decision log. `/flow:build` adds the rows later.
6. Commit: `backlog <slug>: add brief`. Push with `git push -u origin feature/backlog-<slug>`.
7. Open the pull request into the base branch. With the host `github` or `azure-devops`, use the command of `${CLAUDE_PLUGIN_ROOT}/reference/hosting/GITHUB.md` or `${CLAUDE_PLUGIN_ROOT}/reference/hosting/AZURE_DEVOPS.md`. With another host, or when the tool fails, give the developer the link from the push output. Use the brief summary as the description.
8. Switch back to the base branch.

### Drop

Write nothing. Do not commit.

## Summary

End with a session summary of 8 lines or fewer. Use only these icons:

| Icon | Meaning |
|------|---------|
| ✅ ❌ | Done, failed. |
| ⚠️ | A risk. |
| 👉 | Waits for a reply. |
| ▶️ | The next command. |
| ❓ 🔍 | Questions, findings. |
| 🤖 📁 | Automated checks, files. |

The last line depends on the option:

| Option | Last line |
|--------|-----------|
| Build now | `▶️ Next: /flow:build docs/tasks/_new`, in a new session |
| Backlog | `▶️ Next: review and merge the pull request`, with the link |
| Drop | `▶️ Next: /flow:whats-next` |

Never put the summary, a 👉 line or a ▶️ line inside a code block. The last line of the message must be the 👉 line or the ▶️ line itself.
