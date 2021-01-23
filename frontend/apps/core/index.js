import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import reducer from "./reducer";
import performanceMiddleware from "./middleware/performance";
import * as actions from "./actions";

const store = configureStore({
  reducer,
  middleware: [
    ...getDefaultMiddleware(),
    performanceMiddleware("[CORE]", "#B388FF"),
  ],
});

store.dispatch(actions.fetchData());

export default store;
