const moment = require("moment");
const generateHash = require("../utils/generateHash");

module.exports = (row) => {
  let date = moment(row[1], "MM-DD-YYYY").toISOString();
  if (date === null) date = "";
  const description = ["CHASE", "-", row[2]].join(" ");
  const amount = Number.parseFloat(row[3].replace(/,/g, ""));

  const hash = generateHash({
    date,
    amount,
    description,
  });

  return [date, amount, description, hash];
};
