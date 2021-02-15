import React from "react";
import PropTypes from "prop-types";
import Fade from "react-reveal/Fade";
import { useSelector } from "react-redux";
import * as selectors from "apps/core/selectors";
import formatCurrency from "utils/formatCurrency";

export default function NetWorth({ height }) {
  const loading = useSelector(selectors.loading);
  const accounts = useSelector(selectors.accounts);
  const netWorth = useSelector(selectors.netWorth);

  return loading ? null : (
    <Fade>
      <div className="bg-grey-1000 p-8" style={{ height }}>
        <div className="font-mono mb-4">
          <div className="text-2xs text-grey-600 mt-3 mb-3">net worth</div>
          <div className="text-white whitespace-pre text-4xl">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(netWorth)}
          </div>
        </div>
        <div className="space-y-1">
          {accounts.map(({ name, amount }) => (
            <div key={name} className="font-mono text-2xs flex">
              <div className="text-white flex-1">{name}</div>
              <div
                className={`whitespace-pre ${
                  amount < 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                {formatCurrency(amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fade>
  );
}

NetWorth.propTypes = {
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
