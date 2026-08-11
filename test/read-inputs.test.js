import test from "node:test";
import assert from "node:assert/strict";
import { groupCommits, parseCommits, parseDossier } from "../src/read-inputs.js";

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`parses dossier sections with ${name} line endings`, () => {
    const markdown = `# X

Classification: incubate
Readiness score: 72/100

## Verification

- PASS: npm test
- PASS: npm run smoke

## Documentation

- WARN: SKILL.md missing or thin.

## Risks And Warnings

- WARN: docs need review
`;
    const dossier = parseDossier(markdown.replaceAll("\n", newline));

    assert.equal(dossier.classification, "incubate");
    assert.equal(dossier.score, "72/100");
    assert.deepEqual(dossier.verification, ["PASS: npm test", "PASS: npm run smoke"]);
    assert.deepEqual(dossier.docs, ["WARN: SKILL.md missing or thin."]);
    assert.deepEqual(dossier.warnings, ["WARN: docs need review"]);
  });
}

test("groups commits by release body sections", () => {
  const commits = parseCommits("abc1234 Add tests\nbcd2345 Document skill\ncde3456 Implement parser");
  const groups = groupCommits(commits);

  assert.deepEqual(groups["Tests And Fixtures"], ["Add tests"]);
  assert.deepEqual(groups.Documentation, ["Document skill"]);
  assert.deepEqual(groups.Implementation, ["Implement parser"]);
});
