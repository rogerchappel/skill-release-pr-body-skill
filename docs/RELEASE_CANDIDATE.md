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

## Known Limits

- Markdown dossier parsing expects conventional headings.
- The generated PR body is a draft and requires maintainer review.
- The tool does not call GitHub or open PRs.
