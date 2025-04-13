// utils/AuthUtils.js
import { axiosInstance } from '../api/axios/AxiosInstance';

export async function checkAuthStatus() {
  try {
    await axiosInstance.get('/member/me');
    console.log('User is already logged in (via /api/member/me)');
    return true;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('User is not logged in (via /api/member/me)');
    } else {
      console.error('Error checking auth status:', error);
    }
    return false;
  }
}
