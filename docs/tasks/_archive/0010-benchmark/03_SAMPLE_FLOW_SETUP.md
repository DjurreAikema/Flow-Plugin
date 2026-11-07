# Step 03: Sample flow setup

Date: 5 November 2026

## Goal
The sample project is set up for `flow`, and the hooks keep LF line endings on Windows.

## Context to read
- `docs/tasks/0010-benchmark/README.md`, decisions 5 and 19.
- `plugins/flow/templates/AGENTS.md` and `plugins/flow/templates/CONFIG.md`.
- `plugins/flow/templates/git-hooks/pre-commit` and `plugins/flow/templates/git-hooks/pre-push`.
- `bench/sample/package.json`.

## Files touched
- `bench/sample/AGENTS.md` (new)
- `bench/sample/docs/workflow/CONFIG.md` (new)
- `bench/sample/tools/git-hooks/pre-commit` (new)
- `bench/sample/tools/git-hooks/pre-push` (new)
- `bench/sample/.gitattributes` (new)
- `.gitattributes` (new)

## Work
1. Write `bench/sample/docs/workflow/CONFIG.md` from the template, with these values:
   - Project: name "Lending", summary "An in-memory library lending system: catalog, members, loans, fees and reports."
   - Git: base branch `main`, host `other`, repository `none`.
   - Tasks: task ID `number`, mode threshold 3.
   - Commands: verify `node --test "test/**/*.test.ts"`, setup `git config core.hooksPath tools/git-hooks`, coverage `none`.
   - Testing: rule `logic`. Types: `unit`: one function or class, in memory. `node --test "test/**/*.test.ts"`.
   - Docs: scope, design, roadmap and decision log are all `none`.
   - Records: changelog `none`, writing style `ste`.
   - Project rules: none.
2. Write `bench/sample/AGENTS.md` from the template. Fill in the placeholders for this project. Remove the rows that name a document that the config sets to `none`.
3. Copy the two hooks of `plugins/flow/templates/git-hooks/` to `bench/sample/tools/git-hooks/`. Set `PROTECTED="main"`. Write them with LF line endings.
4. Write `bench/sample/.gitattributes`: `* text=auto`, then `*.sh text eol=lf` and `tools/git-hooks/* text eol=lf`.
5. Write the root `.gitattributes`: `* text=auto`, then `*.sh text eol=lf`, `tools/git-hooks/* text eol=lf`, `plugins/flow/templates/git-hooks/* text eol=lf` and `bench/sample/tools/git-hooks/* text eol=lf`.
6. Mark the 2 new hooks as executable in the index: `git add --chmod=+x bench/sample/tools/git-hooks/pre-commit bench/sample/tools/git-hooks/pre-push`.
7. Refresh the working copies of the existing hooks, so that they get LF endings: delete `tools/git-hooks/pre-commit`, `tools/git-hooks/pre-push` and the 2 files in `plugins/flow/templates/git-hooks/`, then run `git checkout -- tools/git-hooks plugins/flow/templates/git-hooks`. Check with `git ls-files --eol`: each of the 6 hooks shows `w/lf`.
8. Test the guard in a temporary folder outside the repository:
   1. Copy `bench/sample/` there. Run `git init -b main`, and commit everything without hooks.
   2. Run `git config core.hooksPath tools/git-hooks`.
   3. Try a second commit on `main`. The hook refuses it.
   4. Delete the temporary folder.
9. Run `sh tools/verify.sh` in the repository root. It passes.

## Review checklist
none

## Docs to update
none

## Out of scope
- A `CLAUDE.md` in the sample project. The driver writes it per setup (step 05).
- A `.gitattributes` rule in the templates of the plugin, or in `/flow:adopt`.
- Any change to the content of the existing hooks.

## Outcome
Status: implemented
Verify: passed. The only failure is the known check 7 ("sections") on 3 archive lines of task 0003 (Discovery answer 1).

### Choices made
- The new hooks are copies of the existing hooks, taken with `git show HEAD:...`, so they have LF endings. `PROTECTED` was already `main`.
- The CONFIG section "Project rules" holds "none". The "Read these first" table of `AGENTS.md` has only the 2 template rows, because every document of the config is `none`.
- Hard rule 4 of `bench/sample/AGENTS.md` is the rule for erasable TypeScript syntax (task decision 4).
- The guard test passed: in a fresh copy, the hook refused a second commit on `main` with exit code 1.
- The working copies of the 4 existing hooks now have LF endings, with no change of content. `git ls-files --eol` shows `w/lf` for all 6 hooks.

### Deviations
none
