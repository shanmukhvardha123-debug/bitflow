import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Bell, ShieldAlert, CheckCircle2, Sliders } from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
  type: "whale" | "fee" | "block";
}

export default function Alerts() {
  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: "1",
      name: "Whale Transfer Alert",
      condition: "Trigger when single transaction >= 50 BTC",
      enabled: true,
      type: "whale",
    },
    {
      id: "2",
      name: "Fee Spike Warning",
      condition: "Trigger when recommended fee surpasses 35 sat/vB",
      enabled: true,
      type: "fee",
    },
    {
      id: "3",
      name: "New Block Notification",
      condition: "Trigger on each new verified Bitcoin block header",
      enabled: false,
      type: "block",
    },
    {
      id: "4",
      name: "Mempool Congestion Alert",
      condition: "Trigger when mempool memory usage exceeds 280 MB",
      enabled: true,
      type: "fee",
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="page-title">
            <div>
              <h1>Network Alerts</h1>
              <p>Automated triggers for mempool events, fee surges, and whale movements</p>
            </div>

            <div className="live-badge">
              <span className="live-dot"></span>
              Watcher Active
            </div>
          </div>

          <div className="panel mb-6">
            <div className="panel-header">
              <div>
                <h2>Configured Trigger Rules</h2>
                <p>Manage real-time notifications dispatched to your workspace</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                <Sliders size={14} /> 4 Defined Rules
              </div>
            </div>

            <div className="divide-y divide-[#2d3748]">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 flex items-center justify-between hover:bg-[#1c2030]/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        rule.enabled
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-gray-800 text-gray-500 border border-gray-700"
                      }`}
                    >
                      {rule.type === "whale" ? "🐋" : <Bell size={18} />}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                      <p className="text-xs text-[#94a3b8]">{rule.condition}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-md border font-medium transition-colors ${
                      rule.enabled
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-[#1c2030] text-[#94a3b8] border-[#2d3748]"
                    }`}
                  >
                    {rule.enabled ? "Active" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Recent Trigger Log</h2>
                <p>Historical audit of fired triggers</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-[#1c2030] border border-[#2d3748] rounded-lg p-3 flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="text-amber-400 mt-0.5" size={16} />
                  <div>
                    <span className="font-semibold text-white">Whale Transfer Detected</span>
                    <p className="text-[#94a3b8]">Tx f19c82...aa72 broadcasted with 124.50 BTC ($10.2M)</p>
                  </div>
                </div>
                <span className="text-[#64748b]">5m ago</span>
              </div>

              <div className="bg-[#1c2030] border border-[#2d3748] rounded-lg p-3 flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="text-[#22c55e] mt-0.5" size={16} />
                  <div>
                    <span className="font-semibold text-white">Block Height Milestone</span>
                    <p className="text-[#94a3b8]">Block #912,345 confirmed by Foundry USA Pool (3,120 txs)</p>
                  </div>
                </div>
                <span className="text-[#64748b]">14m ago</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
