function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "";

  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return `${first}${last}`.toUpperCase();
}

interface UserAvatarProps {
  name: string;
  label?: string;
  className?: string;
}

export function UserAvatar({
  name,
  label,
  className = "",
}: UserAvatarProps) {
  return (
    <span
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-caption font-semibold text-primary ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}