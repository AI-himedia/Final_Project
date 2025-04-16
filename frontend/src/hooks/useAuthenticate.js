// src/hooks/useAuthenticate.js
import { useSelector } from 'react-redux';

export const useAuthenticate = () => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  return isLoggedIn;
};
