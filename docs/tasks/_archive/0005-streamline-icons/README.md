# Task 0005: streamline the icons

Date: 2 November 2026
Status: ready for PR
Mode: inline

## Goal
Each icon of the workflow output has one meaning. The last line of a message tells the developer what to do: 👉 to reply, ▶️ to run the next command.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. Two action icons. 👉 means "the skill waits for your reply in this chat". ▶️ means "the skill is done, run this command next".
2. 👉 appears once per message, on the last line. Every message that waits ends with one 👉 line, with the same reply wording. This includes every approval prompt of the skills.
3. 👀 marks only a check that a human does outside the chat.
4. Questions stand in one section with the header "❓ Questions". Each question has a number and a kind word: Conflict, Assumption or Blocker. A question outside a Discovery block uses the same form.
5. The default option of a question has the marker ●. Every other option has ○. The 👉 line says: `Reply "go" for the ● answers, or the number and your answer, e.g. "2b".`
6. Each icon has one meaning. ⚠️ means only "read this". ❌ means only "failed". 🧠 is removed. ❓ and 📁 are added. The set is ✅ ❌ ⚠️ ⏸️ 👉 👀 ❓ 🔍 🤖 📁 ▶️, with the markers ● and ○.
7. The task covers the output of the skills, the examples of the workflow guide and the report of the step builder. The verify script checks that the plugin files use only the icons of the set.
8. The verify script detects icons with `python3`, like check 5. It warns and passes when `python3` is missing.
9. The header of the quick setup block of `/flow:adopt` becomes `🔍 Quick setup`. The block shows what the setup found.
10. The mode is `inline`. The rule gives `agents`, because `tools/verify.sh` is code. This cloud session cannot load the `flow:step-builder` agent, as in task 0001.

## Out of scope
- The archived tasks. They are a record.
- The messages of the git hooks and of the verify script. Their icons already match the meanings.
- The project skill `/release` of this repository.
- Changes to the loop.

## Tests
none. The project rules allow no automated tests. The verify script is the check.

## Changelog
### Changed
- Each icon of the workflow output has one meaning. A message that waits for the developer ends with one 👉 line, and a session summary ends with one ▶️ line. Discovery questions stand in a "❓ Questions" section, with ● on the default answer. 🧠 is removed, and ❓ and 📁 are added. The verify script fails on an icon outside the set. Task: [0005-streamline-icons](docs/tasks/_archive/0005-streamline-icons/README.md).

## Open points
1. `AGENTS.md` says that the verify script checks paths, style and hooks. The script also checks the Python scripts (task 0004) and the icons (this task). No step of this task touches `AGENTS.md`.

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Icon rules in the guide and the loop skills](01_GUIDE_AND_LOOP.md) | verified |
| 02 | [Helper skills and the icon check](02_HELPERS_AND_CHECK.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0005 streamline the icons

✅ Facts I checked
   1. Verify passes on the branch.         sh tools/verify.sh
   2. The branch guard is on.              core.hooksPath
   3. The session runs Opus. Mode inline.  task file
   4. "←" is only in plan-task, implement-task and WORKFLOW.md.
      Step 01 removes every one.           grep
   5. The review page holds only ⏸️.       review-page.html

📁 Files I will touch
   ~ plugins/flow/reference/WORKFLOW.md, discuss, plan-task,
     implement-task, checklist, finish-task           step 01
   ~ adopt, whats-next, tutorial, tools/verify.sh,
     CHANGELOG.md                                     step 02

👉 No questions. Reply "go" to start.
```

Answer: "go".
