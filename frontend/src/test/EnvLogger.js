import React, { useEffect } from 'react';

const EnvLogger = () => {
  useEffect(() => {
    console.log('Environment Variables:', process.env);
  }, []);

  return null;
};

export default EnvLogger;
