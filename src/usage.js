const axios = require("axios");
const eachSeries = require("async/eachSeries");
const { parseCsv } = require("./csv-parser");

const codeSearchUrl = "https://api.github.com/search/code";

function search(flagKey) {
  return axios
    .get(`${codeSearchUrl}?q=${encodeURIComponent(flagKey)}+org:wealthsimple`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    })
    .then((response) => {
      const items = response.data.items;

      if (items.length > 0) {
        console.log(
          `❗️ [${flagKey}] References found in code. Remove references before archiving!`
        );
      } else {
        console.log(
          `✅ [${flagKey}] No references found in code. Should be safe to archive!`
        );
      }
    })
    .catch((err) => {
      console.error(err.response.data);
    });
}

function run() {
  if (process.env.GITHUB_ACCESS_TOKEN === undefined) {
    console.error("Please set GITHUB_ACCESS_TOKEN environment variable first.");
    process.exit(1);
  }

  parseCsv(process.argv[2])
    .then((flags) => {
      console.log(`🔎  Searching usage of ${flags.length} flags`);

      const iteratee = (flagKey, callback) => {
        return search(flagKey).then(() => callback());
      };

      return eachSeries(flags, iteratee);
    })
    .then(() => {
      process.exit();
    });
}

run();
