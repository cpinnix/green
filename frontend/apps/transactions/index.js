import createInteractor from "./interactor";
import * as gateway from "./gateway";

export default function createInteractors() {
  const transactionsInteractor = createInteractor({ gateway });

  // transactionsInteractor.actions.initiate();

  return {
    transactions: transactionsInteractor,
  };
}
