import { readFile } from "node:fs/promises";

export async function readOptional(filePath) {
  if (!filePath) return "";
  return readFile(filePath, "utf8");
}

export function parseDossier(markdown) {
  const lines = visibleLines(markdown.split(/\r?\n/));
  const visibleMarkdown = lines.join("\n");
  const classification = matchLine(visibleMarkdown, /^Classification:\s*(.+)$/m) ?? "unknown";
  const score = matchLine(visibleMarkdown, /^Readiness score:\s*(.+)$/m) ?? "unknown";
  const verification = collectBullets(lines, "Verification");
  const warnings = collectBullets(lines, "Risks And Warnings").filter((line) => !/no warnings/i.test(line));
  const docs = collectBullets(lines, "Documentation");

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

function collectBullets(lines, heading) {
  const headingPattern = new RegExp(`^ {0,3}##[ \\t]+${escapeRegExp(heading)}(?:[ \\t]+#+)?[ \\t]*$`);
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start === -1) return [];

  const end = lines.findIndex((line, index) => index > start && /^ {0,3}##(?:[ \t]+|$)/.test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end)
    .map((line) => line.match(/^ {0,3}[-*+][ \t]+(.+)$/)?.[1]?.trim())
    .filter((line) => line !== undefined);
}

function visibleLines(lines) {
  let fence;
  let inComment = false;

  return lines.map((line) => {
    if (fence) {
      const closingFence = new RegExp(`^ {0,3}${escapeRegExp(fence.marker)}{${fence.length},}[ \\t]*$`);
      if (closingFence.test(line)) fence = undefined;
      return "";
    }

    let visible = "";
    let remainder = line;

    while (remainder) {
      if (inComment) {
        const commentEnd = remainder.indexOf("-->");
        if (commentEnd === -1) return "";
        inComment = false;
        remainder = remainder.slice(commentEnd + 3);
        continue;
      }

      const commentStart = remainder.indexOf("<!--");
      if (commentStart === -1) {
        visible += remainder;
        break;
      }
      visible += remainder.slice(0, commentStart);
      inComment = true;
      remainder = remainder.slice(commentStart + 4);
    }

    const openingFence = visible.match(/^ {0,3}(`{3,}|~{3,})/);
    if (openingFence) {
      fence = { marker: openingFence[1][0], length: openingFence[1].length };
      return "";
    }

    return visible;
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
