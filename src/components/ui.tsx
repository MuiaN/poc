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
  valueClassName,
  subClassName,
}: {
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "red";
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
  subClassName?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-3.5 transition-shadow hover:shadow-card-md">
      <div className={cn("flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px]", kpiIconBg[tone])}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-2">{label}</div>
        <div className={cn("font-display text-[26px] font-bold leading-none", valueClassName)}>{value}</div>
        {sub && <div className={cn("mt-px text-[10px]", !subClassName && "text-text-3", subClassName)}>{sub}</div>}
      </div>
      <div className="ml-auto flex-shrink-0 text-text-3">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
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
  type = "button",
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "ghost" }) {
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
  columns: (string | { key: string; label: string; align?: "left" | "center" | "right"; headerClassName?: string; cellClassName?: string })[];
  children: ReactNode;
}) {
  return (
    <table className="w-full border-collapse text-[12.5px]">
      <thead>
        <tr>
          {columns.map((c) => {
            const col = typeof c === "string" ? { key: c, label: c, align: "left" as const } : c;
            const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
            const headerClassName = typeof c === "object" ? c.headerClassName : undefined;
            return (
              <th
                key={col.key}
                className={`whitespace-nowrap border-b border-border bg-bg-3 px-3.5 py-2.5 ${alignClass} text-[10px] font-bold uppercase tracking-wider text-text-2 ${headerClassName || ""}`}
              >
                {col.label}
              </th>
            );
          })}
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

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Dialog({ open, onClose, title, description, children, action }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-2 border border-border rounded-lg p-6 min-w-[400px] max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4">
          <div className="text-lg font-semibold text-text">{title}</div>
          {description && <div className="mt-1 text-text-2 text-sm">{description}</div>}
        </div>
        <div className="mb-4">{children}</div>
        {action && <div className="flex justify-end gap-2">{action}</div>}
      </div>
    </div>
  );
}
