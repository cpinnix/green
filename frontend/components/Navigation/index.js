import React from "react";
import Link from "next/link";
import classes from "./index.module.css";

export default function Navigation() {
  return (
    <div className={classes.layout}>
      <div className="text-xl">🤑</div>
      <div className={classes.layoutSpacer} />
      <Link href="/">
        <a
          className={`
            font-mono
            text-xs
            text-white
            ml-4
            focus:outline-none
            focus:text-blue-500
            ${
              window && window.location.pathname === "/"
                ? "text-yellow-200"
                : ""
            }
          `}
        >
          Transactions
        </a>
      </Link>
      <Link href="/trends">
        <a
          className={`
            font-mono
            text-xs
            text-white
            ml-4
            focus:outline-none
            focus:text-blue-500
            ${
              window && window.location.pathname.includes("/trends")
                ? "text-yellow-200"
                : ""
            }
          `}
        >
          Summary
        </a>
      </Link>
    </div>
  );
}
