import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Search,
  ShieldAlert,
  Sliders,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Share2,
} from "lucide-react";

export default function Investigation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTarget = searchParams.get("target") || "bc1qexample001syntheticbitcoindemo";
  const [targetInput, setTargetInput] = useState(initialTarget);
  const [hopCount, setHopCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [investigationData, setInvestigationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "hops" | "risk" | "timeline" | "report">("graph");
  const [copied, setCopied] = useState(false);

  const runInvestigation = async (targetToRun: string, hops: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/investigation/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetToRun, hopCount: hops }),
      });
      const data = await res.json();
      setInvestigationData(data);
    } catch (err) {
      console.error("Investigation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runInvestigation(targetInput, hopCount);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;
    setSearchParams({ target: targetInput.trim() });
    runInvestigation(targetInput.trim(), hopCount);
  };

  const handleHopChange = (h: number) => {
    setHopCount(h);
    runInvestigation(targetInput, h);
  };

  const quickPresets = [
    { label: "M001 (Aarav Kumar)", value: "M001" },
    { label: "TX-001 (Peeling Chain)", value: "DEMO-TX-001-BITFLOW" },
    { label: "M010 (Rapid Forwarding)", value: "M010" },
    { label: "TX-025 (Fan-In Hub)", value: "DEMO-TX-025-BITFLOW" },
    { label: "M047 (Dormant Anomaly)", value: "M047" },
  ];

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Title and Controls */}
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Transaction Investigation Center</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  SOC FORENSIC ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-hop graph traversal, risk propagation scoring & AI anomaly baseline detection
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Depth Expansion:</span>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {[1, 2, 3, 4, 5].map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHopChange(h)}
                    className={`px-2.5 py-1 text-xs font-bold rounded ${
                      hopCount === h ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {h}-Hop
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="card mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter Transaction Hash, Wallet Address, Member ID (e.g. M001), or TX ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shrink-0 transition-all shadow-md"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sliders size={16} />}
                START INVESTIGATION
              </button>
            </form>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400 flex-wrap">
              <span className="font-semibold text-slate-300">Target Presets:</span>
              {quickPresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setTargetInput(p.value);
                    setSearchParams({ target: p.value });
                    runInvestigation(p.value, hopCount);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Profile Card */}
          {investigationData && (
            <div className="card mb-6 p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
                      {investigationData.targetMember?.name ? investigationData.targetMember.name[0] : "₿"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">
                          {investigationData.targetMember?.name || "Subject Address"}
                        </h2>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                          {investigationData.targetMember?.memberId || "M-DEMO"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {investigationData.targetMember?.profileStatus || "Active"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {investigationData.targetWallet}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                    <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">INCOMING TXS</span>
                      <span className="font-bold text-slate-200">
                        {investigationData.historicalStats.totalIncoming} ({investigationData.historicalStats.incomingVolumeBtc} BTC)
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">OUTGOING TXS</span>
                      <span className="font-bold text-slate-200">
                        {investigationData.historicalStats.totalOutgoing} ({investigationData.historicalStats.outgoingVolumeBtc} BTC)
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">CONNECTED PEERS</span>
                      <span className="font-bold text-slate-200">
                        {investigationData.totalConnectedWallets} Wallets ({investigationData.totalHopsFound} Hops)
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">AI ANOMALY SCORE</span>
                      <span className="font-bold text-amber-400">
                        {investigationData.aiAnomalyEngine.anomalyScore} / 1.00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 min-w-[200px]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Composite Risk Score
                  </span>
                  <div
                    className={`text-4xl font-black mt-1 ${
                      investigationData.riskBreakdown.finalScore >= 85
                        ? "text-red-400"
                        : investigationData.riskBreakdown.finalScore >= 70
                        ? "text-amber-400"
                        : investigationData.riskBreakdown.finalScore >= 40
                        ? "text-blue-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {investigationData.riskBreakdown.finalScore}
                    <span className="text-sm font-normal text-slate-500">/100</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 border ${
                      investigationData.riskBreakdown.riskLevel === "CRITICAL"
                        ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse"
                        : investigationData.riskBreakdown.riskLevel === "HIGH"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {investigationData.riskBreakdown.riskLevel} PRIORITY
                  </span>
                  <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
                    {investigationData.riskBreakdown.formula}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 mb-6 gap-2">
            {[
              { id: "graph", label: "Interactive Flow Graph", icon: Layers },
              { id: "hops", label: "Multi-Hop Trace Ledger", icon: TrendingUp },
              { id: "risk", label: "Risk Propagation Formula", icon: ShieldAlert },
              { id: "timeline", label: "Behavioral Timeline", icon: Clock },
              { id: "report", label: "SAR Compliance Dossier", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-400 bg-amber-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: GRAPH */}
          {activeTab === "graph" && investigationData && (
            <div className="card p-6 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Multi-Hop Network Topology Graph</h3>
                  <p className="text-xs text-slate-400">
                    Displaying origin wallet and downstream relay path up to {hopCount} hops
                  </p>
                </div>
                <Link
                  to="/network-graph"
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                >
                  Open Full Canvas Graph <ExternalLink size={12} />
                </Link>
              </div>

              {/* Visual Hop Chain */}
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
                <div className="flex items-center gap-4 min-w-[700px] justify-between">
                  {investigationData.graph.nodes.slice(0, 6).map((node: any, idx: number) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border transition-transform hover:scale-105 ${
                            node.isRoot
                              ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20"
                              : node.riskScore >= 75
                              ? "bg-red-500/20 border-red-500 text-red-400"
                              : "bg-blue-500/20 border-blue-500 text-blue-400"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase">
                            {node.isRoot ? "ROOT" : `HOP ${node.hopLevel}`}
                          </span>
                          <span className="text-xs font-bold">{node.memberId}</span>
                        </div>
                        <span className="text-[11px] font-bold text-white mt-2 max-w-[100px] truncate text-center">
                          {node.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          Risk: {node.riskScore}
                        </span>
                      </div>

                      {idx < investigationData.graph.nodes.slice(0, 6).length - 1 && (
                        <div className="flex flex-col items-center justify-center px-2">
                          <ArrowRight className="text-amber-500/80 animate-pulse" size={20} />
                          <span className="text-[9px] font-mono text-amber-400/80">
                            {investigationData.graph.edges[idx]?.amountBtc || "1.24"} BTC
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Anomaly Interpretation Box */}
              <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-3">
                <Brain className="text-amber-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">AI Engine Interpretation & Outlier Analysis</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      Confidence 94%
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {investigationData.aiAnomalyEngine.reasons.map((r: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {r}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 mt-2 italic">
                    {investigationData.aiAnomalyEngine.legalNotice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-HOP TRACE LEDGER */}
          {activeTab === "hops" && investigationData && (
            <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Sequential Multi-Hop Fund Path</h3>
                  <p className="text-xs text-slate-400">
                    Step-by-step transaction route traced across the synthetic Bitcoin network
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400">
                  {investigationData.multiHopPaths.length} Transits Recorded
                </span>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Hop #</th>
                      <th>Transit Path</th>
                      <th>Transaction ID</th>
                      <th>Amount (BTC)</th>
                      <th>USD Value</th>
                      <th>Risk Score</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investigationData.multiHopPaths.map((hop: any) => (
                      <tr key={hop.txId}>
                        <td className="font-bold text-amber-400">Hop {hop.hop}</td>
                        <td className="font-medium text-white">{hop.path}</td>
                        <td className="font-mono text-xs text-slate-300">{hop.txId}</td>
                        <td className="font-bold text-white">{hop.amountBtc} BTC</td>
                        <td className="text-slate-400">${hop.amountUsd.toLocaleString()}</td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              hop.riskScore >= 75
                                ? "bg-red-500/20 text-red-300"
                                : hop.riskScore >= 50
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {hop.riskScore}/100
                          </span>
                        </td>
                        <td>
                          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} /> {hop.status}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/transactions?search=${hop.txId}`}
                            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                          >
                            Details <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RISK PROPAGATION FORMULA */}
          {activeTab === "risk" && investigationData && (
            <div className="card p-6 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              <h3 className="text-sm font-bold text-white mb-1">
                Explainable Risk Engine (Requirement 19 & 20)
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Direct transaction risk, behavior risk, network risk, historical anomaly, and connection exposure
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    1. Direct Risk (35%)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {investigationData.riskBreakdown.directRisk}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct transaction risk & fee anomalies
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    2. Network Risk (25%)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {investigationData.riskBreakdown.networkRisk}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hop depth & counterparty risk
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    3. Behavior Risk (15%)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {investigationData.riskBreakdown.behaviorRisk}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Whale amounts & high sat/vB
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    4. Hist. Anomaly (15%)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {investigationData.riskBreakdown.historicalAnomaly}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Statistical deviation from baseline
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    5. Exposure (10%)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {investigationData.riskBreakdown.connectionExposure}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cluster fan-in/fan-out exposure
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Final Synthesized Risk Calculation:
                  </span>
                  <span className="text-sm font-black text-amber-400">
                    {investigationData.riskBreakdown.finalScore} / 100
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-2">
                  Score = (Direct: {investigationData.riskBreakdown.directRisk} × 0.35) + (Network: {investigationData.riskBreakdown.networkRisk} × 0.25) + (Behavior: {investigationData.riskBreakdown.behaviorRisk} × 0.15) + (Anomaly: {investigationData.riskBreakdown.historicalAnomaly} × 0.15) + (Exposure: {investigationData.riskBreakdown.connectionExposure} × 0.10)
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === "timeline" && investigationData && (
            <div className="card p-6 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              <h3 className="text-sm font-bold text-white mb-1">
                Investigation & Behavioral Timeline
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Chronological ledger showing baseline behavior transitioning into alert events
              </p>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {investigationData.behaviorTimeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        item.severity === "critical"
                          ? "bg-red-500 text-white"
                          : item.severity === "warning"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      <Clock size={14} />
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex-1">
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {item.time}
                      </span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SAR COMPLIANCE DOSSIER */}
          {activeTab === "report" && investigationData && (
            <div className="card p-6 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Regulatory Suspicious Activity Report (SAR)</h3>
                  <p className="text-xs text-slate-400">
                    Auto-generated AML compliance dossier based on telemetry graph
                  </p>
                </div>
                <button
                  onClick={() => {
                    const text = JSON.stringify(investigationData, null, 2);
                    navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1"
                >
                  <Share2 size={13} /> {copied ? "Copied to Clipboard!" : "Copy Full JSON Dossier"}
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-bold">CASE ID:</span> SAR-AML-2026-BF-{investigationData.targetMember?.memberId || "M001"}
                </div>
                <div>
                  <span className="text-slate-400">TARGET WALLET:</span> {investigationData.targetWallet}
                </div>
                <div>
                  <span className="text-slate-400">SUBJECT PERSON (SYNTHETIC):</span> {investigationData.targetMember?.name || "N/A"} ({investigationData.targetMember?.occupation || "N/A"}, {investigationData.targetMember?.city || "N/A"})
                </div>
                <div>
                  <span className="text-slate-400">COMPOSITE RISK SCORE:</span> {investigationData.riskBreakdown.finalScore}/100 ({investigationData.riskBreakdown.riskLevel})
                </div>
                <div>
                  <span className="text-slate-400">NETWORK TRACE DEPTH:</span> {investigationData.hopDepth} Hops across {investigationData.totalConnectedWallets} Connected Counterparties
                </div>
                <div>
                  <span className="text-slate-400">AI EXPLANATION:</span> {investigationData.aiAnomalyEngine.reasons.join(" | ")}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-400/90 italic">
                  "Automated analytical assessment — manual investigation required. Synthetic demonstration dataset."
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
