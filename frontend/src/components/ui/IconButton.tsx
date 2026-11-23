import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  /** Accessible name; also shown as the native tooltip. */
  label: string;
  active?: boolean;
  size?: "sm" | "md";
}

export function IconButton({
  icon: Icon,
  label,
  active = false,
  size = "md",
  className = "",
  type = "button",
  ...rest
}: IconButtonProps) {
  const dimensions = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const state = active
    ? "bg-accent-soft text-accent"
    : "text-muted hover:bg-hover hover:text-fg";

  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      className={`inline-flex ${dimensions} items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted ${state} ${className}`}
      {...rest}
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  );
}
