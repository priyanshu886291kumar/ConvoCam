import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("authUser");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;



// 🎯 What Is This File For?
// This file creates a custom hook named useLogout.

// 🧠 Its job is:

// To log the user out from the app, and then refresh the user info so the app knows the user is now logged out.

// We use a helper tool called React Query to do this easily.

