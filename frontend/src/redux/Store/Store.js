import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Slice/userSlice';
import authReducer from '../Slice/authSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});

export default store;
