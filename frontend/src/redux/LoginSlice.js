import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLogin: false,
  email: null,
  isChecking: true,
};

const LoginSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin(state, action) {
      state.isLogin = true;
      state.email = action.payload;
    },
    setLogout(state) {
      state.isLogin = false;
      state.email = null;
    },
  },
});

export const { setLogin, setLogout } = LoginSlice.actions;
export default LoginSlice.reducer;
