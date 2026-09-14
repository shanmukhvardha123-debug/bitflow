import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Bitcoin,
  DollarSign,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface BitcoinMarketData {
  currentPrice: {
    usd: number;
    inr: number;
    eur: number;
    gbp: number;
  };
  change24h: {
    percent: number;
    amountUsd: number;
    isPositive: boolean;
  };
  range24h: {
    high: number;
    low: number;
  };
  networkStats: {
    marketCapUsd: number;
    volume24hUsd: number;
    btcDominance: number;
    satsPerDollar: number;
    hashrateEH: number;
    avgFeeSatVb: number;
    blockHeight: number;
    nextHalvingBlock: number;
    blocksUntilHalving: number;
  };
  charts: {
    "24H": { time: string; price: number; volume: number }[];
    "7D": { time: string; price: number; volume: number }[];
    "1M": { time: string; price: number; volume: number }[];
    "1Y": { time: string; price: number; volume: number }[];
  };
  lastUpdated: string;
}

type TimeFrame = "24H" | "7D" | "1M" | "1Y";
type Currency = "USD" | "INR" | "EUR";

export default function BitcoinMarketCard() {
  const [marketData, setMarketData] = useState<BitcoinMarketData | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>("24H");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loading, setLoading] = useState(true);
  const [isLivePulsing, setIsLivePulsing] = useState(false);

  const fetchMarketData = async () => {
    try {
      const res = await fetch("/api/bitcoin/market");
      if (res.ok) {
        const data: BitcoinMarketData = await res.json();
        setMarketData(data);
        setIsLivePulsing(true);
        setTimeout(() => setIsLivePulsing(false), 1200);
      }
    } catch (err) {
      console.error("Failed to load bitcoin market data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading || !marketData) {
    return (
      <div className="card p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg mb-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="h-10 w-64 bg-slate-800 rounded mb-6"></div>
        <div className="h-60 w-full bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const { currentPrice, change24h, range24h, networkStats, charts } = marketData;

  // Currency Formatter
  const formatPrice = (val: number) => {
    if (currency === "INR") {
      const inrVal = Math.round(val * (currentPrice.inr / currentPrice.usd));
      return `₹${inrVal.toLocaleString("en-IN")}`;
    }
    if (currency === "EUR") {
      const eurVal = Math.round(val * (currentPrice.eur / currentPrice.usd));
      return `€${eurVal.toLocaleString("de-DE")}`;
    }
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentDisplayPrice =
    currency === "INR"
      ? `₹${currentPrice.inr.toLocaleString("en-IN")}`
      : currency === "EUR"
      ? `€${currentPrice.eur.toLocaleString("de-DE")}`
      : `$${currentPrice.usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const chartData = charts[timeframe] || charts["24H"];

  // Calculate min and max for chart domain
  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;

  return (
    <div
      id="bitcoin-market-value-card"
      className="card p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl shadow-xl mb-6 relative overflow-hidden"
    >
      {/* Background glowing watermark */}
      <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
        <Bitcoin size={260} className="text-amber-500" />
      </div>

      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Bitcoin size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Bitcoin Market Value
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${isLivePulsing ? "animate-ping" : "animate-pulse"}`}></span>
                LIVE NETWORK PRICE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time spot index, 24h market performance & cryptographic blockchain telemetry
            </p>
          </div>
        </div>

        {/* Currency & Timeframe Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold">
            {(["USD", "INR", "EUR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  currency === c
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Timeframe Toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold">
            {(["24H", "7D", "1M", "1Y"] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === tf
                    ? "bg-slate-800 text-amber-300 font-bold border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMarketData}
            title="Refresh Market Price"
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isLivePulsing ? "animate-spin text-amber-400" : ""} />
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 my-5">
        {/* Present Price */}
        <div className="col-span-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Present Price ({currency})
          </span>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className={`text-2xl sm:text-3xl font-black text-white font-mono transition-colors ${isLivePulsing ? "text-amber-400" : ""}`}>
              {currentDisplayPrice}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                change24h.isPositive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {change24h.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change24h.isPositive ? "+" : ""}
              {change24h.percent}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            24h Change: {change24h.isPositive ? "+$" : "-$"}{Math.abs(change24h.amountUsd).toLocaleString()} USD
          </span>
        </div>

        {/* 24h High / Low */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            24h Range
          </span>
          <div className="text-xs font-bold text-emerald-400 font-mono">
            H: {formatPrice(range24h.high)}
          </div>
          <div className="text-xs font-bold text-rose-400 font-mono mt-0.5">
            L: {formatPrice(range24h.low)}
          </div>
          {/* Visual Range bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    ((currentPrice.usd - range24h.low) / (range24h.high - range24h.low)) * 100
                  )
                )}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Market Cap & Dominance */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Market Cap
          </span>
          <div className="text-sm font-black text-white font-mono">
            ${(networkStats.marketCapUsd / 1e12).toFixed(2)}T
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            Dominance: <span className="text-amber-400 font-bold">{networkStats.btcDominance}%</span>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            24h Volume
          </span>
          <div className="text-sm font-black text-white font-mono">
            ${(networkStats.volume24hUsd / 1e9).toFixed(1)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {networkStats.satsPerDollar.toLocaleString()} sats / $
          </div>
        </div>

        {/* Blockchain Telemetry */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Mempool & Hashrate
          </span>
          <div className="text-sm font-black text-amber-400 font-mono flex items-center gap-1">
            <Zap size={13} className="text-amber-400" />
            {networkStats.avgFeeSatVb} sat/vB
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Block: #{networkStats.blockHeight.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Interactive Bitcoin Graph */}
      <div className="mt-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-300">
              Bitcoin Price Trajectory ({timeframe})
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Min: {formatPrice(Math.min(...prices))} | Max: {formatPrice(Math.max(...prices))}
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="bitcoinBtcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#64748b"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                tickFormatter={(v) =>
                  currency === "INR"
                    ? `₹${(v * 86.85 / 100000).toFixed(1)}L`
                    : `$${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-amber-500/40 p-3 rounded-xl shadow-2xl text-xs font-mono">
                        <p className="text-[10px] text-slate-400 font-sans mb-1 font-bold">
                          {dataPoint.time}
                        </p>
                        <p className="text-sm font-black text-amber-400">
                          {formatPrice(dataPoint.price)}
                        </p>
                        <p className="text-[10px] text-slate-300 mt-1">
                          Approx Volume: {dataPoint.volume}K BTC
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#bitcoinBtcGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
