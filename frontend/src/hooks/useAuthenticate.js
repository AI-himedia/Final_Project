// src/hooks/useAuthenticate.js
import { useSelector } from 'react-redux';

export const useAuthenticate = () => {
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = !!user?.userCode;
  return isAuthenticated;
};
