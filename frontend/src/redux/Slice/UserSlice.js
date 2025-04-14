import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  code: null,
  email: null,
  oauth: null,
  gender: null,
  fullName: null,
  number: null,
  admin: false,
  status: false,
  fetched: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      const {
        code,
        email,
        oauth,
        gender,
        fullName,
        number,
        admin,
        status,
        fetched = true,
      } = action.payload;

      state.code = code;
      state.email = email;
      state.oauth = oauth;
      state.gender = gender;
      state.fullName = fullName;
      state.number = number;
      state.admin = admin;
      state.status = status;
      state.fetched = fetched;
    },
    clearUser(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
