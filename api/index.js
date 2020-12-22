const fs = require("fs");
const output = require("../green-output.json");
const { ApolloServer, gql } = require("apollo-server");

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

  type Query {
    transactions: [Transaction]
    taggedExpressions: [TaggedExpression]
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
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
