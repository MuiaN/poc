import { cn } from "@/components/ui";

type Notam = {
  loc: string;
  num: string;
  cls: string;
  sev: string;
  valid: string;
  cond: string;
};

type NotamItemProps = {
  notam: Notam;
  isEven: boolean;
};

export function NotamItem({ notam, isEven }: NotamItemProps) {
  return (
    <div
      className={cn(
        "grid cursor-pointer grid-cols-[52px_82px_36px_1fr] items-start gap-x-3 border-b border-border py-2 px-4 transition-colors last:border-none hover:bg-bg-hover",
        isEven ? "bg-bg-2" : "bg-bg-3",
      )}
    >
      <span className="text-[12px] font-bold text-text">{notam.loc}</span>
      <span className="font-mono text-[11px] text-accent">{notam.num}</span>
      <span className="mt-px text-[10px] font-bold" style={{ color: notam.sev }}>
        {notam.cls}
      </span>
      <div>
        <div className="mb-[2px] text-[11px] text-text-3">{notam.valid}</div>
        <div className="text-[11.5px] leading-[1.45] text-text-2">{notam.cond}</div>
      </div>
    </div>
  );
}