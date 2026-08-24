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
  const lines = markdown.split(/\r?\n/);
  const headingPattern = new RegExp(`^##[ \\t]+${escapeRegExp(heading)}(?:[ \\t]+#+)?[ \\t]*$`);
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start === -1) return [];

  const end = lines.findIndex((line, index) => index > start && /^##(?:[ \\t]+|$)/.test(line));
  return visibleLines(lines.slice(start + 1, end === -1 ? undefined : end))
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
}

function visibleLines(lines) {
  let fence;
  let inComment = false;

  return lines.map((line) => {
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

    if (fence) {
      const closingFence = new RegExp(`^ {0,3}${escapeRegExp(fence.marker)}{${fence.length},}[ \\t]*$`);
      if (closingFence.test(visible)) fence = undefined;
      return "";
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
