interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: "green" | "red" | "blue" | "amber" | "purple" | "cyan";
  className?: string;
}

const COLOR_MAP = {
  green: "var(--green)", red: "var(--red)", blue: "var(--blue)",
  amber: "var(--amber)", purple: "var(--purple)", cyan: "var(--cyan)",
};

export function StatCard({ label, value, sub, color, className = "" }: StatCardProps) {
  return (
    <div className={`card ${className}`} style={{ transition: "border-color 0.16s" }}>
      <div style={{ fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--txt3)", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: color ? COLOR_MAP[color] : "var(--txt)" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "4px", fontFamily: "JetBrains Mono, monospace" }}>
          {sub}
        </div>
      )}
    </div>
  );
}
