import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { ScanForm } from "./ScanForm";
import { ScanResults } from "./ScanResults";
import { ScanHistory } from "./ScanHistory";
import { IntegrityFramework } from "./IntegrityFramework";

type ActiveTab = "framework" | "scan" | "history";

type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

type VulnerabilityLike = {
  cveId?: string;
  title?: string;
  name?: string;
  severity?: string;
  riskLevel?: string;
  cvssScore?: number;
  cvss?: number;
};

type ScanLike = {
  _id?: string;
  status?: string;

  vulnerabilities?: VulnerabilityLike[];
  threats?: VulnerabilityLike[];
  findings?: VulnerabilityLike[];

  results?: {
    vulnerabilities?: VulnerabilityLike[];
    threats?: VulnerabilityLike[];
    findings?: VulnerabilityLike[];
  };

  threatCount?: number;
  vulnerabilityCount?: number;
  findingsCount?: number;

  criticalCount?: number;
  highCount?: number;
  mediumCount?: number;
  lowCount?: number;
  infoCount?: number;
};

type SeverityCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
};

type DashboardStats = SeverityCounts & {
  totalScans: number;
  completedScans: number;
  runningScans: number;
  failedScans: number;
  totalFindings: number;
  overallRisk: Severity;
};

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("framework");
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const scans = useQuery(api.vulnerabilityAnalyzer.getUserScans);

  const selectedScan = useQuery(
    api.vulnerabilityAnalyzer.getScan,
    selectedScanId ? { scanId: selectedScanId as any } : "skip"
  );

  const dashboardStats = useMemo(() => {
    return calculateDashboardStats((scans || []) as ScanLike[]);
  }, [scans]);

  const handleScanComplete = (scanId: string) => {
    setSelectedScanId(scanId);
    setActiveTab("scan");
    toast.success("Security scan completed successfully!");
  };

  const isLoading = scans === undefined;

  return (
    <div className="space-y-8">
      {/* Command Center Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-xl" />

        <div className="relative">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Cybersecurity Command Center
          </h2>

          <p className="text-cyan-300/80 text-lg max-w-3xl mx-auto">
            Ethical vulnerability assessment with scan history, CVSS-based risk
            classification, and integrity framework controls.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
            <StatusBadge
              color="green"
              label="INTEGRITY ACTIVE"
            />

            <StatusBadge
              color="blue"
              label="CVSS RISK CLASSIFICATION"
            />

            <RiskStatusBadge risk={dashboardStats.overallRisk} />
          </div>
        </div>
      </div>

      {/* Accuracy Summary Cards */}
      <DashboardSummary stats={dashboardStats} isLoading={isLoading} />

      {/* Navigation Tabs */}
      <div className="relative">
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-2">
          <nav className="flex flex-col sm:flex-row gap-2">
            {[
              {
                id: "framework",
                label: "Integrity Framework",
                icon: "🛡️",
              },
              {
                id: "scan",
                label: "Security Scan",
                icon: "🔍",
              },
              {
                id: "history",
                label: `Scan History (${dashboardStats.totalScans})`,
                icon: "📊",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                    : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {activeTab === "framework" && <IntegrityFramework />}

        {activeTab === "scan" && (
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <ScanForm onScanComplete={handleScanComplete} />

            {selectedScan ? (
              <div className="mt-8 pt-8 border-t border-cyan-500/20">
                <ScanResults scan={selectedScan} />
              </div>
            ) : (
              <div className="mt-8 pt-8 border-t border-cyan-500/20 text-center text-slate-400">
                Run a new scan or select a scan from history to view detailed
                results.
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <ScanHistory
              scans={scans || []}
              onSelectScan={(scanId) => {
                setSelectedScanId(scanId);
                setActiveTab("scan");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSummary({
  stats,
  isLoading,
}: {
  stats: DashboardStats;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <SummaryCard
        title="Total Scans"
        value={isLoading ? "..." : stats.totalScans}
        description="Number of saved scan records"
        tone="cyan"
      />

      <SummaryCard
        title="Total Findings"
        value={isLoading ? "..." : stats.totalFindings}
        description="Detected vulnerabilities or issues"
        tone="violet"
      />

      <SummaryCard
        title="Critical"
        value={isLoading ? "..." : stats.critical}
        description="CVSS score 9.0 - 10.0"
        tone="red"
      />

      <SummaryCard
        title="High"
        value={isLoading ? "..." : stats.high}
        description="CVSS score 7.0 - 8.9"
        tone="orange"
      />

      <SummaryCard
        title="Overall Risk"
        value={isLoading ? "..." : stats.overallRisk}
        description="Based on highest detected severity"
        tone={getRiskTone(stats.overallRisk)}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string | number;
  description: string;
  tone: "cyan" | "violet" | "red" | "orange" | "green" | "gray";
}) {
  const toneClass = {
    cyan: "border-cyan-500/30 text-cyan-300 shadow-cyan-500/10",
    violet: "border-violet-500/30 text-violet-300 shadow-violet-500/10",
    red: "border-red-500/30 text-red-300 shadow-red-500/10",
    orange: "border-orange-500/30 text-orange-300 shadow-orange-500/10",
    green: "border-green-500/30 text-green-300 shadow-green-500/10",
    gray: "border-slate-500/30 text-slate-300 shadow-slate-500/10",
  }[tone];

  return (
    <div
      className={`bg-black/40 backdrop-blur-md border rounded-2xl p-5 shadow-lg ${toneClass}`}
    >
      <p className="text-sm text-slate-400">{title}</p>

      <p className="text-3xl font-bold mt-2">{value}</p>

      <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
  );
}

function StatusBadge({
  color,
  label,
}: {
  color: "green" | "blue";
  label: string;
}) {
  const colorClass =
    color === "green"
      ? "bg-green-500/20 border-green-400/30 text-green-300"
      : "bg-blue-500/20 border-blue-400/30 text-blue-300";

  const dotClass = color === "green" ? "bg-green-400" : "bg-blue-400";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 border rounded-full ${colorClass}`}
    >
      <div className={`w-2 h-2 rounded-full animate-pulse ${dotClass}`} />
      <span className="text-sm font-mono">{label}</span>
    </div>
  );
}

function RiskStatusBadge({ risk }: { risk: Severity }) {
  const riskClass = {
    Critical: "bg-red-500/20 border-red-400/30 text-red-300",
    High: "bg-orange-500/20 border-orange-400/30 text-orange-300",
    Medium: "bg-yellow-500/20 border-yellow-400/30 text-yellow-300",
    Low: "bg-green-500/20 border-green-400/30 text-green-300",
    Info: "bg-slate-500/20 border-slate-400/30 text-slate-300",
  }[risk];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${riskClass}`}>
      <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <span className="text-sm font-mono">RISK: {risk.toUpperCase()}</span>
    </div>
  );
}

function calculateDashboardStats(scans: ScanLike[]): DashboardStats {
  const stats: DashboardStats = {
    totalScans: scans.length,
    completedScans: 0,
    runningScans: 0,
    failedScans: 0,
    totalFindings: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    overallRisk: "Info",
  };

  for (const scan of scans) {
    const status = normalizeStatus(scan.status);

    if (status === "completed") stats.completedScans += 1;
    if (status === "running" || status === "pending") stats.runningScans += 1;
    if (status === "failed") stats.failedScans += 1;

    const scanStats = calculateSingleScanStats(scan);

    stats.totalFindings += scanStats.totalFindings;
    stats.critical += scanStats.critical;
    stats.high += scanStats.high;
    stats.medium += scanStats.medium;
    stats.low += scanStats.low;
    stats.info += scanStats.info;
  }

  stats.overallRisk = getOverallRisk(stats);

  return stats;
}

function calculateSingleScanStats(scan: ScanLike): SeverityCounts & {
  totalFindings: number;
} {
  const vulnerabilities = extractVulnerabilities(scan);

  const counts: SeverityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  if (vulnerabilities.length > 0) {
    for (const vulnerability of vulnerabilities) {
      const severity = getSeverity(vulnerability);

      if (severity === "Critical") counts.critical += 1;
      else if (severity === "High") counts.high += 1;
      else if (severity === "Medium") counts.medium += 1;
      else if (severity === "Low") counts.low += 1;
      else counts.info += 1;
    }

    return {
      ...counts,
      totalFindings: vulnerabilities.length,
    };
  }

  const critical = safeNumber(scan.criticalCount);
  const high = safeNumber(scan.highCount);
  const medium = safeNumber(scan.mediumCount);
  const low = safeNumber(scan.lowCount);
  const info = safeNumber(scan.infoCount);

  const totalFromSeverity = critical + high + medium + low + info;

  const totalFromScan =
    safeNumber(scan.threatCount) ||
    safeNumber(scan.vulnerabilityCount) ||
    safeNumber(scan.findingsCount);

  return {
    critical,
    high,
    medium,
    low,
    info,
    totalFindings: totalFromSeverity || totalFromScan,
  };
}

function extractVulnerabilities(scan: ScanLike): VulnerabilityLike[] {
  const possibleSources = [
    scan.vulnerabilities,
    scan.threats,
    scan.findings,
    scan.results?.vulnerabilities,
    scan.results?.threats,
    scan.results?.findings,
  ];

  for (const source of possibleSources) {
    if (Array.isArray(source)) {
      return source;
    }
  }

  return [];
}

function getSeverity(vulnerability: VulnerabilityLike): Severity {
  const explicitSeverity = String(
    vulnerability.severity || vulnerability.riskLevel || ""
  ).toLowerCase();

  if (explicitSeverity.includes("critical")) return "Critical";
  if (explicitSeverity.includes("high")) return "High";
  if (explicitSeverity.includes("medium")) return "Medium";
  if (explicitSeverity.includes("low")) return "Low";
  if (explicitSeverity.includes("info")) return "Info";

  const score = getCvssScore(vulnerability);

  if (score === null) return "Info";
  if (score >= 9.0) return "Critical";
  if (score >= 7.0) return "High";
  if (score >= 4.0) return "Medium";
  if (score > 0.0) return "Low";

  return "Info";
}

function getCvssScore(vulnerability: VulnerabilityLike): number | null {
  const score = vulnerability.cvssScore ?? vulnerability.cvss;

  if (typeof score !== "number") return null;
  if (Number.isNaN(score)) return null;
  if (score < 0 || score > 10) return null;

  return score;
}

function getOverallRisk(stats: SeverityCounts): Severity {
  if (stats.critical > 0) return "Critical";
  if (stats.high > 0) return "High";
  if (stats.medium > 0) return "Medium";
  if (stats.low > 0) return "Low";
  return "Info";
}

function normalizeStatus(status?: string): string {
  const value = String(status || "").toLowerCase();

  if (value === "completed") return "completed";
  if (value === "running") return "running";
  if (value === "pending") return "pending";
  if (value === "failed") return "failed";

  return "unknown";
}

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getRiskTone(
  risk: Severity
): "cyan" | "violet" | "red" | "orange" | "green" | "gray" {
  if (risk === "Critical") return "red";
  if (risk === "High") return "orange";
  if (risk === "Medium") return "orange";
  if (risk === "Low") return "green";
  return "gray";
}