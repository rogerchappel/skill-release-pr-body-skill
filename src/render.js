export function renderPrBody(model) {
  const lines = [
    "## Summary",
    "",
    `- Release readiness classification: ${escapeMarkdown(model.dossier.classification)}.`,
    `- Readiness score: ${escapeMarkdown(model.dossier.score)}.`,
    "- Generated from local evidence; maintainer review is still required.",
    "",
    "## Commit Groups",
    "",
    ...renderCommitGroups(model.commitGroups, model.commitGroupLabels),
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
    ...renderList([
      ...(Array.isArray(model.dossier.warnings) ? model.dossier.warnings : []),
      ...(Array.isArray(model.risks) ? model.risks : [])
    ], "No unresolved risks were supplied."),
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

function renderCommitGroups(groups, labels = {}) {
  const entries = groups && typeof groups === "object" && !Array.isArray(groups)
    ? Object.entries(groups)
    : [];
  if (!entries.length) return ["- No commit log was supplied."];
  return entries.flatMap(([name, commits]) => [`- ${escapeMarkdown(labels[name] ?? name)}:`, ...commits.map((commit) => `  - ${escapeMarkdown(commit)}`)]);
}

function renderList(items, fallback) {
  return Array.isArray(items) && items.length
    ? items.map((item) => `- ${escapeMarkdown(item)}`)
    : [`- ${fallback}`];
}

function escapeMarkdown(value) {
  return String(value).replace(/([\\`*_{}\[\]<>|])/g, "\\$1").replace(/\r?\n/g, " ");
}
