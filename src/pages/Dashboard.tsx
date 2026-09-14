import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BitcoinMarketCard from "../components/BitcoinMarketCard";
import WatchedWalletsSection from "../components/WatchedWalletsSection";
import { X } from "lucide-react";

export default function Dashboard() {
  const [criticalNotice, setCriticalNotice] = useState<any | null>(null);

  // WebSocket Live Stream Connection for Critical Alerts
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "NEW_ALERT" && msg.data) {
            if (msg.data.severity === "CRITICAL") {
              setCriticalNotice(msg.data);
            }
          }
        } catch (err) {
          console.error("WS Parse error:", err);
        }
      };
    } catch (e) {
      console.warn("WebSocket connection warning:", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Header Action Bar */}
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Bitcoin Intelligence & Forensic Monitoring
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE STREAMING
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time Bitcoin market tracking, 24h trajectory analysis, and network surveillance
              </p>
            </div>
          </div>

          {/* Non-intrusive Critical Alert Banner if detected */}
          {criticalNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-between gap-3 text-xs text-rose-200 shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-bold text-white">🚨 High Risk Detection:</span>
                <span>{criticalNotice.title || criticalNotice.flowSummary}</span>
              </div>
              <button
                onClick={() => setCriticalNotice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Present Market Value & Graph of Bitcoin */}
          <BitcoinMarketCard />

          {/* Watched Wallets Pinned Monitoring Section */}
          <WatchedWalletsSection />
        </section>
      </main>
    </div>
  );
}
