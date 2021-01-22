import React from "react";
import { useRouter } from "next/router";
import classes from "./index.module.css";

export default function Navigation() {
  const router = useRouter();

  return (
    <div className={classes.layout}>
      <div className={classes.layoutSpacer} />
      <select
        value={router.pathname}
        className="bg-transparent appearance-none focus:outline-none cursor-pointer text-xs font-mono text-white"
        onChange={(e) => {
          const nextPath = e.target.value;
          router.push(nextPath);
        }}
      >
        <option value="/">transactions</option>
        <option value="/summary">summary</option>
        <option value="/trends">trends</option>
        <option value="/dashboard">dashboard</option>
      </select>
    </div>
  );
}
