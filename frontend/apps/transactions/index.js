import createInteractor from "./interactor";
import memoryStorage from "apps/memoryStorage";
import localStorage from "apps/localStorage";
import * as gateway from "./gateway";

export default function createInteractors() {
  const transactionsInteractor = createInteractor({
    gateway,
    memoryStorage,
    localStorage,
  });

  return {
    transactions: transactionsInteractor,
  };
}
