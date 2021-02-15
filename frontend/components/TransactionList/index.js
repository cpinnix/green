import React, { useState } from "react";
import PropTypes from "prop-types";
import sum from "lodash/sum";
import { List, AutoSizer } from "react-virtualized";
import Fade from "react-reveal/Fade";
import { useSelector } from "react-redux";
import * as selectors from "apps/core/selectors";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import classes from "./index.module.css";
import formatCurrency from "utils/formatCurrency";
import { format as formatDate } from "date-fns";

export default function TransactionList({ height }) {
  const loading = useSelector(selectors.loading);
  const tags = useSelector(selectors.tags);
  const months = useSelector(selectors.months);
  const years = useSelector(selectors.years);

  const [tag, changeTag] = useState();
  const [month, changeMonth] = useState(getMonth(new Date()));
  const [year, changeYear] = useState(getYear(new Date()));
  const [query, changeQuery] = useState();

  const transactions = useSelector(selectors.filteredTransactions)({
    tag,
    month,
    year,
    query,
  });

  const count = transactions.length;
  const net = sum(transactions.map((transaction) => transaction.amount));

  function rowRenderer({ index, key, style }) {
    const { amount, description, date, hash } = transactions[index];

    return (
      <div key={key} style={style}>
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
      </div>
    );
  }

  return loading ? null : (
    <Fade>
      <div style={{ height }}>
        <div className="flex flex-col h-full bg-grey-1000 pt-8">
          <div className="flex items-center space-x-2 px-8 border-b border-grey-900">
            <select
              name="month"
              id="month"
              value={month}
              className="bg-transparent appearance-none focus:border-blue-500 focus:outline-none cursor-pointer font-mono text-2xs text-white leading-none"
              onChange={(e) => {
                let newMonth = e.target.value;
                if (newMonth) {
                  newMonth = parseInt(newMonth);
                }
                changeMonth(newMonth);
              }}
            >
              <option value="">month</option>
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {MONTH_OPTIONS[index]}
                </option>
              ))}
            </select>
            <select
              name="year"
              id="year"
              value={year}
              className="bg-transparent appearance-none focus:border-blue-500 focus:outline-none cursor-pointer font-mono text-2xs text-white leading-none"
              onChange={(e) => {
                let newYear = e.target.value;
                if (newYear) {
                  newYear = parseInt(newYear);
                }
                changeYear(newYear);
              }}
            >
              <option value="">year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              name="tags"
              id="tags"
              value={tag}
              className="bg-transparent appearance-none focus:border-blue-500 focus:outline-none cursor-pointer font-mono text-2xs text-white leading-none"
              onChange={(e) => {
                changeTag(e.target.value);
              }}
            >
              <option value="">tag</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <input
              placeholder="search"
              value={query}
              onChange={(e) => {
                changeQuery(e.target.value);
              }}
              className="flex-1 font-mono text-2xs leading-none py-3 bg-transparent text-white focus:outline-none focus:text-blue-500 w-24"
            />
            <div className="font-mono text-2xs mb-0.5 text-white pr-2">
              <span
                className={`whitespace-pre ${
                  net < 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(net)}
              </span>{" "}
              net. {count} transactions.
            </div>
          </div>
          <div className="flex-1">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowCount={transactions.length}
                  rowHeight={20}
                  rowRenderer={rowRenderer}
                  className="bg-grey-1000 focus:outline-none focus:border-blue-500"
                  overscanRowCount={100}
                />
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    </Fade>
  );
}

TransactionList.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
