# Step 06: Repository docs and changelog

Date: 2 November 2026

## Goal
The design, the README and the backlog brief match the core, and the changelog holds the entry of the task.

## Context to read
- `docs/tasks/0003-standalone-core/README.md`
- `docs/tasks/0003-standalone-core/BRIEF.md`
- `plugins/flow/reference/GIT.md` and `plugins/flow/reference/WORKFLOW.md`, as steps 01 and 02 left them
- `docs/DESIGN.md`
- `README.md`
- `docs/tasks/_backlog/azure-devops-trial/BRIEF.md`
- `CHANGELOG.md`

## Files touched
- `docs/DESIGN.md` (changed)
- `README.md` (changed)
- `docs/tasks/_backlog/azure-devops-trial/BRIEF.md` (changed)
- `CHANGELOG.md` (changed)

## Work
1. In `docs/DESIGN.md` section 2: the scope is the loop, the backlog, `whats-next`, `tutorial` and the branch guard. Remove `release` and the tracker. Add removed features to "Out of scope for now", with the route through project rules and project skills.
2. In `docs/DESIGN.md` sections 3.1 to 3.3: remove the tracker guide, the `fragments` row and the extras. Describe the branch guard in section 3.3.
3. In `docs/DESIGN.md` section 4: mark decisions 5 and 11 as replaced. Add a row per task decision 3, 5 to 8 and 10. The changes to the archive (task decision 1) get a row too.
4. In `docs/DESIGN.md` section 5: remove "and Azure Boards" from open question 2.
5. In `README.md`: name the branch guard in the introduction.
6. In the brief `azure-devops-trial`: remove decision 2 about the git hooks, decision 4 and open question 2. Renumber the decisions and the open questions. Remove "and Azure Boards" from "Why".
7. Copy the "Changelog" entry of the task file to the `Unreleased` section of `CHANGELOG.md`, under "Changed".

## Review checklist
none

## Docs to update
The files under "Files touched".

## Out of scope
- The archived tasks. Step 07 does this.
- The existing entries of the changelog.

## Outcome

Status: implemented
Verify: passed

### Choices made
- Scope section 2 adds the branch guard as item 4. The removed features and the extension points go under "Out of scope for now", with the route through project rules and project skills.
- Section 3.3 describes the two hooks and says that host protection is an addition.
- The decision log gets decisions 14 to 19. Decision 5 points to 16, and decision 11 points to 14 and 15. Decision 4 was replaced already, so it stays as it is.
- The brief `azure-devops-trial` keeps the base branch and the branch policy in decision 2. Only "Git hooks stay off" goes, because the branch policy is still useful next to the branch guard.
- The changelog entry goes under the existing "Changed" heading, after the entry of task 0001.

### Deviations
none
