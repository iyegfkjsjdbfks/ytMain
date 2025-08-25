// useServiceWorker - Optimized Hook
import { useState, useEffect } from 'react';

export function useServiceWorker() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setState({ initialized: true, timestamp: Date.now() });
      setLoading(false);
    }, 100);
  }, []);

  return { state, loading, setState };
}

export default useServiceWorker;