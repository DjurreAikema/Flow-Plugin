# Step 04: Fit the helper skills

Date: 7 November 2026

## Goal
`/flow:whats-next`, `/flow:roadmap`, `/flow:tutorial` and `/flow:adopt` describe and read the two-skill loop.

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, decisions 6 and 8.
- `plugins/flow/skills/whats-next/SKILL.md`, `roadmap/SKILL.md`, `tutorial/SKILL.md` and `adopt/SKILL.md`.
- `plugins/flow/skills/build/SKILL.md`, from step 01.

## Files touched
- `plugins/flow/skills/whats-next/SKILL.md` (changed)
- `plugins/flow/skills/roadmap/SKILL.md` (changed)
- `plugins/flow/skills/tutorial/SKILL.md` (changed)
- `plugins/flow/skills/adopt/SKILL.md` (changed)
- `plugins/flow/templates/MILESTONE.md` (changed)

## Work
1. `whats-next`: read the brief of an active task (`git show <branch>:docs/tasks/<task ID>/BRIEF.md`) and of an archived task. Recommend `/flow:build` for a brief in `_new` or the backlog. Remove "a checklist to tick". Hold the rules it needs, and read no reference guide. Keep the host guide for open pull requests.
2. `roadmap`: derive the card status from the `Roadmap card` line of the archived and active briefs. Hold the rules of section 5.9 that it needs. Read no reference guide.
3. `tutorial`: teach the loop of `/flow:discuss` and `/flow:build`. Remove the lessons on steps, modes and the review page. Teach the map, the parts and the human checklist. The dry run shows a brief and a pull request description.
4. `adopt`: remove "Mode threshold" from the quick setup. Keep the read of the workflow guide and the git guide.
5. `templates/MILESTONE.md`: the status of a card comes from the archived briefs.
6. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [ ] Run `/flow:adopt` with the quick setup in a test project. The config has no "Mode threshold".
  Why: Project rule 4: a changed skill runs on a test project.
- [ ] Run `/flow:whats-next` in a test project with an archived brief. It reports the task and recommends `/flow:discuss` or `/flow:build`.
  Why: Project rule 4: a changed skill runs on a test project.

## Docs to update
none

## Out of scope
- The workflow guide. Step 05 rewrites it.
- `/flow:discuss` and `/flow:build`.

## Outcome

Status: implemented
Verify: passed

### Choices made
- `whats-next`, `roadmap` and `discuss` hold the git commands that they need, and name the host guides directly. They no longer read `reference/GIT.md`.
- `whats-next` reports a brief in `docs/tasks/_new/` as open work, and recommends `/flow:build` for it.
- `roadmap` keeps the conversation rules of `/flow:discuss` in short form, instead of a read of that skill file.
- `tutorial` keeps 8 lessons: the lessons on steps, Discovery and modes became lessons on the brief and the build.
- `adopt` still reads the whole workflow guide and the git guide (plan answer 2). Step 05 keeps the sections that it cites: 7, 11 and 11.3.

### Deviations
none
