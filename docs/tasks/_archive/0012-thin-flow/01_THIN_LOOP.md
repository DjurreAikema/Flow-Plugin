# Step 01: Add the thin loop

Date: 7 November 2026

## Goal
The brief template has a map, parts, tests and a human checklist, `/flow:discuss` fills them in, and `/flow:build` builds a brief on autopilot.

## Context to read
- `docs/tasks/0012-thin-flow/README.md`, decisions 1 to 6 and 8.
- `plugins/flow/templates/BRIEF.md`.
- `plugins/flow/skills/discuss/SKILL.md`.
- `plugins/flow/skills/plan-task/SKILL.md`, `implement-task/SKILL.md` and `finish-task/SKILL.md`: the rules that the build takes over.
- `plugins/flow/reference/GIT.md`: the commands, the checks before work and "Open a pull request".
- `plugins/flow/reference/WORKFLOW.md` sections 5.1, 6.3, 7, 11 and 12: the rules that the skills must now hold themselves.

## Files touched
- `plugins/flow/templates/BRIEF.md` (changed)
- `plugins/flow/skills/discuss/SKILL.md` (changed)
- `plugins/flow/skills/build/SKILL.md` (new)

## Work
1. In `templates/BRIEF.md`, add five sections. "Map": the files and functions to change, and the patterns to follow. "Parts": numbered, one commit each. "Tests". "Human checklist": each item with a "Why" line. "Changelog". Keep "Why", "What", "Decisions", "Out of scope" and "Open questions". Remove "How to check the result": the human checklist and the verify command take its place.
2. Rewrite `skills/discuss/SKILL.md` so that it reads no reference guide. It holds its own rules: the question format, the last-line rules and its icons. It holds the writing rules of `ste` in short form. Add the exploration: read the code that the work touches, and fill in the map. Read the scope document and the decision log of the config. Plan the tests by the section "Testing" of the config, and ask before a test for an untested function that the work changes. Fill in the human checklist with checks that are cheap for a human and expensive for an agent.
3. Change the options at the end of `/flow:discuss`: "Build now" writes `docs/tasks/_new/BRIEF.md` and ends with `▶️ Next: /flow:build docs/tasks/_new`, for a new session. "Backlog", "Keep discussing" and "Drop" stay. "Build now" adds the decision log rows of the brief.
4. Write `skills/build/SKILL.md`. Input: `docs/tasks/_new` or `docs/tasks/_backlog/<slug>`. Order: the checks before work, the task ID, update the base branch, start `feature/<task ID>`, move the brief to `docs/tasks/<task ID>/BRIEF.md`. Read the brief and only the files of its map, with a search before each read. Build the parts in order. Run the verify command. Commit once per part: `<task ID> part <N>: <change>`. Copy the changelog entry in the last part. Run the style script on the changed documents when the style is `ste`. Add "Outcome" to the brief only for deviations. Move the folder to `docs/tasks/_archive/`, commit, push, and open the pull request by the host guide or the manual fallback.
5. In `skills/build/SKILL.md`, write the three stop cases of decision 4, the deviation rule and the pull request description of decision 5. The session summary ends with `▶️ Next: review and merge the pull request`.
6. Run `sh tools/verify.sh`. It passes.

## Review checklist
- [x] ⏸️ Read `plugins/flow/skills/build/SKILL.md`. The autopilot and its stop cases match what you want.
  Why: Steps 02 to 07 remove the old loop and measure this skill.
  Checked: 7 November 2026
- [ ] Run `/flow:discuss` on a small topic in a test project. The brief has a map, parts, tests and a human checklist.
  Why: Project rule 4: a changed skill runs on a test project.

## Docs to update
none. Step 05 updates the workflow guide.

## Out of scope
- Removing the old skills. Steps 02 and 03 do it.
- Changes to the helper skills, the workflow guide or the benchmark.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The brief commit goes with part 1, so the build saves one commit and one request.
- The build archives and commits in one commit: `<task ID> archive`. The "Outcome" section joins that commit.
- With the host `other`, the build writes `PULL_REQUEST.md`, gives the link and does not wait for the developer.
- The changelog link of a new task points to `docs/tasks/_archive/<task ID>/BRIEF.md`, because the task has no `README.md`.
- Both skills end with a rule: never put the 👉 line or the ▶️ line inside a code block. The benchmark showed this slip in fresh sessions.
- The icons of each skill stand in a table, so that each line stays under 25 words.

### Deviations
none

### Open points
- `scripts/style_check.py` crashes on Windows when a finding holds an icon. Python prints with the code page `cp1252`. With `PYTHONIOENCODING=utf-8` it works. The verify script still reports the finding. Not in the scope of this task.
