import React, { useState } from "react";

// Palette of pleasant background gradients based on string hash
const GRADIENT_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-fuchsia-600",
];

const getGradientForName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_COLORS.length;
  return GRADIENT_COLORS[index];
};

const getInitials = (name = "") => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SIZE_MAP = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
  "2xl": "size-24 text-3xl",
};

const Avatar = ({
  src,
  name = "User",
  size = "md",
  className = "",
  isOnline,
  ring = false,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = SIZE_MAP[size] || size;
  const gradient = getGradientForName(name);
  const initials = getInitials(name);

  // Reliable fallback avatar url if src is missing
  const avatarSrc =
    src ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&color=fff&bold=true`;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-bold select-none transition-transform ${sizeClasses} ${
          ring ? "ring-2 ring-primary ring-offset-base-100 ring-offset-1" : ""
        } ${className}`}
      >
        {!hasError && avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${gradient} text-white shadow-inner`}
          >
            <span>{initials}</span>
          </div>
        )}
      </div>

      {/* Online / Offline status badge */}
      {isOnline !== undefined && isOnline !== null && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-base-100 ${
            isOnline ? "bg-success" : "bg-base-300"
          } ${
            size === "xs" || size === "sm"
              ? "size-2.5"
              : size === "lg" || size === "xl" || size === "2xl"
              ? "size-4 border-[3px]"
              : "size-3.5"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};

export default Avatar;
