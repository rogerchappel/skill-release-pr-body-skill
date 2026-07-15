#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { buildPrBody } from "../src/build.js";

function parseArgs(argv) {
  const args = { json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--dossier") args.dossier = argv[++i];
    else if (arg === "--commits") args.commits = argv[++i];
    else if (arg === "--risks") args.risks = argv[++i];
    else if (arg === "--out") args.out = argv[++i];
    else if (arg === "--json") args.json = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return `Usage: skill-release-pr-body --dossier <file> [--commits <file>] [--risks <file>] [--out <file>] [--json]`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dossier) {
    console.log(usage());
    return;
  }

  const result = await buildPrBody(args);
  const output = args.json ? `${JSON.stringify(result, null, 2)}\n` : result.markdown;
  if (args.out) await writeFile(args.out, output, "utf8");
  else process.stdout.write(output);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
