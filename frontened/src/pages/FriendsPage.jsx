// import { useQuery } from "@tanstack/react-query";
// import { getUserFriends } from "../lib/api";
// import FriendCard from "../components/FriendCard";
// import NoFriendsFound from "../components/NoFriendsFound";
// import { UsersIcon } from "lucide-react";

// const FriendsPage = () => {
//   const { data: friends = [], isLoading: loadingFriends } = useQuery({
//     queryKey: ["friends"],
//     queryFn: getUserFriends,
//   });

//   return (
    
//     <div className="p-4 sm:p-6 lg:p-8 bg-base-100">
//       <div className="container mx-auto space-y-10">
//         <div className="flex items-center justify-between gap-4 mb-6">
//           <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
//             <UsersIcon className="size-6" />
//             Your Friends
//           </h2>
//         </div>
//         {loadingFriends ? (
//           <div className="flex justify-center py-12">
//             <span className="loading loading-spinner loading-lg" />
//           </div>
//         ) : friends.length === 0 ? (
//           <NoFriendsFound />
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {friends.map((friend) => (
//               <FriendCard key={friend._id} friend={friend} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FriendsPage;







import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { UsersIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="container mx-auto space-y-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <UsersIcon className="size-6" />
                Your Friends
              </h2>
            </div>
            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friends.length === 0 ? (
              <NoFriendsFound />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {friends.map((friend) => (
                  <FriendCard key={friend._id} friend={friend} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FriendsPage;