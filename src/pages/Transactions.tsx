import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Activity,
  Filter,
  Search,
  Zap,
  HelpCircle,
  Eye,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  X,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [whaleOnly, setWhaleOnly] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "CONFIRMED" | "MEMPOOL">("ALL");
  const navigate = useNavigate();

  const fetchTransactions = () => {
    setLoading(true);
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load transactions:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();

    // WebSocket live feed subscription
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "NEW_TRANSACTION" && msg.data) {
          setTransactions((prev) => [msg.data, ...prev.slice(0, 149)]);
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    return () => ws.close();
  }, []);

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      tx.id.toLowerCase().includes(q) ||
      tx.senderName?.toLowerCase().includes(q) ||
      tx.receiverName?.toLowerCase().includes(q) ||
      tx.senderAddress?.toLowerCase().includes(q) ||
      tx.receiverAddress?.toLowerCase().includes(q);

    const matchesRisk =
      riskFilter === "ALL"
        ? true
        : riskFilter === "HIGH"
        ? tx.riskScore >= 75 || tx.riskFlag === "High"
        : riskFilter === "REVIEW"
        ? (tx.riskScore >= 45 && tx.riskScore < 75) || tx.riskFlag === "Review"
        : tx.riskScore < 45 || tx.riskFlag === "Low";

    const matchesWhale = whaleOnly ? tx.isWhale || tx.amountBtc >= 5.0 : true;

    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "CONFIRMED"
        ? tx.status === "Confirmed"
        : tx.status === "Pending" || tx.status === "Mempool";

    return matchesSearch && matchesRisk && matchesWhale && matchesTab;
  });

  const totalVolume = transactions.reduce((acc, t) => acc + (t.amountBtc || 0), 0).toFixed(2);
  const highRiskCount = transactions.filter((t) => t.riskScore >= 75).length;
  const whaleCount = transactions.filter((t) => t.isWhale || t.amountBtc >= 5.0).length;

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header onSearch={setSearchQuery} />

        <section className="content">
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Live Bitcoin Transaction Ledger</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  WS STREAMING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time mempool broadcasts, risk-scored transactions & deep forensic tracing
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTransactions}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Streamed Txs</span>
              <div className="text-2xl font-black text-white mt-1">{transactions.length}</div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Active Mempool & Blocks</span>
            </div>

            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Cumulative Volume</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{totalVolume} <span className="text-xs font-normal text-slate-400">BTC</span></div>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Network Throughput</span>
            </div>

            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Whale Transactions</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{whaleCount}</div>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">&ge; 5.00 BTC Transfers</span>
            </div>

            <div className="card p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Flagged Threats</span>
              <div className="text-2xl font-black text-red-400 mt-1">{highRiskCount}</div>
              <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">Risk Score &ge; 75</span>
            </div>
          </div>

          {/* Filtering and Controls Bar */}
          <div className="card mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(["ALL", "CONFIRMED", "MEMPOOL"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                      activeTab === tab ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Risk Filter Buttons */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[
                  { key: "ALL", label: "All Risks" },
                  { key: "HIGH", label: "High Risk (75+)" },
                  { key: "REVIEW", label: "Review (45-74)" },
                  { key: "LOW", label: "Low Risk (<45)" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRiskFilter(item.key)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                      riskFilter === item.key
                        ? "bg-slate-800 text-white border border-slate-700 shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWhaleOnly(!whaleOnly)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-colors ${
                  whaleOnly
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                🐋 Whale Transfers Only: {whaleOnly ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl mb-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-amber-400" />
                  Transactions Feed ({filtered.length} matching)
                </h3>
                <p className="text-xs text-slate-400">
                  Click 'Why Flagged?' to inspect AI heuristics or 'Investigate' for multi-hop graph trace
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Sender & Receiver</th>
                    <th>Amount (BTC)</th>
                    <th>USD Value</th>
                    <th>Fee Rate</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                    <th>Explainable AI Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="font-mono text-xs text-slate-300 font-semibold">{tx.id}</td>
                      <td className="text-xs">
                        <div className="text-white font-medium">{tx.senderName || tx.senderAddress?.slice(0, 12)}</div>
                        <div className="text-slate-400 text-[11px]">→ {tx.receiverName || tx.receiverAddress?.slice(0, 12)}</div>
                      </td>
                      <td className="font-bold text-white text-xs">
                        {tx.amountBtc} BTC
                        {tx.isWhale && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                            WHALE
                          </span>
                        )}
                      </td>
                      <td className="text-slate-400 text-xs">${tx.amountUsd?.toLocaleString() || "—"}</td>
                      <td className="font-mono text-xs text-amber-400">{tx.feeRateSatVb} sat/vB</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.riskScore >= 75
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : tx.riskScore >= 45
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {tx.riskScore}/100
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-semibold border border-slate-700 flex items-center gap-1"
                        >
                          <HelpCircle size={12} /> Why Flagged?
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/investigation?target=${tx.id}`)}
                          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Eye size={12} /> Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-500 text-xs">
                        No transactions match your current search and filter settings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Explainable AI Modal Drawer */}
          {selectedTx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="card p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl relative">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      selectedTx.riskScore >= 75
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    !
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Detection Heuristic Explanation</h3>
                    <p className="text-xs font-mono text-slate-400">{selectedTx.id}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">
                      AI Telemetry Reason
                    </span>
                    <p className="text-white text-xs font-medium">{selectedTx.aiInterpretation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">AMOUNT</span>
                      <span className="font-bold text-white">{selectedTx.amountBtc} BTC</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">FEE RATE</span>
                      <span className="font-bold text-amber-400">{selectedTx.feeRateSatVb} sat/vB</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">
                      Model Classification Note
                    </span>
                    <p className="text-slate-300 text-[11px]">{selectedTx.aiDecisionNote}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const id = selectedTx.id;
                      setSelectedTx(null);
                      navigate(`/investigation?target=${id}`);
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    Open Full Multi-Hop Trace <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
