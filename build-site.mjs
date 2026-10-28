// Prépare le dossier site/ pour un hébergement statique (Vercel, en-têtes dans vercel.json) :
// index.html reçoit le squelette (doctype, charset, viewport) que l'aperçu Artifact ajoute tout seul,
// et seuls les fichiers servis sont copiés (pas les photos WhatsApp d'origine ni les archives).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "site";
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const page = readFileSync("index.html", "utf8");
const tete = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
`;
writeFileSync(`${out}/index.html`, tete + page.replace(/^﻿/, "") + "\n</html>\n");

for (const d of ["audio", "photos", "tex"]) cpSync(`assets/${d}`, `${out}/assets/${d}`, { recursive: true });

writeFileSync(`${out}/robots.txt`, "User-agent: *\nDisallow: /\n");

console.log("site/ prêt");
