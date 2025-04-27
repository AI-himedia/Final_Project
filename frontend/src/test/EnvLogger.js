import React, { useEffect } from 'react';

const EnvLogger = () => {
  useEffect(() => {
    console.log('Environment Variables:', process.env);
  }, []);

  return (
    <div>
      <h1>Environment Logger</h1>
      <p>Check the console for the environment variables.</p>
    </div>
  );
};

export default EnvLogger;
