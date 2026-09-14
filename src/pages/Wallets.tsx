import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Wallet,
  Search,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Pin,
  PinOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Wallets() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const {
    isWalletPinned,
    addWatchedWalletItem,
    removeWatchedWalletItem,
    watchedWallets,
  } = useAuth();

  useEffect(() => {
    fetch("/api/wallets")
      .then((res) => res.json())
      .then((data) => {
        setWallets(data.wallets || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wallets:", err);
        setLoading(false);
      });
  }, []);

  const filtered = wallets.filter((w) => {
    const matchesSearch =
      search.trim() === "" ||
      w.address.toLowerCase().includes(search.toLowerCase()) ||
      w.demoPerson.toLowerCase().includes(search.toLowerCase()) ||
      w.memberId.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL"
        ? true
        : riskFilter === "HIGH"
        ? w.riskScore >= 70
        : riskFilter === "MEDIUM"
        ? w.riskScore >= 40 && w.riskScore < 70
        : w.riskScore < 40;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="page-title flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Wallet Intelligence Directory</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  100 BENCHMARK WALLETS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Profiling counterparty clusters, risk propagation, and historical velocity deviations
              </p>
            </div>

            <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
              SYNTHETIC DEMO PROFILES — NOT REAL PERSON DATA
            </div>
          </div>

          {/* Search & Filters */}
          <div className="card mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wallet address, person name, member ID, or city..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Risk:</span>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      riskFilter === lvl ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
                <RefreshCw className="animate-spin" size={18} /> Loading wallet directory...
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Subject Name</th>
                      <th>Bitcoin Address</th>
                      <th>Location</th>
                      <th>Txs</th>
                      <th>Total Received</th>
                      <th>Total Sent</th>
                      <th>Risk Score</th>
                      <th>KYC Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((w) => (
                      <tr key={w.address} className="hover:bg-slate-800/40 transition-colors">
                        <td className="font-bold text-amber-400 font-mono text-xs">{w.memberId}</td>
                        <td className="font-semibold text-white">{w.demoPerson}</td>
                        <td className="font-mono text-xs text-slate-400">
                          {w.address.slice(0, 14)}...{w.address.slice(-6)}
                        </td>
                        <td className="text-slate-300 text-xs">{w.city}</td>
                        <td className="text-slate-200 font-bold">{w.txCount}</td>
                        <td className="text-emerald-400 font-medium">+{w.totalReceived} BTC</td>
                        <td className="text-rose-400 font-medium">-{w.totalSent} BTC</td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              w.riskScore >= 75
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : w.riskScore >= 50
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            {w.riskScore}/100
                          </span>
                        </td>
                        <td>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {w.kycStatus}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const pinned = isWalletPinned(w.address);
                                if (pinned) {
                                  const rec = watchedWallets.find((item) => item.address.toLowerCase() === w.address.toLowerCase());
                                  if (rec) removeWatchedWalletItem(rec.id);
                                } else {
                                  addWatchedWalletItem({
                                    address: w.address,
                                    label: `${w.demoPerson} (${w.memberId})`,
                                    category: w.riskScore >= 70 ? "SUSPECT" : "GENUINE",
                                    riskScore: w.riskScore,
                                    balanceBtc: Math.max(0, (w.totalReceived || 0) - (w.totalSent || 0)),
                                    notes: `Monitored from Directory. City: ${w.city}`,
                                    txCount: w.txCount,
                                    lastActive: "Monitored",
                                  });
                                }
                              }}
                              className={`p-1.5 rounded text-xs transition-colors cursor-pointer border ${
                                isWalletPinned(w.address)
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                                  : "bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:border-amber-500/40"
                              }`}
                              title={isWalletPinned(w.address) ? "Unpin from Dashboard Watched Wallets" : "Pin to Dashboard Watched Wallets"}
                              aria-label={isWalletPinned(w.address) ? "Unpin wallet" : "Pin wallet"}
                            >
                              {isWalletPinned(w.address) ? <PinOff size={13} className="text-rose-400" /> : <Pin size={13} className="text-amber-400" />}
                            </button>

                            <Link
                              to={`/wallet/${w.address}`}
                              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                            >
                              <span>Investigate</span>
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
