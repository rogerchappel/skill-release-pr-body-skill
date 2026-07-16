# Release Candidate Notes

## Classification

Ship after public repo setup, branch protection, and PR review.

## Verification Commands

```bash
npm test
npm run check
npm run smoke
bash scripts/validate.sh
```

## 2026-07-16 Verification

- `npm test` passed: 3 tests, 0 failures.
- `npm run check` passed: required docs and output sections present.
- `npm run smoke` passed: fixture PR body JSON includes verification, docs, safety, risks, and checklist sections.
- `bash scripts/validate.sh` passed: test, check, and smoke suite completed.

## Known Limits

- Markdown dossier parsing expects conventional headings.
- The generated PR body is a draft and requires maintainer review.
- The tool does not call GitHub or open PRs.
