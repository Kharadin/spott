import { useQuery , useMutation} from "convex/react";
import { useState, useEffect } from "react";
import { toast } from "sonner"; 


export const useConvexQuery = (query, ...args) => {
  // 1. Unpack rest parameters. If no args or first arg is undefined, flag it to skip.
  const firstArg = args[0];
  const shouldSkip = firstArg === undefined || firstArg === "skip";

  // 2. Pass "skip" directly to standard useQuery if we should skip, otherwise pass the args
  const result = useQuery(query, shouldSkip ? "skip" : firstArg);
  
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Use effect to handle the state changes based on the query result
  useEffect(() => {
    if (result === undefined) {
      setIsLoading(true);
    } else {
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
  }, [result]);

  return {
    data,
    isLoading,
    error,
  };
};

// no-useEffect version, try it later 
// export const useConvexQuery = (query, ...args) => {
//   const firstArg = args[0];
//   const shouldSkip = firstArg === undefined || firstArg === "skip";

//   // Assuming useQuery returns the data directly or undefined while loading
//   const result = useQuery(query, shouldSkip ? "skip" : firstArg);

//   // Derive states instantly during the render phase
//   const isLoading = result === undefined;
//   const data = result;
//   const error = null; // Note: Standard useQuery hooks usually expose an error object directly if needed

//   return {
//     data,
//     isLoading,
//     error,
//   };
// };


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
      toast.error(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
