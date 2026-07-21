import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 56,
};

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <span
        className={`relative inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-surface ${SIZE_CLASS[size]} ${className}`}
      >
        <Image
          src={avatarUrl}
          alt={name ?? "Avatar"}
          width={SIZE_PX[size]}
          height={SIZE_PX[size]}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground ${SIZE_CLASS[size]} ${className}`}
    >
      {name?.charAt(0).toUpperCase() ?? "?"}
    </span>
  );
}
