import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function cn(...args: (string | undefined | false | null)[]) {
  return clsx(...args);
}

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-bg-2 shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-text-2">{title}</div>
      {action}
    </div>
  );
}

const kpiIconBg: Record<string, string> = {
  blue: "bg-accent-dim text-accent",
  green: "bg-success-dim text-success",
  amber: "bg-warn-dim text-warn",
  red: "bg-danger-dim text-danger",
};

export function KpiCard({
  icon,
  tone = "blue",
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "red";
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-card-md">
      <div className={cn("flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px]", kpiIconBg[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-2">{label}</div>
        <div className="font-display text-[26px] font-bold leading-none text-text">{value}</div>
        {sub && <div className="mt-0.5 text-[10px] text-text-3">{sub}</div>}
      </div>
    </Card>
  );
}

const badgeTone: Record<string, string> = {
  success: "bg-success-dim text-success",
  warn: "bg-warn-dim text-warn",
  danger: "bg-danger-dim text-danger",
  info: "bg-accent-dim text-accent",
  neutral: "bg-bg-3 text-text-2",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "success" | "warn" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
        badgeTone[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  variant = "default",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "ghost" }) {
  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-3.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer";
  const styles = {
    default: "border-border-2 bg-bg-3 text-text-2 hover:bg-bg-hover hover:text-text hover:border-accent",
    primary: "border-accent bg-accent text-white hover:bg-accent-h hover:border-accent-h",
    ghost: "border-transparent bg-transparent text-text-2 hover:bg-bg-3 hover:text-text",
  };
  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="text-[10.5px] font-bold uppercase tracking-wider text-text-3">{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div>
        <div className="font-display text-[18px] font-bold tracking-wide text-text">{title}</div>
        {subtitle && <div className="mt-0.5 text-[11.5px] text-text-2">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function DataTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <table className="w-full border-collapse text-[12.5px]">
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              className="whitespace-nowrap border-b border-border bg-bg-3 px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-2"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function Empty({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <div className="text-[13px] font-semibold text-text-2">{title}</div>
      {sub && <div className="mt-1 text-[11.5px] text-text-3">{sub}</div>}
    </div>
  );
}

export function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-[2.5px] border-white/25 border-t-white",
        className,
      )}
      {...props}
    />
  );
}
