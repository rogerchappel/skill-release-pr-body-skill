# Skill Release PR Body Skill

Generate a release-candidate PR body from local evidence. The CLI reads a
release dossier, optional commits, and optional risk notes, then produces a
reviewable markdown body with verification and safety sections.

## Quickstart

```bash
npm install
npm run smoke
node bin/skill-release-pr-body.js --dossier fixtures/dossier.md --commits fixtures/commits.txt
```

## CLI

```bash
skill-release-pr-body --dossier <file> [--commits <file>] [--risks <file>] [--out <file>] [--json]
```

## Output Sections

- Summary
- Commit groups
- Verification
- Documentation
- Safety
- Known limits and risks
- Reviewer checklist

## Safety

This tool is local-first and read-only unless `--out` is supplied. It does not
open PRs, push branches, tag releases, publish packages, or call external
services.

## Validation

```bash
npm test
npm run check
npm run smoke
bash scripts/validate.sh
```
