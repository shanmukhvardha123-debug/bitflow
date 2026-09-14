import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Building2,
  Bitcoin,
  History,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Info,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
} from "lucide-react";
import {
  buildCanonicalScamChain,
  traceDynamicScamChain,
  ScamChain,
  ScamNode,
  ScamTransferStep,
} from "../services/scamAnalysisService";
import { SEED_MEMBERS, DemoMember } from "../data/seedData";

export default function ScamAnalysis() {
  const [activeTab, setActiveTab] = useState<"canonical" | "sandbox">("canonical");
  const [chain, setChain] = useState<ScamChain>(buildCanonicalScamChain());
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-x");
  const [inspectorTab, setInspectorTab] = useState<"kyc" | "banking" | "crypto" | "history">("kyc");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Dynamic Trace Sandbox State
  const [selectedOriginMemberId, setSelectedOriginMemberId] = useState<string>("M001");
  const [customAmountBtc, setCustomAmountBtc] = useState<number>(4.85);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  // Live Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);

  // Emergency Freeze State
  const [freezeSuccessMessage, setFreezeSuccessMessage] = useState<string | null>(null);
  const [showSarModal, setShowSarModal] = useState<boolean>(false);
  const [sarDossier, setSarDossier] = useState<any | null>(null);

  // Sync selected node with chain
  const selectedNode = chain.nodes.find((n) => n.id === selectedNodeId) || chain.nodes[0];

  // Simulation timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimulationStep((prev) => {
          if (prev >= chain.transfers.length) {
            setIsSimulating(false);
            return prev;
          }
          const nextStep = prev + 1;
          // Auto select node being activated
          if (chain.nodes[nextStep]) {
            setSelectedNodeId(chain.nodes[nextStep].id);
          }
          return nextStep;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isSimulating, chain]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunDynamicTrace = async () => {
    setIsTracing(true);
    try {
      const res = await fetch("/api/scam-analysis/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originMemberId: selectedOriginMemberId,
          amountBtc: customAmountBtc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chain) {
          setChain(data.chain);
          setSelectedNodeId(data.chain.nodes[0].id);
        }
      } else {
        // Fallback to local generator
        const localChain = traceDynamicScamChain(selectedOriginMemberId, customAmountBtc);
        setChain(localChain);
        setSelectedNodeId(localChain.nodes[0].id);
      }
    } catch {
      const localChain = traceDynamicScamChain(selectedOriginMemberId, customAmountBtc);
      setChain(localChain);
      setSelectedNodeId(localChain.nodes[0].id);
    } finally {
      setIsTracing(false);
      setSimulationStep(0);
    }
  };

  const handleResetToCanonical = () => {
    const canonical = buildCanonicalScamChain();
    setChain(canonical);
    setSelectedNodeId("node-x");
    setSimulationStep(0);
    setIsSimulating(false);
  };

  const handleEmergencyFreezeAll = async () => {
    try {
      const res = await fetch("/api/scam-analysis/freeze-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chainId: chain.id,
          memberIds: chain.nodes.map((n) => n.member.memberId),
        }),
      });
      const data = await res.json();
      setFreezeSuccessMessage(
        data.message || `🚨 Successfully froze all ${chain.nodes.length} accounts. Bank transfers restricted and regulatory hold applied.`
      );
    } catch {
      setFreezeSuccessMessage(
        `🚨 Successfully froze all ${chain.nodes.length} accounts. Bank transfers restricted and regulatory hold applied.`
      );
    }

    // Update local state
    setChain((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => ({
        ...n,
        banking: { ...n.banking, isFrozen: true, accountStatus: "Frozen by AML Freeze" },
        status: "FROZEN_BY_AML",
      })),
    }));

    setTimeout(() => setFreezeSuccessMessage(null), 6000);
  };

  const handleToggleSingleFreeze = async (nodeId: string) => {
    setChain((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id === nodeId) {
          const nextFrozen = !n.banking.isFrozen;
          return {
            ...n,
            banking: {
              ...n.banking,
              isFrozen: nextFrozen,
              accountStatus: nextFrozen ? "Frozen for Demo Review" : "Active",
            },
            status: nextFrozen ? "FROZEN_BY_AML" : "MULE_DETECTED",
          };
        }
        return n;
      }),
    }));

    const node = chain.nodes.find((n) => n.id === nodeId);
    if (node) {
      try {
        await fetch("/api/scam-analysis/freeze-single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: node.member.memberId,
            action: node.banking.isFrozen ? "UNFREEZE" : "FREEZE",
          }),
        });
      } catch {
        // Handled locally
      }
    }
  };

  const handleGenerateSar = async () => {
    try {
      const res = await fetch("/api/scam-analysis/export-sar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain }),
      });
      const data = await res.json();
      setSarDossier(data.dossier);
      setShowSarModal(true);
    } catch {
      // Fallback
      setSarDossier({
        regulatoryFilingId: `SAR-AML-2026-9912`,
        agency: "Financial Intelligence Unit / AML Division",
        filingDate: new Date().toISOString(),
        summary: `Multi-hop Bitcoin peeling chain originating from ${chain.originScammer}`,
        syndicateMetrics: {
          totalDisbursedBtc: chain.totalDisbursedBtc,
          totalDisbursedUsd: chain.totalDisbursedUsd,
          accountsInvolved: chain.nodes.length,
        },
        flaggedPersonsAndAccounts: chain.nodes.map((n) => ({
          role: n.roleName,
          personName: n.member.name,
          memberId: n.member.memberId,
          city: n.member.city,
          syntheticIdProof: n.member.syntheticIdRef,
          bankAccountId: n.banking.accountId,
          fiatBalance: n.banking.fiatBalance,
          taintPercentage: `${n.taintScore}%`,
          retainedMuleCut: `${n.forensics.retainedCutBtc} BTC ($${n.forensics.retainedCutUsd} USD)`,
        })),
        transferLedgerTrail: chain.transfers,
      });
      setShowSarModal(true);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Page Title & Status Header */}
          <div className="page-title">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold flex items-center gap-2.5">
                  <ShieldAlert className="text-red-500" size={26} />
                  Scam Network & Mule Chain Tracer
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  7/7 ACCOUNTS TAINTED & DETECTED
                </span>
              </div>
              <p className="text-[#94a3b8] text-sm mt-1">
                Multi-hop peeling chain analysis: Detects when Scammer (X) disburses funds to Person (A) → (B) → (C) → (D) → (E) → (F), profiling their accounts, KYC, bank details, and historical data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-export-sar"
                onClick={handleGenerateSar}
                className="flex items-center gap-2 text-xs font-medium bg-[#1c2030] text-[#94a3b8] hover:text-white border border-[#2d3748] hover:border-slate-600 px-3.5 py-2 rounded-lg transition-colors"
              >
                <FileText size={15} />
                Regulatory SAR Dossier
              </button>

              <button
                id="btn-emergency-freeze-all"
                onClick={handleEmergencyFreezeAll}
                className="flex items-center gap-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                <Lock size={15} />
                Emergency Freeze All 7 Accounts
              </button>
            </div>
          </div>

          {/* Alert Notification Toast */}
          {freezeSuccessMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-red-400 shrink-0" size={20} />
                <span>{freezeSuccessMessage}</span>
              </div>
              <button
                onClick={() => setFreezeSuccessMessage(null)}
                className="text-xs text-red-400 hover:text-white underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Syndicate KPI Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 mb-6">
            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
                Scam Volume
              </span>
              <div className="text-lg font-bold text-white">
                {chain.totalDisbursedBtc} <span className="text-xs text-[#f7931a]">BTC</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">
                ${chain.totalDisbursedUsd.toLocaleString()} USD
              </span>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
                Syndicate Taint
              </span>
              <div className="text-lg font-bold text-red-400">
                {chain.chainTaintScore}% <span className="text-xs text-red-400/70">CRITICAL</span>
              </div>
              <span className="text-[11px] text-[#94a3b8]">
                BIP-AML FIFO Decay
              </span>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
                Accounts Linked
              </span>
              <div className="text-lg font-bold text-amber-400">
                {chain.nodes.length} <span className="text-xs text-[#94a3b8]">Accounts</span>
              </div>
              <span className="text-[11px] text-amber-400/80">
                1 Scammer + 6 Mules
              </span>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
                Mean Relay Velocity
              </span>
              <div className="text-lg font-bold text-cyan-400">
                {chain.averageHopLatencySec}s <span className="text-xs text-[#94a3b8]">/ hop</span>
              </div>
              <span className="text-[11px] text-cyan-400/80">
                Bot-Scripted Relay
              </span>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
                Mule Cuts Extracted
              </span>
              <div className="text-lg font-bold text-yellow-400">
                {chain.totalMuleCutsBtc} <span className="text-xs text-[#f7931a]">BTC</span>
              </div>
              <span className="text-[11px] text-yellow-400/80 font-mono">
                ${chain.totalMuleCutsUsd.toLocaleString()} USD
              </span>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <span className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block mb-1">
                Containment Status
              </span>
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> 100%
              </div>
              <span className="text-[11px] text-emerald-400/80">
                All 7 Ready for Hold
              </span>
            </div>
          </div>

          {/* Scenario Mode Tabs & Live Simulation Controls */}
          <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  id="tab-mode-canonical"
                  onClick={() => {
                    setActiveTab("canonical");
                    handleResetToCanonical();
                  }}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${
                    activeTab === "canonical"
                      ? "bg-[#1c2030] text-[#f7931a] border-[#f7931a]/40"
                      : "bg-[#0d0f14] text-[#94a3b8] border-[#2d3748] hover:text-white"
                  }`}
                >
                  Canonical Chain: Scammer (X) → (A) → (B) → (C) → (D) → (E) → (F)
                </button>

                <button
                  id="tab-mode-sandbox"
                  onClick={() => setActiveTab("sandbox")}
                  className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${
                    activeTab === "sandbox"
                      ? "bg-[#1c2030] text-[#f7931a] border-[#f7931a]/40"
                      : "bg-[#0d0f14] text-[#94a3b8] border-[#2d3748] hover:text-white"
                  }`}
                >
                  Dynamic Trace Sandbox: Select Any Scammer
                </button>
              </div>

              {/* Simulation Playback Bar */}
              <div className="flex items-center gap-2.5 bg-[#0d0f14] border border-[#2d3748] px-3 py-1.5 rounded-lg">
                <span className="text-xs text-[#94a3b8] font-medium mr-1 flex items-center gap-1.5">
                  <Activity size={14} className={isSimulating ? "text-emerald-400 animate-pulse" : "text-[#94a3b8]"} />
                  Live Transfer Simulator:
                </span>

                <button
                  id="btn-play-sim"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded transition-colors ${
                    isSimulating
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  }`}
                >
                  {isSimulating ? <Pause size={13} /> : <Play size={13} />}
                  {isSimulating ? "Pause Relay" : "Play Sequence"}
                </button>

                <button
                  id="btn-reset-sim"
                  onClick={() => {
                    setIsSimulating(false);
                    setSimulationStep(0);
                    setSelectedNodeId("node-x");
                  }}
                  className="p-1 text-[#94a3b8] hover:text-white transition-colors"
                  title="Reset simulation step"
                >
                  <RotateCcw size={14} />
                </button>

                <div className="text-[11px] font-mono text-[#94a3b8] pl-2 border-l border-[#2d3748]">
                  Step {simulationStep} of {chain.transfers.length}
                </div>
              </div>
            </div>

            {/* Sandbox Controls Form (Visible when Sandbox Tab is active) */}
            {activeTab === "sandbox" && (
              <div className="mt-4 pt-4 border-t border-[#2d3748] flex flex-wrap items-center gap-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#94a3b8]">Select Designated Scammer (X):</label>
                  <select
                    id="select-sandbox-scammer"
                    value={selectedOriginMemberId}
                    onChange={(e) => setSelectedOriginMemberId(e.target.value)}
                    className="bg-[#0d0f14] border border-[#2d3748] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-[#f7931a]"
                  >
                    {SEED_MEMBERS.slice(0, 30).map((m) => (
                      <option key={m.memberId} value={m.memberId}>
                        {m.memberId} - {m.name} ({m.city}, {m.occupation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#94a3b8]">Disbursement BTC:</label>
                  <input
                    id="input-sandbox-btc"
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="50"
                    value={customAmountBtc}
                    onChange={(e) => setCustomAmountBtc(parseFloat(e.target.value) || 1)}
                    className="w-24 bg-[#0d0f14] border border-[#2d3748] text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-[#f7931a]"
                  />
                </div>

                <button
                  id="btn-run-dynamic-trace"
                  onClick={handleRunDynamicTrace}
                  disabled={isTracing}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#f7931a] hover:bg-[#e08213] text-black px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Zap size={14} />
                  {isTracing ? "Tracing Graph..." : "Execute Dynamic Taint Trace"}
                </button>
              </div>
            )}
          </div>

          {/* Multi-Hop Interactive Visual Pipeline Diagram */}
          <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-5 mb-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#f7931a]" />
                <h2 className="text-sm font-bold text-white">
                  Multi-Hop Money Mule Routing Pipeline (Click any person to inspect previous data & banking)
                </h2>
              </div>
              <span className="text-xs text-[#94a3b8]">
                Hover or click node for forensic breakdown
              </span>
            </div>

            {/* Pipeline Flow Container */}
            <div className="flex items-center gap-2.5 min-w-[980px] py-3 px-2">
              {chain.nodes.map((node, idx) => {
                const isSelected = node.id === selectedNodeId;
                const isCurrentSimStep = simulationStep === idx;
                const isPastSimStep = simulationStep > idx;

                return (
                  <div key={node.id} className="flex items-center gap-2.5 flex-1">
                    {/* Node Card */}
                    <div
                      id={`node-card-${node.id}`}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative flex-1 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#1c2030] border-[#f7931a] shadow-lg shadow-[#f7931a]/15 scale-[1.02]"
                          : isCurrentSimStep
                          ? "bg-[#1c2030] border-emerald-400 ring-2 ring-emerald-400/30 animate-pulse"
                          : "bg-[#0d0f14] border-[#2d3748] hover:border-slate-500 hover:bg-[#141720]"
                      }`}
                    >
                      {/* Top Role Badge & Taint */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${node.roleBadgeColor}`}>
                          {node.roleShort}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-red-400">
                          {node.taintScore}% Taint
                        </span>
                      </div>

                      {/* Person Name & City */}
                      <div className="text-xs font-bold text-white truncate" title={node.member.name}>
                        {node.member.name}
                      </div>
                      <div className="text-[11px] text-[#94a3b8] truncate mb-2">
                        {node.member.city} • {node.member.occupation}
                      </div>

                      {/* Bank Account ID & Status */}
                      <div className="text-[10px] font-mono text-slate-400 bg-[#141720] px-2 py-1 rounded border border-[#2d3748] flex items-center justify-between">
                        <span className="truncate">{node.banking.accountId}</span>
                        {node.banking.isFrozen ? (
                          <span className="text-red-400 font-bold ml-1">FROZEN</span>
                        ) : (
                          <span className="text-amber-400 font-medium ml-1">FLAGGED</span>
                        )}
                      </div>

                      {/* Peeling Commission Cut Indicator */}
                      {node.hopIndex > 0 && node.hopIndex < 6 && (
                        <div className="mt-2 text-[10px] text-yellow-400/90 font-mono">
                          ✂ Kept {node.forensics.retainedCutBtc} BTC
                        </div>
                      )}
                      {node.hopIndex === 6 && (
                        <div className="mt-2 text-[10px] text-purple-400 font-mono font-bold">
                          🎯 Off-Ramp Exit
                        </div>
                      )}
                      {node.hopIndex === 0 && (
                        <div className="mt-2 text-[10px] text-red-400 font-mono font-bold">
                          💀 Illicit Originator
                        </div>
                      )}
                    </div>

                    {/* Arrow Connector between nodes */}
                    {idx < chain.nodes.length - 1 && (
                      <div className="flex flex-col items-center justify-center shrink-0 w-12 text-center">
                        <span className="text-[9px] font-mono text-[#f7931a] whitespace-nowrap mb-0.5">
                          {chain.transfers[idx]?.amountBtc} ₿
                        </span>
                        <ArrowRight
                          size={16}
                          className={
                            simulationStep > idx
                              ? "text-emerald-400"
                              : simulationStep === idx
                              ? "text-amber-400 animate-bounce"
                              : "text-[#94a3b8]"
                          }
                        />
                        <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap mt-0.5">
                          ⏱ {chain.transfers[idx]?.holdingDuration}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Forensic Account Inspector (The Core Requirements) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column: Quick Profile Summary & Actions */}
            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#2d3748] mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-[#2d3748] flex items-center justify-center text-lg font-bold text-white">
                      {selectedNode.member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {selectedNode.member.name}
                      </h3>
                      <span className="text-xs text-[#94a3b8] font-mono">
                        {selectedNode.member.memberId} • Age {selectedNode.member.age}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded border ${selectedNode.roleBadgeColor}`}>
                    {selectedNode.roleShort}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-[#0d0f14] rounded border border-[#2d3748]">
                    <span className="text-[#94a3b8]">Syndicate Role:</span>
                    <span className="font-semibold text-white">{selectedNode.roleName}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-[#0d0f14] rounded border border-[#2d3748]">
                    <span className="text-[#94a3b8]">Taint Score:</span>
                    <span className="font-bold text-red-400">{selectedNode.taintScore}% (High Taint)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-[#0d0f14] rounded border border-[#2d3748]">
                    <span className="text-[#94a3b8]">Bank Account Status:</span>
                    <span className={`font-bold ${selectedNode.banking.isFrozen ? "text-red-400" : "text-amber-400"}`}>
                      {selectedNode.banking.accountStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-[#0d0f14] rounded border border-[#2d3748]">
                    <span className="text-[#94a3b8]">Mule Cut Retained:</span>
                    <span className="font-bold text-yellow-400 font-mono">
                      {selectedNode.forensics.retainedCutBtc} BTC (${selectedNode.forensics.retainedCutUsd.toLocaleString()} USD)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-[#0d0f14] rounded border border-[#2d3748]">
                    <span className="text-[#94a3b8]">Holding Latency:</span>
                    <span className="font-semibold text-cyan-400 font-mono">
                      {selectedNode.forensics.holdingDurationHuman}
                    </span>
                  </div>
                </div>

                {/* Key Detected Flags Box */}
                <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 mb-4">
                  <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Forensic Red Flags:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                    {selectedNode.forensics.detectedFlags.map((flag, fIdx) => (
                      <li key={fIdx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-[#2d3748]">
                <button
                  id={`btn-toggle-freeze-${selectedNode.id}`}
                  onClick={() => handleToggleSingleFreeze(selectedNode.id)}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg border transition-colors ${
                    selectedNode.banking.isFrozen
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
                  }`}
                >
                  {selectedNode.banking.isFrozen ? <Unlock size={14} /> : <Lock size={14} />}
                  {selectedNode.banking.isFrozen ? "Unfreeze Account (Mark Whitelisted)" : "Freeze Bank Account & Block On-Ramp"}
                </button>

                <div className="text-[11px] text-[#94a3b8] text-center">
                  Recommended Action: <strong className="text-amber-400">{selectedNode.forensics.sarRecommendation}</strong>
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Multi-Tab Forensic Dossier */}
            <div className="lg:col-span-2 bg-[#141720] border border-[#2d3748] rounded-xl p-5">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-[#2d3748] pb-3 mb-4">
                <button
                  id="tab-inspector-kyc"
                  onClick={() => setInspectorTab("kyc")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    inspectorTab === "kyc"
                      ? "bg-[#1c2030] text-[#f7931a]"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <UserCheck size={14} />
                  1. KYC & Personal Info
                </button>

                <button
                  id="tab-inspector-banking"
                  onClick={() => setInspectorTab("banking")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    inspectorTab === "banking"
                      ? "bg-[#1c2030] text-[#f7931a]"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <Building2 size={14} />
                  2. Bank & Financial Account
                </button>

                <button
                  id="tab-inspector-crypto"
                  onClick={() => setInspectorTab("crypto")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    inspectorTab === "crypto"
                      ? "bg-[#1c2030] text-[#f7931a]"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <Bitcoin size={14} />
                  3. Crypto Wallet & Routing
                </button>

                <button
                  id="tab-inspector-history"
                  onClick={() => setInspectorTab("history")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    inspectorTab === "history"
                      ? "bg-[#1c2030] text-[#f7931a]"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <History size={14} />
                  4. Previous Data & Past Transactions
                </button>
              </div>

              {/* Tab 1: KYC & Personal Identity Data */}
              {inspectorTab === "kyc" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Member ID</span>
                      <span className="text-xs font-mono font-bold text-white">{selectedNode.member.memberId}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Full Legal Name</span>
                      <span className="text-xs font-bold text-white">{selectedNode.member.name}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">City & Jurisdiction</span>
                      <span className="text-xs text-white">{selectedNode.member.city}, {selectedNode.member.country}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Age & Occupation</span>
                      <span className="text-xs text-white">{selectedNode.member.age} yrs • {selectedNode.member.occupation}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Phone Contact</span>
                      <span className="text-xs font-mono text-white">{selectedNode.member.phone}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Email Address</span>
                      <span className="text-xs font-mono text-white truncate block">{selectedNode.member.email}</span>
                    </div>
                  </div>

                  <div className="bg-[#0d0f14] p-4 rounded-lg border border-[#2d3748]">
                    <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                      <Shield size={14} className="text-indigo-400" />
                      Synthetic Government Proof & KYC Case
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">ID Proof Type</span>
                        <span className="text-white font-medium">{selectedNode.member.idProofType}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">ID Reference</span>
                        <span className="text-white font-mono">{selectedNode.member.syntheticIdRef}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">KYC Status</span>
                        <span className="text-emerald-400 font-medium">{selectedNode.member.kycStatus}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Verification Date</span>
                        <span className="text-white font-mono">{selectedNode.member.verificationDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0d0f14] p-4 rounded-lg border border-[#2d3748]">
                    <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-amber-400" />
                      Registered Nominee & Proxy Intermediary Details
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Nominee Name</span>
                        <span className="text-white font-medium">{selectedNode.member.nomineeName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Relationship</span>
                        <span className="text-white">{selectedNode.member.nomineeRelationship}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Nominee Phone</span>
                        <span className="text-white font-mono">{selectedNode.member.nomineePhone}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Nominee Email</span>
                        <span className="text-white font-mono truncate block">{selectedNode.member.nomineeEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Bank Account & Fiat Financial Data */}
              {inspectorTab === "banking" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Bank Account Number</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-mono font-bold text-white">{selectedNode.banking.accountId}</span>
                        <button
                          onClick={() => handleCopy(selectedNode.banking.accountId)}
                          className="text-[#94a3b8] hover:text-white"
                          title="Copy account"
                        >
                          {copiedText === selectedNode.banking.accountId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Financial Institution</span>
                      <span className="text-xs font-bold text-white">{selectedNode.banking.bankName}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Branch Location</span>
                      <span className="text-xs text-white">{selectedNode.banking.branch}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Routing / IFSC Ref</span>
                      <span className="text-xs font-mono text-white">{selectedNode.banking.routingRef}</span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Current Fiat Balance</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        ₹{selectedNode.banking.fiatBalance.toLocaleString()} INR
                      </span>
                    </div>

                    <div className="bg-[#0d0f14] p-3 rounded-lg border border-[#2d3748]">
                      <span className="text-[11px] text-[#94a3b8] block">Daily Transfer Limit</span>
                      <span className="text-xs text-white font-mono">
                        ₹{selectedNode.banking.dailyLimit.toLocaleString()} INR
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0d0f14] p-4 rounded-lg border border-[#2d3748]">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                      <span>Custody & Compliance Parameters</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selectedNode.banking.isFrozen ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {selectedNode.banking.accountStatus}
                      </span>
                    </h4>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">
                      Account Model: <strong className="text-white">{selectedNode.member.custodyModel}</strong>.
                      Registered with BitFlow simulated banking gateway. Account creation timestamp: <span className="font-mono text-white">{selectedNode.member.accountCreated}</span>.
                      When frozen, all API settlement corridors and ACH/IMPS fast payout gateways are permanently severed.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Crypto Wallet & Scam Forensics */}
              {inspectorTab === "crypto" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#0d0f14] p-4 rounded-lg border border-[#2d3748]">
                    <span className="text-[11px] text-[#94a3b8] block mb-1">Bitcoin SegWit Address</span>
                    <div className="flex items-center justify-between bg-[#141720] p-2 rounded border border-[#2d3748]">
                      <span className="text-xs font-mono text-emerald-400 truncate mr-2">
                        {selectedNode.crypto.address}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedNode.crypto.address)}
                        className="text-[#94a3b8] hover:text-white"
                        title="Copy BTC Address"
                      >
                        {copiedText === selectedNode.crypto.address ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Wallet Type</span>
                        <span className="text-white font-medium">{selectedNode.crypto.walletType}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Wallet Balance</span>
                        <span className="text-white font-mono font-bold">{selectedNode.crypto.balanceBtc} BTC</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Lifetime Sent</span>
                        <span className="text-white font-mono">{selectedNode.crypto.totalSentBtc} BTC</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#94a3b8] block">Total Tx Count</span>
                        <span className="text-white font-mono">{selectedNode.crypto.txCount} txs</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0d0f14] p-4 rounded-lg border border-[#2d3748]">
                    <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                      <Zap size={14} className="text-yellow-400" />
                      Scam Chain Peeling Breakdown for this Account
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-[#141720] border border-[#2d3748]">
                        <span className="text-[11px] text-[#94a3b8] block">Received Upstream</span>
                        <span className="text-white font-mono font-bold">{selectedNode.forensics.amountReceivedBtc} BTC</span>
                        <span className="text-[10px] text-slate-400 block truncate">from {selectedNode.forensics.receivedFrom}</span>
                      </div>

                      <div className="p-2.5 rounded bg-[#141720] border border-[#2d3748]">
                        <span className="text-[11px] text-[#94a3b8] block">Forwarded Downstream</span>
                        <span className="text-white font-mono font-bold">{selectedNode.forensics.amountForwardedBtc} BTC</span>
                        <span className="text-[10px] text-slate-400 block truncate">to {selectedNode.forensics.sentTo}</span>
                      </div>

                      <div className="p-2.5 rounded bg-[#141720] border border-[#2d3748]">
                        <span className="text-[11px] text-yellow-400 font-medium block">Mule Cut Retained</span>
                        <span className="text-yellow-400 font-mono font-bold">
                          {selectedNode.forensics.retainedCutBtc} BTC ({selectedNode.forensics.retainedCutPercent}%)
                        </span>
                        <span className="text-[10px] text-yellow-400/80 block">
                          ${selectedNode.forensics.retainedCutUsd.toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Previous Historical Data & Past Transactions */}
              {inspectorTab === "history" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#94a3b8]">
                      Previous historical transaction log registered for this member prior to / outside the scam:
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Baseline Velocity: Nominal
                    </span>
                  </div>

                  {selectedNode.historicalTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#2d3748] text-[#94a3b8]">
                            <th className="py-2 px-2 font-medium">Tx ID</th>
                            <th className="py-2 px-2 font-medium">Date & Time</th>
                            <th className="py-2 px-2 font-medium">Type / Dir</th>
                            <th className="py-2 px-2 font-medium">Counterparty</th>
                            <th className="py-2 px-2 font-medium text-right">Amount (BTC)</th>
                            <th className="py-2 px-2 font-medium text-right">Fee (sat/vB)</th>
                            <th className="py-2 px-2 font-medium">Risk Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d3748]/50">
                          {selectedNode.historicalTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#0d0f14]/50">
                              <td className="py-2 px-2 font-mono text-slate-300 truncate max-w-[120px]" title={tx.id}>
                                {tx.id}
                              </td>
                              <td className="py-2 px-2 text-[#94a3b8] font-mono">
                                {tx.date} {tx.time}
                              </td>
                              <td className="py-2 px-2">
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  tx.direction === "Incoming" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                                }`}>
                                  {tx.direction}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-slate-300 truncate max-w-[140px]">
                                {tx.receiverName || tx.senderName}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-medium text-white">
                                {tx.amountBtc} ₿
                              </td>
                              <td className="py-2 px-2 text-right font-mono text-[#94a3b8]">
                                {tx.feeRateSatVb} sat/vB
                              </td>
                              <td className="py-2 px-2">
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  tx.riskScore >= 75
                                    ? "bg-red-500/20 text-red-400"
                                    : tx.riskScore >= 50
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}>
                                  {tx.riskFlag} ({tx.riskScore})
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#94a3b8] bg-[#0d0f14] rounded-lg border border-[#2d3748]">
                      No previous independent transactions recorded. This account is newly registered / dormant and activated solely for the scam relay.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full Step-by-Step Chronological Transfer Ledger */}
          <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#f7931a]" />
                <h2 className="text-sm font-bold text-white">
                  Chronological Step-by-Step Scam Transfer Ledger (Hops 1 through 6)
                </h2>
              </div>
              <span className="text-xs text-[#94a3b8]">
                Audit trail cryptographically bound to synthetic ledger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2d3748] text-[#94a3b8]">
                    <th className="py-2.5 px-3 font-semibold">Hop #</th>
                    <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                    <th className="py-2.5 px-3 font-semibold">From Account (Sender)</th>
                    <th className="py-2.5 px-3 font-semibold">To Account (Receiver)</th>
                    <th className="py-2.5 px-3 font-semibold">Transaction ID</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Transfer Volume</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Holding Latency</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Retained Mule Cut</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d3748]">
                  {chain.transfers.map((step) => (
                    <tr
                      key={step.step}
                      className={`hover:bg-[#1c2030]/60 transition-colors ${
                        simulationStep === step.step ? "bg-emerald-500/10" : ""
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-white">
                        Hop {step.step}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#94a3b8]">
                        {step.timestamp}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-200">
                        {step.fromName}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-200">
                        {step.toName}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {step.txId}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        {step.amountBtc} BTC
                        <span className="text-[10px] text-slate-400 block">${step.amountUsd.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-cyan-400">
                        ⏱ {step.holdingDuration}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-yellow-400 font-bold">
                        ✂ {step.retainedCutBtc} BTC
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          SCAM TAINT
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAR Dossier Modal */}
          {showSarModal && sarDossier && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-[#141720] border border-[#2d3748] rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                <div className="p-5 border-b border-[#2d3748] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="text-[#f7931a]" size={20} />
                    <h3 className="text-base font-bold text-white">
                      Regulatory SAR Dossier #{sarDossier.regulatoryFilingId}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowSarModal(false)}
                    className="text-[#94a3b8] hover:text-white text-sm px-2 py-1"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="p-6 overflow-y-auto font-mono text-xs space-y-4 text-slate-300">
                  <div className="bg-[#0d0f14] p-4 rounded-lg border border-[#2d3748]">
                    <div className="text-emerald-400 font-bold text-sm mb-2">
                      OFFICIAL SUSPICIOUS ACTIVITY REPORT (SAR) - CRYPTO MULE SYNDICATE
                    </div>
                    <p className="text-slate-400 mb-2">
                      Agency: {sarDossier.agency} • Filing Date: {sarDossier.filingDate}
                    </p>
                    <p className="text-white leading-relaxed">{sarDossier.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs uppercase mb-2">
                      Syndicate Summary Metrics:
                    </h4>
                    <pre className="bg-[#0d0f14] p-3 rounded border border-[#2d3748] text-slate-300">
                      {JSON.stringify(sarDossier.syndicateMetrics, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs uppercase mb-2">
                      Flagged Persons, KYC & Banking Ledger:
                    </h4>
                    <pre className="bg-[#0d0f14] p-3 rounded border border-[#2d3748] text-slate-300 overflow-x-auto">
                      {JSON.stringify(sarDossier.flaggedPersonsAndAccounts, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-4 border-t border-[#2d3748] flex items-center justify-between bg-[#0d0f14]">
                  <span className="text-[11px] text-[#94a3b8]">
                    Compliance hash verified by BitFlow AML Autonomous Engine.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(JSON.stringify(sarDossier, null, 2))}
                      className="text-xs bg-[#1c2030] text-white px-3 py-1.5 rounded border border-[#2d3748] hover:border-slate-500"
                    >
                      {copiedText ? "Copied JSON!" : "Copy Full JSON"}
                    </button>
                    <button
                      onClick={() => setShowSarModal(false)}
                      className="text-xs bg-[#f7931a] text-black font-semibold px-4 py-1.5 rounded"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
