# Brief: /flow:release, a release set up per project

Date: 7 November 2026
Roadmap card: none

## Why
The developer wants a release skill in the plugin that stays generic. The first run sets up the release of the project. Later runs do what the setup decided, and the developer can change the setup later.

## What
A project runs `/flow:release`. Without a recipe, the skill talks the release through with the developer, like `/flow:discuss`. It writes the recipe to `docs/workflow/RELEASE.md` and opens a pull request. After the merge, `/flow:release` makes a release by the recipe. `/flow:release setup` reopens the conversation from the current recipe. This repository makes its releases with `/flow:release` too.

## Decisions
1. `/flow:release` is a skill of the plugin. Without a recipe, it runs the setup. With a recipe, it runs the release. `/flow:release setup` runs the setup again, and starts from the current recipe.
2. The recipe is `docs/workflow/RELEASE.md`. The config names it under "Records": `Release: docs/workflow/RELEASE.md`, or `none`. The setup counts as missing when the line is `none`, absent, or names a file that does not exist.
3. The template `templates/RELEASE.md` gives the recipe its sections: version scheme, version files, changelog, branch and pull request, tag, extra steps, and stops. Each section can say "none". The developer can add free text to each section.
4. The setup is a conversation like `/flow:discuss`. It uses the question format of `/flow:discuss`: directions, then one "My view" line. The developer decides every choice. The skill holds guidance per topic, never a fixed choice.
5. The guidance per topic:
   - How far a release goes: stop at the tag, or add a host release through the host guide. Extra commands, such as a publish command, can follow.
   - Version scheme: SemVer (the bump follows the changelog categories), CalVer, none (a tag without a version number), or a rule in free text.
   - Version files: the files that hold the version number, for example a package manifest.
   - Changelog: with the config changelog `direct`, the release dates the `Unreleased` section and adds a new empty one. With `none`, the release skips it.
   - Branch flow: a release branch with a pull request into the base branch, then a tag on the merge commit. Or a tag on the current commit of the base branch, without a release commit. Or a pull request into a release target branch, for git flow.
   - Tag: its format, for example `v<version>`, and whether it is annotated.
   - Stops: the steps where a run waits for approval. The setup names each step that cannot be undone, such as a tag push or a publish command.
6. The recipe decides the stops of a run. The setup always asks about the stops, and recommends a stop before each step that cannot be undone.
7. The branch guard stays, in every recipe. A run never commits on or pushes to a protected branch. A release reaches a protected branch only through a pull request. A recipe can release into a branch that is not protected, for example `main` with the base branch `develop`. Then the setup adds that branch to `PROTECTED` in both hooks.
8. The setup commits the recipe on the branch `feature/release-setup`, and opens a pull request into the base branch. The first release runs after the merge. `/flow:release setup` uses the same branch and pull request.
9. A run checks first: a clean working tree, the base branch equal to `origin`, the branch guard on, and the checks of the recipe. It stops when a check fails. When a step fails, it stops and reports. It never runs a failed publish step again on its own.
10. `/flow:adopt` does not ask about releases. It writes `Release: none` in the config, and its guidance names `/flow:release`.
11. The summary of a release run names the version number, the pull request link and the tag. The last line is `▶️ Next: /flow:whats-next`. The summary of a setup run gives the pull request link. Its last line is `▶️ Next: merge the pull request, then /flow:release`.
12. This repository uses `/flow:release`. `docs/workflow/RELEASE.md` holds the procedure of `.claude/skills/release/SKILL.md`. That is SemVer from the changelog categories, and the version in `plugins/flow/.claude-plugin/plugin.json`. It dates `CHANGELOG.md`, and uses the branch `release/<version>` with a pull request into `main`. An annotated tag `v<version>` goes on the merge commit. Its stops are the same as in the project skill. The project skill is removed.
13. Decision 42 of `docs/DESIGN.md` replaces the release part of decision 15. `/flow:discuss` added the row.

## Out of scope
- Built-in support for registries, stores or deploy targets. The recipe holds their commands.
- Release automation in CI, and rollback of a release.
- Changelog fragments, trackers and a git flow tool.
- A change of the branch guard itself, other than the `PROTECTED` list of a project.
- Changes to `/flow:discuss`, `/flow:build`, `/flow:roadmap` and `/flow:whats-next`.

## Map
- `plugins/flow/skills/release/SKILL.md`: new. Front matter `name: release` and a `description`, like `plugins/flow/skills/adopt/SKILL.md`. The conversation and the question format follow `plugins/flow/skills/discuss/SKILL.md`. The git commands follow `plugins/flow/reference/GIT.md`. Paths into the plugin use `${CLAUDE_PLUGIN_ROOT}` (project rule 2). The icon table and the summary rules follow the "Summary" section of `discuss`.
- `plugins/flow/templates/RELEASE.md`: new. The sections of decision 3, each with a placeholder in the style of `plugins/flow/templates/CONFIG.md`.
- `plugins/flow/templates/CONFIG.md`: add `- Release: <`docs/workflow/RELEASE.md` | none>` under "Records". Remove "a release process" from the examples of "Project rules".
- `plugins/flow/reference/WORKFLOW.md`: add a row for `/flow:release` to the helper table in section 1. Add section 13 "Releases" at the end: the setup, the recipe, the run, the stops and the branch guard. Keep every other section number.
- `plugins/flow/reference/GIT.md`: line 82. A release into `main` follows the recipe of `/flow:release`.
- `plugins/flow/skills/adopt/SKILL.md`: line 153, "Project-specific features". Releases leave the list and point to `/flow:release`. Step 3 of "Write the setup" writes `Release: none`.
- `plugins/flow/skills/tutorial/SKILL.md`: lesson 2 names `/flow:release` among the helpers.
- `README.md`: add a row for `/flow:release` to the "Commands" table.
- `docs/workflow/CONFIG.md`: add `- Release: docs/workflow/RELEASE.md` under "Records". Project rule 5 names `/flow:release` and the recipe.
- `docs/workflow/RELEASE.md`: new. The recipe of decision 12, from `.claude/skills/release/SKILL.md`.
- `.claude/skills/release/SKILL.md`: remove, with its folder.
- `AGENTS.md`: the row `/release` in "Commands" becomes `/flow:release`.
- `docs/DESIGN.md`: section 2 adds the release to the scope, and removes "Releases, version numbers" from "Out of scope". Section 3.3, the last sentence of its last paragraph: task 0003 removed the releases, and decision 42 brought them back as a recipe. Section 3.1 lists the release skill only when it lists skills.
- `tools/verify.sh`: read only. It checks the plugin paths, the icons and the style of the new files.

## Parts
1. The skill and the templates: `/flow:release` with the setup and the run, the recipe template, and the `Release` line of the config template. Files: `plugins/flow/skills/release/SKILL.md`, `plugins/flow/templates/RELEASE.md`, `plugins/flow/templates/CONFIG.md`.
2. The plugin docs: the workflow guide, the git guide, `adopt`, `tutorial` and the README. Files: `plugins/flow/reference/WORKFLOW.md`, `plugins/flow/reference/GIT.md`, `plugins/flow/skills/adopt/SKILL.md`, `plugins/flow/skills/tutorial/SKILL.md`, `README.md`.
3. This repository: its recipe and config, the removal of the project skill, `AGENTS.md`, the design and the changelog. Files: `docs/workflow/RELEASE.md`, `docs/workflow/CONFIG.md`, `.claude/skills/release/SKILL.md`, `AGENTS.md`, `docs/DESIGN.md`, `CHANGELOG.md`.

## Tests
none. The test rule of the config is `none`. The verify script is the check.

## Human checklist
- [ ] Run `/flow:release` twice in a test project. The first run talks the release through, writes the recipe and opens its pull request. After the merge, the second run follows the recipe.
  Why: A skill change needs a run on a test project (project rule 4), and only a person can judge the conversation.
- [ ] Read `docs/workflow/RELEASE.md` of this repository. It describes the same release as the old `/release`.
  Why: Judging a text needs a human.

## Changelog
Added: `/flow:release` makes a release in the way of the project. Its first run talks the release through with the developer, and writes a recipe to `docs/workflow/RELEASE.md` through a pull request. Later runs follow the recipe, and `/flow:release setup` changes it. A project with a config can add the line `Release: none` under "Records". Task: [0013-release-skill](docs/tasks/_archive/0013-release-skill/BRIEF.md).

## Open questions
none

## Outcome

| What changed | Why | What it affects |
|--------------|-----|-----------------|
| The recipe of this repository has an extra section "Checks". | The run checks the recipe first (decision 9). The template has no section for these checks, and the developer can add free text. | `docs/workflow/RELEASE.md` |
| The quick setup block of `/flow:adopt` names `Release none` among the defaults. | Step 3 of "Write the setup" writes `Release: none`, so the block shows it. | `plugins/flow/skills/adopt/SKILL.md` |
| Decision 42 ends with `(task 0013)`. | Every other row names its task. | `docs/DESIGN.md` |
