// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { login } from "../lib/api";

// const useLogin = () => {
//   const queryClient = useQueryClient();
//   const { mutate, isPending, error } = useMutation({
//     mutationFn: login,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
//   });

//   return { error, isPending, loginMutation: mutate };
// };

// export default useLogin;


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Save user to localStorage
      if (data && data.user) {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { isPending, error, loginMutation: mutate };
};
export default useLogin;


// 🎯 What is This File Doing?
// This file creates a helper function called useLogin.

// 🧠 Its job is:

// To log a user into the app, and after that, refresh the user data so the app knows who is now logged in.

// It uses a magic tool called React Query to do this easily.

