import React from "react";
import PropTypes from "prop-types";
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

MyApp.propTypes = {
  Component: PropTypes.node,
  pageProps: PropTypes.any,
};

export default MyApp;
