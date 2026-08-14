import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { buildPrBody } from "../src/build.js";

for (const file of ["README.md", "SKILL.md", "docs/PRD.md", "docs/TASKS.md", "docs/ORCHESTRATION.md", "docs/RELEASE_CANDIDATE.md"]) {
  await access(file);
}

const readme = await readFile("README.md", "utf8");
assert.doesNotMatch(
  readme,
  /npm\s+(?:i|install)(?:\s+--[^\s]+)*\s+skill-release-pr-body-skill(?:\s|$)/m,
  "README must not recommend a registry install while the package is unpublished",
);
for (const instruction of ["npm pack", "not currently published", "does not publish"]) {
  assert(readme.includes(instruction), `README is missing local package guidance: ${instruction}`);
}

const result = await buildPrBody({ dossier: "fixtures/dossier.md", commits: "fixtures/commits.txt" });
for (const section of ["## Summary", "## Commit Groups", "## Verification", "## Safety", "## Reviewer Checklist"]) {
  if (!result.markdown.includes(section)) throw new Error(`Missing section: ${section}`);
}

console.log("check ok");
