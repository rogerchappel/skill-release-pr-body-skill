import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const cli = resolve("bin/skill-release-pr-body.js");
const dossier = resolve("fixtures/dossier.md");
const commits = resolve("fixtures/commits.txt");

function run(args, cwd = process.cwd()) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
}

test("no arguments reports the required dossier and exits nonzero", () => {
  const result = run([]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--dossier is required/);
  assert.match(result.stderr, /Usage:/);
});

test("help flags print usage and exit successfully", () => {
  for (const flag of ["--help", "-h"]) {
    const result = run([flag]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage:/);
    assert.equal(result.stderr, "");
  }
});

test("every value-taking option rejects an omitted value", () => {
  for (const option of ["--dossier", "--commits", "--risks", "--out"]) {
    const prefix = option === "--dossier" ? [] : ["--dossier", dossier];
    const result = run([...prefix, option]);
    assert.notEqual(result.status, 0, option);
    assert.match(result.stderr, new RegExp(`${option} requires a value`));
    assert.match(result.stderr, /Usage:/);
  }
});

test("value-taking options reject another flag as their value", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "skill-release-cli-"));
  for (const option of ["--dossier", "--commits", "--risks", "--out"]) {
    const prefix = option === "--dossier" ? [] : ["--dossier", dossier];
    const result = run([...prefix, option, "--json"], cwd);
    assert.notEqual(result.status, 0, option);
    assert.match(result.stderr, new RegExp(`${option} requires a value`));
    assert.doesNotMatch(result.stderr, /ENOENT/);
  }
  await assert.rejects(readFile(join(cwd, "--json")), { code: "ENOENT" });
});

test("unknown arguments report an error", () => {
  const result = run(["--dossier", dossier, "--unknown"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown argument: --unknown/);
  assert.match(result.stderr, /Usage:/);
});

test("valid JSON output is written to stdout", () => {
  const result = run(["--dossier", dossier, "--commits", commits, "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).model.dossier.classification, "ship");
});

test("valid file output is written without stdout", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "skill-release-cli-"));
  const output = join(cwd, "pr-body.md");
  const result = run(["--dossier", dossier, "--out", output], cwd);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
  assert.match(await readFile(output, "utf8"), /## Verification/);
});
