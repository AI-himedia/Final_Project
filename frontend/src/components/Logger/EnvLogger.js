// src/components/EnvLogger.js
import { useEffect } from 'react';

const EnvLogger = () => {
  useEffect(() => {
    console.log(
      '[LOG] 카카오 REST API 키 :',
      process.env.REACT_APP_KAKAO_REST_API_KEY
    );
    console.log(
      '[LOG] 카카오 시크릿키 :',
      process.env.REACT_APP_KAKAO_CLIENT_SECRET
    );
  }, []);

  return null;
};

export default EnvLogger;
