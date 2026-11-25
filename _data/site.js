// The site's own words, and the origin its machine-read files name (llms.txt, the markdown twins, docs/index.json).
// SITE_ORIGIN builds a copy that links to itself (a preview, or a self-hoster's own docs; see /docs/run/own-docs/).
module.exports = {
  subscribeEndpoint: "https://parachute-subscribe.unforced.workers.dev/",
  oneLine: "Your own vault that any AI can read and write, and an app that shows you what is in it.",
  origin: (process.env.SITE_ORIGIN || "https://parachute.computer").replace(/\/+$/, ""),
};
