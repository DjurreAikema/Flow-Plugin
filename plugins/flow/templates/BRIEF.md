# Brief: <title>

Date: <D Month YYYY>
Roadmap card: <the card name, the card name with `(part)`, or none>

## Why
What the developer wants and why. Two or three sentences.

## What
The behaviour or the document that exists after the task. Describe it from the view of a user, or of the reader of the document.

## Decisions
The confirmed decisions. Numbered. `/flow:build` does not change them.

1. ...

## Out of scope
What the task must not do. Name the ideas that came up and go to "Later".

## Map
The files that the build reads and changes. The build reads nothing else without a search first.

- `<path>`: <what changes, or what to read>. <The function or the pattern to follow.>

## Parts
The parts of the work, in order. The build makes one commit per part. Each part ends in a state where the verify command passes.

1. <Part title>: <what it builds>. Files: `<path>`, `<path>`.

## Tests
The automated tests of the task, by the test plan of the config. Or "none".

- <the code that the test covers> (<test type of the plan>): <the reason, which names a rule of the plan>
  <the conventions of the plan that the test needs, or none>

## Human checklist
Checks that are cheap for a human and expensive for an agent: look at a screen, try a device, judge a text, ask a person. The pull request shows them as checkboxes. Or "none".

- [ ] <Check, starting with a verb.>
  Why: <One sentence.>

## Changelog
The changelog entry, with its category. Or "none" when the config has no changelog.

## Open questions
Questions that the discussion did not settle, or "none". `/flow:build` does not start while a question is open.
