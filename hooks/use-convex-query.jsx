import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query, ...args) => {
  // 1. SAFETY CHECK: Convert 'null' or undefined to the official "skip" token
  // This allows you to pass 'null' from your components without crashing
  const shouldSkip = !query || query === "skip";
  const queryArg = shouldSkip ? "skip" : query;

  // 2. Always call the hook (React Rule), but pass "skip" if offline
  const result = useQuery(queryArg, ...args);

  const [data, setData] = useState(undefined);
  // If we are skipping, we are NOT loading. We are just idle/empty.
  const [isLoading, setIsLoading] = useState(!shouldSkip);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 3. Handle the "Skipped" state (Offline/Decoupled)
    if (shouldSkip) {
      setData(undefined);
      setError(null);
      setIsLoading(false); // crucial: stop loading spinner if we aren't fetching
      return;
    }

    // 4. Handle Standard Loading State
    if (result === undefined) {
      setIsLoading(true);
    } else {
      // 5. Handle Success
      try {
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [result, shouldSkip, query]); // Depend on 'shouldSkip' logic, not just query

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = (mutation) => {
  const mutationFn = useMutation(mutation);
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mutationFn(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      // Optional: Verify this toast doesn't duplicate existing global error handlers
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};

