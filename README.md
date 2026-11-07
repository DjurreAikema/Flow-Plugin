# flow: an AI workflow for Claude Code

Date: 2 November 2026

`flow` is a Claude Code plugin. It runs a fenced, documented workflow for work with an AI agent, in any project:

| # | Phase | Skill | Result |
|---|-------|-------|--------|
| 1 | Discuss | `/flow:discuss` | A brief: the decisions, a map of the files, the parts, the tests and a human checklist. |
| 2 | Build | `/flow:build` | The parts built and committed, the brief archived, and a pull request open. |

You and the agent settle the work in the discussion. The build then runs on autopilot, in a new session. It stops only when the verify command fails and it cannot fix it, or when the work leaves the brief. The pull request lists each deviation, and holds the human checklist for you to tick.

## Long-term planning

`/flow:roadmap` turns client requests into a roadmap. Paste a mail, an export of a tracker or a report. The agent writes a summary of each request in its own words, and talks the plan through with you. The result is a set of milestones in `docs/roadmap/`, each with short cards, an order and an optional target date. Run `/flow:discuss <card title>` to turn a card into a brief. `/flow:whats-next` derives the progress of each milestone from the finished tasks.

The plugin works in any git project, for one developer or a team. It needs a base branch, a feature branch per task and a pull request. Two git hooks guard the base branch: they refuse a commit on it and a push to it, so work reaches it only through a pull request. On GitHub and Azure DevOps, the agent opens the pull request itself. On other hosts, you open it from the link that the agent gives.

## Install

Add this repository as a marketplace, then install the plugin:

```sh
claude plugin marketplace add DjurreAikema/Flow-Plugin
claude plugin install flow@ai-workflow
```

Install at the project scope to enable the plugin for everyone who works in a project.

### Try it without an install

To test the plugin, copy the folder `plugins/flow` to any place on your machine. Start Claude Code in your project with:

```sh
claude --plugin-dir <path to the copy>/flow
```

The `/flow:` skills are available in that session. Nothing is installed, and you need no access to this repository.

## Set up a project

In the project, run:

```
/flow:adopt
```

The skill inspects the repository: the host, the branches, the build and test commands, and the docs. It shows a quick setup: the values that it found and a default for every other setting, in one block. Reply "go" to accept it, or "full" to talk each choice through. The skill then opens a pull request with `docs/workflow/CONFIG.md` and `AGENTS.md`. It does not change the code of the project.

Run `/flow:adopt` again later to review the setup with the full conversation.

Then run `/flow:tutorial` to learn the workflow, or `/flow:discuss <topic>` to start.

## Commands

| Command | What it does |
|---------|--------------|
| `/flow:adopt` | Sets up the workflow in a project. It writes the config and the agent rules through a pull request. Run it once, or again to review the setup. |
| `/flow:discuss <topic>` | Talks a feature through with you, and writes a brief. You then build it now or put it in the backlog. Start every task here. |
| `/flow:build <brief folder>` | Builds a brief on autopilot, in a new session, and opens the pull request. Use `docs/tasks/_new` after a discussion, or `docs/tasks/_backlog/<slug>` for a backlog brief. |
| `/flow:roadmap` | Turns client requests into milestones and cards, or adds new requests to the roadmap. |
| `/flow:release` | Makes a release in the way of the project. The first run talks the release through, and writes a recipe through a pull request. Later runs follow the recipe. |
| `/flow:whats-next` | Shows where the project stands, and recommends the next step. It changes nothing. Say "details" for more. |
| `/flow:tutorial` | Explains the project, the workflow or both, step by step. It can do a dry run on a toy task. |

## Documentation

| Document | Holds |
|----------|-------|
| [The workflow guide](plugins/flow/reference/WORKFLOW.md) | How the workflow works, and every setting. |
| [The design](docs/DESIGN.md) | Why the plugin is built this way. |
| [The changelog](CHANGELOG.md) | What changed. |

## Work on the plugin

This repository uses its own workflow. See `AGENTS.md`. To use the skills of your working tree, start Claude Code with:

```sh
claude --plugin-dir plugins/flow
```

## License

MIT. See [LICENSE](LICENSE).
