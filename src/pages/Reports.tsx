import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  RefreshCw,
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("DAILY");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReport = (type: string) => {
    setLoading(true);
    fetch(`/api/reports/generate?type=${type}`)
      .then((res) => res.json())
      .then((d) => {
        setReportData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to generate report:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Compliance & Audit Reports Center</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  AML / SAR COMPLIANCE GENERATOR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate formal Suspicious Activity Reports (SAR) and executive Bitcoin forensic dossiers
              </p>
            </div>

            {/* Report Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Report Period:</span>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {["DAILY", "WEEKLY", "MONTHLY"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      reportType === type ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="card mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-400" /> Generated: {reportData?.generatedAt || "Now"}
              </span>
              <span>Case Reference: <strong>{reportData?.investigationId || "RPT-2026"}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/api/reports/generate?type=${reportType}&format=csv`}
                download
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <Download size={13} /> Export CSV
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 flex items-center gap-1.5"
              >
                <Share2 size={13} /> {copied ? "Copied!" : "Copy SAR Dossier"}
              </button>
            </div>
          </div>

          {/* Dossier Document Preview */}
          <div className="card p-8 bg-slate-950 border border-slate-800 rounded-2xl mb-6 shadow-2xl relative">
            <div className="border-b border-slate-800 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                    BF
                  </div>
                  <h2 className="text-lg font-black text-white">
                    BITFLOW AUTONOMOUS FORENSIC COMPLIANCE AUDIT
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  OFFICIAL SUSPICIOUS ACTIVITY REPORT (SAR) • FINCEN / AML / CFT BENCHMARK DOSSIER
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">CLASSIFICATION</span>
                <span className="text-xs font-bold text-red-400 font-mono">CONFIDENTIAL // LAW ENFORCEMENT DEMO</span>
              </div>
            </div>

            {/* Mandatory Regulatory Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 mb-6">
              <strong>MANDATORY REGULATORY NOTICE:</strong> {reportData?.notice || "ALL DATA IS SYNTHETIC DEMONSTRATION DATA (NOT REAL PEOPLE)."}
              <div className="text-[11px] text-amber-400/80 mt-1 italic">
                "{reportData?.summary || "Automated analytical assessment — manual investigation required."}"
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Volume Audited</span>
                <span className="text-xl font-black text-white">{reportData?.totalVolumeBtc || 0} BTC</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Alerts Triaged</span>
                <span className="text-xl font-black text-amber-400">{reportData?.totalAlerts || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Critical Flow Networks</span>
                <span className="text-xl font-black text-red-400">{reportData?.criticalNetworksDetected || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">PostgreSQL Health</span>
                <span className="text-xl font-black text-emerald-400">100% OK</span>
              </div>
            </div>

            {/* Flagged Networks */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white mb-3">Priority Suspicious Relay Networks</h3>
              <div className="space-y-3">
                {reportData?.topSuspiciousFlows?.map((flow: any, index: number) => {
                  const uniqueKey = flow.flowId || flow.id || `flow-item-${index}`;
                  const pathDisplay = Array.isArray(flow.path) ? flow.path.join(" → ") : (flow.path || "N/A");
                  const hopCount = flow.hops ?? (Array.isArray(flow.path) ? Math.max(0, flow.path.length - 1) : 0);
                  const detectedDate = flow.detectedAt || flow.detectedTime || "Recent";

                  return (
                    <div
                      key={uniqueKey}
                      id={`report-suspicious-flow-${flow.flowId || index}`}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{flow.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                            Risk {flow.riskScore}/100
                          </span>
                        </div>
                        <p className="text-xs font-mono text-amber-400 mt-1 break-all">
                          Path: {pathDisplay} ({hopCount} Hops, {flow.totalBtc} BTC)
                        </p>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        Detected: {detectedDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certification Footer */}
            <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
              <span>Cryptographic Hash: 4e9c7a2b001f3e498d5c8088b71d9e2a</span>
              <span>BitFlow Autonomous Compliance Engine v2.4</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
