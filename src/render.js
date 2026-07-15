export function renderPrBody(model) {
  const lines = [
    "## Summary",
    "",
    `- Release readiness classification: ${model.dossier.classification}.`,
    `- Readiness score: ${model.dossier.score}.`,
    "- Generated from local evidence; maintainer review is still required.",
    "",
    "## Commit Groups",
    "",
    ...renderCommitGroups(model.commitGroups),
    "",
    "## Verification",
    "",
    ...renderList(model.dossier.verification, "No verification evidence was supplied."),
    "",
    "## Documentation",
    "",
    ...renderList(model.dossier.docs, "No documentation checklist was supplied."),
    "",
    "## Safety",
    "",
    "- Tooling is local-first and does not push, merge, tag, publish, or call external services.",
    "- This PR body is generated from evidence and should not be treated as approval.",
    "",
    "## Known Limits And Risks",
    "",
    ...renderList([...model.dossier.warnings, ...model.risks], "No unresolved risks were supplied."),
    "",
    "## Reviewer Checklist",
    "",
    "- [ ] Verification commands are accurate.",
    "- [ ] Safety boundaries are acceptable.",
    "- [ ] Documentation is sufficient for first-time users.",
    "- [ ] No private data or credentials are included."
  ];
  return `${lines.join("\n")}\n`;
}

function renderCommitGroups(groups) {
  const entries = Object.entries(groups);
  if (!entries.length) return ["- No commit log was supplied."];
  return entries.flatMap(([name, commits]) => [`- ${name}:`, ...commits.map((commit) => `  - ${commit}`)]);
}

function renderList(items, fallback) {
  return items.length ? items.map((item) => `- ${item}`) : [`- ${fallback}`];
}
