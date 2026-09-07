import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    refetchOnWindowFocus: false, // Prevents kicking user to login when switching to terminal
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};
export default useAuthUser;



// 🔶 What is This File?
// This file is a custom hook called useAuthUser. A hook is like a small helper that we can use to do some special work in our React app.

// This particular helper is used to check who the user is (are they logged in or not).

