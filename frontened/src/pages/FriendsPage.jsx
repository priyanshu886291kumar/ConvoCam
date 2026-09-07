

// import { useQuery } from "@tanstack/react-query";
// import { getUserFriends } from "../lib/api";
// import FriendCard from "../components/FriendCard";
// import NoFriendsFound from "../components/NoFriendsFound";
// import { UsersIcon } from "lucide-react";
// import Sidebar from "../components/Sidebar";

// const FriendsPage = () => {
//   const { data: friends = [], isLoading: loadingFriends } = useQuery({
//     queryKey: ["friends"],
//     queryFn: getUserFriends,
//   });



//   return (
//     <div className="flex h-screen bg-base-100">
//       <Sidebar />
//       <main className="flex-1 overflow-y-auto">
//         <div className="p-4 sm:p-6 lg:p-8">
//           <div className="container mx-auto space-y-10">
//             <div className="flex items-center justify-between gap-4 mb-6">
//               <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
//                 <UsersIcon className="size-6" />
//                 Your Friends
//               </h2>
//             </div>
//             {loadingFriends ? (
//               <div className="flex justify-center py-12">
//                 <span className="loading loading-spinner loading-lg" />
//               </div>
//             ) : friends.length === 0 ? (
//               <NoFriendsFound />
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {friends.map((friend) => (
//                   <FriendCard key={friend._id} friend={friend} />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default FriendsPage;




import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { UsersIcon } from "lucide-react";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ["onlineUsers"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/online-users`);
        const data = await res.json();
        return data.online || [];
      } catch {
        return [];
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <UsersIcon className="size-7 text-primary" />
            Your Friends
          </h2>
          <p className="text-sm text-base-content/70 mt-1">
            Connect, chat in real-time, or start a video call with your language partners
          </p>
        </div>
        <span className="badge badge-primary badge-lg font-semibold">
          {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
        </span>
      </div>

      {loadingFriends ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : friends.length === 0 ? (
        <NoFriendsFound />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {friends.map((friend) => (
            <FriendCard
              key={friend._id}
              friend={friend}
              isOnline={onlineUsers.includes(friend._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
