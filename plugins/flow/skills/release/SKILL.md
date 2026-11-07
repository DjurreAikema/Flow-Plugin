---
name: release
description: Make a release of the project in the way of the project. The first run talks the release through with the developer and writes a recipe to docs/workflow/RELEASE.md through a pull request. Later runs follow the recipe. Use /flow:release setup to change the recipe.
---

# /flow:release

Make a release of the project. The project decides how it releases. Its recipe `docs/workflow/RELEASE.md` holds every step and every stop. The plugin holds only the setup conversation and the engine that follows the recipe.

Input: none, `setup`, or the version number that the developer wants.

## Before you start

1. Read `docs/workflow/CONFIG.md`. Stop when it does not exist. Tell the developer to run `/flow:adopt`. `AGENTS.md` is in the session already.
2. Find the recipe. Read the line `Release` under "Records" of the config. The recipe is missing when the line is `none`, absent, or names a file that does not exist.
3. Pick the mode:

   | Input | Recipe | Mode |
   |-------|--------|------|
   | `setup` | Any | Setup. Start from the current recipe, when it exists. |
   | None, or a version number | Missing | Setup. |
   | None, or a version number | Exists | Run. |

4. Read a file only once per session, unless you edited it.

## Setup

The setup writes the recipe. It is a conversation, like `/flow:discuss`. The developer decides every choice.

### Inspect

Read the repository before you ask anything. Ask only what the repository cannot answer.

1. The version files: a package manifest, a plugin manifest, a version constant, or a project file with a version field.
2. The tags: `git tag --list --sort=-creatordate`. The newest tags show the tag format and the version scheme.
3. The changelog: the setting "Changelog" of the config, and the sections of the changelog file.
4. The branches: the base branch of the config, a `main` or `master` branch next to it, and `release/` branches.
5. The branch guard: `PROTECTED` in the hooks of the setup command of the config.
6. The release commands: publish or deploy commands in the files of the stack and in the CI config.
7. With `setup` and an existing recipe: read the recipe. Report each section, and ask which sections to change.

### The conversation

The developer leads. You explain, inform and recommend. You do not steer.

1. Report what you found, in short: the version files, the tags, the changelog, the branches and the release commands.
2. Ask open questions in prose. Do not use the multiple-choice tool.
3. Ask every question whose answer changes the recipe. Ask first the questions whose answers shape other questions.
4. List every realistic direction. Never add a filler direction. Keep the recommendation separate, as one "My view" line with its reason.
5. Always ask about the stops. Recommend a stop before each step that cannot be undone.
6. When an answer is vague, ask a follow-up question.
7. Stop asking when every section of `${CLAUDE_PLUGIN_ROOT}/templates/RELEASE.md` has a value.
8. End each round of questions with one line: `👉 Reply to the questions in your own words.`

### Question format

```markdown
**<Number>. <The question, in one sentence>**

- **What this is about:** <the subject, in simple words>
- **Why it matters:** <what the answer changes>
- **Directions:**
  - <Direction>: <what it means>. <Its trade-offs.>
- **What I need from you:** <the kind of answer that helps>

**My view:** <the recommendation, with the reason>
```

Leave out "Directions" when the question is truly open.

### Guidance per topic

Use these facts in your directions and your view. They are guidance, never a fixed choice.

- **How far a release goes:** a release can stop at the tag. It can add a host release through the host guide of the config. Extra commands, such as a publish command, can follow.
- **Version scheme:**
  - SemVer: the changelog categories suggest the bump. "Added", "Changed" or "Removed" suggest MINOR. Only "Fixed" suggests PATCH. The developer picks the number.
  - CalVer: the version number is a date, for example `2026.11.0`.
  - None: a tag without a version number, for example a date or a build number.
  - A rule in free text.
- **Version files:** the files that hold the version number, for example a package manifest. A release sets the number in each file.
- **Changelog:** with the config changelog `direct`, the release renames `Unreleased` to the version number and the date, and adds a new empty `Unreleased` section. With `none`, the release skips the changelog.
- **Branch flow:**
  - A release branch, for example `release/<version>`, with a pull request into the base branch. The tag goes on the merge commit.
  - A tag on the current commit of the base branch, without a release commit. This works only without version files and without a changelog step.
  - A pull request into a release target branch, for git flow. An example is a pull request from `develop` into `main`.
- **Tag:** its format, for example `v<version>`, and whether it is annotated. An annotated tag holds a message and a date.
- **Stops:** the steps where a run waits for approval. Name each step that cannot be undone, such as a tag push or a publish command. A failed publish step never runs again without the developer.
- **Branch guard:** it stays in every recipe. A release reaches a protected branch only through a pull request. A release target branch that is not protected joins `PROTECTED` in both hooks.

### Write the recipe

1. Show a short summary of the recipe. End the message with `👉 Reply "go" to write this recipe through a pull request, or name the changes.` Wait for the reply.
2. Run the checks before work:
   - The working tree is clean: `git status --porcelain` prints nothing.
   - The base branch of the config exists on `origin`: `git ls-remote --heads origin <base>` prints a line.
   - The branch guard is on: `git config core.hooksPath` prints the hooks folder of the setup command of the config.
3. Run `git switch <base> && git pull --ff-only origin <base>`. When `feature/release-setup` exists on `origin`, switch to it and pull it. Otherwise, run `git switch -c feature/release-setup <base>`.
4. Write `docs/workflow/RELEASE.md` from `${CLAUDE_PLUGIN_ROOT}/templates/RELEASE.md`. Write "none" in a section that does not apply. Keep the free text of the developer in each section.
5. In the config, set the line `Release: docs/workflow/RELEASE.md` under "Records". Add the line when it is absent.
6. When the recipe releases into a branch that is not protected, add that branch to `PROTECTED` in both hooks of the setup command.
7. Run the verify command of the config. Fix the failures in the files of this setup.
8. Commit: `release setup: write the release recipe`. Push with `git push -u origin feature/release-setup`.
9. Open the pull request into the base branch. When a pull request of `feature/release-setup` is open already, the push updates it. With the host `github` or `azure-devops`, use the command of `${CLAUDE_PLUGIN_ROOT}/reference/hosting/GITHUB.md` or `${CLAUDE_PLUGIN_ROOT}/reference/hosting/AZURE_DEVOPS.md`. With another host, or when the tool fails, give the developer the link from the push output. Use the summary of step 1 as the description.
10. Switch back to the base branch.

## Run

The run follows the recipe, step by step. The recipe decides the steps and the stops. This section holds only the rules that apply to every recipe.

### Checks before the run

Stop when a check fails. Report the problem and the fix.

1. The working tree is clean: `git status --porcelain` prints nothing.
2. The base branch exists on `origin`, and the local base branch equals it. Run `git fetch origin <base>`, then compare `git rev-parse <base>` with `git rev-parse origin/<base>`.
3. The branch guard is on: `git config core.hooksPath` prints the hooks folder of the setup command of the config.
4. The checks of the recipe, for example a changelog section with entries, or no open release branch.

### Steps

1. Do the steps of the recipe in its order. Do not add a step. Do not skip a step.
2. Pick the version number by the version scheme of the recipe. Show the current version number, the suggested number and the reason. Wait for the developer to pick the number. A version number in the input is the pick.
3. At each stop of the recipe, show what the next step does. End the message with `👉 Reply "go" to <the step>, or name the changes.` Wait for the reply.
4. Never commit on a protected branch, and never push to one. A release reaches a protected branch only through a pull request.
5. Open a pull request into a protected branch with the host guide of the config. With another host, or when the tool fails, give the developer the link from the push output.
6. When the recipe waits for a merge, ask the developer to merge the pull request. End the message with `👉 Reply "merged" when the pull request is merged.`
7. When a step fails, stop. Report the step, the output and the options. Never run a failed publish step again on its own. End the message with `👉 Reply with how to continue.`
8. After the tag push, check that the tag exists on `origin`, on the right commit: `git ls-remote --tags origin <tag>`.

## Summary

End with a session summary of 8 lines or fewer. Use only these icons:

| Icon | Meaning |
|------|---------|
| ✅ ❌ | Done, failed. |
| ⚠️ | A risk. |
| 👉 | Waits for a reply. |
| ▶️ | The next command. |
| ❓ 🔍 | Questions, findings. |
| 🤖 📁 | Automated checks, files. |

| Mode | The summary names | Last line |
|------|-------------------|-----------|
| Setup | The pull request link. | `▶️ Next: merge the pull request, then /flow:release` |
| Run | The version number, the pull request link and the tag. | `▶️ Next: /flow:whats-next` |

Never put the summary, a 👉 line or a ▶️ line inside a code block. The last line of the message must be the 👉 line or the ▶️ line itself.
