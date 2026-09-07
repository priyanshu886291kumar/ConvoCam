import { useNavigate } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { useChatStore } from "../store/useChatStore";
import { MessageSquare, Video } from "lucide-react";
import Avatar from "./Avatar";

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}

const FriendCard = ({ friend, isOnline }) => {
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const navigate = useNavigate();

  return (
    <div className="card bg-base-200/80 hover:bg-base-200 border border-base-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col h-full">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3.5">
          <Avatar
            src={friend.profilePic}
            name={friend.fullName}
            size="lg"
            isOnline={isOnline}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-base-content truncate">
              {friend.fullName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`size-2 rounded-full shrink-0 ${
                  isOnline ? "bg-success animate-pulse" : "bg-base-content/30"
                }`}
              />
              <span
                className={`text-xs font-medium truncate ${
                  isOnline ? "text-success" : "text-base-content/60"
                }`}
              >
                {isOnline ? "Active now" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="badge badge-secondary/90 text-xs font-medium py-2.5">
            {getLanguageFlag(friend.nativeLanguage)}
            <span className="truncate max-w-[120px]">
              Native: {friend.nativeLanguage}
            </span>
          </span>
          <span className="badge badge-outline text-xs font-medium py-2.5">
            {getLanguageFlag(friend.learningLanguage)}
            <span className="truncate max-w-[120px]">
              Learning: {friend.learningLanguage}
            </span>
          </span>
        </div>

        {/* ACTION BUTTONS: Message & Video Call */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-base-300/50">
          <button
            className="btn btn-outline btn-sm flex-1 gap-1.5 font-medium text-xs sm:text-sm min-w-0"
            onClick={() => {
              setSelectedUser(friend);
              navigate(`/chat/${friend._id}`);
            }}
          >
            <MessageSquare className="size-3.5 sm:size-4 shrink-0" />
            <span className="truncate">Message</span>
          </button>
          <button
            className="btn btn-primary btn-sm flex-1 gap-1.5 font-medium text-xs sm:text-sm min-w-0"
            onClick={() => {
              setSelectedUser(friend);
              navigate(`/call/${friend._id}`, { state: { isCaller: true } });
            }}
            title="Start WebRTC Video Call"
          >
            <Video className="size-3.5 sm:size-4 shrink-0" />
            <span className="truncate">Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;