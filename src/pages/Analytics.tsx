import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  TrendingUp,
  BarChart3,
  ShieldAlert,
  PieChart as PieIcon,
  Activity,
  Calendar,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    // Generate volume chart data based on timeframe
    const generateVolume = () => {
      const days = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
      return Array.from({ length: Math.min(12, days) }, (_, i) => ({
        name: timeframe === "24h" ? `${i * 2}:00` : `Day ${i + 1}`,
        volumeBtc: +(2.5 + Math.sin(i) * 1.8 + (i % 3 === 0 ? 3.2 : 0)).toFixed(2),
        txCount: 8 + Math.floor(Math.random() * 16),
        highRiskTxs: Math.floor(Math.random() * 4),
      }));
    };

    setAnalyticsData({
      volumeTimeline: generateVolume(),
      threatBreakdown: [
        { name: "Multi-Hop Relays", count: 28, color: "#ef4444" },
        { name: "Rapid Forwarding", count: 22, color: "#f59e0b" },
        { name: "Fan-In Concentration", count: 18, color: "#8b5cf6" },
        { name: "Fan-Out Dispersion", count: 14, color: "#ec4899" },
        { name: "Circular Flows", count: 11, color: "#06b6d4" },
        { name: "Dormant Reactivations", count: 7, color: "#10b981" },
      ],
      riskDistribution: [
        { name: "Low Risk (<40)", value: 48, color: "#10b981" },
        { name: "Medium Risk (40-69)", value: 29, color: "#3b82f6" },
        { name: "High Risk (70-84)", value: 17, color: "#f59e0b" },
        { name: "Critical Risk (85+)", value: 6, color: "#ef4444" },
      ],
      velocityMetrics: {
        avgVelocityPerHour: 8.4,
        peakVelocityPerHour: 26.0,
        medianFeeSatVb: 34,
        peakFeeSatVb: 92,
      },
      topRiskWallets: [
        { address: "bc1qscammerx001syntheticdemo0001", name: "Scammer Origin X001", risk: 94, totalBtc: 14.5 },
        { address: "bc1qmulegamma001syntheticdemo004", name: "Mule Gamma C001", risk: 89, totalBtc: 9.8 },
        { address: "bc1qtargetfanin001syntheticdemo", name: "Fan-In Hub F001", risk: 88, totalBtc: 18.2 },
        { address: "bc1qmulealpha001syntheticdemo002", name: "Mule Alpha A001", risk: 84, totalBtc: 6.4 },
        { address: "bc1qexitcashout001syntheticdemo05", name: "Offramp Exit F001", risk: 82, totalBtc: 12.1 },
      ],
    });
  }, [timeframe]);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Forensic Threat Analytics & Network Metrics</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LONGITUDINAL AI METRICS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pattern frequency, velocity surges, risk distributions & counterparty concentration
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(["24h", "7d", "30d", "90d"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-xs font-bold rounded ${
                    timeframe === t ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Velocity</span>
              <div className="text-2xl font-black text-white mt-1">
                {analyticsData?.velocityMetrics?.avgVelocityPerHour || 8.4} <span className="text-xs font-normal text-slate-400">tx/hr</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Nominal Rate</span>
            </div>

            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Peak Velocity Surge</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {analyticsData?.velocityMetrics?.peakVelocityPerHour || 26.0} <span className="text-xs font-normal text-slate-400">tx/hr</span>
              </div>
              <span className="text-[10px] text-red-400 font-semibold mt-1 block">+3.1σ Deviation</span>
            </div>

            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Median Mempool Fee</span>
              <div className="text-2xl font-black text-white mt-1">
                {analyticsData?.velocityMetrics?.medianFeeSatVb || 34} <span className="text-xs font-normal text-slate-400">sat/vB</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Priority Window</span>
            </div>

            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Critical Threat Ratio</span>
              <div className="text-2xl font-black text-red-400 mt-1">
                6.0% <span className="text-xs font-normal text-slate-400">of network</span>
              </div>
              <span className="text-[10px] text-amber-400 font-semibold mt-1 block">6 Wallets Isolated</span>
            </div>
          </div>

          {/* Charts Row: Volume Timeline & Threat Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Volume Timeline (2 cols) */}
            <div className="lg:col-span-2 card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-1">Transaction Volume & High-Risk Incidents</h3>
              <p className="text-xs text-slate-400 mb-4">
                Bitcoin transfer volume (BTC) plotted alongside flagged anomaly spikes
              </p>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData?.volumeTimeline || []}>
                    <defs>
                      <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="volumeBtc" name="Volume (BTC)" stroke="#f59e0b" fillOpacity={1} fill="url(#volGrad)" />
                    <Area type="monotone" dataKey="highRiskTxs" name="High Risk Txs" stroke="#ef4444" fillOpacity={1} fill="url(#riskGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Pie (1 col) */}
            <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-1">Risk Score Distribution</h3>
              <p className="text-xs text-slate-400 mb-4">
                Proportion of wallets across risk tiers
              </p>

              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData?.riskDistribution || []}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analyticsData?.riskDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mt-2">
                {analyticsData?.riskDistribution?.map((d: any) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span>{d.name}: <strong>{d.value}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Threat Patterns Breakdown Bar Chart */}
          <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
            <h3 className="text-sm font-bold text-white mb-1">Threat Pattern Frequency Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">
              Detections by topology archetype across synthetic benchmark dataset
            </p>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.threatBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" name="Incidents Flagged">
                    {analyticsData?.threatBreakdown?.map((entry: any, index: number) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top High-Risk Wallets Table */}
          <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <h3 className="text-sm font-bold text-white mb-3">Top Highest-Risk Synthetic Wallets</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Wallet Identifier</th>
                    <th>Synthetic Person / Label</th>
                    <th>Risk Score</th>
                    <th>Cumulative BTC</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData?.topRiskWallets?.map((w: any) => (
                    <tr key={w.address}>
                      <td className="font-mono text-xs text-slate-300">{w.address}</td>
                      <td className="font-bold text-white text-xs">{w.name}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[11px]">
                          {w.risk}/100
                        </span>
                      </td>
                      <td className="font-bold text-amber-400 text-xs">{w.totalBtc} BTC</td>
                      <td>
                        <a
                          href={`/investigation?target=${w.address}`}
                          className="text-xs font-semibold text-amber-400 hover:underline"
                        >
                          Deep Trace
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
