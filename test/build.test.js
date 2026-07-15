import test from "node:test";
import assert from "node:assert/strict";
import { buildPrBody } from "../src/build.js";

test("builds a release PR body from fixture evidence", async () => {
  const result = await buildPrBody({
    dossier: "fixtures/dossier.md",
    commits: "fixtures/commits.txt",
    risks: "fixtures/risks.txt"
  });

  assert.equal(result.model.dossier.classification, "ship");
  assert.ok(result.model.commitGroups.Implementation.length >= 1);
  assert.match(result.markdown, /## Verification/);
  assert.match(result.markdown, /PASS: npm test/);
  assert.match(result.markdown, /Reviewer Checklist/);
});
