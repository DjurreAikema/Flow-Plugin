# Task 0004: review page

Date: 2 November 2026
Status: ready for PR
Mode: inline

## Goal
`/flow:checklist` records the review in a page in the browser, with a result and an optional comment per item. `/flow:discuss` and `/flow:adopt` ask every question that matters, without a limit per round.

## Origin
[BRIEF.md](BRIEF.md).

## Decisions

1. A local server serves the review page and receives the results. It uses Python 3 with the standard library only. It listens on `127.0.0.1` only, on a random port, with a random token in the URL.
2. The server opens the browser with the Python module `webbrowser`. It needs no command per operating system.
3. The server runs in the background. The skill repeats a wait command of at most 9 minutes until the result file exists. A review can then take longer than the time limit of the Bash tool. [Verify]
4. When the server cannot start, the agent fills the page itself and opens the file. The button "Finish" then downloads `checklist-results.json`. The developer tells the agent "done", and the agent reads the file.
5. When no browser can open, the agent lists the items. The developer replies in prose, for example "1 pass, 2 fail: the layout breaks". The multiple-choice question is removed.
6. A passed item with a comment gets a line `Note: <comment>`. A failed item gets a line `Open: <reason>`. "Note" is a term in the workflow guide.
7. The page and the server are in the plugin and stay generic (project rule 1). The skill reads them through `${CLAUDE_PLUGIN_ROOT}`.
8. `tools/verify.sh` checks the syntax of the server with `python3 -m py_compile`. It skips the check with ⚠️ when Python 3 is missing.
9. `/flow:discuss` and `/flow:adopt` have no limit on the number of questions per round. They ask first the questions whose answers shape other questions. A question that depends on another answer waits for the next round. Decision 6 of the design log still applies.
10. The setup of a project does not change. Project rule 6 needs no setup instruction.
11. Both changes are in one task, with one pull request. The developer chose this.
12. The mode is `inline`. The rule gives `agents`: 3 steps, and step 01 changes code. But the `flow:step-builder` agent is not in the agent list of the cloud session that builds this task (Discovery answer 1).

## Out of scope
- The Discovery of `/flow:implement-task`, and other question flows.
- A page for the review of a pull request.
- A change to the setup of a project.

## Tests
none. The project rules allow no automated tests. The verify script is the check.

## Changelog
### Changed
- `/flow:checklist` opens a review page in the browser. The developer marks each item as passed or failed, and can add a comment. "Finish" returns the results to the agent. Without Python 3, the page downloads a result file. Without a browser, the developer replies in prose. A comment on a passed item becomes a `Note:` line. `/flow:discuss` and `/flow:adopt` have no limit on questions per round, and ask the questions with the most impact first. Task: [0004-review-page](docs/tasks/_archive/0004-review-page/README.md).

## Steps
| # | Step | Status |
|---|------|--------|
| 01 | [Review page and server](01_REVIEW_PAGE.md) | verified |
| 02 | [Checklist skill](02_CHECKLIST_SKILL.md) | verified |
| 03 | [No question limit](03_NO_QUESTION_LIMIT.md) | verified |

## Discovery answers

```
🔍 Discovery: Task 0004 review page

⚠️ 1. The flow:step-builder agent is not in the agent list of this session.
      a) Switch to inline mode. I build and review each step myself      ← default
      b) Stay in agents mode, with a general-purpose agent that follows
         plugins/flow/agents/step-builder.md
⚠️ 2. Step 02 marks its test run ⏸️, but step 03 does not depend on it.
      The run needs a desktop, which this session does not have.
      a) Drop the ⏸️. Step 03 runs, and the item stays on the checklist      ← default
      b) Keep the ⏸️. I stop after step 02 until you have done the run
🧠 3. Step 02 says "the scratch folder of the session". Claude Code names no such folder.
      a) The skill makes a temporary folder with `mktemp -d`, outside the repository      ← default
      b) Use .flow/ in the repository, with a .gitignore entry

✅ Facts I checked
   1. The branch is feature/0004-review-page, and the tree is clean.   git status
   2. Verify passes on the branch.                                     sh tools/verify.sh
   3. The git hooks are on in this clone.                              core.hooksPath
   4. Python 3.13 is installed here, so I can test the server.         python3 --version
   5. This session runs Opus.                                          the session model
```

Answer: "go". Answers 1a, 2a and 3a.
