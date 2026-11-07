# Step 02: Guide and templates

Date: 2 November 2026

## Goal
The workflow guide, the templates and the writing style describe only the core, with neutral examples.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `plugins/flow/reference/GIT.md`, as step 01 left it
- `plugins/flow/reference/WORKFLOW.md`
- `plugins/flow/templates/CONFIG.md`
- `plugins/flow/templates/TASK.md`
- `plugins/flow/reference/WRITING_STYLE.md`

## Files touched
- `plugins/flow/reference/WORKFLOW.md` (changed)
- `plugins/flow/templates/CONFIG.md` (changed)
- `plugins/flow/templates/TASK.md` (changed)
- `plugins/flow/reference/WRITING_STYLE.md` (changed)

## Work
1. In `WORKFLOW.md` section 1: remove `/flow:release` from the helper table.
2. In `WORKFLOW.md` section 4: remove `changelog.d/` and "patch notes" from the layout.
3. In `WORKFLOW.md` section 5.1: remove the row `work-item`. In section 5.7: remove item 5.
4. In `WORKFLOW.md` section 9: name the branch guard of `reference/GIT.md` as core. Remove the sentence about extras.
5. In `WORKFLOW.md`: remove section 12. Renumber section 13 to 12, and its subsections. Remove `fragments`, the `/flow:release` row of 12.2, section 13.3 (extra records) and section 13.4 (version numbers). Update the references inside the guide.
6. In `WORKFLOW.md`: replace the game examples with neutral ones. The examples are `movement-prototype`, sprint-jump, `RobotController.cs`, `movement_spec.tres`, `MovementSpec.MaxJump` and `JumpHeight`.
7. In `templates/CONFIG.md`: remove "Tracker", "Extra records" and "Extras". The task ID is `number | slug`. The changelog is `direct | none`. "Setup" is `git config core.hooksPath tools/git-hooks`. Keep "Roadmap" as a read-only document.
8. In `templates/TASK.md`: remove the lines `Milestone` and `Work item`, and the section "Extra records".
9. In `WRITING_STYLE.md`: replace "a playful voice in patch notes" with a neutral example.

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The skills. Steps 03 and 04 do this.
- The content of the loop itself.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The neutral example is a password reset in a web app (Discovery answer 2a): `0003-password-reset`, `02_RESET_EMAIL.md`, `src/auth/ResetController.ts` and `ResetToken`.
- Section 12 is "Changelog" instead of "Changelog and other records", because the extra records are gone.
- Section 12.1 says that `direct` conflicts in a team, and that a team picks `none` or adds fragments with a project skill (Discovery answer 3a).
- The layout of section 4 lists `tools/git-hooks/`, because every project now has it.
- Section 9 names four things from git, to match `reference/GIT.md`.
- The config template sets "Setup" to the hook command, because every project needs it.
- `templates/TASK.md` names section 12, as Discovery fact 4 says.
- The writing style example of an exception is a friendly voice in the help texts of an app.

### Deviations
none
