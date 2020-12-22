const tags = require("../../green-tags.json");

module.exports = ({ description, hash }) =>
  tags
    .filter((tag) => {
      const regExp = new RegExp(tag[0]);
      return description.match(regExp) || tag[0] === hash;
    })
    .map((tag) => tag[1])
    .reduce((acc, tag) => [tag], [])
    .join(",");
