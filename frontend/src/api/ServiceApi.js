// import axios from "axios";
import { axiosInstance } from '../api/AxiosInstance';

export const getServiceCheck = async (userCode) => {
  const response = await axiosInstance.get(
    `/subscription/me?userCode=${userCode}`
  );
  return response.data;
};
