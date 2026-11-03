import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { buildPrBody } from "../src/build.js";

// Require package.json root metadata to agree with the npm lockfile. This is
// deterministic, offline, and reports the precise manifest keys that drift.
const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const lockedRoot = lock.packages?.[""];
assert(lockedRoot, "package-lock.json is missing its root package entry");
for (const key of ["name", "version", "license", "engines", "bin", "dependencies", "devDependencies", "optionalDependencies"]) {
  assert.deepEqual(lockedRoot[key] ?? {}, manifest[key] ?? {}, `package-lock.json is out of sync with package.json for ${key}; run npm install to update the lockfile`);
}

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
