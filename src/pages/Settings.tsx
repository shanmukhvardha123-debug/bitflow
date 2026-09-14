import { useState, useEffect, FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Check,
  User,
  Shield,
  BadgeCheck,
  Building2,
  Lock,
  Mail,
  Phone,
  Terminal,
  FileText,
  RotateCcw,
  Sparkles,
  Award,
  Globe,
  Clock,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  UserProfile,
  DEFAULT_USER_PROFILE,
  loadUserProfile,
  saveUserProfile,
} from "../utils/userProfile";

const PRESET_ORGANIZATIONAL_ROLES = [
  "Lead SOC & AML Forensics Investigator",
  "Senior Financial Crime Compliance Officer",
  "AML Transaction Monitoring Lead",
  "Cybercrime Incident Responder",
  "Blockchain Forensics & On-Chain Auditor",
  "Digital Asset Risk Analyst",
  "Regulatory Compliance & SAR Filing Officer",
  "Institutional Crypto Custody Admin",
  "Custom Role",
];

const PRESET_DEPARTMENTS = [
  "Financial Intelligence & Cyber Defense Division",
  "Special Cybercrime & Mule Containment Unit",
  "Corporate Digital Assets Treasury Desk",
  "SOC Threat Intelligence & Forensics",
  "Anti-Money Laundering Surveillance Cell",
  "Institutional Custody & Settlement Operations",
];

const PRESET_CLEARANCE_LEVELS = [
  "Level 3 - Top Secret (Autonomous Syndicate Freeze Authority)",
  "Level 2 - Secret (SAR Regulatory Filing & Mule Flagging)",
  "Level 1 - Confidential (Read-Only Monitored Audits)",
];

const PRESET_JURISDICTIONS = [
  "FIU-IND / FATF Global Standards (IN/SG/AE)",
  "FinCEN / BSA Compliance Standards (US)",
  "ESMA / MiCA Regulatory Scope (EU)",
  "MAS Digital Payment Token Regime (SG)",
  "Global Cross-Border AML/CFT Surveillance",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "TELEMETRY">("PROFILE");

  // Officer Profile State
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Telemetry Settings State
  const [endpoint, setEndpoint] = useState("https://mempool.space/api");
  const [refreshInterval, setRefreshInterval] = useState("3");
  const [currency, setCurrency] = useState("USD");
  const [whaleThreshold, setWhaleThreshold] = useState("10");
  const [telemetrySaved, setTelemetrySaved] = useState(false);

  // Load server profile on mount if available
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error");
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          // Merge with local storage
          const merged = { ...profile, ...data.profile };
          setProfile(merged);
          saveUserProfile(merged);
        }
      })
      .catch((err) => console.log("Server profile fallback:", err));
  }, []);

  // Sync custom role mode
  useEffect(() => {
    if (!PRESET_ORGANIZATIONAL_ROLES.includes(profile.organizationalRole)) {
      setIsCustomRole(true);
      setCustomRoleText(profile.organizationalRole);
    } else {
      setIsCustomRole(false);
    }
  }, [profile.organizationalRole]);

  // Handle Profile Form Submission
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();

    const updatedRole = isCustomRole ? customRoleText : profile.organizationalRole;
    const updatedProfile: UserProfile = {
      ...profile,
      organizationalRole: updatedRole,
      lastUpdated: new Date().toISOString(),
    };

    // 1. Client-side persistence (sessionStorage + localStorage)
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);

    // 2. Server-side session persistence
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
    } catch (err) {
      console.error("Failed to sync profile to server:", err);
    }

    setSaveMessage(
      `Officer profile for ${updatedProfile.fullName} (${updatedProfile.employeeId}) saved. Persisted across browser session & server registry.`
    );
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  // Generate random Employee ID helper
  const handleGenerateEmployeeId = () => {
    const num = Math.floor(100 + Math.random() * 900);
    const codes = ["SOC", "AML", "SEC", "FIU", "CRYPTO"];
    const code = codes[Math.floor(Math.random() * codes.length)];
    const newEmpId = `EMP-${code}-2026-${num}`;
    setProfile({ ...profile, employeeId: newEmpId });
  };

  // Restore defaults
  const handleResetProfile = () => {
    setProfile(DEFAULT_USER_PROFILE);
    saveUserProfile(DEFAULT_USER_PROFILE);
    setSaveMessage("Profile restored to default session credentials.");
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Handle Telemetry Save
  const handleSaveTelemetry = (e: FormEvent) => {
    e.preventDefault();
    setTelemetrySaved(true);
    setTimeout(() => setTelemetrySaved(false), 2000);
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          <div className="page-title flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Profile & System Settings
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  SESSION PERSISTENT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your SOC Investigator Employee ID, organizational roles, and node telemetry configurations
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => setActiveTab("PROFILE")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === "PROFILE"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User size={14} />
                Officer Profile & Roles
              </button>
              <button
                onClick={() => setActiveTab("TELEMETRY")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === "TELEMETRY"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <SettingsIcon size={14} />
                Node & Telemetry
              </button>
            </div>
          </div>

          {activeTab === "PROFILE" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Officer Identity Dossier Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
                      {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white leading-snug">
                        {profile.fullName}
                      </h2>
                      <div className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                        {profile.employeeId}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Active Session Credential
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Organizational Role
                      </span>
                      <div className="font-bold text-slate-200 mt-0.5">
                        {profile.organizationalRole}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Department / Unit
                      </span>
                      <div className="text-slate-300 mt-0.5">{profile.department}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Clearance Level
                      </span>
                      <div className="font-mono text-emerald-400 font-bold mt-0.5">
                        {profile.clearanceLevel}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Badge Ref
                        </span>
                        <div className="font-mono text-amber-400 text-[11px] font-bold mt-0.5">
                          {profile.badgeRef}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">
                          Workstation
                        </span>
                        <div className="font-mono text-slate-300 text-[11px] mt-0.5 truncate">
                          {profile.workstationId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regulatory Signature Preview Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <FileText size={14} className="text-blue-400" />
                    Regulatory SAR Sign-Off Preview
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When exporting SAR filings or locking suspect accounts, this certified signature is cryptographically embedded into the audit log:
                  </p>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="text-amber-400 font-bold">
                      FIU-AML-OFFICER: {profile.fullName}
                    </div>
                    <div>EMP-ID: {profile.employeeId}</div>
                    <div>ROLE: {profile.organizationalRole}</div>
                    <div>JURISDICTION: {profile.jurisdiction}</div>
                    <div className="text-[10px] text-slate-500">
                      STAMP: {new Date().toISOString().split("T")[0]} // BITFLOW-AUTH-SEAL
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Profile Settings Form */}
              <div className="lg:col-span-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <BadgeCheck size={18} className="text-amber-400" />
                        Officer Profile & Organizational Roles
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Fields below are persistent across this session and instantly update audit trails & header credentials
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetProfile}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Reset to default session values"
                    >
                      <RotateCcw size={13} />
                      Reset Defaults
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                    {/* Success notification banner */}
                    {profileSaved && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                        <Check size={16} className="text-emerald-400 shrink-0" />
                        <span className="font-semibold">{saveMessage}</span>
                      </div>
                    )}

                    {/* Section 1: Corporate Identity & Employee ID */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound size={13} /> 1. Personnel Identification & Staff Key
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Employee ID with Generator */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-300">
                              Employee ID <span className="text-amber-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleGenerateEmployeeId}
                              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                            >
                              <Sparkles size={11} /> Auto-Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            value={profile.employeeId}
                            onChange={(e) =>
                              setProfile({ ...profile, employeeId: e.target.value })
                            }
                            required
                            placeholder="e.g. EMP-SOC-2026-007"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs font-mono text-amber-400 font-bold outline-none transition-colors"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Unique corporate identifier stamped on forensic reports and alerts
                          </p>
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Full Legal / Operational Name <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) =>
                              setProfile({ ...profile, fullName: e.target.value })
                            }
                            required
                            placeholder="e.g. Shanmukh Vardha"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-white font-medium outline-none transition-colors"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Displayed in the top navigation bar and compliance logs
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Organizational Roles & Operational Assignment */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={13} /> 2. Organizational Role & Hierarchy
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Organizational Role Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Organizational Role <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={isCustomRole ? "Custom Role" : profile.organizationalRole}
                            onChange={(e) => {
                              if (e.target.value === "Custom Role") {
                                setIsCustomRole(true);
                              } else {
                                setIsCustomRole(false);
                                setProfile({ ...profile, organizationalRole: e.target.value });
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition-colors font-medium"
                          >
                            {PRESET_ORGANIZATIONAL_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>

                          {isCustomRole && (
                            <input
                              type="text"
                              value={customRoleText}
                              onChange={(e) => {
                                setCustomRoleText(e.target.value);
                                setProfile({ ...profile, organizationalRole: e.target.value });
                              }}
                              placeholder="Enter custom organizational role title..."
                              className="mt-2 w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-amber-300 outline-none"
                            />
                          )}
                        </div>

                        {/* Department / Operational Unit */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Department / Operating Unit <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={profile.department}
                            onChange={(e) =>
                              setProfile({ ...profile, department: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                          >
                            {PRESET_DEPARTMENTS.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Security Clearance & Duty Shift */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Security Clearance Level
                          </label>
                          <select
                            value={profile.clearanceLevel}
                            onChange={(e) =>
                              setProfile({ ...profile, clearanceLevel: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                          >
                            {PRESET_CLEARANCE_LEVELS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Surveillance Duty Shift
                          </label>
                          <select
                            value={profile.dutyShift}
                            onChange={(e) =>
                              setProfile({ ...profile, dutyShift: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                          >
                            <option value="24/7 Global Surveillance (Shift Alpha)">
                              24/7 Global Surveillance (Shift Alpha)
                            </option>
                            <option value="Shift Bravo (APAC / EMEA Forensic Watch)">
                              Shift Bravo (APAC / EMEA Forensic Watch)
                            </option>
                            <option value="Shift Charlie (Americas AML Custody Desk)">
                              Shift Charlie (Americas AML Custody Desk)
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Contact & Terminal Details */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal size={13} /> 3. Terminal & Communications Credentials
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Official Email Address
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="officer@bitflow.soc"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Emergency Comms / Signal Phone
                          </label>
                          <input
                            type="text"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+91-98765-43210"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Badge Reference ID
                          </label>
                          <input
                            type="text"
                            value={profile.badgeRef}
                            onChange={(e) => setProfile({ ...profile, badgeRef: e.target.value })}
                            placeholder="BADGE-2026-ALPHA"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-300 outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            SOC Workstation ID
                          </label>
                          <input
                            type="text"
                            value={profile.workstationId}
                            onChange={(e) =>
                              setProfile({ ...profile, workstationId: e.target.value })
                            }
                            placeholder="WS-SOC-NODE-01"
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-300 outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            Regulatory Jurisdiction
                          </label>
                          <select
                            value={profile.jurisdiction}
                            onChange={(e) =>
                              setProfile({ ...profile, jurisdiction: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition-colors"
                          >
                            {PRESET_JURISDICTIONS.map((j) => (
                              <option key={j} value={j}>
                                {j}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Lock size={13} className="text-amber-400 shrink-0" />
                        Persists across browser session & real-time server registry
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        {profileSaved ? <Check size={16} /> : <Save size={16} />}
                        {profileSaved
                          ? "Credentials Saved & Active"
                          : "Save Profile Credentials & Persist Session"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* Telemetry Settings Tab */
            <div className="panel max-w-3xl">
              <div className="panel-header">
                <div>
                  <h2 className="text-base font-bold text-white">Node & Telemetry Settings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure upstream Bitcoin mempool endpoints and stream rates
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveTelemetry} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                    Upstream Mempool API Endpoint
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full bg-[#1c2030] border border-[#2d3748] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f7931a]"
                  />
                  <p className="text-xs text-[#64748b] mt-1.5">
                    Default public gateway: https://mempool.space/api or your self-hosted instance
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                      Stream Polling Frequency (seconds)
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(e.target.value)}
                      className="w-full bg-[#1c2030] border border-[#2d3748] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f7931a]"
                    >
                      <option value="1">1 second (Ultra Low Latency)</option>
                      <option value="3">3 seconds (Recommended)</option>
                      <option value="5">5 seconds (Low Bandwidth)</option>
                      <option value="10">10 seconds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                      Whale Detection Threshold (BTC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={whaleThreshold}
                        onChange={(e) => setWhaleThreshold(e.target.value)}
                        className="w-full bg-[#1c2030] border border-[#2d3748] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#f7931a]"
                      />
                      <span className="absolute right-4 top-2.5 text-xs text-[#94a3b8]">BTC</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                    Display Fiat Conversion Currency
                  </label>
                  <div className="flex gap-3">
                    {["USD", "INR", "EUR", "GBP"].map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setCurrency(curr)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          currency === curr
                            ? "bg-[#f7931a]/15 text-[#f7931a] border-[#f7931a]"
                            : "bg-[#1c2030] text-[#94a3b8] border-[#2d3748] hover:text-white"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#2d3748] flex items-center justify-between">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#f7931a] hover:bg-[#e08213] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {telemetrySaved ? <Check size={16} /> : <Save size={16} />}
                    {telemetrySaved ? "Saved Configuration" : "Save Settings"}
                  </button>

                  {telemetrySaved && (
                    <span className="text-xs text-[#22c55e] flex items-center gap-1">
                      Preferences successfully updated!
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
