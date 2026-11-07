#!/bin/sh
# Set up a Claude Code cloud session for this repository.
# The SessionStart hook in .claude/settings.json runs it.
# It registers the marketplace of this working tree and installs the flow plugin.
# It writes .claude/settings.local.json. Git does not track that file.
set -e
cd "$(dirname "$0")/.."
claude plugin marketplace add ./ --scope local < /dev/null
claude plugin install flow@ai-workflow --scope local < /dev/null
git config core.hooksPath tools/git-hooks
