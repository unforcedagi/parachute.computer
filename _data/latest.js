// /latest.json: the newest Parachute release, read from npm when the site builds (dist-tags of @openparachute/core),
// so a connected AI can say "a newer version exists". The site rebuilds daily (deploy.yml) so it keeps up. If npm
// can't be read, latest and beta are null ("unknown": say nothing) and `source` says why; the build never fails on it.
const versions = require("./versions.json");
const shape = (tags, source) => ({
  core: { package: versions.package, latest: tags.latest, beta: tags.beta },
  docs: versions.current, docs_versions: versions.versions.map((v) => v.version),
  source, checked_at: new Date().toISOString(),
});
module.exports = async function () {
  const url = `https://registry.npmjs.org/-/package/${versions.package.replace("/", "%2F")}/dist-tags`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`npm ${res.status}`);
    const tags = await res.json();
    return shape({ latest: tags.latest, beta: tags.beta }, "npm");
  } catch (e) {
    return shape({ latest: null, beta: null }, `unknown: npm unreachable at build (${e.message})`);
  }
};
