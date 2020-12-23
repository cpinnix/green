import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import classes from "./index.module.css";

export default function Navigation() {
  const router = useRouter();

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
            ${router.pathname === "/" ? "text-yellow-200" : ""}
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
            ${router.pathname.includes("/trends") ? "text-yellow-200" : ""}
          `}
        >
          Summary
        </a>
      </Link>
    </div>
  );
}
