import createMemoryStorageInteractor from "./interactor";

const memoryStorageInteractor = createMemoryStorageInteractor();

export default memoryStorageInteractor;

if (typeof window !== "undefined") {
  window._memoryStorage = memoryStorageInteractor;
}
