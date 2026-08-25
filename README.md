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

The package is not currently published to the npm registry. To validate or use
the installable artifact, pack the source checkout and install that tarball in
a clean consumer project:

```bash
PACKAGE_TARBALL=$(npm pack --silent)
PACKAGE_PATH="$(pwd)/${PACKAGE_TARBALL}"
CONSUMER_DIR=$(mktemp -d)
cd "${CONSUMER_DIR}"
npm init --yes
npm install "${PACKAGE_PATH}"
npx skill-release-pr-body \
  --dossier node_modules/skill-release-pr-body-skill/fixtures/dossier.md \
  --commits node_modules/skill-release-pr-body-skill/fixtures/commits.txt \
  --out pr-body.md
```

For real use, replace the example fixture paths with paths to your own release
evidence. The packed artifact includes the example fixtures, so its
self-contained smoke command can also be run from
`node_modules/skill-release-pr-body-skill`. Packing and installing this local
artifact validates the package contents; it does not publish the package or
establish npm registry availability.

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

The dossier reader recognizes `Verification`, `Documentation`, and
`Risks And Warnings` as exact CommonMark ATX H2 headings. An optional closing
hash sequence is accepted, and a blank line after the heading is not required.
Heading names and level remain exact; the section ends at the next H2, while
H3-H6 content remains inside its enclosing section.
Only visible bullet lines are collected as evidence. Bullets inside CommonMark
backtick or tilde fenced code blocks and HTML comments are ignored. Once a
fence opens, its contents are treated literally until the matching closing
fence, so HTML comment markers in code examples do not affect later evidence.

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
