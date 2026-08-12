import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, [result.stdout, result.stderr].filter(Boolean).join("\n"));
  return result;
}

const root = process.cwd();
const workspace = await mkdtemp(join(tmpdir(), "skill-release-package-smoke-"));

try {
  const pack = run("npm", ["pack", "--json", "--pack-destination", workspace], root);
  const [manifest] = JSON.parse(pack.stdout);
  const paths = new Set(manifest.files.map(({ path }) => path));

  for (const required of [
    "bin/skill-release-pr-body.js",
    "fixtures/commits.txt",
    "fixtures/dossier.md",
    "package.json",
    "README.md",
    "SKILL.md",
  ]) {
    assert(paths.has(required), `Packed artifact is missing ${required}`);
  }

  const consumer = join(workspace, "consumer");
  await mkdir(consumer);
  run("npm", ["init", "--yes"], consumer);
  run("npm", ["install", "--ignore-scripts", join(workspace, manifest.filename)], consumer);

  const installed = join(consumer, "node_modules", "skill-release-pr-body-skill");
  const smoke = run("npm", ["run", "smoke"], installed);
  assert.equal(JSON.parse(smoke.stdout.slice(smoke.stdout.indexOf("{"))).model.dossier.classification, "ship");

  const output = join(workspace, "pr-body.json");
  run(
    join(consumer, "node_modules", ".bin", "skill-release-pr-body"),
    ["--dossier", join(installed, "fixtures", "dossier.md"), "--json", "--out", output],
    consumer,
  );
  assert.equal(JSON.parse(await readFile(output, "utf8")).model.dossier.classification, "ship");

  console.log("package smoke ok");
} finally {
  await rm(workspace, { recursive: true, force: true });
}
