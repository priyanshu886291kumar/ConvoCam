import React from "react";
import { Video } from "lucide-react";
import Avatar from "./Avatar";

const ChatHeader = ({ selectedUser, onlineUsers, onVideoCall }) => {
  const formatLastSeen = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `last seen ${d.toLocaleDateString([], { weekday: "short" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (!selectedUser) return null;

  const isOnline = onlineUsers?.includes(selectedUser._id);

  return (
    <div className="p-3 border-b border-base-300 bg-base-100 sticky top-0 z-10 flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Avatar
          src={selectedUser.profilePic}
          name={selectedUser.fullName}
          size="md"
          isOnline={isOnline}
          ring={true}
        />
        <div>
          <h3 className="font-semibold text-base leading-tight">{selectedUser.fullName}</h3>
          <p className="text-xs text-base-content/70 mt-0.5">
            {isOnline ? (
              <span className="text-success font-medium">Online</span>
            ) : (
              formatLastSeen(selectedUser.lastSeen)
            )}
          </p>
        </div>
      </div>

      {/* 🎥 Prominent WebRTC Video Call Button */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary btn-sm sm:btn-md gap-2 shadow-sm"
          title="Start 1-on-1 WebRTC Video Call"
          onClick={onVideoCall}
        >
          <Video className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">Video Call</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;