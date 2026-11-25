#!/usr/bin/env node
// npm run docs:freeze -- <version>: keep a version's markdown pages as they are now, before the pages move on to the
// next release. Run it before the first change for a new version: it builds the site, copies /docs/v/<version>/*.md
// into docs-versions/<version>/ (served at the same addresses), and marks the version frozen in _data/versions.json.
// Then add the new version to versions.json as `current` and change the older one's status and note.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const version = process.argv[2];
const file = "_data/versions.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const entry = data.versions.find((v) => v.version === version);
if (!entry) throw new Error(`${version} isn't in ${file}: add it there first`);
if (entry.frozen) throw new Error(`${version} is frozen already (docs-versions/${version}/)`);
fs.rmSync("_site", { recursive: true, force: true }); // a clean build: nothing stale or from another SITE_ORIGIN gets frozen
execSync("npx @11ty/eleventy --quiet", { stdio: "inherit", env: { ...process.env, SITE_ORIGIN: "" } });
const from = `_site/docs/v/${version}`, to = `docs-versions/${version}`;
let n = 0;
const copy = (dir) => {
  for (const e of fs.readdirSync(path.join(from, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) copy(rel);
    else if (e.name.endsWith(".md")) {
      fs.mkdirSync(path.join(to, dir), { recursive: true });
      fs.copyFileSync(path.join(from, rel), path.join(to, rel));
      n++;
    }
  }
};
copy("");
entry.frozen = true;
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`froze ${n} pages of ${version} into ${to}/`);
