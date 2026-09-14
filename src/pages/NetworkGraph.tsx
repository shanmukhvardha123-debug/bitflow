import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

interface GraphNode {
  id: string;
  name: string;
  memberId: string;
  address: string;
  isRoot: boolean;
  hopLevel: number;
  riskScore: number;
  x?: number;
  y?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amountBtc: number;
  amountUsd: number;
  feeRate: number;
  hopLevel: number;
  riskScore: number;
}

export default function NetworkGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [loading, setLoading] = useState(true);
  const [hopLevel, setHopLevel] = useState(4);
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const loadGraphData = (hops: number) => {
    setLoading(true);
    fetch("/api/network")
      .then((res) => res.json())
      .then((data) => {
        // Layout nodes in a directed circular / hierarchical topology
        const rawNodes = data.nodes || [];
        const rawEdges = data.edges || [];

        // Position nodes mathematically in multi-hop concentric arcs
        const width = 850;
        const height = 550;
        const centerX = width / 2;
        const centerY = height / 2;

        const positionedNodes = rawNodes.map((node: any, idx: number) => {
          const hop = node.hopLevel || (idx === 0 ? 0 : Math.min(hops, Math.floor(idx / 2) + 1));
          const angle = (idx * (2 * Math.PI)) / (rawNodes.length || 1);
          const radius = hop === 0 ? 0 : hop * 90;

          return {
            ...node,
            hopLevel: hop,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
          };
        });

        setNodes(positionedNodes);
        setEdges(rawEdges);
        if (positionedNodes.length > 0) {
          setSelectedNode(positionedNodes[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load network graph:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGraphData(hopLevel);
  }, []);

  const handleHopChange = (hops: number) => {
    setHopLevel(hops);
    loadGraphData(hops);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (score: number) => {
    if (score >= 85) return "#ef4444"; // Red - Critical
    if (score >= 70) return "#f59e0b"; // Amber - High
    if (score >= 40) return "#3b82f6"; // Blue - Medium
    return "#10b981"; // Green - Low
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL"
        ? true
        : riskFilter === "CRITICAL"
        ? n.riskScore >= 85
        : riskFilter === "HIGH"
        ? n.riskScore >= 70 && n.riskScore < 85
        : riskFilter === "MEDIUM"
        ? n.riskScore >= 40 && n.riskScore < 70
        : n.riskScore < 40;

    return matchesSearch && matchesRisk;
  });

  const suspiciousSubgraphs = [
    {
      id: "SUB-1",
      title: "Peeling Chain Relay (X → A → B → C → F)",
      hops: 4,
      riskScore: 94,
      type: "MULTI_HOP",
      targetId: "DEMO-TX-001-BITFLOW",
    },
    {
      id: "SUB-2",
      title: "Hub Consolidation (4 Wallets → F001)",
      hops: 2,
      riskScore: 89,
      type: "FAN_IN",
      targetId: "DEMO-TX-025-BITFLOW",
    },
    {
      id: "SUB-3",
      title: "Dispersal Mixer (1 Wallet → 5 Wallets)",
      hops: 1,
      riskScore: 82,
      type: "FAN_OUT",
      targetId: "M018",
    },
    {
      id: "SUB-4",
      title: "Circular Loopback (M012 → M015 → M012)",
      hops: 3,
      riskScore: 86,
      type: "CIRCULAR_FLOW",
      targetId: "M012",
    },
  ];

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />

        <section className="content">
          {/* Header */}
          <div className="page-title flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">Network Graph Visualization</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  TOPOLOGY & FLOW CLUSTERING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive node-edge layout mapping transaction hops, peeling chains, and counterparty contagion
              </p>
            </div>

            {/* Hop Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Hop Expansion:</span>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {[1, 2, 3, 4, 5].map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHopChange(h)}
                    className={`px-2.5 py-1 text-xs font-bold rounded ${
                      hopLevel === h ? "bg-amber-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {h}-Hop
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Graph Toolbar */}
          <div className="card mb-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find node by name, ID or address..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Risk Filters */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Risk Filter:</span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                    riskFilter === r
                      ? "bg-slate-700 text-amber-400 border border-amber-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Zoom / Pan Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title="Reset View"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Legend Banner */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 rounded-lg border border-slate-800 mb-4 text-[11px] text-slate-400 flex-wrap gap-2">
            <span className="font-semibold text-slate-300">Legend:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low Risk (&lt;40)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Medium Risk (40-69)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> High Risk (70-84)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical Risk (85+)
              </div>
            </div>
            <span className="font-mono text-slate-500">Drag to Pan • Click Node / Edge for Dossier</span>
          </div>

          {/* Main Layout: Canvas + Inspection Sidebars */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* SVG Graph Canvas (3 cols) */}
            <div className="lg:col-span-3 card p-0 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative min-h-[560px]">
              {loading ? (
                <div className="flex items-center justify-center h-[560px] text-slate-400 gap-2">
                  <RefreshCw className="animate-spin" size={20} /> Generating topology...
                </div>
              ) : (
                <svg
                  className="w-full h-[560px] cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                    </marker>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <g
                    transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                    style={{ transformOrigin: "center" }}
                  >
                    {/* Edges */}
                    {edges.map((edge) => {
                      const sourceNode = nodes.find((n) => n.address === edge.source);
                      const targetNode = nodes.find((n) => n.address === edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const isSelected = selectedEdge?.id === edge.id;

                      return (
                        <g
                          key={edge.id}
                          className="cursor-pointer group"
                          onClick={() => {
                            setSelectedEdge(edge);
                            setSelectedNode(null);
                          }}
                        >
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={isSelected ? "#f59e0b" : "#475569"}
                            strokeWidth={isSelected ? 3 : Math.min(5, Math.max(1.5, edge.amountBtc))}
                            strokeDasharray={edge.riskScore >= 75 ? "4 2" : "none"}
                            markerEnd="url(#arrow)"
                          />
                          <text
                            x={(sourceNode.x! + targetNode.x!) / 2}
                            y={(sourceNode.y! + targetNode.y!) / 2 - 6}
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="middle"
                            className="select-none font-mono"
                          >
                            {edge.amountBtc} BTC
                          </text>
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {filteredNodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      const color = getNodeColor(node.riskScore);

                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                            setSelectedEdge(null);
                          }}
                        >
                          {isSelected && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r="28"
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                              className="animate-spin"
                              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                            />
                          )}

                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="18"
                            fill="#0f172a"
                            stroke={color}
                            strokeWidth={isSelected ? 3 : 2}
                          />

                          <text
                            cx={node.x}
                            y={node.y! + 4}
                            fill={color}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="select-none pointer-events-none"
                          >
                            {node.memberId}
                          </text>

                          <text
                            x={node.x}
                            y={node.y! + 30}
                            fill="#f8fafc"
                            fontSize="11"
                            fontWeight="600"
                            textAnchor="middle"
                            className="select-none pointer-events-none drop-shadow"
                          >
                            {node.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              )}
            </div>

            {/* Side Inspection Panel (1 col) */}
            <div className="space-y-4">
              {/* Selected Node or Edge Inspector */}
              <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
                {selectedNode ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Inspecting Node
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${getNodeColor(selectedNode.riskScore)}22`,
                          color: getNodeColor(selectedNode.riskScore),
                        }}
                      >
                        Risk {selectedNode.riskScore}/100
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{selectedNode.name}</h3>
                    <p className="text-xs font-mono text-amber-400 mt-0.5">
                      {selectedNode.memberId}
                    </p>

                    <div className="mt-3 p-2.5 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">
                        Bitcoin Address
                      </span>
                      <p className="text-[11px] font-mono text-slate-300 break-all mt-0.5">
                        {selectedNode.address}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <Link
                        to={`/investigation?target=${selectedNode.address}`}
                        className="w-full py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShieldAlert size={14} /> Investigate Address
                      </Link>

                      <Link
                        to={`/wallet/${selectedNode.address}`}
                        className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Eye size={13} /> View Wallet Dossier
                      </Link>
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Inspecting Edge
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        Hop {selectedEdge.hopLevel}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-mono">{selectedEdge.id}</h3>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transferred:</span>
                        <span className="font-bold text-white">{selectedEdge.amountBtc} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Approx USD:</span>
                        <span className="text-slate-200">${selectedEdge.amountUsd.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fee Rate:</span>
                        <span className="font-mono text-amber-400">{selectedEdge.feeRate} sat/vB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Edge Risk Score:</span>
                        <span className="font-bold text-red-400">{selectedEdge.riskScore}/100</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <Link
                        to={`/investigation?target=${selectedEdge.id}`}
                        className="w-full py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert size={14} /> Trace Transaction
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Click any node or transaction line to inspect forensic details.
                  </p>
                )}
              </div>

              {/* Suspicious Subgraphs List */}
              <div className="card p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
                  <AlertOctagon className="text-amber-400" size={15} /> Top Suspicious Subgraphs
                </h4>

                <div className="space-y-2.5">
                  {suspiciousSubgraphs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer"
                      onClick={() => {
                        const targetNode = nodes.find((n) => n.memberId === sub.targetId || n.name.includes(sub.targetId));
                        if (targetNode) {
                          setSelectedNode(targetNode);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{sub.title}</span>
                        <span className="text-[10px] font-bold text-red-400">
                          {sub.riskScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{sub.hops} Hops Sequence</span>
                        <span className="text-amber-400 font-semibold">{sub.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
