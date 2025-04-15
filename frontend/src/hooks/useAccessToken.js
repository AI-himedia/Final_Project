import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAccessToken } from '../redux/Slice/userSlice';

export default function useAccessTokenFromURL() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('accessToken');
    if (token) {
      dispatch(setAccessToken(token));
      window.history.replaceState({}, '', '/');
    }
  }, [location.search, dispatch]);
}
