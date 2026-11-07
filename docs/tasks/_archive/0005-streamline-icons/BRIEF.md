# Brief: streamline the icons

Date: 2 November 2026

## Why
The same action has different icons. 👉 and ▶️ both ask the developer to act. Some icons have two meanings: ⚠️ marks a question and a heads up, and ❌ marks a failure and a question. Some prompts that wait for a reply have no icon and no fixed reply. The developer must know what to do from the last line of any message.

## What
Each icon has one meaning. A message that waits for the developer ends with one 👉 line that says what to reply. A message that ends a skill ends with one ▶️ line that names the next command. Questions in a Discovery block stand in one "❓ Questions" section, and the default answer of each question is easy to see.

## Decisions

1. Two action icons. 👉 means "the skill waits for your reply in this chat". ▶️ means "the skill is done, run this command next".
2. 👉 appears once per message, on the last line. Every message that waits ends with one 👉 line, with the same reply wording. This includes every approval prompt of the skills.
3. 👀 marks only a check that a human does outside the chat.
4. Questions stand in one section with the header "❓ Questions". Each question has a number and a kind word: Conflict, Assumption or Blocker. A question outside a Discovery block uses the same form.
5. The default option of a question has the marker ●. Every other option has ○. The 👉 line says: `Reply "go" for the ● answers, or the number and your answer, e.g. "2b".`
6. Each icon has one meaning. ⚠️ means only "read this". ❌ means only "failed". 🧠 is removed. ❓ and 📁 are added. The set is ✅ ❌ ⚠️ ⏸️ 👉 👀 ❓ 🔍 🤖 📁 ▶️, with the markers ● and ○.
7. The task covers the output of the skills, the examples of the workflow guide and the report of the step builder. The verify script checks that the plugin files use only the icons of the set.

## Out of scope
- The archived tasks. They are a record.
- The messages of the git hooks and of the verify script. Their icons already match the meanings.
- The project skill `/release` of this repository.
- Changes to the loop.

## How to check the result
1. In every skill, each message that waits for the developer ends with exactly one 👉 line.
2. An icon outside the set in a plugin file makes the verify script fail.
3. A run of `/flow:implement-task` on a test project shows the new Discovery block.

## Open questions
1. How does the verify script detect icons, so that it works on macOS and Linux and allows ● and ○?
2. The quick setup block of `/flow:adopt` has the header icon 🧠. Which icon replaces it?
