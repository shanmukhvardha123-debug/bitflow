import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Pin,
  PinOff,
  Search,
  Plus,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Database,
  RefreshCw,
  X,
  Building2,
  Shuffle,
  Eye,
  Activity,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { WatchedWallet } from "../lib/firebase";

interface WatchedWalletsSectionProps {
  btcPriceUsd?: number;
}

export default function WatchedWalletsSection({ btcPriceUsd = 64250 }: WatchedWalletsSectionProps) {
  const {
    user,
    signInWithGoogle,
    watchedWallets,
    addWatchedWalletItem,
    removeWatchedWalletItem,
  } = useAuth();

  const [liveBtcPrice, setLiveBtcPrice] = useState<number>(btcPriceUsd);

  useEffect(() => {
    fetch("/api/bitcoin/market")
      .then((res) => res.json())
      .then((data) => {
        if (data?.prices?.USD) {
          setLiveBtcPrice(data.prices.USD);
        }
      })
      .catch((e) => console.warn("Live BTC price fetch warning:", e));
  }, []);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Suggested / available benchmark wallets from backend directory
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Form State for Pinning
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<WatchedWallet["category"]>("SUSPECT");
  const [newRiskScore, setNewRiskScore] = useState<number>(75);
  const [newBalance, setNewBalance] = useState<string>("12.50");
  const [newNotes, setNewNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load candidate benchmark wallets to suggest in the modal
  useEffect(() => {
    if (isPinModalOpen && availableWallets.length === 0) {
      setLoadingSuggestions(true);
      fetch("/api/wallets")
        .then((res) => res.json())
        .then((data) => {
          if (data.wallets) {
            setAvailableWallets(data.wallets.slice(0, 15));
          }
        })
        .catch((err) => console.error("Could not fetch candidate wallets:", err))
        .finally(() => setLoadingSuggestions(false));
    }
  }, [isPinModalOpen, availableWallets.length]);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handlePickCandidate = (w: any) => {
    setNewAddress(w.address);
    setNewLabel(`${w.demoPerson} (${w.memberId})`);
    setNewRiskScore(w.riskScore || 50);
    setNewCategory(w.riskScore >= 70 ? "SUSPECT" : "GENUINE");
    setNewBalance(((w.totalReceived || 0) - (w.totalSent || 0)).toFixed(2));
    setNewNotes(`Flagged in automated surveillance. Location: ${w.city || "Unknown"}`);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newAddress.trim()) {
      setFormError("Please enter a valid Bitcoin wallet address.");
      return;
    }

    if (!newLabel.trim()) {
      setFormError("Please provide a label or moniker for this wallet.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addWatchedWalletItem({
        address: newAddress.trim(),
        label: newLabel.trim(),
        category: newCategory,
        riskScore: Number(newRiskScore) || 50,
        balanceBtc: parseFloat(newBalance) || 0,
        notes: newNotes.trim() || undefined,
        txCount: Math.floor(Math.random() * 80) + 12,
        lastActive: "Just now",
      });

      // Reset form
      setNewAddress("");
      setNewLabel("");
      setNewCategory("SUSPECT");
      setNewRiskScore(75);
      setNewBalance("12.50");
      setNewNotes("");
      setIsPinModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to pin wallet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered watched wallets
  const filteredWallets = watchedWallets.filter((w) => {
    const matchesSearch =
      search.trim() === "" ||
      w.label.toLowerCase().includes(search.toLowerCase()) ||
      w.address.toLowerCase().includes(search.toLowerCase()) ||
      (w.notes && w.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || w.category?.toUpperCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Aggregated quick stats
  const totalBtcMonitored = watchedWallets.reduce(
    (acc, curr) => acc + (curr.balanceBtc || 0),
    0
  );
  const highRiskCount = watchedWallets.filter((w) => (w.riskScore || 0) >= 70).length;

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "SUSPECT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert size={11} /> SUSPECT
          </span>
        );
      case "MIXER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Shuffle size={11} /> MIXER
          </span>
        );
      case "EXCHANGE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Building2 size={11} /> EXCHANGE
          </span>
        );
      case "WHALE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Layers size={11} /> WHALE
          </span>
        );
      case "GENUINE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck size={11} /> GENUINE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
            <Eye size={11} /> WATCHED
          </span>
        );
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    if (score >= 40) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <div id="watched-wallets-section" className="card p-5 mb-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Pin size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Watched Wallets
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {watchedWallets.length} Pinned
              </span>
              {user ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Database size={10} className="text-emerald-400" />
                  Firestore Sync
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Local Cache
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pinned high-priority Bitcoin addresses for quick telemetry, risk scoring, and velocity monitoring
            </p>
          </div>
        </div>

        {/* Quick Stats & Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">High Risk</span>
              <strong className="text-rose-400 font-mono">{highRiskCount} Flagged</strong>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Monitored Vol</span>
              <strong className="text-amber-400 font-mono">
                {totalBtcMonitored.toLocaleString(undefined, { maximumFractionDigits: 2 })} BTC
              </strong>
            </div>
          </div>

          <button
            id="pin-new-wallet-btn"
            onClick={() => setIsPinModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Pin Wallet</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pinned labels, addresses, notes..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "SUSPECT", "MIXER", "EXCHANGE", "WHALE", "GENUINE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Watched Wallets Grid */}
      {filteredWallets.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80 my-2">
          <Wallet size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No watched wallets match your criteria</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Pin suspect addresses or key exchange reserves to keep them in high-visibility view on your dashboard.
          </p>
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Pin a Wallet Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {filteredWallets.map((wallet) => {
            const usdValue = (wallet.balanceBtc || 0) * liveBtcPrice;
            const isHighRisk = (wallet.riskScore || 0) >= 70;

            return (
              <div
                key={wallet.id}
                id={`watched-wallet-card-${wallet.id}`}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all hover:shadow-lg flex flex-col justify-between group relative"
              >
                {/* Card Header: Category & Unpin */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {getCategoryBadge(wallet.category)}

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getRiskScoreColor(
                          wallet.riskScore || 0
                        )}`}
                        title="Composite AML Risk Score"
                      >
                        Risk {wallet.riskScore || 0}/100
                      </span>

                      <button
                        onClick={() => removeWatchedWalletItem(wallet.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Unpin wallet from quick monitoring"
                        aria-label={`Unpin ${wallet.label}`}
                      >
                        <PinOff size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Moniker / Label */}
                  <h3 className="font-bold text-white text-sm truncate tracking-tight" title={wallet.label}>
                    {wallet.label}
                  </h3>

                  {/* Address with Copy */}
                  <div className="flex items-center justify-between gap-1.5 mt-1 px-2 py-1 rounded bg-slate-900 border border-slate-800/80">
                    <span
                      className="font-mono text-[11px] text-slate-400 truncate"
                      title={wallet.address}
                    >
                      {wallet.address}
                    </span>
                    <button
                      onClick={() => handleCopy(wallet.address)}
                      className="text-slate-500 hover:text-white p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                      title="Copy full Bitcoin address"
                    >
                      {copiedAddress === wallet.address ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>

                  {/* Notes if available */}
                  {wallet.notes && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 italic leading-relaxed">
                      "{wallet.notes}"
                    </p>
                  )}
                </div>

                {/* Card Footer: Metrics & Navigation Link */}
                <div className="mt-3 pt-3 border-t border-slate-800/70">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Balance</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">
                        {(wallet.balanceBtc || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })} BTC
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">USD Equiv</span>
                      <span className="text-xs font-semibold text-slate-300 font-mono">
                        ${usdValue >= 1000000
                          ? `${(usdValue / 1000000).toFixed(2)}M`
                          : usdValue >= 1000
                          ? `${(usdValue / 1000).toFixed(1)}k`
                          : usdValue.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Activity size={10} className="text-emerald-400" />
                      {wallet.txCount || 1} txs recorded
                    </span>

                    <Link
                      to={`/wallet/${wallet.address}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      <span>Investigate</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pin New Wallet Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Pin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pin Wallet to Dashboard</h3>
                  <p className="text-[11px] text-slate-400">
                    Quickly bookmark suspect clusters, darknet exits, or high-value accounts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Quick Pick from Benchmark Suspect Directory */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Quick Pick from Benchmark Directory:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Click any suspect to autofill</span>
                </label>

                {loadingSuggestions ? (
                  <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin" /> Loading benchmark addresses...
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {availableWallets.slice(0, 6).map((item) => (
                      <button
                        type="button"
                        key={item.address}
                        onClick={() => handlePickCandidate(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left shrink-0 transition-colors cursor-pointer group"
                      >
                        <div className="text-[11px] font-bold text-white group-hover:text-amber-400 truncate max-w-[140px]">
                          {item.demoPerson}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                          {item.address.substring(0, 10)}...
                        </div>
                        <span
                          className={`inline-block text-[9px] font-mono font-bold mt-1 px-1 rounded ${
                            item.riskScore >= 70 ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          Risk {item.riskScore}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pin Form */}
              <form onSubmit={handlePinSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {formError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Bitcoin Address *
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa or bc1q..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Label / Moniker *
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Suspect Peel-Chain Node"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Entity Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="SUSPECT">SUSPECT (High AML Flag)</option>
                      <option value="MIXER">MIXER (Anonymity Pool)</option>
                      <option value="EXCHANGE">EXCHANGE (Reserve/Hot)</option>
                      <option value="WHALE">WHALE (Large Liquidity)</option>
                      <option value="GENUINE">GENUINE (Verified Legitimate)</option>
                      <option value="CUSTOM">CUSTOM WATCH</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Initial Risk Score ({newRiskScore}/100)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={newRiskScore}
                      onChange={(e) => setNewRiskScore(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>0 (Safe)</span>
                      <span>50 (Medium)</span>
                      <span>100 (Critical)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Balance (BTC)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Investigator Surveillance Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Associated with sudden transaction spikes or unverified P2P escrow..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Pin size={14} />
                    {isSubmitting ? "Pinning..." : "Pin Wallet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
