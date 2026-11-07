# Step 05: Rewrite the guide and the docs

Date: 7 November 2026

## Goal
The workflow guide, the readme, `AGENTS.md` and the design describe the two-skill loop for a person.

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, all decisions.
- `plugins/flow/reference/WORKFLOW.md`.
- `README.md`, `AGENTS.md`, and `docs/DESIGN.md` section 3.
- `plugins/flow/skills/discuss/SKILL.md` and `build/SKILL.md`.

## Files touched
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `README.md` (changed)
- `AGENTS.md` (changed)
- `docs/DESIGN.md` (changed)

## Work
1. Rewrite `WORKFLOW.md` for a person who learns the workflow. Section 1: the loop of two skills, the options of `/flow:discuss`, and the helpers. Remove the sections on steps, modes, the step builder and the review page. Describe the brief with its map, parts, tests and human checklist, the autopilot and its stops, and the record in `_archive/`. Keep the sections on testing, git, hosting, icons and the changelog where they still apply. Keep the section numbers that `adopt`, `tutorial` and the verify script cite, or update those citations.
2. In `README.md`, replace the table of five phases with the two skills, and remove the sentences on agents mode and the Discovery.
3. In `AGENTS.md`, change hard rule 1 to "Build only what the brief names." Change rule 3 to copy the entry of the brief. Change the row of the workflow guide in "Read these first".
4. In `docs/DESIGN.md` section 3.1, remove the step builder from what the plugin holds. In section 3.4, the status of a card comes from the archived briefs.
5. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [ ] Read `plugins/flow/reference/WORKFLOW.md` and `README.md`. A new user understands the loop of discuss and build.
  Why: Judging a text needs a human.

## Docs to update
- `plugins/flow/reference/WORKFLOW.md`, `README.md`, `AGENTS.md`, `docs/DESIGN.md`.

## Out of scope
- The decision log. The plan commit adds its rows.
- `CHANGELOG.md`. Step 07 adds the entry.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The guide keeps the section numbers 5.9, 7, 11, 11.3 and 11.4, which the skills, the templates and the verify script cite. Section 5 now holds the brief (5.8) and the record (5.5). Section 6 holds the build. Section 8 holds the human checklist.
- The icon ⏸️ leaves the icon table, because no skill uses it now. The verify script still allows it.
- The last-line rule 11.3 gains rule 5: never put the last line inside a code block.
- `docs/DESIGN.md` section 2, item 1, names the loop of discuss and build.

### Deviations
| # | What changed | Why | Affects |
|---|--------------|-----|---------|
| 1 | `docs/DESIGN.md` section 2 (the step names section 3): item 1 of the scope names the new loop. | The scope listed the five old phases. | none |
