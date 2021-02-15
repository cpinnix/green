import React, { useState } from "react";
import PropTypes from "prop-types";
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
          <div className="font-mono text-2xs text-grey-700">year over year</div>
          <div className="flex-1" />
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
        <div className="text-white font-mono text-4xl mb-2">{displayNet}</div>
        <div className="text-white font-mono text-2xs mb-8 text-grey-500">
          {displayLastNet}
        </div>
        <div className="bg-grey-900 h-4 w-full relative">
          <div
            className="bg-green-500 h-4"
            style={{ width: `${(thisYear / lastYear) * 100}%` }}
          ></div>
          {Array.apply(null, new Array(11)).map((_, index) => (
            <div
              key={index}
              className="absolute bg-white opacity-50 w-px h-full top-0"
              style={{
                left: `${((index + 1) * 100) / 12}%`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </Fade>
  );
}

YearOverYear.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
