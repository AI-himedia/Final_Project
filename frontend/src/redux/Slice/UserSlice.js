import { createSlice } from '@reduxjs/toolkit';

const savedUser = localStorage.getItem('user');

const initialState = savedUser
  ? { isLoggedIn: true, user: JSON.parse(savedUser) }
  : { isLoggedIn: false, user: null };

// userSlice.js
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload;
      // console.log('[DEBUG] setUser 실행됨:', userData);
      state.isLoggedIn = true;
      state.user = userData;
      // setTimeout(() => {
      //   localStorage.setItem('user', JSON.stringify(userData));
      // }, 0);
    },

    clearUser: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      // localStorage.removeItem('user');
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
