import { cn } from "./ui";

type NewsBadgeProps = {
  children: React.ReactNode;
  color?: string;
  className?: string;
};

export function NewsBadge({ children, color, className }: NewsBadgeProps) {
  const isAccent = !color;
  const style = isAccent ? {} : { color, backgroundColor: `${color}22` };

  return (
    <span className={cn("rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", isAccent ? "bg-accent-dim text-accent" : "", className)} style={style}>
      {children}
    </span>
  );
}