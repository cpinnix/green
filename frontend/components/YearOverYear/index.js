import React, { useState } from "react";
import Fade from "react-reveal/Fade";
import getYear from "date-fns/getYear";
import { useSelector } from "react-redux";
import * as selectors from "apps/core/selectors";

export default function YearOverYear({ height }) {
  const loading = useSelector(selectors.loading);
  const years = useSelector(selectors.years);

  const [year, changeYear] = useState(getYear(new Date()));

  const thisYear = useSelector(selectors.net)({ year });
  const lastYear = useSelector(selectors.net)({ year: year - 1 });

  const displayNet = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(thisYear);

  const displayLastNet = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(lastYear);

  return loading ? null : (
    <Fade>
      <div className="bg-grey-1000 p-8" style={{ height }}>
        <div className="flex items-center">
          <div className="font-mono text-xs text-grey-700">year over year</div>
          <div className="flex-1" />
          <select
            name="year"
            id="year"
            value={year}
            className="p-3 bg-transparent appearance-none focus:outline-none cursor-pointer text-white font-mono text-xs"
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
        <div className="text-white font-mono text-6xl mb-2">{displayNet}</div>
        <div className="text-white font-mono text-lg mb-8 text-grey-500">
          {displayLastNet}
        </div>
        <div className="bg-grey-900 h-4 w-full">
          <div
            className="bg-green-500 h-4"
            style={{ width: `${(thisYear / lastYear) * 100}%` }}
          ></div>
        </div>
      </div>
    </Fade>
  );
}
