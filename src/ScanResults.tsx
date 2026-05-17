type Severity = "Info" | "Low" | "Medium" | "High" | "Critical";

type Classification = "Safe" | "Possibly Vulnerable" | "Vulnerable";

type TargetType =
  | "github_repo"
  | "localhost"
  | "private_ip"
  | "public_ip"
  | "public_website"
  | "domain"
  | "unknown";

interface ScanResult {
  port?: number;
  protocol?: string;
  service?: string;
  banner?: string;

  title?: string;
  category?: string;
  source?: string;
  evidence?: string;

  cvssScore?: number;
  riskLevel?: Severity;
  classification?: Classification;

  vulnerabilities?: string[];
  explanation?: string;
  mitigation?: string;
  recommendation?: string;

  confidence?: number;
}

interface Scan {
  _id: string;
  target: string;
  status: "pending" | "running" | "completed" | "failed";
  results?: ScanResult[];
  createdAt: number;
  completedAt?: number;

  targetType?: TargetType;
  scanMode?: string;
}

interface ScanResultsProps {
  scan: Scan;
}

interface NormalizedFinding {
  title: string;
  category: string;
  source: string;
  evidence: string;
  severity: Severity;
  classification: Classification;
  cvssScore: number | null;
  vulnerabilities: string[];
  explanation: string;
  mitigation: string;
  confidence: number | null;
  port?: number;
  protocol?: string;
  service?: string;
  banner?: string;
}

export function ScanResults({ scan }: ScanResultsProps) {
  if (scan.status !== "completed") {
    return <ProcessingState status={scan.status} />;
  }

  const rawResults = scan.results ?? [];
  const findings = rawResults.map(normalizeFinding);
  const sortedFindings = [...findings].sort(
    (a, b) => getRiskWeight(b.severity) - getRiskWeight(a.severity)
  );

  const targetType = scan.targetType ?? detectTargetType(scan.target);
  const analysisTitle = getAnalysisTitle(targetType, sortedFindings);
  const detailTitle = getDetailTitle(targetType, sortedFindings);

  const summary = calculateSummary(sortedFindings);
  const completedTime = scan.completedAt
    ? new Date(scan.completedAt).toLocaleString()
    : "Not recorded";

  const exportResults = () => {
    const csvRows = [
      [
        "Title",
        "Category",
        "Port",
        "Protocol",
        "Service",
        "CVSS Score",
        "Severity",
        "Classification",
        "Confidence",
        "Source",
        "Evidence",
        "Vulnerabilities",
        "Mitigation",
      ],
      ...sortedFindings.map((finding) => [
        finding.title,
        finding.category,
        finding.port ?? "N/A",
        finding.protocol ?? "N/A",
        finding.service ?? "N/A",
        finding.cvssScore ?? "N/A",
        finding.severity,
        finding.classification,
        finding.confidence !== null
          ? `${Math.round(finding.confidence * 100)}%`
          : "N/A",
        finding.source,
        finding.evidence,
        finding.vulnerabilities.join("; "),
        finding.mitigation,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map(escapeCsvCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `ehif-security-scan-${sanitizeFileName(
      scan.target
    )}-${new Date().toISOString().split("T")[0]}.csv`;

    link.click();
    URL.revokeObjectURL(url);
  };

  if (sortedFindings.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-cyan-300 mb-3">
          Security Analysis Complete
        </h3>

        <p className="text-gray-300">
          No findings were returned by the backend for this scan.
        </p>

        <p className="text-yellow-300 text-sm mt-3">
          Note: No findings does not guarantee the target is completely secure.
          It only means this scan did not detect reportable issues.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Analysis Header */}
      <div className="bg-gradient-to-r from-slate-900/60 to-black/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-3">
              {analysisTitle}
            </h3>

            <div className="space-y-2">
              <p className="text-cyan-300 text-lg">
                Target:{" "}
                <span className="font-mono font-bold text-violet-300 break-all">
                  {scan.target}
                </span>
              </p>

              <p className="text-gray-400">Completed: {completedTime}</p>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={`TARGET: ${formatTargetType(targetType)}`}
                  tone="cyan"
                />

                <StatusBadge
                  label={summary.cvssBasedCount > 0 ? "CVSS USED" : "BACKEND SEVERITY"}
                  tone={summary.cvssBasedCount > 0 ? "green" : "yellow"}
                />

                <StatusBadge
                  label={`OVERALL RISK: ${summary.overallRisk.toUpperCase()}`}
                  tone={getSeverityTone(summary.overallRisk)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={exportResults}
            className="bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/30 text-cyan-300 px-6 py-3 rounded-xl hover:from-cyan-500/30 hover:to-violet-500/30 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm shadow-lg hover:shadow-cyan-500/20"
          >
            <span className="text-xl">📊</span>
            Export Report
          </button>
        </div>

        <AccuracyNotice
          cvssBasedCount={summary.cvssBasedCount}
          backendSeverityCount={summary.backendSeverityCount}
          totalFindings={summary.total}
        />

        {/* Risk Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <RiskCard
            label="Critical"
            count={summary.critical}
            total={summary.total}
            tone="red"
            description="CVSS 9.0 - 10.0"
          />

          <RiskCard
            label="High"
            count={summary.high}
            total={summary.total}
            tone="orange"
            description="CVSS 7.0 - 8.9"
          />

          <RiskCard
            label="Medium"
            count={summary.medium}
            total={summary.total}
            tone="yellow"
            description="CVSS 4.0 - 6.9"
          />

          <RiskCard
            label="Low"
            count={summary.low}
            total={summary.total}
            tone="green"
            description="CVSS 0.1 - 3.9"
          />

          <RiskCard
            label="Info"
            count={summary.info}
            total={summary.total}
            tone="gray"
            description="No confirmed risk"
          />
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="space-y-6">
        <h4 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
          <span className="text-3xl">🔬</span>
          {detailTitle} ({sortedFindings.length} findings)
        </h4>

        <div className="space-y-4">
          {sortedFindings.map((finding, index) => (
            <FindingCard key={`${finding.title}-${index}`} finding={finding} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessingState({
  status,
}: {
  status: "pending" | "running" | "completed" | "failed";
}) {
  const message =
    status === "failed"
      ? "Scan failed. Please check backend logs."
      : "Processing security analysis...";

  return (
    <div className="text-center py-12">
      {status !== "failed" && (
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-cyan-400 border-r-violet-400 mx-auto" />
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-cyan-400/30 mx-auto" />
        </div>
      )}

      <p
        className={`text-lg ${
          status === "failed" ? "text-red-300" : "text-cyan-300"
        }`}
      >
        {message}
      </p>
    </div>
  );
}

function FindingCard({ finding }: { finding: NormalizedFinding }) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="text-4xl">
            {getClassificationIcon(finding.classification)}
          </div>

          <div>
            <h5 className="text-xl font-bold text-cyan-300 mb-1">
              {finding.title}
            </h5>

            <p className="text-violet-300 font-medium">
              {finding.category}
            </p>

            {finding.port !== undefined && (
              <p className="text-gray-300 text-sm mt-1">
                Port:{" "}
                <span className="font-mono text-cyan-200">
                  {finding.port}
                </span>{" "}
                {finding.protocol && (
                  <>
                    | Protocol:{" "}
                    <span className="font-mono text-cyan-200">
                      {finding.protocol}
                    </span>
                  </>
                )}
              </p>
            )}

            {finding.service && (
              <p className="text-gray-300 text-sm mt-1">
                Service:{" "}
                <span className="font-mono text-cyan-200">
                  {finding.service}
                </span>
              </p>
            )}

            {finding.banner && (
              <p className="text-gray-400 text-sm font-mono mt-1 break-all">
                {finding.banner}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl font-bold text-sm border bg-gradient-to-r ${getRiskColor(
              finding.severity
            )} shadow-lg`}
          >
            {finding.severity} Risk
          </div>

          <div className="text-center">
            <div className="text-cyan-400 font-mono text-lg font-bold">
              {finding.cvssScore !== null ? finding.cvssScore.toFixed(1) : "N/A"}
            </div>
            <div className="text-gray-400 text-xs">CVSS</div>
          </div>

          <div className="text-center">
            <div className="text-cyan-400 font-mono text-lg font-bold">
              {finding.confidence !== null
                ? `${Math.round(finding.confidence * 100)}%`
                : "N/A"}
            </div>
            <div className="text-gray-400 text-xs">confidence</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <InfoBox
          title="Analysis"
          icon="🔍"
          tone="cyan"
          content={finding.explanation}
        />

        <InfoBox
          title="Evidence"
          icon="📌"
          tone="violet"
          content={finding.evidence}
        />

        {finding.vulnerabilities.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-xl p-4 border border-red-500/10">
            <h6 className="font-bold text-red-300 mb-3 flex items-center gap-2">
              <span>⚠️</span> Identified Issues
            </h6>

            <ul className="space-y-2">
              {finding.vulnerabilities.map((vulnerability, index) => (
                <li
                  key={`${vulnerability}-${index}`}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="text-red-400 mt-1">•</span>
                  <span>{vulnerability}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <InfoBox
          title="Recommended Actions"
          icon="🛠️"
          tone="green"
          content={finding.mitigation}
        />

        <div className="text-xs text-gray-500 font-mono">
          Source: {finding.source}
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  title,
  icon,
  tone,
  content,
}: {
  title: string;
  icon: string;
  tone: "cyan" | "violet" | "green";
  content: string;
}) {
  const toneClass = {
    cyan: "from-cyan-500/5 to-violet-500/5 border-cyan-500/10 text-cyan-300",
    violet:
      "from-violet-500/5 to-cyan-500/5 border-violet-500/10 text-violet-300",
    green:
      "from-green-500/5 to-emerald-500/5 border-green-500/10 text-green-300",
  }[tone];

  return (
    <div className={`bg-gradient-to-r rounded-xl p-4 border ${toneClass}`}>
      <h6 className="font-bold mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h6>

      <p className="text-gray-300 leading-relaxed">{content}</p>
    </div>
  );
}

function RiskCard({
  label,
  count,
  total,
  tone,
  description,
}: {
  label: Severity;
  count: number;
  total: number;
  tone: "red" | "orange" | "yellow" | "green" | "gray";
  description: string;
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;

  const toneClass = {
    red: {
      card: "from-red-500/20 to-red-600/20 border-red-400/30",
      text: "text-red-400",
      label: "text-red-300",
      barBg: "bg-red-900/30",
      bar: "from-red-400 to-red-500",
    },
    orange: {
      card: "from-orange-500/20 to-orange-600/20 border-orange-400/30",
      text: "text-orange-400",
      label: "text-orange-300",
      barBg: "bg-orange-900/30",
      bar: "from-orange-400 to-orange-500",
    },
    yellow: {
      card: "from-yellow-500/20 to-yellow-600/20 border-yellow-400/30",
      text: "text-yellow-400",
      label: "text-yellow-300",
      barBg: "bg-yellow-900/30",
      bar: "from-yellow-400 to-yellow-500",
    },
    green: {
      card: "from-green-500/20 to-green-600/20 border-green-400/30",
      text: "text-green-400",
      label: "text-green-300",
      barBg: "bg-green-900/30",
      bar: "from-green-400 to-green-500",
    },
    gray: {
      card: "from-gray-500/20 to-gray-600/20 border-gray-400/30",
      text: "text-gray-400",
      label: "text-gray-300",
      barBg: "bg-gray-900/30",
      bar: "from-gray-400 to-gray-500",
    },
  }[tone];

  return (
    <div
      className={`bg-gradient-to-br ${toneClass.card} border rounded-xl p-4 text-center backdrop-blur-sm`}
    >
      <div className={`text-3xl font-bold ${toneClass.text} mb-1`}>
        {count}
      </div>

      <div className={`${toneClass.label} font-medium`}>{label}</div>

      <p className="text-xs text-gray-500 mt-1">{description}</p>

      <div className={`w-full ${toneClass.barBg} rounded-full h-2 mt-2`}>
        <div
          className={`bg-gradient-to-r ${toneClass.bar} h-2 rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function AccuracyNotice({
  cvssBasedCount,
  backendSeverityCount,
  totalFindings,
}: {
  cvssBasedCount: number;
  backendSeverityCount: number;
  totalFindings: number;
}) {
  if (cvssBasedCount === totalFindings) {
    return (
      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 text-green-200 text-sm">
        Severity levels are calculated from CVSS scores for all findings.
      </div>
    );
  }

  if (cvssBasedCount > 0 && backendSeverityCount > 0) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-yellow-200 text-sm">
        Some findings use CVSS-based severity, while others use backend-provided
        severity because CVSS scores were not available.
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-yellow-200 text-sm">
      CVSS scores were not found in the scan results. Risk levels are based on
      backend-provided classifications and should be treated as estimated.
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "cyan" | "green" | "yellow" | "red" | "gray";
}) {
  const toneClass = {
    cyan: "bg-cyan-500/20 border-cyan-400/30 text-cyan-300",
    green: "bg-green-500/20 border-green-400/30 text-green-300",
    yellow: "bg-yellow-500/20 border-yellow-400/30 text-yellow-300",
    red: "bg-red-500/20 border-red-400/30 text-red-300",
    gray: "bg-gray-500/20 border-gray-400/30 text-gray-300",
  }[tone];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 border rounded-full ${toneClass}`}
    >
      <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      <span className="text-sm font-mono">{label}</span>
    </div>
  );
}

function normalizeFinding(result: ScanResult): NormalizedFinding {
  const cvssScore = getValidCvssScore(result.cvssScore);
  const severity = cvssScore !== null
    ? getSeverityFromCvss(cvssScore)
    : result.riskLevel ?? "Info";

  const vulnerabilities = Array.isArray(result.vulnerabilities)
    ? result.vulnerabilities
    : [];

  const classification =
    result.classification ??
    getClassificationFromSeverity(severity, vulnerabilities.length);

  const category = result.category ?? getCategory(result);

  const title =
    result.title ??
    getDefaultTitle(result, category);

  const confidence = normalizeConfidence(result.confidence);

  return {
    title,
    category,
    source:
      result.source ??
      (cvssScore !== null
        ? "CVSS-based severity"
        : "Backend-provided severity"),
    evidence:
      result.evidence ??
      result.banner ??
      "No evidence was supplied by the backend for this finding.",
    severity,
    classification,
    cvssScore,
    vulnerabilities,
    explanation:
      result.explanation ??
      "No detailed explanation was supplied by the backend.",
    mitigation:
      result.mitigation ??
      result.recommendation ??
      "Review this finding manually and apply the appropriate security hardening steps.",
    confidence,
    port: result.port,
    protocol: result.protocol,
    service: result.service,
    banner: result.banner,
  };
}

function calculateSummary(findings: NormalizedFinding[]) {
  const summary = {
    total: findings.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    cvssBasedCount: 0,
    backendSeverityCount: 0,
    overallRisk: "Info" as Severity,
  };

  for (const finding of findings) {
    if (finding.severity === "Critical") summary.critical += 1;
    else if (finding.severity === "High") summary.high += 1;
    else if (finding.severity === "Medium") summary.medium += 1;
    else if (finding.severity === "Low") summary.low += 1;
    else summary.info += 1;

    if (finding.cvssScore !== null) {
      summary.cvssBasedCount += 1;
    } else {
      summary.backendSeverityCount += 1;
    }
  }

  summary.overallRisk = getOverallRisk(summary);

  return summary;
}

function getOverallRisk(summary: {
  critical: number;
  high: number;
  medium: number;
  low: number;
}): Severity {
  if (summary.critical > 0) return "Critical";
  if (summary.high > 0) return "High";
  if (summary.medium > 0) return "Medium";
  if (summary.low > 0) return "Low";
  return "Info";
}

function getValidCvssScore(score: unknown): number | null {
  if (typeof score !== "number") return null;
  if (!Number.isFinite(score)) return null;
  if (score < 0 || score > 10) return null;

  return score;
}

function getSeverityFromCvss(score: number): Severity {
  if (score >= 9.0) return "Critical";
  if (score >= 7.0) return "High";
  if (score >= 4.0) return "Medium";
  if (score > 0.0) return "Low";

  return "Info";
}

function getRiskWeight(severity: Severity): number {
  const weights: Record<Severity, number> = {
    Critical: 5,
    High: 4,
    Medium: 3,
    Low: 2,
    Info: 1,
  };

  return weights[severity];
}

function getClassificationFromSeverity(
  severity: Severity,
  vulnerabilityCount: number
): Classification {
  if (severity === "Critical" || severity === "High") return "Vulnerable";
  if (severity === "Medium" || vulnerabilityCount > 0) {
    return "Possibly Vulnerable";
  }

  return "Safe";
}

function normalizeConfidence(confidence: unknown): number | null {
  if (typeof confidence !== "number") return null;
  if (!Number.isFinite(confidence)) return null;

  if (confidence > 1 && confidence <= 100) {
    return confidence / 100;
  }

  if (confidence >= 0 && confidence <= 1) {
    return confidence;
  }

  return null;
}

function getDefaultTitle(result: ScanResult, category: string): string {
  if (result.port !== undefined && result.service) {
    return `Port ${result.port} - ${result.service}`;
  }

  if (result.port !== undefined) {
    return `Port ${result.port} Finding`;
  }

  if (result.service) {
    return result.service;
  }

  return `${category} Finding`;
}

function getCategory(result: ScanResult): string {
  if (result.port !== undefined) return "Network Service";
  if (result.category) return result.category;

  return "Security Finding";
}

function getRiskColor(severity: Severity): string {
  switch (severity) {
    case "Critical":
      return "from-red-500 to-red-600 text-white border-red-400/50";
    case "High":
      return "from-orange-500 to-red-500 text-white border-orange-400/50";
    case "Medium":
      return "from-yellow-500 to-orange-500 text-black border-yellow-400/50";
    case "Low":
      return "from-green-500 to-emerald-500 text-black border-green-400/50";
    case "Info":
    default:
      return "from-gray-500 to-gray-600 text-white border-gray-400/50";
  }
}

function getClassificationIcon(classification: Classification): string {
  switch (classification) {
    case "Vulnerable":
      return "🚨";
    case "Possibly Vulnerable":
      return "⚠️";
    case "Safe":
      return "✅";
    default:
      return "❓";
  }
}

function detectTargetType(target: string): TargetType {
  const value = target.trim();

  if (isGithubRepo(value)) return "github_repo";

  const hostname = extractHostname(value);

  if (!hostname) return "unknown";
  if (isLocalhost(hostname)) return "localhost";
  if (isValidIPv4(hostname) && isPrivateIPv4(hostname)) return "private_ip";
  if (isValidIPv4(hostname)) return "public_ip";
  if (looksLikeDomain(hostname)) return "public_website";

  return "unknown";
}

function getAnalysisTitle(
  targetType: TargetType,
  findings: NormalizedFinding[]
): string {
  if (targetType === "github_repo") {
    return "Repository Security Analysis Complete";
  }

  if (findings.every((finding) => finding.port !== undefined)) {
    return "Network Security Analysis Complete";
  }

  return "Security Analysis Complete";
}

function getDetailTitle(
  targetType: TargetType,
  findings: NormalizedFinding[]
): string {
  if (targetType === "github_repo") {
    return "Repository Security Findings";
  }

  if (findings.every((finding) => finding.port !== undefined)) {
    return "Detailed Port Analysis";
  }

  return "Detailed Security Findings";
}

function formatTargetType(targetType: TargetType): string {
  return targetType.replace("_", " ").toUpperCase();
}

function getSeverityTone(
  severity: Severity
): "cyan" | "green" | "yellow" | "red" | "gray" {
  if (severity === "Critical") return "red";
  if (severity === "High") return "red";
  if (severity === "Medium") return "yellow";
  if (severity === "Low") return "green";

  return "gray";
}

function isGithubRepo(target: string): boolean {
  try {
    const url = new URL(target);

    if (url.hostname !== "github.com") return false;

    const parts = url.pathname.split("/").filter(Boolean);

    return parts.length >= 2;
  } catch {
    return false;
  }
}

function extractHostname(target: string): string | null {
  try {
    const url = target.includes("://")
      ? new URL(target)
      : new URL(`http://${target}`);

    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isValidIPv4(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;

    const number = Number(part);

    return number >= 0 && number <= 255;
  });
}

function isPrivateIPv4(ip: string): boolean {
  const [first, second] = ip.split(".").map(Number);

  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 169 && second === 254) return true;

  return false;
}

function looksLikeDomain(hostname: string): boolean {
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(hostname);
}

function escapeCsvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 80);
}