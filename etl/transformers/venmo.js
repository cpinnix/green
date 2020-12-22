const moment = require("moment");
const generateHash = require("../utils/generateHash");

module.exports = (row) => {
  let date = moment(row[2], "YYYY-MM-DD").toISOString();
  if (date === null) date = "";
  const description = [
    "VENMO",
    "-",
    row[3],
    "-",
    row[5],
    `${row[6]} -> ${row[7]}`,
  ].join(" ");
  const amount = parseFloat(
    row[8].replace(/ /g, "").replace(/\$/g, "").replace(/,/g, "")
  );

  const hash = generateHash({
    date,
    amount,
    description,
  });

  return [date, amount, description, hash];
};
