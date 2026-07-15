import { access } from "node:fs/promises";
import { buildPrBody } from "../src/build.js";

for (const file of ["README.md", "SKILL.md", "docs/PRD.md", "docs/TASKS.md", "docs/ORCHESTRATION.md", "docs/RELEASE_CANDIDATE.md"]) {
  await access(file);
}

const result = await buildPrBody({ dossier: "fixtures/dossier.md", commits: "fixtures/commits.txt" });
for (const section of ["## Summary", "## Commit Groups", "## Verification", "## Safety", "## Reviewer Checklist"]) {
  if (!result.markdown.includes(section)) throw new Error(`Missing section: ${section}`);
}

console.log("check ok");
