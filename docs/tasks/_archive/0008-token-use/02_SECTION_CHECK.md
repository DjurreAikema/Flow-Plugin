# Step 02: Section check

Date: 2 November 2026

## Goal
The verify script fails when a file cites a section of the workflow guide that does not exist.

## Context to read
- `docs/tasks/0008-token-use/README.md`
- `tools/verify.sh`
- `plugins/flow/reference/WORKFLOW.md`, the section headings

## Files touched
- `tools/verify.sh` (changed)
- `CHANGELOG.md` (changed)

## Work
1. Add check 7 "sections" to `tools/verify.sh`, in Python 3 like check 6. Skip it with a ⚠️ when `python3` is missing.
2. Collect the section numbers of `plugins/flow/reference/WORKFLOW.md` from its headings: `## 1. Summary` gives `1`, `### 5.1 Task IDs and names` gives `5.1`.
3. Scan the Markdown files of `plugins/flow/`, `.claude/skills/`, `docs/` without `docs/tasks/_archive/`, `AGENTS.md`, `README.md` and `CHANGELOG.md`. A citation is "workflow guide section" or "`WORKFLOW.md` section", followed by one or more numbers. Examples: "sections 3 and 8", "sections 2, 3 and 5".
4. Fail on each cited number that has no heading. Print the file, the line and the number.
5. Add the check to the comment block at the top of the script.
6. In `CHANGELOG.md`, the header: the changelog rules are in section 12, not 13.

## Review checklist
none

## Docs to update
none

## Out of scope
- Every other change of `CHANGELOG.md`. Step 03 adds the entry of the task.

## Outcome

Status: implemented
Verify: passed

### Choices made
- The check accepts an optional comma before "section", so "the workflow guide, section 11.2" counts as a citation too.
- A test citation with "sections 2, 3, 99 and 12" made the check fail on 99 only. The test file is removed.
- Before the fix, the check failed on `CHANGELOG.md` line 5, section 13, as planned.

### Deviations
none
