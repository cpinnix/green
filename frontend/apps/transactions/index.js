import createInteractor from "./interactor";
import memoryStorage from "apps/memoryStorage";
import localStorage from "apps/localStorage";
import * as gateway from "./gateway";
import createSpan from "utils/createSpan";

export default function createInteractors() {
  const endSpan = createSpan("[TRANSACTIONS] createInteractor");

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
