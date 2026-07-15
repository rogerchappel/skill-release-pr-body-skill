import { parseCommits, parseDossier, groupCommits, readOptional } from "./read-inputs.js";
import { renderPrBody } from "./render.js";

export async function buildPrBody(options) {
  const dossierText = await readOptional(options.dossier);
  if (!dossierText) throw new Error("--dossier is required and must not be empty.");

  const commitText = await readOptional(options.commits);
  const riskText = await readOptional(options.risks);
  const dossier = parseDossier(dossierText);
  const commits = parseCommits(commitText);
  const risks = riskText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const model = {
    dossier,
    commits,
    commitGroups: groupCommits(commits),
    risks
  };

  return {
    model,
    markdown: renderPrBody(model)
  };
}
