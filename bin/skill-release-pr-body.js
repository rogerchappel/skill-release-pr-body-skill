#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { buildPrBody } from "../src/build.js";

class UsageError extends Error {}

const VALUE_OPTIONS = new Set(["--dossier", "--commits", "--risks", "--out"]);

function parseArgs(argv) {
  const args = { json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") args.help = true;
    else if (VALUE_OPTIONS.has(arg)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new UsageError(`${arg} requires a value`);
      }
      args[arg.slice(2)] = value;
      i += 1;
    }
    else if (arg === "--json") args.json = true;
    else throw new UsageError(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  return `Usage: skill-release-pr-body --dossier <file> [--commits <file>] [--risks <file>] [--out <file>] [--json]`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.dossier) throw new UsageError("--dossier is required");

  const result = await buildPrBody(args);
  const output = args.json ? `${JSON.stringify(result, null, 2)}\n` : result.markdown;
  if (args.out) await writeFile(args.out, output, "utf8");
  else process.stdout.write(output);
}

main().catch((error) => {
  console.error(error.message);
  if (error instanceof UsageError) console.error(usage());
  process.exitCode = 1;
});
