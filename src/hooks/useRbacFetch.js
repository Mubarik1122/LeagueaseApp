import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetches RBAC list/data once per dependency set.
 * - Skips fetch when `enabled` is false (e.g. waiting for company context).
 * - Ignores stale responses on unmount / dep change (StrictMode-safe state).
 * - Pair with deduped GET helpers in api.js to avoid duplicate network calls.
 */
export function useRbacFetch(fetcher, deps, options = {}) {
  const { enabled = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetchIdRef = useRef(0);

  const runFetch = useCallback(
    async (manual = false) => {
      if (!enabled && !manual) {
        setLoading(false);
        return null;
      }

      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (fetchId === fetchIdRef.current) {
          setData(result);
        }
        return result;
      } catch (err) {
        if (fetchId === fetchIdRef.current) {
          setError(err);
        }
        throw err;
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, ...deps]
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    runFetch().catch(() => {});

    return () => {
      fetchIdRef.current += 1;
    };
  }, [enabled, runFetch]);

  const reload = useCallback(() => runFetch(true), [runFetch]);

  return { data, loading, error, reload, setData };
}
