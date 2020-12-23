import React, { useEffect } from "react";
import useInteractors from "hooks/useInteractors";
import createInteractors from "apps/transactions";
import createLogger from "utils/createLogger";

const log = createLogger("#82B1FF", "[TRENDS]");

function present(interactors) {
  log("interactors", interactors);

  const { state, selectors } = interactors.transactions;

  const filteredTransactions = selectors.filteredTransactions(state);

  const presentation = {
    state: {
      count: filteredTransactions.length,
    },
  };

  log("presentation", presentation);

  return presentation;
}

export default function Page() {
  const interactors = useInteractors(() => createInteractors());

  useEffect(() => {
    interactors.transactions.actions.initiate();
  }, []);

  const {
    state: { count },
  } = present(interactors);

  return <div className="text-white">{count}</div>;
}
