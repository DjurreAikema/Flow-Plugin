# Brief: first run on Azure DevOps

Date: 2 November 2026

## Why
Every command in the Azure DevOps guide has the `[Verify]` marker. Nobody ran them yet. The developer wants to use the plugin at work, where the team uses Azure DevOps. A first real run shows which commands work.

## What
The plugin runs the whole loop on a test repository in Azure DevOps, from `/flow:adopt` to `/flow:finish-task`. The run has a real pull request and a review comment. The guides then hold only commands that worked.

## Decisions

1. Use a test repository, not a project of the team.
2. Use the base branch `main`, with a branch policy on it next to the branch guard of the plugin.
3. Remove the `[Verify]` marker of each command that worked. Fix or replace each command that did not.

## Out of scope
- Changes for a real project of the team.
- Other hosts.

## How to check the result
1. The pull request of the test task exists in Azure DevOps, with the description of `/flow:finish-task`.
2. `/flow:finish-task` reads a review comment and replies to it.
3. The Azure DevOps guide has no `[Verify]` marker on a command that the run used.

## Open questions
1. Which Azure DevOps organization and project can hold the test repository?
