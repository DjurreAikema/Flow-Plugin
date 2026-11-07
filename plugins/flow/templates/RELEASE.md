# Release recipe

Date: <D Month YYYY>

How this project makes a release. `/flow:release` follows this recipe, step by step. `/flow:release setup` changes it through a pull request. Write "none" in a section that does not apply. Add free text to any section.

## Version scheme
<SemVer: the changelog categories suggest the bump | CalVer: <format> | none: a tag without a version number | a rule in free text>

## Version files
<the files that hold the version number, each with the field to set, or none>

## Changelog
<date the `Unreleased` section of <changelog file> and add a new empty one | none>

## Branch and pull request
Pick one flow:

- Release branch: <`<name>`, with a pull request into <branch>. The tag goes on the merge commit.>
- Tag only: <the tag goes on the current commit of <branch>, without a release commit.>
- Release target: <a pull request from <base branch> into <release target branch>.>

## Tag
- Format: <for example `v<version>`>
- Annotated: <yes, with the message `<message>` | no>

## Extra steps
<the steps after the tag, each with its command, for example a host release or a publish command, or none>

## Stops
The steps where a run waits for approval. A stop comes before each step that cannot be undone.

- <step>
