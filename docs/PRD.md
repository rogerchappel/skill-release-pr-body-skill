# Product Requirements: Skill Release PR Body Skill

## Summary

Generate release-candidate PR bodies for agent-skill repos from local release
evidence, commit groups, and risk notes.

## Users

- Agents opening release-candidate PRs.
- Maintainers reviewing generated releases.
- Automation lanes that need consistent PR body sections.

## Problem

Generated PR bodies can be vague, overconfident, or disconnected from the
actual release evidence. A local-first generator should preserve verification,
documentation, and safety facts without pretending to approve the release.

## MVP

- Parse a markdown release dossier.
- Group commits into implementation, tests, docs, and release readiness.
- Render summary, verification, docs, safety, risks, and reviewer checklist.
- Support fixture-backed tests and smoke command.

## Non-Goals

- No GitHub writes.
- No automatic PR creation.
- No maintainer approval decisions.
