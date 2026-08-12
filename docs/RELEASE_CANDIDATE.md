# Release Candidate Notes

## Classification

Ship after public repo setup, branch protection, and PR review.

## Verification Commands

```bash
npm test
npm run check
npm run smoke
npm run test:package
bash scripts/validate.sh
```

The packed artifact includes the example dossier and commit fixtures used by
`npm run smoke`. The package test installs the tarball into a clean disposable
consumer and executes both that smoke command and the published CLI.

## 2026-07-16 Verification

- `npm test` passed: 3 tests, 0 failures.
- `npm run check` passed: required docs and output sections present.
- `npm run smoke` passed: fixture PR body JSON includes verification, docs, safety, risks, and checklist sections.
- `npm run test:package` passed: required tarball files, installed smoke command, and packaged executable verified.
- `bash scripts/validate.sh` passed: test, check, smoke, and packed-artifact suite completed.

## Known Limits

- Markdown dossier parsing expects conventional headings.
- The generated PR body is a draft and requires maintainer review.
- The tool does not call GitHub or open PRs.
