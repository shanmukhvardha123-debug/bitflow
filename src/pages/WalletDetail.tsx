import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Wallet,
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  FileCheck,
  Share2,
  ChevronRight,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  Pin,
  PinOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function WalletDetail() {
  const { address } = useParams<{ address: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const {
    isWalletPinned,
    addWatchedWalletItem,
    removeWatchedWalletItem,
    watchedWallets,
  } = useAuth();

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/wallets/${address}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wallet detail:", err);
        setLoading(false);
      });
  }, [address]);

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="animate-spin" size={18} /> Loading wallet dossier...
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main p-8 text-white">
          <h2>Wallet not found</h2>
          <Link to="/wallets" className="text-amber-400 mt-4 block">
            Return to Wallets
          </Link>
        </main>
      </div>
    );
  }

  const member = data.member;
  const stats = data.stats;

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Regulatory Synthetic Banner */}
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} />
              SYNTHETIC DEMO PROFILE — NOT REAL PERSON DATA (BENCHMARK DATASET)
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono">
              DATA_SOURCE = SYNTHETIC_DEMO_EXCEL
            </span>
          </div>

          {/* Profile Overview Card */}
          <div className="card mb-6 p-6 bg-slate-900/90 border border-slate-800 rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-2xl shrink-0">
                  {member?.name ? member.name[0] : "W"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-black text-white">{member?.name || "Subject Wallet"}</h1>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {member?.memberId || "M-DEMO"}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {member?.profileStatus || "Active"}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-400 mt-1">{address}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 flex-wrap">
                    <span><strong>Location:</strong> {member?.city || "Unknown"}, {member?.country || "India"}</span>
                    <span><strong>Age:</strong> {member?.age || "N/A"}</span>
                    <span><strong>Occupation:</strong> {member?.occupation || "N/A"}</span>
                    <span><strong>Account Created:</strong> {member?.profileCreated || "2026-07-01"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Risk */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[120px]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                    Risk Score
                  </span>
                  <div className={`text-2xl font-black ${stats.riskScore >= 70 ? "text-red-400" : stats.riskScore >= 40 ? "text-amber-400" : "text-emerald-400"}`}>
                    {stats.riskScore}/100
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!address) return;
                      const pinned = isWalletPinned(address);
                      if (pinned) {
                        const rec = watchedWallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
                        if (rec) removeWatchedWalletItem(rec.id);
                      } else {
                        addWatchedWalletItem({
                          address,
                          label: member?.name ? `${member.name} (${member.memberId || "Subject"})` : `Wallet ${address.slice(0, 10)}`,
                          category: stats.riskScore >= 70 ? "SUSPECT" : "GENUINE",
                          riskScore: stats.riskScore || 50,
                          balanceBtc: stats.netBalanceBtc || 0,
                          notes: `Pinned from Dossier. Location: ${member?.city || "Unknown"}`,
                          txCount: stats.txCount || 0,
                          lastActive: "Recent Activity",
                        });
                      }
                    }}
                    className={`px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer border ${
                      isWalletPinned(address || "")
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-amber-500/40"
                    }`}
                    title={isWalletPinned(address || "") ? "Unpin from Watched Wallets on Dashboard" : "Pin to Watched Wallets on Dashboard"}
                  >
                    {isWalletPinned(address || "") ? (
                      <>
                        <PinOff size={14} className="text-rose-400" />
                        <span>Pinned to Dashboard</span>
                      </>
                    ) : (
                      <>
                        <Pin size={14} className="text-amber-400" />
                        <span>Pin to Watched Wallets</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/investigation?target=${address}`}
                    className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
                  >
                    <ShieldAlert size={14} /> Open Investigation
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Transacted</span>
                <span className="text-sm font-bold text-white">{stats.txCount} txs</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Received</span>
                <span className="text-sm font-bold text-emerald-400">+{stats.totalReceived} BTC</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Sent</span>
                <span className="text-sm font-bold text-rose-400">-{stats.totalSent} BTC</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Net Balance</span>
                <span className="text-sm font-bold text-amber-400">{stats.netBalance} BTC</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Counterparties</span>
                <span className="text-sm font-bold text-slate-200">{stats.counterpartiesCount} unique</span>
              </div>
            </div>
          </div>

          {/* 3 Column Detailed Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 1. Core KYC & ID Reference */}
            <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                <FileCheck className="text-amber-400" size={17} /> KYC & Synthetic ID Credentials
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">ID Proof Type:</span>
                  <span className="font-semibold text-white">{member?.idProofType || "Aadhaar (Demo Ref)"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Synthetic ID Ref:</span>
                  <span className="font-mono text-amber-400">{member?.syntheticIdRef || "DEMO-ID-REF-XXXX"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">KYC Status:</span>
                  <span className="font-bold text-emerald-400">{member?.kycStatus || "Verified (Synthetic)"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Verification Date:</span>
                  <span className="text-slate-300">{member?.verificationDate || "2026-08-01"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">KYC Case Reference:</span>
                  <span className="font-mono text-slate-400">{member?.kycCaseId || "KYC-DEMO-0001"}</span>
                </div>
              </div>
            </div>

            {/* 2. Banking Gateway & Custody */}
            <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                <Building className="text-amber-400" size={17} /> Banking & Custody Architecture
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Bank Account ID:</span>
                  <span className="font-mono text-amber-400">{member?.accountId || "DEMO-BANK-000001"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Routing / IFSC Ref:</span>
                  <span className="font-mono text-slate-300">{member?.routingRef || "DEMO-IFSC-00001"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Custody Model:</span>
                  <span className="text-slate-300">{member?.custodyModel || "Synthetic Custodial Demo"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="font-bold text-emerald-400">{member?.accountStatus || "Active"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Account Type:</span>
                  <span className="text-slate-300">{member?.accountType || "Bitcoin Wallet"}</span>
                </div>
              </div>
            </div>

            {/* 3. Nominee / Proxy Details */}
            <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-white">
                <User className="text-amber-400" size={17} /> Registered Nominee & Intermediary
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Nominee Name:</span>
                  <span className="font-semibold text-white">{member?.nomineeName || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Relationship:</span>
                  <span className="text-slate-300">{member?.nomineeRelationship || "Relative"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Contact Reference:</span>
                  <span className="font-mono text-slate-400">{member?.nomineePhone || "+91-91111-20000"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Nominee ID:</span>
                  <span className="font-mono text-amber-400">{member?.nomineeRef || "DEMO-NOM-0001"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Timeline & Previous Data Analysis */}
          <div className="card p-6 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
            <h3 className="text-sm font-bold text-white mb-1">
              Historical Behavior & Threat Timeline (Requirement 24 & 26)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Longitudinal activity tracking from baseline inception to real-time risk classification
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.behaviorTimeline.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{item.date}</span>
                    <p className="text-xs font-semibold text-slate-200 mt-1">{item.event}</p>
                  </div>
                  <span
                    className={`mt-3 text-[10px] font-bold px-2 py-0.5 rounded w-max ${
                      item.level === "critical"
                        ? "bg-red-500/20 text-red-300"
                        : item.level === "warning"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {item.level.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Previous Transactions Ledger</h3>
              <span className="text-xs text-slate-400 font-mono">
                {data.transactions.length} Records Found
              </span>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date & Time</th>
                    <th>Direction</th>
                    <th>Counterparty</th>
                    <th>Amount (BTC)</th>
                    <th>USD Value</th>
                    <th>Risk Flag</th>
                    <th>AI Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((t: any) => {
                    const isOut = t.senderAddress === address;
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="font-mono text-xs text-amber-400 font-bold">{t.id}</td>
                        <td className="text-xs text-slate-300">
                          {t.date} {t.time}
                        </td>
                        <td>
                          <span
                            className={`flex items-center gap-1 text-xs font-semibold ${
                              isOut ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {isOut ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
                            {isOut ? "Outgoing" : "Incoming"}
                          </span>
                        </td>
                        <td className="text-xs font-medium text-white">
                          {isOut ? t.receiverName : t.senderName}
                        </td>
                        <td className="font-bold text-white">{t.amountBtc} BTC</td>
                        <td className="text-slate-400 text-xs">${t.amountUsd.toLocaleString()}</td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              t.riskFlag === "High"
                                ? "bg-red-500/20 text-red-300"
                                : t.riskFlag === "Review"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {t.riskFlag}
                          </span>
                        </td>
                        <td className="text-xs text-slate-300 max-w-xs truncate">
                          {t.aiInterpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
