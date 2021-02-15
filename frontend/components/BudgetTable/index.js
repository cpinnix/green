import React, { useState } from "react";
import PropTypes from "prop-types";
import Fade from "react-reveal/Fade";
import { useSelector } from "react-redux";
import * as selectors from "apps/core/selectors";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import formatCurrency from "utils/formatCurrency";
import classes from "./index.module.css";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import { format as formatDate } from "date-fns";

function Accordion({ header, children, enabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => enabled && setOpen(!open)}>{header}</div>
      {open && children}
    </div>
  );
}

Accordion.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  enabled: PropTypes.bool,
};

export default function BudgetTable() {
  const loading = useSelector(selectors.loading);
  const tags = useSelector(selectors.tags);
  const months = useSelector(selectors.months);
  const years = useSelector(selectors.years);
  const budget = useSelector(selectors.budget);

  const [month, changeMonth] = useState(getMonth(new Date()));
  const [year, changeYear] = useState(getYear(new Date()));

  const netSelector = useSelector(selectors.net);
  const transactionsSelector = useSelector(selectors.filteredTransactions);

  const net = netSelector({ year, month });

  const multiplier = month !== "" ? 1 : 12;

  return loading ? null : (
    <Fade>
      <div className="bg-grey-1000 py-8 mb-8">
        <div className="px-8 space-x-2">
          <select
            name="month"
            id="month"
            value={month}
            className="bg-transparent appearance-none focus:outline-none cursor-pointer text-white font-mono text-2xs"
            onChange={(e) => {
              let newMonth = e.target.value;
              if (newMonth) {
                newMonth = parseInt(newMonth);
              }
              changeMonth(newMonth);
            }}
          >
            <option value=""></option>
            {months.map((month, index) => (
              <option key={month} value={month}>
                {MONTH_OPTIONS[index]}
              </option>
            ))}
          </select>
          <select
            name="year"
            id="year"
            value={year}
            className="p-3 bg-transparent appearance-none focus:outline-none cursor-pointer text-white font-mono text-2xs"
            onChange={(e) => {
              let newYear = e.target.value;
              if (newYear) {
                newYear = parseInt(newYear);
              }
              changeYear(newYear);
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className={classes.row}>
          <div className="font-mono text-2xs text-white">tag</div>
          <div className={`font-mono text-2xs text-white`}>amount</div>
          <div className={`font-mono text-2xs text-white`}>budget</div>
          <div className={`font-mono text-2xs text-white`}>diff</div>
          <div className="font-mono text-2xs text-white">transactions</div>
        </div>
        <div className="bg-grey-1000">
          {tags.map((tag) => {
            const netTag = netSelector({ year, month, tag });
            const rows = transactionsSelector({ year, month, tag });

            return (
              <div key={tag}>
                <Accordion
                  enabled={rows.length > 0}
                  header={
                    <div
                      className={`
                        ${classes.row}
                        ${rows.length > 0 ? "cursor-pointer" : ""}
                      `}
                    >
                      <div className="font-mono text-2xs text-white">{tag}</div>
                      <div
                        className={`font-mono text-2xs whitespace-pre ${
                          netTag < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {formatCurrency(netTag)}
                      </div>
                      <div
                        className={`font-mono text-2xs whitespace-pre text-gray-500`}
                      >
                        {formatCurrency(budget[tag] * multiplier)}
                      </div>
                      <div
                        className={`font-mono text-2xs whitespace-pre ${
                          netTag - budget[tag] * multiplier < 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {formatCurrency(netTag - budget[tag] * multiplier)}
                      </div>
                      <div className="font-mono text-2xs text-gray-500">
                        {rows.length}
                      </div>
                    </div>
                  }
                >
                  <div className="bg-grey-900 max-h-96 overflow-scroll">
                    {rows.map(({ amount, date, description, hash }, index) => (
                      <div key={index} className={classes.transaction}>
                        <div
                          className={`font-mono text-2xs text-white whitespace-pre ${
                            amount < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {formatCurrency(amount)}
                        </div>
                        <div className="font-mono text-2xs text-white overflow-x-hidden whitespace-nowrap">
                          {description}
                        </div>
                        <div className="font-mono text-2xs text-white">
                          {formatDate(new Date(date), "MMM dd yyyy")}
                        </div>
                        <div className="font-mono text-2xs text-white">
                          {hash}
                        </div>
                      </div>
                    ))}
                  </div>
                </Accordion>
              </div>
            );
          })}
          <div className={classes.row}>
            <div className="font-mono text-2xs text-white">net</div>
            <div
              className={`font-mono text-2xs whitespace-pre ${
                net < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {formatCurrency(net)}
            </div>
            <div className={`font-mono text-2xs whitespace-pre text-gray-500`}>
              {formatCurrency(budget.net * multiplier)}
            </div>
            <div
              className={`font-mono text-2xs whitespace-pre ${
                net - budget.net * multiplier < 0
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {formatCurrency(net - budget.net * multiplier)}
            </div>
          </div>
        </div>
      </div>
    </Fade>
  );
}
