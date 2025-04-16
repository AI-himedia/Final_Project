import { axiosInstance } from './AxiosInstance';

export const getUserInfo = async () => {
  const response = await axiosInstance.get(`/member/me`);
  return response.data;
};
