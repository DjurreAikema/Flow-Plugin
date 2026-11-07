# Task 0010: benchmark for the workflow

Date: 5 November 2026
Status: ready for PR
Mode: agents
Roadmap card: none

## Goal
`bench/` holds a repeatable benchmark. It measures the cost, the quality and the workflow discipline of three setups: `lean`, `flow-inline` and `flow-agents`.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. The benchmark lives in `bench/`. It is not part of `plugins/flow/`, and `tools/verify.sh` does not run it.
2. The sample project is TypeScript on Node, in `bench/sample/`. It has 2,000 to 4,000 lines, existing tests, and a verify command that runs in seconds.
3. The sample project is a library lending system with 5 modules: `catalog`, `members`, `loans`, `fees` and `reports`.
4. The test runner is `node --test`. Node 22.18 or later strips the types, so a run needs no `npm install` and no network. The source uses only erasable TypeScript syntax: no `enum`, no `namespace`, no parameter properties. Imports name the `.ts` extension.
5. The sample project is set up for `flow` already: a config, an `AGENTS.md` and the branch guard. `/flow:adopt` is not part of the benchmark.
6. Each run uses a copy of the sample project in a temporary folder outside the repository. The driver runs `git init` and makes a local bare repository as `origin`. Nothing reaches GitHub. To reset, the driver deletes the folder.
7. A run starts from a fixed `BRIEF.md` in `docs/tasks/_new/` of the copy. `/flow:discuss` is not part of the benchmark.
8. The pilot feature is "holds", in `bench/features/holds/`. It has 3 or 4 steps and about 300 changed lines. It has a brief with a fixed public API, hidden acceptance tests, a list of allowed files and a reference solution as a patch. The driver copies the hidden tests into the copy after the run.
9. The setups:
   - `lean`: plain Claude Code with a short `CLAUDE.md`. It holds the core rules: a feature branch, out of scope, the verify command and one commit per step. This is the 1x baseline.
   - `flow-inline`: the loop from `/flow:plan-task` to `/flow:finish-task`, with the mode `inline`.
   - `flow-agents`: the same loop, with the mode `agents`.
10. The driver is a Python 3 script, `bench/run.py`. It runs `claude -p` with `--output-format json`, and continues the session with `--resume` for each reply. All setups use the model `opus`.
11. The plugin folder is an argument of the driver.
12. The driver answers each 👉 line with the scripted reply of the setup. The default reply is "go". It follows each ▶️ line to the next skill, until `/flow:finish-task` ends. It logs and counts each question of the agent.
13. For `/flow:checklist`, the driver sets `BROWSER` to a fake browser that records the URL. The driver then passes every item through the review server, like the "Finish" button. Without a display on Linux, the skill uses the prose fallback, and the scripted reply passes every item. (Changed in step 05, deviation 2.)
14. The driver adds up `modelUsage` from each JSON result. It reads the session logs of Claude Code for the number of step builders, and for the tokens when the JSON result leaves out the tokens of the step builders.
15. Each run records three groups of figures:
    - Cost: the tokens per model (input, cache write, cache read and output), the number of turns and the wall time.
    - Quality: the hidden tests that pass, the result of the verify command, and the files changed outside the allowed list.
    - Workflow: one commit per step, the status values, the last-line rules and the number of questions.
16. Each setup runs 3 times. The report shows the median and the spread (minimum to maximum) of each figure.
17. The runs use the Claude subscription of the developer, not an API key. At a usage limit, the driver stops cleanly. A later call skips the finished runs and continues with the rest.
18. A run is isolated. It loads no `CLAUDE.md` of this repository and no user-level `CLAUDE.md`. Only the flow setups load the plugin. [Verify] the flags of Claude Code that do this.
19. A `.gitattributes` file keeps LF line endings for shell scripts and git hooks, in the repository root and in the sample project.
20. Raw run results go to `bench/results/`, and git ignores that folder.

## Out of scope
- The step-size matrix: one large feature with pinned plans of 2, 4 and 8 steps. This is the next task.
- Changes to `plugins/flow/`. The changes from the plugin review are later tasks.
- `/flow:discuss` and `/flow:adopt` in the benchmark.
- A judge model that scores the code beyond the hidden tests.
- A `.gitattributes` rule that `/flow:adopt` writes into a project.
- Runs in the cloud or in CI, and parallel runs.
- A change to `tools/verify.sh`.

## Tests
none. The test rule of the config is `none`. The verify script is the check. The tests of the sample project are part of the product of this task, not tests of this repository.

## Changelog
### Added
- `bench/` holds a benchmark of the workflow. It has a TypeScript sample project that is set up for `flow`, a pilot feature with hidden tests, a Python driver and a report. The driver runs Claude Code headless on a copy of the sample project and plays the developer. The report compares the setups `lean`, `flow-inline` and `flow-agents` on cost, quality and workflow. A `.gitattributes` file keeps LF line endings for shell scripts and git hooks. Task: [0010-benchmark](docs/tasks/_archive/0010-benchmark/README.md).

## Open points
- The 9 pilot runs have not run. The next task, the step-size matrix, runs them first and reads the report (review item of step 06).
- `tools/verify.sh` check 7 ("sections") fails on Windows, because it compares paths with `/` (Discovery answer 1). Fix it on the branch `fix/verify-windows-paths`.
- `plugins/flow/scripts/style_check.py` crashes on Windows when a finding holds an emoji, because the console uses cp1252. `PYTHONIOENCODING=utf-8` avoids it.
- The fake browser of the driver is untested in a real run, because the review run planned no review item.
- `--setting-sources project,local` is not shown to keep a user-level `CLAUDE.md` out. The machine of the review run has no such file.

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Sample source](01_SAMPLE_SOURCE.md) | verified |
| 02 | [Sample tests](02_SAMPLE_TESTS.md) | verified |
| 03 | [Sample flow setup](03_SAMPLE_FLOW_SETUP.md) | verified |
| 04 | [Pilot feature and setups](04_PILOT_FEATURE.md) | verified |
| 05 | [Driver](05_DRIVER.md) | verified |
| 06 | [Report and records](06_REPORT_RECORDS.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0010 benchmark for the workflow

❓ Questions
   1. Conflict: the verify command fails before any change. Check 7 ("sections")
      does not skip docs/tasks/_archive on Windows, because os.path.join gives
      backslashes. It flags 3 old lines of task 0003. The task puts
      tools/verify.sh out of scope, so no step may fix it.
      ● a) A step passes when "sections" on those 3 archive lines is the only
           failure. Each Outcome records it. Fix it later on fix/verify-windows-paths.
      ○ b) Stop. Fix it on fix/verify-windows-paths first, then restart.

✅ Facts I checked
   1. This session runs Opus 5.5, and the agent flow:step-builder
      is available.                                         session model, agent list
   2. Branch feature/0010-benchmark, clean tree, origin/main
      exists, the guard is tools/git-hooks.                 git status, ls-remote, core.hooksPath
   3. Node is v24.11.0. That is 22.18 or later, so node
      strips types without a package.                       node --version
   4. The 4 existing hooks are CRLF in the working tree.
      Step 03 refreshes them to LF.                         git ls-files --eol

📁 Files I will touch
   + bench/sample/src/ (6 modules)                          step 01
   + bench/sample/package.json, test/ (5 files)             step 02
   + bench/sample/AGENTS.md, docs/workflow/CONFIG.md,
     tools/git-hooks/ (2), .gitattributes                   step 03
   + .gitattributes                                         step 03
   + bench/features/holds/ (4 files), bench/setups/ (2)     step 04
   + bench/run.py, bench/.gitignore, bench/README.md        step 05
   + bench/report.py                                        step 06
   ~ bench/README.md, AGENTS.md, CHANGELOG.md               step 06
   ~ docs/tasks/0010-benchmark/ (outcomes, statuses)        every step

👉 1 question. Reply "go" for the ● answers, or the number and your answer, e.g. "1b".
```

Answer: "go".
