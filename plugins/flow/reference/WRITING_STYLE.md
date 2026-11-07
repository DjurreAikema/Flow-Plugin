# Writing style: STE

Date: 2 November 2026

This is the `ste` writing style of the `flow` plugin. A project uses it when its config sets "Writing style" to `ste`. It applies to every document that the workflow writes: briefs, task files, step files, skills and pull request descriptions. The style is based on Simplified Technical English (STE).

## Rules

1. Never use em dashes. Use a period, a comma, a colon or parentheses.
2. Write one idea per sentence. Aim for fewer than 20 words. Never use more than 25.
3. Use the active voice. Write "The server sends the email", not "The email is sent".
4. Use the present tense, unless you must write about the past or the future.
5. Give instructions as direct commands. Write "Run the verify command", not "You should run the verify command".
6. Use one word for one concept. Use the words in the terms table of the workflow guide (`reference/WORKFLOW.md` section 3). When a project adds a concept, add it to the project rules of the config.
7. Put code identifiers, file names and commands in backticks. Write the exact identifier.
8. Write for a reader with no outside context. Never refer to an earlier conversation.
9. Put the date at the top of each document.
10. Use short paragraphs. Use a list when there are three or more items of the same kind.
11. Do not use filler words: "simply", "just", "basically", "actually", "very".
12. Do not use vague words when an exact word exists. Write "3 retries", not "a few retries".
13. Do not hedge. When a fact is not certain, mark it with `[Verify]`. When a choice is not made, mark it as an open question.

## Exceptions

The config can name exceptions, for example a friendly voice in the help texts of an app. An exception applies only where the config says so.

## Examples

| Do not write | Write |
|--------------|-------|
| The token is basically checked on every request — it's pretty important. | The server checks the token on every request. |
| Users should probably be able to reset stuff like passwords. | Users can reset their password. |
| It might be a good idea to maybe add tests here. | Add a test for the refund rule. |
| As we discussed earlier, the export stays optional. | The export is optional. |
