  import { useUser } from "@clerk/clerk-react";
 import { useConvexAuth, useMutation } from "convex/react";
  import { useEffect, useState } from "react";

  import { api } from "../convex/_generated/api";

  export function useStoreUser() {
    const { isLoading, isAuthenticated } = useConvexAuth();
    const { user } = useUser();
    // When this state is set we know the server
    // has stored the user.
    const [userId, setUserId] = useState(null);
    const storeUser = useMutation(api.users.store);   
    // I: store- is the name of the mutation in users.js file
    // Call the `storeUser` mutation function to store
    // the current user in the `users` table and return the `Id` value.
    useEffect(() => {
      // If the user is not logged in don't do anything
      if (!isAuthenticated) {
        return;
      }
      let cancelled = false;
      // Store the user in the database.
      // Recall that `storeUser` gets the user information via the `auth`
      // object on the server. You don't need to pass anything manually here.
      async function createUser() {
        try {
          const id = await storeUser();
          if (!cancelled) {
            setUserId(id);
          }
          } catch (error) {
          console.error("Failed to store user:", error);
          // Optionally: set error state or retry logic
        }
      }
      createUser();

      return () => {
        cancelled = true;
      setUserId(null);
      };
      // Make sure the effect reruns if the user logs in with
      // a different identity
    }, [isAuthenticated, storeUser, user?.id]);
    // Combine the local state with the state from context
    return {
      isLoading: isLoading || (isAuthenticated && userId === null),
      isAuthenticated: isAuthenticated && userId !== null,
    };
  }