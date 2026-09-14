import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  icon: ReactNode;
  isPositive?: boolean;
}

export default function KPICard({
  title,
  value,
  change,
  icon,
  isPositive = true,
}: KPICardProps) {
  const isNeutral = change === "Latest" || change.includes("Stable");
  const changeColor = isNeutral
    ? "#94a3b8"
    : isPositive
    ? "#22c55e"
    : "#ef4444";

  return (
    <div
      id={`kpi-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className="kpi-card"
    >
      <div className="kpi-top">
        <span>{title}</span>
        <span className="kpi-icon">{icon}</span>
      </div>

      <h2>{value}</h2>

      <div className="kpi-change" style={{ color: changeColor }}>
        {change}
      </div>
    </div>
  );
}
