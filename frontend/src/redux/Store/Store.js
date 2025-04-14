// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../Slice/UserSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// rootReducer
const rootReducer = combineReducers({
  user: userReducer,
});

// persist 설정
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

// persist 적용된 reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store 생성
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// persistor 내보내기
export const persistor = persistStore(store);

export default store;
