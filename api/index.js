const fs = require("fs");
const parse = require("csv-parse");
const output = require("../green-output.json");
const { ApolloServer, gql } = require("apollo-server");

function parseCSV(path) {
  return new Promise((resolve) => {
    const table = [];

    const parser = parse({
      delimiter: ",",
      relax_column_count: true,
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read())) {
        table.push(record);
      }
    });

    // parser.on("error", (err) => {
    //   logger.error(err.message);
    // });

    parser.on("end", () => {
      resolve(table);
    });

    const file = fs.readFileSync(path);
    parser.write(file);
    parser.end();
  });
}

const typeDefs = gql`
  type Transaction {
    date: String
    amount: Float
    description: String
    hash: String
  }

  type TaggedExpression {
    regex: String
    tag: String
  }

  type Budget {
    tag: String
    amount: Float
  }

  type Query {
    transactions: [Transaction]
    taggedExpressions: [TaggedExpression]
    budgets: [Budget]
  }
`;

const resolvers = {
  Query: {
    transactions: async function () {
      return JSON.parse(fs.readFileSync(output.transactions.json));
    },
    taggedExpressions: async function () {
      return JSON.parse(
        fs.readFileSync("../green-tags.json")
      ).map(([regex, tag]) => ({ regex, tag }));
    },
    budgets: async function () {
      const table = await parseCSV("../green-budget.csv");
      return table.map((row) => ({
        tag: row[0],
        amount: row[1],
      }));
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
