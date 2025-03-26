// src/redux/Store.js

import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./LoginSlice";

export const store = configureStore({
  reducer: {
    loginSlice: loginSlice,
  },
});

export default store;
