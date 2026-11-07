# Release recipe

Date: 7 November 2026

How this repository makes a release of the `flow` plugin. `/flow:release` follows this recipe, step by step. `/flow:release setup` changes it through a pull request. Project rule 5 of `docs/workflow/CONFIG.md` applies.

## Checks
Stop when a check fails, and report it.

1. The `Unreleased` section of `CHANGELOG.md` has entries.
2. No `release/` branch exists, local or remote.

## Version scheme
SemVer, by [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

1. Find the newest `v*` tag. Without a tag, the current version number is `0.0.0`.
2. Raise MINOR for new content or features. Set PATCH to 0.
3. Raise PATCH for a release with only fixes.
4. An "Added", "Changed" or "Removed" entry suggests MINOR. Only "Fixed" entries suggest PATCH.
5. Show the current version number, the suggested number, the reason and the entries. The developer picks the version number.

## Version files
- `plugins/flow/.claude-plugin/plugin.json`: set `version` to the version number.

## Changelog
In `CHANGELOG.md`, rename `## [Unreleased]` to `## [<version>] - <YYYY-MM-DD>`. Add a new empty `## [Unreleased]` above it.

## Branch and pull request
Release branch: `release/<version>`, with a pull request into `main`. The tag goes on the merge commit.

1. Update `main` from `origin`. Create the branch `release/<version>` from `main`.
2. Change the changelog and the version file.
3. Run `sh tools/verify.sh`. Stop when it fails.
4. Commit: `release <version>: update the changelog and the version`.
5. Push the branch. Open the pull request into `main`. Use the new changelog section as the description.
6. Wait until the developer says that the pull request is merged.

## Tag
- Format: `v<version>`
- Annotated: yes, with the message `v<version>`

Fetch `main`, and find the merge commit of the pull request. Tag it: `git tag -a v<version> -m "v<version>" <commit>`. Push the tag: `git push origin v<version>`. The branch guard lets a tag push through. Check that the tag exists on `origin`, on the merge commit.

## Extra steps
none

## Stops
The steps where a run waits for approval. A stop comes before each step that cannot be undone.

- The version number: the developer picks it.
- The commit: show the diff first.
- The push of the branch and the pull request.
- The merge: the developer merges the pull request.
- The tag and its push.
