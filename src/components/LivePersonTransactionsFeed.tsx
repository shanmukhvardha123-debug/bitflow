import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Bitcoin,
  DollarSign,
  User,
  Filter,
  Eye,
} from "lucide-react";

export interface LivePersonTransaction {
  id: string;
  date: string;
  time: string;
  amountBtc: number;
  amountUsd: number;
  riskScore: number;
  riskFlag: string;
  txType: string;
  paymentStatus: string;
  senderMember: {
    memberId: string;
    name: string;
    occupation: string;
    isScammer: boolean;
    role: string;
    riskScore: number;
    accountId: string;
  };
  receiverMember: {
    memberId: string;
    name: string;
    occupation: string;
    isScammer: boolean;
    role: string;
    riskScore: number;
    accountId: string;
  };
  isScammerInvolved: boolean;
  aiInterpretation?: string;
}

interface LivePersonTransactionsFeedProps {
  transactions: LivePersonTransaction[];
  onSelectPersonById: (memberId: string) => void;
}

export default function LivePersonTransactionsFeed({
  transactions,
  onSelectPersonById,
}: LivePersonTransactionsFeedProps) {
  const [filter, setFilter] = useState<"ALL" | "SCAMMER_FLOWS" | "GENUINE_ONLY">("ALL");

  const filteredTxs = transactions.filter((tx) => {
    if (filter === "SCAMMER_FLOWS") return tx.isScammerInvolved;
    if (filter === "GENUINE_ONLY") return !tx.isScammerInvolved;
    return true;
  });

  return (
    <div id="live-person-transactions" className="card p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              Live Transactions of Persons
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REAL-TIME FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Person-to-person cryptographic transfers with instantaneous scammer vs genuine counterparty classification
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 rounded font-semibold transition-colors ${
              filter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Live ({transactions.length})
          </button>
          <button
            onClick={() => setFilter("SCAMMER_FLOWS")}
            className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
              filter === "SCAMMER_FLOWS"
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert size={12} className="text-red-400" />
            Scammer Flows
          </button>
          <button
            onClick={() => setFilter("GENUINE_ONLY")}
            className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors ${
              filter === "GENUINE_ONLY"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 size={12} className="text-emerald-400" />
            Genuine Only
          </button>
        </div>
      </div>

      {/* Live Transaction Stream List */}
      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {filteredTxs.slice(0, 20).map((tx, idx) => {
          const isThreat = tx.isScammerInvolved || tx.riskScore >= 60;
          return (
            <div
              key={tx.id || `live-tx-${idx}`}
              className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isThreat
                  ? "bg-gradient-to-r from-red-950/20 via-slate-950 to-slate-950 border-red-900/40 hover:border-red-500/50"
                  : "bg-slate-950 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Person Transfer Path (Sender -> Receiver) */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Sender Person */}
                <div
                  onClick={() => onSelectPersonById(tx.senderMember.memberId)}
                  className="flex items-center gap-2 cursor-pointer group shrink-0"
                  title={`Click to preview full profile of ${tx.senderMember.name}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      tx.senderMember.isScammer
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {tx.senderMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {tx.senderMember.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({tx.senderMember.memberId})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      {tx.senderMember.isScammer ? (
                        <span className="text-red-400 font-semibold flex items-center gap-0.5">
                          🚨 Scammer / Mule
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          🛡️ Genuine User
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transfer Arrow & Flow Info */}
                <div className="flex flex-col items-center justify-center px-2 shrink-0">
                  <div className="text-[10px] font-mono text-slate-500 mb-0.5">{tx.txType || "Transfer"}</div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="w-4 h-0.5 bg-slate-700"></span>
                    <ArrowRight size={14} className={isThreat ? "text-amber-400" : "text-slate-400"} />
                  </div>
                </div>

                {/* Receiver Person */}
                <div
                  onClick={() => onSelectPersonById(tx.receiverMember.memberId)}
                  className="flex items-center gap-2 cursor-pointer group shrink-0"
                  title={`Click to preview full profile of ${tx.receiverMember.name}`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      tx.receiverMember.isScammer
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {tx.receiverMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {tx.receiverMember.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({tx.receiverMember.memberId})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      {tx.receiverMember.isScammer ? (
                        <span className="text-red-400 font-semibold">🚨 Flagged Mule</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">🛡️ Genuine User</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount, Time, Risk & Profile Preview Button */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-black text-white font-mono flex items-center justify-end gap-1">
                    <Bitcoin size={14} className="text-amber-400" />
                    {tx.amountBtc.toFixed(4)} BTC
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ${tx.amountUsd.toLocaleString()} USD
                  </div>
                </div>

                {/* Risk Tag */}
                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                      tx.riskScore >= 75
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : tx.riskScore >= 50
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    Risk: {tx.riskScore}/100
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {tx.time || "Live"}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPersonById(tx.senderMember.memberId)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors border border-slate-800"
                  title="Preview Sender Profile"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTxs.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-xs">
          No live transactions matching the selected filter.
        </div>
      )}
    </div>
  );
}
