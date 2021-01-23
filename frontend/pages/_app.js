import React from "react";
import "tailwindcss/tailwind.css";
import "./_app.css";
import core from "apps/core";
import { Provider } from "react-redux";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={core}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
