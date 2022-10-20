const path = require("path");
const fs = require("fs");
const csv = require("@fast-csv/parse");

function parseCsv(filename) {
  const output = [];

  const filePath = path.resolve(process.cwd(), filename);

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

exports.parseCsv = parseCsv;
