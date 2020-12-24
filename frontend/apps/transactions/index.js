import createInteractor from "./interactor";
import memoryStorage from "apps/memoryStorage";
import localStorage from "apps/localStorage";
import * as gateway from "./gateway";
import createLogger from "utils/createLogger";
import createTracer from "utils/createTracer";

const log = createLogger("#B388FF", "[TRANSACTIONS]");
const { createSpan } = createTracer(log);

export default function createInteractors() {
  const endSpan = createSpan("createInteractor");

  const transactionsInteractor = createInteractor({
    gateway,
    memoryStorage,
    localStorage,
  });

  endSpan();

  return {
    transactions: transactionsInteractor,
  };
}
