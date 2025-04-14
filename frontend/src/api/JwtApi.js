// src/services/api/JwtApi.js

import axios from 'axios';
import { API_SERVER_HOST } from '../config/ApiConfig';

export const refreshJWT = async () => {
  const res = await axios.post(
    // `${API_SERVER_HOST}/api/member/token/refresh`,
    `${API_SERVER_HOST}/be/member/token/refresh`,
    null,
    {
      withCredentials: true,
    }
  );
  return res.data;
};
