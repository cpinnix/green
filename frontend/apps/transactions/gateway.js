import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";

const log = createLogger("#B388FF", "[TRANSACTIONS]");
const { createSpan } = createTracer(log);

export async function fetchTransactions() {
  const endSpan = createSpan("`fetchTransactions`");

  const response = await fetch("//localhost:4000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
          query {
            transactions {
              date
              amount
              description
              hash
            }
          }`,
    }),
  }).then((response) => response.json());

  endSpan();

  return response?.data?.transactions;
}

export async function fetchTaggedExpressions() {
  const endSpan = createSpan("`fetchTaggedExpressions`");

  const response = await fetch("//localhost:4000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
          query {
            taggedExpressions {
              regex
              tag
            }
          }`,
    }),
  }).then((response) => response.json());

  endSpan();

  return response?.data?.taggedExpressions;
}
