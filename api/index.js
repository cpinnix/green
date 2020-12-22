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

  type Query {
    transactions: [Transaction]
  }
`;

const resolvers = {
  Query: {
    transactions: async function () {
      return JSON.parse(fs.readFileSync(output.transactions.json));
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
