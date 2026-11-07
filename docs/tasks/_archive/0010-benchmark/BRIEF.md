# Brief: benchmark for the workflow

Date: 2 November 2026
Roadmap card: none

## Why
Nobody has measured the token use or the code quality of the workflow. Agents mode has never run: the step builder did not load in tasks 0004, 0008 and 0009. The mode threshold of 3 steps and the step limit of 6 files are guesses.

The developer wants a strict workflow, not a lean one. A strict workflow may cost more, but it must come as close to 1x of a lean baseline as possible. A repeatable benchmark measures this, and measures each later change of the plugin.

## What
`bench/` holds a TypeScript sample project, one feature with hidden tests, and a driver script. The driver runs Claude Code headless on a fresh copy of the sample project. It plays the developer: it reads the last line of each message and sends the scripted reply.

Each run records its token use, its quality, and how well the agent follows the workflow. A report compares three setups: lean, flow inline and flow agents. The first results answer two questions. Does agents mode work? What does the workflow cost against the lean baseline?

## Decisions

1. The benchmark lives in this repository, in `bench/`. It is not part of `plugins/flow/`, and `tools/verify.sh` does not run it.
2. The sample project is TypeScript on Node. It has 2,000 to 4,000 lines, existing tests, and a verify command that runs in seconds.
3. The sample project is set up for `flow` already: it holds a config, an `AGENTS.md` and the branch guard. `/flow:adopt` is not part of the benchmark.
4. Each run uses a copy of the sample project in a temporary folder outside the repository. The driver runs `git init` and makes a local bare repository as `origin`. Nothing reaches GitHub. To reset, the driver deletes the folder.
5. A run starts from a fixed `BRIEF.md`. `/flow:discuss` is not part of the benchmark.
6. The pilot has one medium feature: 3 or 4 steps, and about 300 changed lines. The feature has hidden acceptance tests, a list of allowed files and a reference solution. The agent never sees the hidden tests. The driver copies them in after the run.
7. The benchmark has three setups:
   - `lean`: plain Claude Code with a short `CLAUDE.md`. It holds the core rules: a feature branch, out of scope, the verify command and one commit per step. This is the 1x baseline.
   - `flow-inline`: the loop from `/flow:plan-task` to `/flow:finish-task`, with the mode `inline`.
   - `flow-agents`: the same loop, with the mode `agents`.
8. The driver is a Python 3 script, so that it runs on Windows. It runs `claude -p` with `--output-format json`. It continues the session with `--resume` for each reply.
9. The plugin folder is an argument of the driver. A run can then compare `main` with a feature branch of the plugin.
10. The driver answers each 👉 line with the scripted reply of the setup. It replies "go" to accept every ● answer, unless the script names another answer. The driver logs and counts each question of the agent.
11. Each run records three groups of figures:
    - Cost: the tokens per model (input, cache write, cache read and output), the number of turns and the wall time.
    - Quality: the hidden tests that pass, the result of the verify command, and the files changed outside the allowed list.
    - Workflow: one commit per step, the status values, the last-line rules and the number of questions.
12. Each setup runs 3 times. The report shows the median and the spread of each figure.
13. The runs use the Claude subscription of the developer, not an API key. The pilot records the tokens of each run, so that the developer can size later runs to the plan limits. At a usage limit, the driver stops cleanly. A later call continues with the remaining runs.
14. A run is isolated. It loads no `CLAUDE.md` of this repository and no user-level `CLAUDE.md`. Only the flow setups load the plugin. [Verify] the flags of Claude Code that do this.
15. A `.gitattributes` file keeps LF line endings for shell scripts and git hooks. With CRLF endings, the hooks stop with a syntax error, and the sample project needs working hooks on Windows.
16. Raw run results go to `bench/results/`, and git ignores that folder.

## Out of scope
- The step-size matrix: one large feature with pinned plans of 2, 4 and 8 steps, in both modes. This is the next task.
- The changes from the plugin review: a light path, fewer commits, a new mode threshold, and skills that do not need the workflow guide. Each one is a later task that runs against the benchmark.
- `/flow:discuss` and `/flow:adopt` in the benchmark.
- A judge model that scores the code beyond the hidden tests.
- A `.gitattributes` rule that `/flow:adopt` writes into a project.
- Runs in the cloud or in CI.

## How to check the result
1. One command runs one setup once. It writes a result file with every figure of decision 11.
2. A `flow-agents` run starts one `flow:step-builder` agent per step, or its result records why not.
3. A run changes no file in this repository and pushes nothing to GitHub.
4. The hidden tests fail on the untouched sample project and pass on the reference solution.
5. In a Windows checkout, the hooks of the sample project refuse a commit on `main`.
6. The report command prints a table of the 9 pilot runs, with the median and the spread per setup.

## Open questions
1. Which test runner does the sample project use? `node --test` with the type stripping of Node needs no package. `vitest` is more common in real projects.
2. What is the subject of the sample project? It must be neutral and have 3 to 5 modules that a medium feature touches.
3. `/flow:checklist` needs a person. On Windows, `review_server.py` opens a browser and waits. Does the plugin get an environment variable that forces the prose fallback? Or does the driver skip `/flow:checklist`?
4. Does the JSON result of `claude -p` include the tokens of the step builder? When it does not, the driver reads the session logs of Claude Code.
