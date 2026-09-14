import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Database,
  Table,
  Key,
  Layers,
  Search,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info,
  Server,
  Activity,
  Code2,
} from "lucide-react";
import { POSTGRESQL_TABLES_METADATA, TableDefinition } from "../db/schema";

interface TableStat {
  name: string;
  category: string;
  rowCount: number;
  columnCount: number;
  primaryKey: string;
  indexCount: number;
  description: string;
}

interface HealthData {
  status: string;
  dialect: string;
  engine: string;
  version: string;
  tablesConfigured: number;
  activeTables: number;
  totalRows: number;
  uptimeSeconds: number;
  connectionPool: {
    maxConnections: number;
    activeClients: number;
    idleClients: number;
    latencyMs: number;
  };
}

export default function DatabaseExplorer() {
  const [selectedTable, setSelectedTable] = useState<string>("transactions");
  const [activeTab, setActiveTab] = useState<"records" | "schema" | "ddl">("records");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableStats, setTableStats] = useState<TableStat[]>([]);
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [limit] = useState<number>(20);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reseedLoading, setReseedLoading] = useState<boolean>(false);
  const [copiedDdl, setCopiedDdl] = useState<boolean>(false);
  const [ddlContent, setDdlContent] = useState<string>("");

  const categories = [
    "ALL",
    "Identity & RBAC",
    "Entities & Accounts",
    "Ledger & Blockchain",
    "Detection & Intelligence",
    "SOC Operations",
    "Audit & System",
  ];

  // Fetch table statistics and health
  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const [tablesRes, healthRes] = await Promise.all([
        fetch("/api/database/tables"),
        fetch("/api/database/health"),
      ]);

      if (tablesRes.ok) {
        const data = await tablesRes.json();
        setTableStats(data.tables || []);
      }

      if (healthRes.ok) {
        const hData = await healthRes.json();
        setHealth(hData.health || null);
      }
    } catch (err) {
      console.error("Failed to load database metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rows for selected table
  const fetchTableData = async (tableName: string, pageNum: number = 0) => {
    try {
      const res = await fetch(`/api/database/table/${tableName}?limit=${limit}&offset=${pageNum * limit}`);
      if (res.ok) {
        const data = await res.json();
        setTableRows(data.rows || []);
        setTotalRows(data.total || 0);
      }
    } catch (err) {
      console.error(`Failed to fetch rows for ${tableName}:`, err);
    }
  };

  // Fetch raw SQL DDL
  const fetchDdl = async () => {
    try {
      const res = await fetch("/api/database/raw-ddl");
      if (res.ok) {
        const sql = await res.text();
        setDdlContent(sql);
      }
    } catch (err) {
      console.error("Failed to fetch DDL:", err);
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchDdl();
  }, []);

  useEffect(() => {
    setPage(0);
    fetchTableData(selectedTable, 0);
  }, [selectedTable]);

  useEffect(() => {
    fetchTableData(selectedTable, page);
  }, [page]);

  const handleReseed = async () => {
    try {
      setReseedLoading(true);
      const res = await fetch("/api/database/seed", { method: "POST" });
      if (res.ok) {
        await fetchMetadata();
        await fetchTableData(selectedTable, page);
      }
    } catch (err) {
      console.error("Reseed failed:", err);
    } finally {
      setReseedLoading(false);
    }
  };

  const handleCopyDdl = () => {
    if (ddlContent) {
      navigator.clipboard.writeText(ddlContent);
      setCopiedDdl(true);
      setTimeout(() => setCopiedDdl(false), 2000);
    }
  };

  const currentMeta: TableDefinition | undefined = POSTGRESQL_TABLES_METADATA[selectedTable];

  const filteredStats = tableStats.filter((t) => {
    const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const grandTotalRows = tableStats.reduce((sum, t) => sum + t.rowCount, 0);

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Header & Status Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <Database className="text-[#f7931a]" size={26} />
                  PostgreSQL Relational Schema & Database Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Phase 2 Online
                </span>
              </div>
              <p className="text-sm text-[#94a3b8]">
                14 Normalized relational tables supporting KYC members, accounts, wallets, on-chain ledger, and multi-hop graph detection
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-reseed-db"
                onClick={handleReseed}
                disabled={reseedLoading}
                className="px-4 py-2 bg-[#1c2030] hover:bg-[#252b3d] text-white border border-[#2d3748] rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={reseedLoading ? "animate-spin text-[#f7931a]" : "text-[#94a3b8]"} />
                {reseedLoading ? "Reseeding..." : "Reseed 14 Tables"}
              </button>

              <button
                id="btn-copy-ddl"
                onClick={handleCopyDdl}
                className="px-4 py-2 bg-[#f7931a] hover:bg-[#f7931a]/90 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#f7931a]/10"
              >
                {copiedDdl ? <Check size={14} /> : <Copy size={14} />}
                {copiedDdl ? "DDL Copied!" : "Copy schema.sql DDL"}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-medium mb-1">
                <span>Relational Tables</span>
                <Layers size={16} className="text-[#00e5ff]" />
              </div>
              <div className="text-2xl font-bold text-white">14 Tables</div>
              <div className="text-xs text-[#64748b] mt-1">6 Security Domains</div>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-medium mb-1">
                <span>Total Live Records</span>
                <Table size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{grandTotalRows.toLocaleString()} Rows</div>
              <div className="text-xs text-emerald-400/80 mt-1">100% Synthetic Seeded</div>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-medium mb-1">
                <span>PostgreSQL Dialect</span>
                <Server size={16} className="text-[#f7931a]" />
              </div>
              <div className="text-2xl font-bold text-white">v16.2</div>
              <div className="text-xs text-[#64748b] mt-1">Pool Latency: {health?.connectionPool.latencyMs || 1.4}ms</div>
            </div>

            <div className="bg-[#141720] border border-[#2d3748] rounded-xl p-4">
              <div className="flex items-center justify-between text-[#94a3b8] text-xs font-medium mb-1">
                <span>Relational Integrity</span>
                <ShieldCheck size={16} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">Foreign Keys</div>
              <div className="text-xs text-[#64748b] mt-1">CASCADE & SET NULL rules</div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#f7931a] text-white shadow-md shadow-[#f7931a]/20"
                    : "bg-[#141720] text-[#94a3b8] hover:text-white border border-[#2d3748]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Two-Column Explorer Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Tables Directory List */}
            <div className="lg:col-span-4 bg-[#141720] border border-[#2d3748] rounded-xl p-4 flex flex-col h-[750px]">
              <div className="mb-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-[#64748b]" />
                  <input
                    type="text"
                    placeholder="Search 14 tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c2030] border border-[#2d3748] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#f7931a]"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredStats.map((t) => {
                  const isSelected = selectedTable === t.name;
                  return (
                    <div
                      key={t.name}
                      id={`table-item-${t.name}`}
                      onClick={() => setSelectedTable(t.name)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#1c2030] border-[#f7931a] shadow-md shadow-[#f7931a]/10"
                          : "bg-[#0d0f14]/50 border-[#2d3748]/60 hover:border-[#2d3748] hover:bg-[#1c2030]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                          <Table size={13} className={isSelected ? "text-[#f7931a]" : "text-[#94a3b8]"} />
                          {t.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#252b3d] text-[#00e5ff]">
                          {t.rowCount} rows
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748b] line-clamp-1 mb-2">{t.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
                        <span className="bg-[#141720] px-1.5 py-0.5 rounded border border-[#2d3748]/50">
                          {t.category}
                        </span>
                        <span>{t.columnCount} columns</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Schema & Data Viewer */}
            <div className="lg:col-span-8 bg-[#141720] border border-[#2d3748] rounded-xl p-5 flex flex-col h-[750px]">
              {/* Header for selected table */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#2d3748] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-white">
                      public.{selectedTable}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#252b3d] text-[#f7931a] border border-[#f7931a]/20">
                      {currentMeta?.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-1">{currentMeta?.description}</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-[#1c2030] p-1 rounded-lg border border-[#2d3748]">
                  <button
                    id="tab-records"
                    onClick={() => setActiveTab("records")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      activeTab === "records" ? "bg-[#f7931a] text-white" : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    Live Rows ({totalRows})
                  </button>
                  <button
                    id="tab-schema"
                    onClick={() => setActiveTab("schema")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      activeTab === "schema" ? "bg-[#f7931a] text-white" : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    Schema ({currentMeta?.columns.length} cols)
                  </button>
                  <button
                    id="tab-ddl"
                    onClick={() => setActiveTab("ddl")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      activeTab === "ddl" ? "bg-[#f7931a] text-white" : "text-[#94a3b8] hover:text-white"
                    }`}
                  >
                    Raw SQL DDL
                  </button>
                </div>
              </div>

              {/* Tab 1: Live Records Browser */}
              {activeTab === "records" && (
                <div className="flex-1 flex flex-col min-h-0 pt-4">
                  <div className="flex-1 overflow-auto border border-[#2d3748] rounded-lg bg-[#0d0f14]/80">
                    {tableRows.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-[#64748b] p-8">
                        <Table size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">No records found in {selectedTable}</p>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse font-mono">
                        <thead className="sticky top-0 bg-[#1c2030] text-[#94a3b8] border-b border-[#2d3748]">
                          <tr>
                            {currentMeta?.columns.slice(0, 7).map((col) => (
                              <th key={col.name} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                                <span className={col.isPrimary ? "text-[#f7931a]" : "text-white"}>
                                  {col.name}
                                  {col.isPrimary && " 🔑"}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d3748]/50 text-slate-300">
                          {tableRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#1c2030]/60 transition-colors">
                              {currentMeta?.columns.slice(0, 7).map((col) => {
                                const val = row[col.name];
                                const isString = typeof val === "string";
                                const isObj = typeof val === "object" && val !== null;
                                return (
                                  <td key={col.name} className="px-3 py-2 whitespace-nowrap max-w-[220px] truncate">
                                    {isObj ? (
                                      <span className="text-[#00e5ff] text-[11px]">
                                        {JSON.stringify(val).slice(0, 28)}...
                                      </span>
                                    ) : isString && val.length > 25 ? (
                                      <span title={val} className="cursor-help">
                                        {val.slice(0, 10)}...{val.slice(-8)}
                                      </span>
                                    ) : (
                                      <span>{val !== undefined && val !== null ? String(val) : "NULL"}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between pt-3 text-xs text-[#94a3b8]">
                    <span>
                      Showing {tableRows.length > 0 ? page * limit + 1 : 0} to{" "}
                      {Math.min((page + 1) * limit, totalRows)} of {totalRows} records
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 rounded bg-[#1c2030] border border-[#2d3748] disabled:opacity-40 hover:bg-[#252b3d] text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-2 font-mono">Page {page + 1}</span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={(page + 1) * limit >= totalRows}
                        className="px-3 py-1 rounded bg-[#1c2030] border border-[#2d3748] disabled:opacity-40 hover:bg-[#252b3d] text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Schema Definition */}
              {activeTab === "schema" && (
                <div className="flex-1 overflow-auto pt-4 pr-1">
                  <div className="border border-[#2d3748] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1c2030] text-[#94a3b8] border-b border-[#2d3748]">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">Column</th>
                          <th className="px-3 py-2.5 font-semibold">Data Type</th>
                          <th className="px-3 py-2.5 font-semibold">Constraints</th>
                          <th className="px-3 py-2.5 font-semibold">Foreign Key Ref</th>
                          <th className="px-3 py-2.5 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2d3748]/50 text-slate-300 font-mono">
                        {currentMeta?.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-[#1c2030]/40">
                            <td className="px-3 py-2.5 font-bold text-white flex items-center gap-1.5">
                              {col.isPrimary && <Key size={12} className="text-[#f7931a]" />}
                              {col.name}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-[#1c2030] text-[#00e5ff] border border-[#2d3748]">
                                {col.type}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-[11px] text-[#94a3b8]">
                              {col.isPrimary ? "PRIMARY KEY" : col.isUnique ? "UNIQUE" : col.isNullable ? "NULL" : "NOT NULL"}
                              {col.defaultValue && ` (default: ${col.defaultValue})`}
                            </td>
                            <td className="px-3 py-2.5 text-[11px] text-[#f7931a]">
                              {col.references ? (
                                <span>
                                  → {col.references.table}({col.references.column})
                                </span>
                              ) : (
                                <span className="text-[#64748b]">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 font-sans text-[11px] text-[#94a3b8]">
                              {col.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Indexes definition box */}
                  <div className="mt-4 p-4 rounded-lg bg-[#0d0f14] border border-[#2d3748]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Code2 size={13} className="text-[#00e5ff]" />
                      Configured Indexes ({currentMeta?.indexes.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentMeta?.indexes.map((idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded text-xs font-mono bg-[#1c2030] text-purple-300 border border-purple-500/20"
                        >
                          {idx}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Raw SQL DDL */}
              {activeTab === "ddl" && (
                <div className="flex-1 flex flex-col min-h-0 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#94a3b8] font-mono">backend/schema.sql (PostgreSQL 16.2 DDL)</span>
                    <button
                      onClick={handleCopyDdl}
                      className="px-3 py-1 text-xs bg-[#1c2030] hover:bg-[#252b3d] text-white rounded border border-[#2d3748] flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedDdl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedDdl ? "Copied" : "Copy SQL"}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto border border-[#2d3748] rounded-lg bg-[#0a0c10] p-4">
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">
                      {ddlContent || "-- Loading schema.sql DDL script..."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
