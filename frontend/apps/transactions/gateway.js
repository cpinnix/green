export async function fetchTransactions() {
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

  return response?.data?.transactions;
}

export async function fetchTaggedExpressions() {
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

  return response?.data?.taggedExpressions;
}
