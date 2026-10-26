import test from "node:test";
import assert from "node:assert/strict";
import { renderPrBody } from "../src/render.js";

function model(overrides = {}) {
  return {
    dossier: {
      classification: "candidate",
      score: "84/100",
      verification: ["PASS: npm test"],
      docs: ["PASS: README updated"],
      warnings: ["WARN: manual review remains"]
    },
    commitGroups: { Tests: ["Add renderer coverage"], Implementation: ["Fix output"] },
    risks: ["Review generated content"],
    ...overrides
  };
}

test("renders dossier evidence and commit groups as stable Markdown", () => {
  const output = renderPrBody(model());

  assert.match(output, /- Release readiness classification: candidate\./);
  assert.match(output, /- Readiness score: 84\/100\./);
  assert.match(output, /- Tests:\n  - Add renderer coverage\n- Implementation:\n  - Fix output/);
  assert.match(output, /- PASS: npm test/);
  assert.match(output, /- PASS: README updated/);
  assert.match(output, /- WARN: manual review remains\n- Review generated content/);
  assert.ok(output.endsWith("\n"));
});

test("renders explicit fallbacks when commit groups and dossier lists are empty", () => {
  const empty = {
    dossier: { classification: "incubate", score: "0/100", verification: [], docs: [], warnings: [] },
    commitGroups: {},
    risks: []
  };

  const output = renderPrBody(empty);

  assert.match(output, /- No commit log was supplied\./);
  assert.match(output, /- No verification evidence was supplied\./);
  assert.match(output, /- No documentation checklist was supplied\./);
  assert.match(output, /- No unresolved risks were supplied\./);
});

test("renders risks together with dossier warnings in input order", () => {
  const output = renderPrBody(model({
    dossier: { ...model().dossier, warnings: ["First warning", "Second warning"] },
    risks: ["Third risk"]
  }));

  assert.ok(output.indexOf("- First warning") < output.indexOf("- Second warning"));
  assert.ok(output.indexOf("- Second warning") < output.indexOf("- Third risk"));
});
