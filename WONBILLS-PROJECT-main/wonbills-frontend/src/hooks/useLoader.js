import { useRef, useState, useCallback } from "react";

export default function useSkeletonLoader(minTime = 600) {
  const startRef = useRef(0);
  const [loading, setLoading] = useState(false);

  const startLoading = useCallback(() => {
    startRef.current = Date.now();
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(0, minTime - elapsed);

    setTimeout(() => {
      setLoading(false);
    }, remaining);
  }, [minTime]);

  return {
    loading,
    startLoading,
    stopLoading,
  };
}
