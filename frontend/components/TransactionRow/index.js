import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "utils/formatCurrency";
import { format as formatDate } from "date-fns";
import classes from "./index.module.css";

export default function TransactionRow({
  amount,
  tag,
  date,
  hash,
  description,
}) {
  return (
    <div className={classes.row}>
      <div
        className={`font-mono text-2xs text-white whitespace-pre ${
          amount < 0 ? "text-red-500" : "text-green-500"
        }`}
      >
        {formatCurrency(amount)}
      </div>
      <div className="font-mono text-2xs text-white">{tag}</div>
      <div className="font-mono text-2xs text-white overflow-x-hidden whitespace-nowrap">
        {description}
      </div>
      <div className="font-mono text-2xs text-white">
        {formatDate(new Date(date), "MMM dd yyyy")}
      </div>
      <div className="font-mono text-2xs text-white">{hash}</div>
    </div>
  );
}

TransactionRow.propTypes = {
  amount: PropTypes.number.isRequired,
  tag: PropTypes.string.isRequired,
  date: PropTypes.any.isRequired,
  hash: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
