import React, { useState } from "react";
import Fade from "react-reveal/Fade";
import { MONTH_OPTIONS } from "apps/transactions/constants";
import { scaleLinear } from "d3-scale";
import getMonth from "date-fns/getMonth";
import getYear from "date-fns/getYear";
import ReactTooltip from "react-tooltip";
import { SizeMe as Size } from "react-sizeme";
import { useSelector } from "react-redux";
import * as selectors from "apps/core/selectors";
import PropTypes from "prop-types";

export default function Budget({ height }) {
  const loading = useSelector(selectors.loading);
  const tags = useSelector(selectors.tags);
  const months = useSelector(selectors.months);
  const years = useSelector(selectors.years);
  const budget = useSelector(selectors.budget);

  const [year, changeYear] = useState(getYear(new Date()));
  const [month, changeMonth] = useState(getMonth(new Date()));

  const net = useSelector(selectors.net);

  return loading ? null : (
    <Fade>
      <Size>
        {({ size }) => {
          const PADDING = 32;
          const WIDTH = size.width - PADDING * 2;
          const BAR_HEIGHT = 8;
          const SPACING = 4;
          const ID = "budget-tooltip";

          return (
            <div className="bg-grey-1000" style={{ padding: PADDING, height }}>
              <div className="flex items-center mb-2">
                <div className="text-2xs font-mono text-grey-700">budget</div>
                <div className="flex-1" />
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
              <div style={{ display: "grid", gap: SPACING }}>
                {tags.map((tag) => {
                  const netTag = net({ year, month, tag });
                  const tagBudget = budget[tag];

                  const scale =
                    tagBudget > 0
                      ? scaleLinear()
                          .domain([0, tagBudget])
                          .range([0, WIDTH / 2])
                      : scaleLinear()
                          .domain([0, tagBudget])
                          .range([0, WIDTH / 2]);

                  const displayNet = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(netTag);

                  const displayBudget = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(tagBudget);

                  return (
                    <div
                      key={tag}
                      className="font-mono text-2xs text-white flex overflow-hidden"
                      data-tip={`${displayNet} of ${displayBudget} ${tag}`}
                      data-for={ID}
                    >
                      <div
                        className="relative"
                        style={{
                          left: WIDTH / 2,
                          width: WIDTH / 2,
                          height: BAR_HEIGHT,
                        }}
                      >
                        <div
                          className="bg-grey-900 absolute"
                          style={{
                            width: Math.abs(scale(tagBudget)),
                            height: BAR_HEIGHT,
                            left: tagBudget > 0 ? 0 : -(WIDTH / 2),
                            top: 0,
                          }}
                        />
                        <div
                          className={`${
                            netTag > 0 ? `bg-green-500` : `bg-red-500`
                          } w-px absolute`}
                          style={{
                            width: Math.abs(scale(netTag)),
                            height: BAR_HEIGHT,
                            left: netTag > 0 ? 0 : -scale(netTag),
                            top: 0,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <ReactTooltip id={ID} />
            </div>
          );
        }}
      </Size>
    </Fade>
  );
}

Budget.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
