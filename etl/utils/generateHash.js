const crypto = require("crypto");

module.exports = ({ date, description, amount }) =>
  crypto
    .createHash("md5")
    .update([date, description, amount].join(""))
    .digest("hex");
