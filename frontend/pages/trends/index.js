import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import toDate from "date-fns/toDate";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import createLogger from "utils/createLogger";
import { SizeMe as Size } from "react-sizeme";
import { scaleTime, scaleLinear } from "d3-scale";
import { interpolateSinebow } from "d3-scale-chromatic";
import Navigation from "components/Navigation";
import Fade from "react-reveal/Fade";
import TransactionRow from "components/TransactionRow";

const log = createLogger("#82B1FF", "[SUMMARY]");

function present(interactors) {
  log("interactors", interactors);

  const presentation = {
    state: {
      ...interactors.transactions.state,
      years: interactors.transactions.selectors.years(
        interactors.transactions.state
      ),
      months: interactors.transactions.selectors.months(
        interactors.transactions.state
      ),
      tags: interactors.transactions.selectors.tags(
        interactors.transactions.state
      ),
    },
    selectors: {
      transactions(year, month, tag) {
        return interactors.transactions.selectors.transactionsFiltered(
          interactors.transactions.state,
          { year, month, tag }
        );
      },
    },
    actions: interactors.transactions.actions,
  };

  log("presentation", presentation);

  return presentation;
}

function Scatterplot({ tags, table, y, x }) {
  const [hoveredRow, updateHoveredRow] = useState(null);

  return (
    <div>
      {table.length > 0 && (
        <Fade>
          <div className="bg-grey-1000">
            <div className="font-mono text-xs text-white mb-4 p-4">2020</div>
            <Size monitorHeight>
              {({ size }) => {
                var PADDING = 48;
                const RADIUS = 4;
                const xRange = [0, size.width - PADDING * 2 - RADIUS * 2];
                const yRange = [0, size.height - PADDING * 2 - RADIUS * 2];

                var xScale = scaleTime().domain(x.domain).range(xRange);
                var yScale = scaleLinear().domain(y.domain).range(yRange);

                return (
                  <div style={{ height: "40rem" }}>
                    <div className="font-mono text-xs text-white">
                      <svg viewBox={`0 0 ${size.width} ${size.height}`}>
                        {table.map((row, index) => (
                          <circle
                            key={index}
                            cx={xScale(toDate(row.date)) + PADDING + RADIUS}
                            cy={yScale(row.amount) + PADDING + RADIUS}
                            r={RADIUS}
                            fill={
                              hoveredRow && row.tag === hoveredRow.tag
                                ? interpolateSinebow(
                                    tags.findIndex((tag) => tag === row.tag) /
                                      tags.length
                                  )
                                : interpolateSinebow(
                                    tags.findIndex((tag) => tag === row.tag) /
                                      tags.length
                                  )
                            }
                            className="transition-opacity duration-300 ease-in-out"
                            style={{
                              opacity:
                                hoveredRow && row.tag !== hoveredRow.tag
                                  ? 0
                                  : 1,
                            }}
                            onMouseEnter={() => updateHoveredRow(row)}
                            onMouseLeave={() => updateHoveredRow(null)}
                          />
                        ))}
                      </svg>
                    </div>
                  </div>
                );
              }}
            </Size>
            <div
              className="px-8 h-8 transition-opacity duration-300 ease-in-out"
              style={{ opacity: hoveredRow ? 1 : 0 }}
            >
              {hoveredRow && <TransactionRow {...hoveredRow} />}
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
}

Scatterplot.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  table: PropTypes.arrayOf({
    tag: PropTypes.string,
  }),
  y: PropTypes.shape({
    domain: PropTypes.arrayOf(PropTypes.number),
  }),
  x: PropTypes.shape({
    domain: PropTypes.arrayOf(PropTypes.date),
  }),
};

export default function Page() {
  const interactors = useInteractors(() => createInteractors());

  useEffect(() => {
    interactors.transactions.actions.initiate();
  }, []);

  const {
    state: { tags },
    selectors: { transactions },
  } = present(interactors);

  const table = transactions();

  const tableSortedByAmount = table.sort((a, b) => a.amount - b.amount);

  const x = {
    domain: [new Date("2020", "0", "1"), new Date("2020", "11", "31")],
  };
  const y = {
    domain: [0, 0],
  };
  if (table.length) {
    y.domain = [
      tableSortedByAmount[tableSortedByAmount.length - 1].amount,
      tableSortedByAmount[0].amount,
    ];
  }

  return (
    <div>
      <Head>
        <title>Green - Trends</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <div className="px-8">
        <Scatterplot tags={tags} x={x} y={y} table={table} />
      </div>
    </div>
  );
}
