# Skill Release PR Body Skill

Generate a release-candidate PR body from local evidence. The CLI reads a
release dossier, optional commits, and optional risk notes, then produces a
reviewable markdown body with verification and safety sections.

## Quickstart

From a source checkout:

```bash
npm install
npm run smoke
node bin/skill-release-pr-body.js --dossier fixtures/dossier.md --commits fixtures/commits.txt
```

As an installed package, pass paths to your own release evidence:

```bash
npm install skill-release-pr-body-skill
npx skill-release-pr-body --dossier release-dossier.md --commits commits.txt --out pr-body.md
```

The published package includes the example fixtures, so its self-contained
smoke command can also be run from `node_modules/skill-release-pr-body-skill`.

## CLI

```bash
skill-release-pr-body --dossier <file> [--commits <file>] [--risks <file>] [--out <file>] [--json]
```

`--dossier` is required. Each file option must be followed by a path; missing
values, flag-like values, and unknown arguments print a usage diagnostic and
exit nonzero. `--help` and `-h` print usage and exit successfully.

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
npm run test:package
bash scripts/validate.sh
```

`npm run test:package` packs the module, installs the tarball in a disposable
consumer project, runs the installed package's smoke command, and invokes its
published executable.
