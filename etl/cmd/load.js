const fs = require("fs");
const parse = require("csv-parse");
const stringify = require("csv-stringify");
const path = require("path");
const moment = require("moment");
const logger = require("../logger");
const walkSync = require("../utils/walkSync");

const input = require("../../green-input.json");
const output = require("../../green-output.json");
const transformers = require("../../green-transformers.json");

function getFilePaths(dir, ext) {
  const paths = [];
  walkSync(dir, paths);
  return paths.filter((file) => ext.includes(path.extname(file)));
}

function parseFile(transformerName, path) {
  return new Promise((resolve) => {
    const transformer = require(`../transformers/${transformerName}`);

    const table = [];

    const parser = parse({
      delimiter: ",",
      relax_column_count: true,
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read())) {
        const row = transformer(record, path);
        if (!row[0]) {
          logger.debug("dropped row %j", row);
        } else {
          logger.debug("transformed row %j", row);
          table.push(row);
        }
      }
    });

    parser.on("error", (err) => {
      logger.error(err.message);
    });

    parser.on("end", () => {
      logger.info(`parsed ${table.length} rows in ${path}`);
      resolve(table);
    });

    const file = fs.readFileSync(path);
    parser.write(file);
    parser.end();
  });
}

const filePaths = input.folders
  .map((folder) => getFilePaths(folder, [".csv", ".CSV"]))
  .reduce((allFiles, folderFiles) => [...allFiles, ...folderFiles], []);

logger.debug("filePaths", filePaths);

Promise.all(
  filePaths.map((path) => {
    const transformerNames = Object.keys(transformers);
    const transformerForPath = transformerNames.find((name) =>
      path.includes(name)
    );

    if (!transformerForPath) {
      throw new Error(`No transformer found for: ${path}`);
      return [];
    }

    return parseFile(transformers[transformerForPath], path);
  })
).then((tables) => {
  const mergedTable = tables
    .reduce((acc, val) => [...acc, ...val], [])
    .filter((item) => item[0] !== "")
    .sort((a, b) => moment(a[0]).diff(moment(b[0])));

  const json = mergedTable.map(([date, amount, description, hash]) => ({
    date,
    amount,
    description,
    hash,
  }));
  fs.writeFileSync(output.transactions.json, JSON.stringify(json));

  stringify(mergedTable, (err, data) => {
    if (err) logger.error("while stringifying to csv", err);
    fs.writeFileSync(output.transactions.csv, data);
  });
});
