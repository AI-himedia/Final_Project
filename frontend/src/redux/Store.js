// src/redux/Store.js

import { configureStore } from '@reduxjs/toolkit';
import loginSlice from './LoginSlice';

const store = configureStore({
  reducer: {
    user: loginSlice,
  },
});

export default store;
