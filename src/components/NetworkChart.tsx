import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Activity, Zap } from "lucide-react";

interface ChartPoint {
  time: string;
  tps: number;
  feeSatVb: number;
  mempoolMb: number;
}

const INITIAL_CHART_DATA: ChartPoint[] = [
  { time: "03:10", tps: 4.8, feeSatVb: 15, mempoolMb: 238 },
  { time: "03:11", tps: 5.1, feeSatVb: 16, mempoolMb: 240 },
  { time: "03:12", tps: 4.9, feeSatVb: 17, mempoolMb: 242 },
  { time: "03:13", tps: 5.3, feeSatVb: 18, mempoolMb: 243 },
  { time: "03:14", tps: 5.0, feeSatVb: 19, mempoolMb: 244 },
  { time: "03:15", tps: 5.4, feeSatVb: 18, mempoolMb: 245 },
  { time: "03:16", tps: 5.2, feeSatVb: 18, mempoolMb: 245 },
];

export default function NetworkChart() {
  const [data, setData] = useState<ChartPoint[]>(INITIAL_CHART_DATA);
  const [metric, setMetric] = useState<"tps" | "feeSatVb">("tps");

  // Stream live data points periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);

      setData((prev) => {
        const last = prev[prev.length - 1];
        const nextTps = Math.max(3.5, +(last.tps + (Math.random() * 0.8 - 0.38)).toFixed(1));
        const nextFee = Math.max(12, Math.round(last.feeSatVb + (Math.random() * 4 - 2)));
        const nextMempool = Math.max(220, Math.round(last.mempoolMb + (Math.random() * 3 - 1.4)));

        const newPoint: ChartPoint = {
          time: timeStr,
          tps: nextTps,
          feeSatVb: nextFee,
          mempoolMb: nextMempool,
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="network-chart-panel" className="panel mb-5">
      <div className="panel-header">
        <div>
          <h2>Bitcoin Network Dynamics</h2>
          <p>Real-time mempool fee pressure & transaction throughput</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="metric-toggle-tps"
            onClick={() => setMetric("tps")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              metric === "tps"
                ? "bg-[#f7931a]/15 text-[#f7931a] border-[#f7931a]/40"
                : "bg-[#1c2030] text-[#94a3b8] border-[#2d3748] hover:text-white"
            }`}
          >
            <Activity size={14} />
            TPS (Throughput)
          </button>

          <button
            id="metric-toggle-fee"
            onClick={() => setMetric("feeSatVb")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
              metric === "feeSatVb"
                ? "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/40"
                : "bg-[#1c2030] text-[#94a3b8] border-[#2d3748] hover:text-white"
            }`}
          >
            <Zap size={14} />
            Sat/vB (Fee Rate)
          </button>
        </div>
      </div>

      <div className="p-4" style={{ height: 260, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f7931a" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f7931a" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2433" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#2d3748" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#2d3748" }}
              domain={metric === "tps" ? [2, 8] : [10, 30]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141720",
                borderColor: "#2d3748",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            {metric === "tps" ? (
              <Area
                type="monotone"
                dataKey="tps"
                name="TPS"
                stroke="#f7931a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTps)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="feeSatVb"
                name="Fee (sat/vB)"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFee)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
