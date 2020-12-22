import { useEffect } from "react";
import Head from "next/head";

export default function Home() {
  useEffect(() => {
    fetch("//localhost:4000", {
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
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Green</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>Hello World</div>
    </div>
  );
}
