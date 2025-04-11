import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: null,
  oauth: null,
  gender: null,
  fullName: null,
  number: null,
  admin: false,
  status: false,
  fetched: false, // 추가된 필드
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      const {
        email,
        oauth,
        gender,
        fullName,
        number,
        admin,
        status,
        fetched = true,
      } = action.payload;

      state.email = email;
      state.oauth = oauth;
      state.gender = gender;
      state.fullName = fullName;
      state.number = number;
      state.admin = admin;
      state.status = status;
      state.fetched = fetched; // 사용자 정보를 가져왔음을 표시
    },
    clearUser(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
