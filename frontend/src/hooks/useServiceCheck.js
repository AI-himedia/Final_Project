import { useEffect, useState } from 'react';
import { getServiceCheck } from '../api/ServiceApi';
import { groupByDeceased } from '../utils/groupByDeceased';

export const useServiceCheck = (userCode) => {
  const [hasService, setHasService] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userCode) return;

    const fetchData = async () => {
      try {
        const data = await getServiceCheck(userCode);
        const grouped =
          Array.isArray(data) && data.length > 0 ? groupByDeceased(data) : [];

        setHasService(grouped);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [userCode]);

  return { hasService, error };
};
