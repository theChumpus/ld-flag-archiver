const axios = require("axios");
const path = require("path");
const fs = require("fs");
const csv = require("@fast-csv/parse");
const eachSeries = require("async/eachSeries");

const baseUrl = "https://app.launchdarkly.com/api/v2/flags/default";

const flagUrl = (flagKey) => `${baseUrl}/${flagKey}`;

const getHeaders = (headers = {}) => ({
  ...headers,
  Authorization: process.env.LD_API_TOKEN,
});

function fetchFlag(flagKey) {
  return axios
    .get(`${baseUrl}/${flagKey}`, {
      headers: getHeaders(),
    })
    .then((response) => {
      trackRateLimit(response.headers);

      return response.data;
    });
}

let rateLimitRemaining;
let rateLimitReset;

function trackRateLimit(headers) {
  rateLimitRemaining = headers["x-ratelimit-route-remaining"];
  rateLimitReset = headers["x-ratelimit-reset"];
}

function waitForRateLimitReset() {
  if (rateLimitRemaining === undefined || rateLimitRemaining > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const resetIn = rateLimitReset - Date.now();
    console.log(`⏳ Wait for ${resetIn} ms for rate limit to reset`);
    setTimeout(() => resolve(), resetIn);
  });
}

function archiveFlag(flagKey) {
  const body = {
    patch: [
      {
        op: "replace",
        path: "/archived",
        value: true,
      },
    ],
    comment: "Archived flag via API",
  };

  return axios
    .patch(flagUrl(flagKey), body, {
      headers: getHeaders({
        "Content-Type": "application/json",
      }),
    })
    .then((response) => {
      trackRateLimit(response.headers);

      const isArchived = response.data.archived;
      if (isArchived === true) {
        console.log(`✅ ${flagKey} archived!`);
      }
      return isArchived;
    });
}

function fetchAndArchiveFlag(flagKey) {
  return waitForRateLimitReset()
    .then(() => fetchFlag(flagKey))
    .then((data) => {
      const isArchived = data.archived;

      if (!isArchived) {
        return archiveFlag(flagKey);
      }

      console.log(`✅ ${flagKey} is already archived`);

      return isArchived;
    })
    .catch((err) => {
      console.error("❌ Could not archive flag", err);
    });
}

function parseCsv(filename) {
  const output = [];

  const filePath = path.resolve(__dirname, filename);

  console.log(`Reading flags from ${filePath}...`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv.parse())
      .on("error", reject)
      .on("data", (row) => {
        output.push(row[0].trim());
      })
      .on("end", () => resolve(output));
  });
}

function run() {
  if (process.env.LD_API_TOKEN === undefined) {
    console.error("Please set LD_API_TOKEN environment variable first.");
    process.exit(1);
  }

  parseCsv(process.argv[2])
    .then((output) => {
      console.log(`➡️  Archiving ${output.length} flags`);

      const iteratee = (flagKey, callback) => {
        return fetchAndArchiveFlag(flagKey).then(() => callback());
      };

      return eachSeries(output, iteratee);
    })
    .then(() => {
      console.log("All done!");
      process.exit();
    });
}

run();
