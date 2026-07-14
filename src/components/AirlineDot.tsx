export function AirlineDot({ color, className, spacing = "4px" }: { color: string; className?: string, spacing?: string }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        backgroundColor: color,
        verticalAlign: "middle",
        marginRight: spacing,
      }}
    />
  );
}