import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Users,
  Search,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
  Filter,
  CheckCircle2,
  X,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load members:", err);
        setLoading(false);
      });
  }, []);

  const filtered = members.filter((m) => {
    const matchesSearch =
      search.trim() === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase()) ||
      m.senderAddress.toLowerCase().includes(search.toLowerCase()) ||
      m.accountId.toLowerCase().includes(search.toLowerCase());

    const matchesKyc =
      kycFilter === "ALL"
        ? true
        : kycFilter === "VERIFIED"
        ? m.kycStatus.includes("Verified")
        : m.kycStatus.includes("Pending");

    return matchesSearch && matchesKyc;
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
                <h1 className="text-xl font-black text-white">Member Profiles & Synthetic KYC Roster</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  100 BENCHMARK SUBJECTS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mapped from BitFlow_100_Members_Profile_Accounts_KYC_Nominee_Demo.xlsx
              </p>
            </div>

            <div className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
              SYNTHETIC DEMO PROFILES — NOT REAL PERSON DATA
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member name, ID (e.g. M001), city, bank account, or wallet..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">KYC Filter:</span>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {["ALL", "VERIFIED", "PENDING"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setKycFilter(lvl)}
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      kycFilter === lvl ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
            {loading ? (
              <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
                <RefreshCw className="animate-spin" size={18} /> Loading members benchmark...
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Legal Subject Name</th>
                      <th>City</th>
                      <th>Age / Occupation</th>
                      <th>Bank Account Ref</th>
                      <th>KYC Status</th>
                      <th>Nominee</th>
                      <th>Relationship</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.memberId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="font-mono text-xs font-bold text-amber-400">{m.memberId}</td>
                        <td className="font-semibold text-white">{m.name}</td>
                        <td className="text-slate-300 text-xs">{m.city}</td>
                        <td className="text-xs text-slate-400">
                          {m.age} yrs • {m.occupation}
                        </td>
                        <td className="font-mono text-xs text-slate-400">{m.accountId}</td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.kycStatus.includes("Verified")
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {m.kycStatus}
                          </span>
                        </td>
                        <td className="text-xs text-slate-200">{m.nomineeName}</td>
                        <td className="text-xs text-slate-400">{m.nomineeRelationship}</td>
                        <td>
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                          >
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Member Dossier Modal */}
          {selectedMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="card p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl relative">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl">
                    {selectedMember.name[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedMember.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedMember.memberId} • {selectedMember.city}, India
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Occupation & Age:</span>
                    <span className="text-white font-medium">
                      {selectedMember.occupation} ({selectedMember.age} years old)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Synthetic ID Reference:</span>
                    <span className="font-mono text-amber-400">{selectedMember.syntheticIdRef}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Bank Account ID:</span>
                    <span className="font-mono text-slate-300">{selectedMember.accountId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Routing / IFSC Code:</span>
                    <span className="font-mono text-slate-300">{selectedMember.routingRef}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Bitcoin Address:</span>
                    <span className="font-mono text-slate-400 break-all">{selectedMember.senderAddress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Nominee / Beneficiary:</span>
                    <span className="text-slate-200">
                      {selectedMember.nomineeName} ({selectedMember.nomineeRelationship})
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Nominee Phone:</span>
                    <span className="font-mono text-slate-300">{selectedMember.nomineePhone}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                  <Link
                    to={`/wallet/${selectedMember.senderAddress}`}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    Open Wallet Dossier
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
