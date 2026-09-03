import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { groupCommits, parseCommits, parseDossier } from "../src/read-inputs.js";

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`accepts indented CommonMark headings and bullet whitespace with ${name} line endings`, async () => {
    const fixture = await readFile(new URL("../fixtures/dossier-commonmark.md", import.meta.url), "utf8");
    const dossier = parseDossier(fixture.replaceAll("\n", newline));

    assert.deepEqual(dossier.verification, [
      "PASS: npm test",
      "PASS: npm run smoke",
      "PASS: npm run check"
    ]);
    assert.deepEqual(dossier.docs, ["PASS: README updated"]);
    assert.deepEqual(dossier.warnings, ["WARN: manual review remains"]);
  });

  test(`collects mixed CommonMark bullet markers with ${name} line endings`, () => {
    const markdown = `## Verification
- PASS: npm test
* PASS: npm run smoke
+ PASS: npm run check
## Documentation
* PASS: README updated
## Risks And Warnings
+ WARN: manual review remains
## Other
- PASS: outside the exact H2 boundary`;

    const dossier = parseDossier(markdown.replaceAll("\n", newline));

    assert.deepEqual(dossier.verification, [
      "PASS: npm test",
      "PASS: npm run smoke",
      "PASS: npm run check"
    ]);
    assert.deepEqual(dossier.docs, ["PASS: README updated"]);
    assert.deepEqual(dossier.warnings, ["WARN: manual review remains"]);
  });

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

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`ignores non-visible dossier bullets with ${name} line endings`, async () => {
    const fixture = await readFile(new URL("../fixtures/dossier-hidden-bullets.md", import.meta.url), "utf8");
    const dossier = parseDossier(fixture.replaceAll("\n", newline));

    assert.deepEqual(dossier.verification, ["PASS: npm test"]);
    assert.deepEqual(dossier.docs, ["PASS: README updated"]);
    assert.deepEqual(dossier.warnings, ["WARN: manual review remains"]);
  });
}

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`treats HTML comment markers inside fences as literal with ${name} line endings`, () => {
    const markdown = `## Verification
\`\`\`text
<!-- literal unclosed comment marker
\`\`\`
- PASS: visible after backtick fence
~~~text
<!-- literal closed comment marker -->
~~~
- PASS: visible after tilde fence`;

    const dossier = parseDossier(markdown.replaceAll("\n", newline));

    assert.deepEqual(dossier.verification, [
      "PASS: visible after backtick fence",
      "PASS: visible after tilde fence"
    ]);
  });
}

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`ignores non-visible dossier scalar metadata with ${name} line endings`, () => {
    const markdown = `<!--
Classification: hidden-comment
Readiness score: 1/100
-->
\`\`\`text
Classification: hidden-backtick-fence
Readiness score: 2/100
<!-- literal unclosed comment marker
\`\`\`
Classification: candidate
~~~text
Readiness score: 3/100
<!-- literal closed comment marker -->
~~~
Readiness score: 84/100`;

    const dossier = parseDossier(markdown.replaceAll("\n", newline));

    assert.equal(dossier.classification, "candidate");
    assert.equal(dossier.score, "84/100");
  });
}

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`ignores dossier evidence inside CommonMark HTML blocks with ${name} line endings`, async () => {
    const fixture = await readFile(new URL("../fixtures/dossier-html-blocks.md", import.meta.url), "utf8");
    const dossier = parseDossier(fixture.replaceAll("\n", newline));

    assert.equal(dossier.classification, "candidate");
    assert.equal(dossier.score, "86/100");
    assert.deepEqual(dossier.verification, ["PASS: npm test"]);
    assert.deepEqual(dossier.docs, ["PASS: README updated"]);
  });
}

for (const [name, newline] of [["LF", "\n"], ["CRLF", "\r\n"]]) {
  test(`accepts CommonMark ATX dossier headings with ${name} line endings`, () => {
    const markdown = `## Verification ###
- PASS: npm test
### Details
- PASS: npm run smoke
## Documentation ##
- PASS: README updated
## Risks And Warnings ###
- no warnings
## Other
- PASS: must stay outside the dossier sections`;

    const dossier = parseDossier(markdown.replaceAll("\n", newline));

    assert.deepEqual(dossier.verification, ["PASS: npm test", "PASS: npm run smoke"]);
    assert.deepEqual(dossier.docs, ["PASS: README updated"]);
    assert.deepEqual(dossier.warnings, []);
  });
}

test("requires exact H2 dossier heading names", () => {
  const dossier = parseDossier(`### Verification
- wrong level
## Verification Notes
- wrong name
## Documentationish
- wrong name`);

  assert.deepEqual(dossier.verification, []);
  assert.deepEqual(dossier.docs, []);
});

test("ignores non-CommonMark headings and unordered bullet markers", () => {
  const dossier = parseDossier(`    ## Verification
- hidden under a four-space-indented heading
## Verification Notes
- wrong name
## Verification
-no marker whitespace
    - four-space-indented bullet
1. ordered bullet
## Documentationish
+ wrong section`);

  assert.deepEqual(dossier.verification, []);
  assert.deepEqual(dossier.docs, []);
});

test("groups commits by release body sections", () => {
  const commits = parseCommits("abc1234 Add tests\nbcd2345 Document skill\ncde3456 Implement parser");
  const groups = groupCommits(commits);

  assert.deepEqual(groups["Tests And Fixtures"], ["Add tests"]);
  assert.deepEqual(groups.Documentation, ["Document skill"]);
  assert.deepEqual(groups.Implementation, ["Implement parser"]);
});
