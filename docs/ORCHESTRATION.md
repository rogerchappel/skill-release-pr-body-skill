# Orchestration

## Agent Flow

1. Collect release evidence locally.
2. Run `skill-release-pr-body --dossier <file> --commits <file>`.
3. Review generated claims against the diff.
4. Use the output as a draft PR body.

## Safety

The CLI has no network behavior. It is safe in automation because it does not
open PRs or mutate repositories unless the caller explicitly chooses `--out` for
a local markdown file.

## Failure Handling

- If no dossier is provided, fail fast.
- If commits are absent, render an explicit fallback line.
- If warnings exist, preserve them in the known risks section.
