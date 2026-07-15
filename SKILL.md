# Skill Release PR Body Skill

Use this skill when an agent has local release evidence and needs a clear,
grounded release-candidate PR body for an agent-skill repository.

## Inputs

- A markdown release dossier.
- Optional git commit log.
- Optional risk notes.

## Side-Effect Boundaries

This skill only reads local files and prints or writes a markdown PR body when
`--out` is supplied. It must not open PRs, push branches, merge, tag, publish, or
call external services.

## Workflow

1. Generate or collect a release dossier.
2. Save recent commits with `git log --oneline`.
3. Run the CLI and review the generated body.
4. Paste the body into a PR only after checking verification and safety claims.

## Example

```bash
node bin/skill-release-pr-body.js --dossier release-dossier.md --commits commits.txt --out pr-body.md
```

## Validation

```bash
npm test
npm run check
npm run smoke
```
