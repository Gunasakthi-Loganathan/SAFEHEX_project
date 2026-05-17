interface ScanResult {
  port: number;
  protocol: string;
  service: string;
  banner?: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  classification: "Safe" | "Possibly Vulnerable" | "Vulnerable";
  vulnerabilities: string[];
  explanation: string;
  mitigation: string;
  confidence: number;
}

interface Scan {
  _id: string;
  target: string;
  status: "pending" | "running" | "completed" | "failed";
  results?: ScanResult[];
  createdAt: number;
  completedAt?: number;
}

interface ScanHistoryProps {
  scans: Scan[];
  onSelectScan: (scanId: string) => void;
}

export function ScanHistory({ scans, onSelectScan }: ScanHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "from-green-500 to-emerald-500 text-black border-green-400/50";
      case "running": return "from-blue-500 to-cyan-500 text-white border-blue-400/50";
      case "pending": return "from-yellow-500 to-orange-500 text-black border-yellow-400/50";
      case "failed": return "from-red-500 to-red-600 text-white border-red-400/50";
      default: return "from-gray-500 to-gray-600 text-white border-gray-400/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✅";
      case "running": return "🔄";
      case "pending": return "⏳";
      case "failed": return "❌";
      default: return "❓";
    }
  };

  const getRiskSummary = (results?: ScanResult[]) => {
    if (!results) return null;
    
    const critical = results.filter(r => r.riskLevel === "Critical").length;
    const high = results.filter(r => r.riskLevel === "High").length;
    const medium = results.filter(r => r.riskLevel === "Medium").length;
    const low = results.filter(r => r.riskLevel === "Low").length;

    return { critical, high, medium, low, total: results.length };
  };

  if (scans.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative mb-8">
          <div className="text-8xl mb-4 animate-pulse">🔍</div>
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 rounded-full blur-xl"></div>
        </div>
        <h3 className="text-2xl font-bold text-cyan-300 mb-4">No Security Scans Detected</h3>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Initialize your first AI-powered security assessment to begin building your threat intelligence database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
          <span className="text-3xl">📊</span>
          Security Scan Archive
        </h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-xl">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-cyan-300 font-mono">{scans.length} total assessments</span>
        </div>
      </div>

      <div className="space-y-4">
        {scans.map((scan) => {
          const riskSummary = getRiskSummary(scan.results);
          
          return (
            <div
              key={scan._id}
              className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 cursor-pointer hover:scale-[1.02] group"
              onClick={() => scan.status === "completed" && onSelectScan(scan._id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getStatusIcon(scan.status)}</div>
                  <div>
                    <h4 className="text-xl font-bold text-cyan-300 group-hover:text-violet-300 transition-colors">
                      {scan.target}
                    </h4>
                    <p className="text-gray-400 font-mono">
                      {new Date(scan.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold text-sm border bg-gradient-to-r ${getStatusColor(scan.status)} shadow-lg`}>
                  {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                </div>
              </div>

              {riskSummary && (
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cyan-300 font-medium">
                      {riskSummary.total} services analyzed
                    </span>
                    <div className="flex items-center gap-1">
                      {riskSummary.critical > 0 && (
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                      {riskSummary.high > 0 && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      )}
                      {riskSummary.medium > 0 && (
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      )}
                      {riskSummary.low > 0 && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    {riskSummary.critical > 0 && (
                      <div className="text-center">
                        <div className="text-red-400 font-bold text-lg">{riskSummary.critical}</div>
                        <div className="text-red-300 text-xs">Critical</div>
                      </div>
                    )}
                    {riskSummary.high > 0 && (
                      <div className="text-center">
                        <div className="text-orange-400 font-bold text-lg">{riskSummary.high}</div>
                        <div className="text-orange-300 text-xs">High</div>
                      </div>
                    )}
                    {riskSummary.medium > 0 && (
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-lg">{riskSummary.medium}</div>
                        <div className="text-yellow-300 text-xs">Medium</div>
                      </div>
                    )}
                    {riskSummary.low > 0 && (
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-lg">{riskSummary.low}</div>
                        <div className="text-green-300 text-xs">Low</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {scan.status === "completed" && (
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <p className="text-cyan-400 text-sm flex items-center gap-2">
                      <span>🔍</span>
                      Click to view detailed analysis
                    </p>
                    <div className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
