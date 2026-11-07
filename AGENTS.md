# flow plugin: agent rules

Date: 2 November 2026

This repository holds `flow`, a Claude Code plugin that runs a fenced, documented AI workflow in any project. The repository is a plugin marketplace too. It uses its own plugin for its own work.

## Read these first

| Document | When to read it |
|----------|-----------------|
| `docs/workflow/CONFIG.md` | Always. The choices and rules of this repository. |
| `plugins/flow/reference/WORKFLOW.md` | How work happens here, and what the plugin does, for a person. The `/flow:` skills hold their own rules. |
| `docs/DESIGN.md` | Before any change to the plugin. Why it is built this way. |
| `plugins/flow/reference/WRITING_STYLE.md` | Before you write any document. |
| `CHANGELOG.md` | To see what changed recently. |

## Layout

| Path | Holds |
|------|-------|
| `.claude-plugin/marketplace.json` | The marketplace. It lists the `flow` plugin. |
| `plugins/flow/` | The plugin: manifest, skills, agent, reference guides and templates. |
| `.claude/skills/` | The project skills of this repository. They are not part of the plugin. |
| `docs/` | The design, the config and the tasks of this repository. |
| `tools/` | The verify script and the git hooks. |
| `bench/` | The benchmark of the workflow: a sample project, a pilot feature, the driver, the report and the results. |

## Commands

| Command | Use |
|---------|-----|
| `sh tools/verify.sh` | Validate the plugin and check its paths, style and hooks. Exit code 0 means pass. |
| `git config core.hooksPath tools/git-hooks` | One-time setup of a clone. It switches on the branch guard. |
| `/release` | Make a release of the plugin. A project skill of this repository. |
| `python bench/run.py --setup <setup> --plugin plugins/flow --runs 3` | Run the benchmark for one setup. It uses the Claude subscription of the developer. See `bench/README.md`. |
| `python bench/report.py` | Print the report of the finished benchmark runs. |
| `sh tools/cloud-setup.sh` | Set up a Claude Code cloud session: install the plugin of this working tree and switch on the branch guard. The SessionStart hook in `.claude/settings.json` calls it. |
| `claude --plugin-dir plugins/flow` | Start Claude Code with the plugin of this working tree. Use it to work on this repository with its own skills. |

## Hard rules

1. Build only what the brief names. Respect every "Out of scope" section.
2. Follow the project rules in `docs/workflow/CONFIG.md`.
3. Never invent a changelog entry. Copy the entry of the brief.
4. Never change a decision in the decision log of `docs/DESIGN.md` on your own. Ask the developer.

## Workflow rules

1. Never commit on `main`. Work on the feature branch of the task.
2. Commit only through the `/flow:` skills, or when the developer asks. Never skip git hooks with `--no-verify`.
3. When the code and the docs disagree, report the difference. Do not silently change either one.
4. Mark a fact that you cannot verify with `[Verify]`.
5. Ask only the questions that matter. Zero questions is a valid result.
