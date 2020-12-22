export function fetchTransactions() {
  return fetch("//localhost:4000", {
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
}
