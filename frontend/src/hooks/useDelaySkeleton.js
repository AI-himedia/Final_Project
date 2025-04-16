// src/hooks/useDelaySkeleton.js
import { useEffect, useState } from 'react';

export function useDelaySkeleton(minDuration = 1000) {
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  return showSkeleton;
}
