import { readFile } from "node:fs/promises";

export async function readOptional(filePath) {
  if (!filePath) return "";
  return readFile(filePath, "utf8");
}

export function parseDossier(markdown) {
  const classification = matchLine(markdown, /^Classification:\s*(.+)$/m) ?? "unknown";
  const score = matchLine(markdown, /^Readiness score:\s*(.+)$/m) ?? "unknown";
  const verification = collectBullets(markdown, "Verification");
  const warnings = collectBullets(markdown, "Risks And Warnings").filter((line) => !/no warnings/i.test(line));
  const docs = collectBullets(markdown, "Documentation");

  return { classification, score, verification, warnings, docs };
}

export function parseCommits(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[a-f0-9]{7,}\s+/i, ""));
}

export function groupCommits(commits) {
  const groups = {
    "Implementation": [],
    "Tests And Fixtures": [],
    "Documentation": [],
    "Release Readiness": []
  };

  for (const commit of commits) {
    if (/test|fixture|coverage/i.test(commit)) groups["Tests And Fixtures"].push(commit);
    else if (/doc|readme|skill|prd|task|orchestration/i.test(commit)) groups["Documentation"].push(commit);
    else if (/release|verify|readiness|candidate/i.test(commit)) groups["Release Readiness"].push(commit);
    else groups["Implementation"].push(commit);
  }

  return Object.fromEntries(Object.entries(groups).filter(([, values]) => values.length));
}

function matchLine(text, pattern) {
  return text.match(pattern)?.[1]?.trim();
}

function collectBullets(markdown, heading) {
  const pattern = new RegExp(`^## ${escapeRegExp(heading)}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, "m");
  const section = markdown.match(pattern)?.[1] ?? "";
  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
