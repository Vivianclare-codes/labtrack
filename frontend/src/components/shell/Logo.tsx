interface LogoMarkProps {
  variant?: "solid" | "soft";
  className?: string;
}

export function LogoMark({
  variant = "solid",
  className = "",
}: LogoMarkProps) {
  const colours =
    variant === "solid"
      ? "bg-primary text-white"
      : "bg-primary-soft text-primary";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-[34px] shrink-0 items-center justify-center rounded-logo ${colours} ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path
          d="M7.5 1.65v11.7M1.65 7.5h11.7"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`text-wordmark font-light tracking-tight ${className}`}
    >
      LabTrack
    </span>
  );
}