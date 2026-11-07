---
name: tutorial
description: Explain a flow project, the flow workflow, or both to a collaborator, step by step, with an optional dry run on a toy task. Use when someone asks what the project is, how the workflow works, or how to start.
---

# /flow:tutorial

Explain the project, the workflow, or both. The reader is a collaborator: the developer, a new team member, or a fresh agent.

## Before you start

1. Read `AGENTS.md`, `docs/workflow/CONFIG.md`, `${CLAUDE_PLUGIN_ROOT}/reference/WORKFLOW.md`, and the writing style of the config. Skip a file that this session already holds and did not edit.
2. When `docs/workflow/CONFIG.md` does not exist, explain the workflow only, and end with `/flow:adopt`.
3. Ask what the reader wants:
   - The project: what it is, and where it stands.
   - The workflow: how work happens in this repository.
   - Both. Start with the project.

   End the message with `👉 Reply "project", "workflow" or "both".`
4. For the workflow track, also ask how much the reader knows already:
   - Nothing. Explain everything.
   - I know AI coding tools. Explain only this workflow.
   - I know the workflow. Show me only the commands and the choices of this project.

   End the message with `👉 Reply with the level that fits you.`

## Lesson format

Teach one lesson per message.

1. Start the lesson with a header: `Lesson N of M: <title>`.
2. End the lesson with this sentence. Fill in the blanks:

   `👉 Reply **continue** for lesson <N+1> (<title>), ask a question, or **skip** to <target>.`

3. On the last lesson of a track, leave out "skip":

   `👉 Reply **continue** for <target>, or ask a question.`

4. "Skip" ends the current track. The target of the project track is the offer of the workflow track. The target of the workflow track is the offer of the dry run.

## Project track

Read the content from the repository at the time of the tutorial. Do not use knowledge from an earlier conversation.

1. **What it is.** The summary of the config, and the `README.md`.
2. **The scope.** The scope document of the config, when it names one.
3. **Where things stand.** The `/flow:whats-next` status. When the config names a roadmap, show each milestone with its done cards out of all cards and its target date.
4. **Where to read more.** The documents of the config "Docs".

After the project track, offer the workflow track.

## Workflow track

Keep each lesson short. Use an example from this project in each lesson. Explain the choices of this project from the config, not every option of the plugin.

1. **The idea.** A good brief first, then an autopilot build. A record in git, and no scope creep. The brief is the context for the agent.
2. **The loop.** Two skills: `/flow:discuss` writes the brief, and `/flow:build` builds it and opens the pull request. The 4 options at the end of `/flow:discuss`, and the backlog. Then the helpers: `/flow:whats-next`, `/flow:tutorial`, `/flow:roadmap`, `/flow:release` and `/flow:test-plan`.
3. **The brief.** The task ID of this project. Each section of the brief: the decisions, "Out of scope", the map, the parts, the tests, the human checklist and the changelog entry. Why the map matters: the build reads only its files.
4. **The build.** The build runs in a new session, without approvals. One commit per part, and the verify command after each part. It stops in three cases only. The verify command fails and it cannot fix it. The work is out of scope. The work contradicts the brief. Every other change is a deviation in the pull request.
5. **Testing and the human checklist.** The test plan of this project is `docs/workflow/TESTING.md`. It says which code gets tests, the test types, how tests are written, and what a person checks. `/flow:test-plan` changes the plan in a conversation. How the brief names the code, the type and the reason of each test, by a rule of the plan. The old-code policy of the plan. The coverage report, when the config has a coverage command. The human checklist: checks that are cheap for a person and expensive for an agent. The reviewer ticks them in the pull request.
6. **Git and the host.** The four git facts: the base branch, the feature branch per task, the pull request, and the branch guard. Show what the hooks refuse, and the setup command of each clone. The host of this project, and how its pull requests open.
7. **The changelog.** The style of this project: `direct` or `none`. Explain that the brief holds the entry and the build only copies it.
8. **The roadmap.** How `/flow:roadmap` turns client requests into milestones and cards, and why the repository holds only a summary of each request. The card name, `/flow:discuss <card title>`, and the `Roadmap card` line of the brief. Why nobody writes a status: `/flow:whats-next` derives it from the archived briefs. Use a milestone of this project when the config names a roadmap, or a neutral example otherwise.

## Dry run (optional)

After the lessons, offer a dry run. Walk through a toy task of this project. Show what each skill would produce: the brief, the commits of the build, the pull request description and the session summaries.

Show the files in the conversation only. Do not write files. Do not create a branch. Do not commit.

## End

End with the commands in one table, and this line:

`▶️ Next: /flow:discuss <topic>`
