import createLocalStorageInteractor from "./interactor";

const localStorageInteractor = createLocalStorageInteractor();

export default localStorageInteractor;

if (typeof window !== "undefined") {
  window._localStorage = localStorageInteractor;
}
