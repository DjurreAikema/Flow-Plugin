---
name: release
description: Make a SemVer release of the flow plugin in this repository. Suggest the version number, date the changelog, set the plugin version, and tag v<version number>. Use only in this repository.
---

# /release

Make a release of the `flow` plugin. This is a project skill of this repository, not a skill of the plugin. Project rule 5 of `docs/workflow/CONFIG.md` applies.

Input: none, or the version number that the developer wants.

## Before you start

1. Read `AGENTS.md`, `docs/workflow/CONFIG.md`, `plugins/flow/reference/GIT.md` and `plugins/flow/reference/WRITING_STYLE.md`.
2. Run the checks before work of `plugins/flow/reference/GIT.md`. Stop when one fails.
3. Stop when the working tree has uncommitted changes. Report them.
4. Fetch `origin`. Stop when the local `main` differs from `origin/main`. Report the difference.
5. Stop when the `Unreleased` section of `CHANGELOG.md` is empty.
6. Stop when a `release/` branch exists, local or remote. Report it.

## Version numbers

Version numbers follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). The tag is the version number with a `v` prefix, for example `v0.3.1`.

1. Raise MINOR for new content or features. Set PATCH to 0.
2. Raise PATCH for a release with only fixes.
3. An "Added", "Changed" or "Removed" entry suggests MINOR. Only "Fixed" entries suggest PATCH.
4. The developer picks the version number.

## Pick the version number

1. Find the newest `v*` tag. When there is none, the current version number is `0.0.0`.
2. Read the entries of the `Unreleased` section.
3. Suggest the bump by the rules above.
4. Show the current version number, the suggested version number, the reason, and the entries. Wait for the developer to pick the version number.

## Release

1. Update `main` from `origin`. Create the branch `release/<version number>` from `main`.
2. In `CHANGELOG.md`: rename `## [Unreleased]` to `## [<version number>] - <YYYY-MM-DD>`. Add a new empty `## [Unreleased]` above it.
3. In `plugins/flow/.claude-plugin/plugin.json`: set `version` to the version number (project rule 5).
4. Run `sh tools/verify.sh`. Stop when it fails.
5. Show the diff. Wait for approval.
6. Commit: `release <version number>: update the changelog and the version`.
7. Ask the developer for approval. Push the branch. Open a pull request into `main` by `plugins/flow/reference/GIT.md`, "Open a pull request". Use the new changelog section as the description.
8. Wait until the developer says that the pull request is merged.
9. Fetch `main`. Find the merge commit of the pull request. Ask the developer for approval. Tag it: `git tag -a v<version number> -m "v<version number>" <commit>`. Push the tag: `git push origin v<version number>`. The branch guard lets a tag push through.
10. Check that the tag `v<version number>` exists on `origin`, on the merge commit.

## Summary

End with a session summary (`plugins/flow/reference/WORKFLOW.md` section 11), with the version number, the pull request link and the tag. The last line is:

`▶️ Next: /flow:whats-next`
