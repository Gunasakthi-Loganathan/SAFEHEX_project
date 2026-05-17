import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface ScanFormProps {
  onScanComplete: (scanId: string) => void;
}

type TargetType =
  | "github_repo"
  | "localhost"
  | "private_ip"
  | "public_ip"
  | "public_website"
  | "domain"
  | "unknown";

type ScanMode =
  | "Repository Security Scan"
  | "Local Lab Security Scan"
  | "Authorized Domain Scan"
  | "Restricted Public Target"
  | "Unknown Target";

type TargetAssessment = {
  normalizedTarget: string;
  targetType: TargetType;
  scanMode: ScanMode;
  canScan: boolean;
  statusLabel: string;
  statusTone: "green" | "yellow" | "red" | "gray";
  description: string;
  allowedChecks: string[];
  blockedChecks: string[];
};

const AUTHORIZED_PUBLIC_HOSTS: string[] = [
  // Add only domains you own or have written permission to test.
  // Example: "yourdomain.com"
];

export function ScanForm({ onScanComplete }: ScanFormProps) {
  const [target, setTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const startScan = useMutation(api.vulnerabilityAnalyzer.startScan);

  const targetAssessment = useMemo(() => {
    return assessTarget(target);
  }, [target]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetAssessment.normalizedTarget) {
      toast.error("Please enter a valid target.");
      return;
    }

    if (!hasConsented) {
      toast.error("Please confirm you have authorization to scan this target.");
      return;
    }

    if (!targetAssessment.canScan) {
      toast.error(
        "Active scanning is disabled for this target type. Use localhost, private lab IP, your authorized domain, or a GitHub repository scan."
      );
      return;
    }

    setIsScanning(true);

    try {
      /*
        Current backend-compatible call:
        This keeps your existing Convex mutation working.

        For better backend accuracy later, update convex/vulnerabilityAnalyzer.ts
        to also accept:
        targetType: targetAssessment.targetType,
        scanMode: targetAssessment.scanMode
      */
      const scanId = await startScan({
        target: targetAssessment.normalizedTarget,
      });

      toast.success(`${targetAssessment.scanMode} completed.`);
      onScanComplete(scanId);
    } catch (error) {
      toast.error("Failed to complete scan. Please check backend logs.");
    } finally {
      setIsScanning(false);
    }
  };

  const canSubmit =
    Boolean(targetAssessment.normalizedTarget) &&
    hasConsented &&
    targetAssessment.canScan &&
    !isScanning;

  return (
    <div className="space-y-8">
      {/* Ethical Warning */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="text-amber-400 text-3xl">⚠️</div>

          <div>
            <h3 className="font-bold text-amber-300 mb-2 text-lg">
              Ethical Use Protocol Active
            </h3>

            <p className="text-amber-200/80 leading-relaxed">
              This security assessment system must be used only on systems you
              own, local lab environments, private test networks, or targets for
              which you have explicit written permission. Public third-party
              websites are blocked from active scanning by default.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          Initialize Security Assessment
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="target"
              className="block text-lg font-medium text-cyan-300 mb-3"
            >
              Target System Identifier
            </label>

            <div className="relative">
              <input
                type="text"
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="localhost:3000, 192.168.1.10, or https://github.com/user/repo"
                className="w-full px-6 py-4 bg-black/40 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all duration-300 text-cyan-100 placeholder-gray-500 backdrop-blur-sm text-lg font-mono"
                disabled={isScanning}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 rounded-xl pointer-events-none" />
            </div>
          </div>

          {targetAssessment.normalizedTarget && (
            <TargetAssessmentPanel assessment={targetAssessment} />
          )}

          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="sr-only"
                  disabled={isScanning}
                />

                <div
                  className={`w-6 h-6 rounded border-2 transition-all duration-300 ${
                    hasConsented
                      ? "bg-gradient-to-r from-cyan-400 to-violet-400 border-cyan-400"
                      : "border-gray-500 bg-black/40"
                  }`}
                >
                  {hasConsented && (
                    <svg
                      className="w-4 h-4 text-black mx-auto mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-cyan-300 font-bold mb-2">
                  Authorization Verification Protocol
                </div>

                <p className="text-gray-300 leading-relaxed">
                  I confirm that I have explicit authorization to test this
                  target. I understand that unauthorized scanning of public or
                  third-party systems may be illegal, and I accept
                  responsibility for using this tool only for ethical and
                  defensive security purposes.
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 text-black py-4 px-8 rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            {isScanning ? (
              <>
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-black border-r-black" />
                </div>
                <span>ANALYSIS IN PROGRESS...</span>
              </>
            ) : targetAssessment.normalizedTarget &&
              !targetAssessment.canScan ? (
              <>
                <span className="text-2xl">🚫</span>
                <span>SCAN DISABLED FOR THIS TARGET</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🚀</span>
                <span>INITIATE SECURITY SCAN</span>
              </>
            )}
          </button>
        </form>
      </div>

      {isScanning && (
        <ScanningStatus assessment={targetAssessment} />
      )}
    </div>
  );
}

function TargetAssessmentPanel({
  assessment,
}: {
  assessment: TargetAssessment;
}) {
  const toneClass = {
    green: "border-green-400/30 bg-green-500/10 text-green-300",
    yellow: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
    red: "border-red-400/30 bg-red-500/10 text-red-300",
    gray: "border-slate-400/30 bg-slate-500/10 text-slate-300",
  }[assessment.statusTone];

  return (
    <div className={`border rounded-2xl p-5 backdrop-blur-sm ${toneClass}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h4 className="font-bold text-lg">Target Classification</h4>

          <p className="text-sm opacity-80 font-mono mt-1">
            {assessment.normalizedTarget}
          </p>
        </div>

        <div className="px-3 py-1 border border-current rounded-full text-xs font-mono w-fit">
          {assessment.statusLabel}
        </div>
      </div>

      <p className="text-sm opacity-90 leading-relaxed mb-4">
        {assessment.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-black/30 border border-current/20 rounded-xl p-4">
          <h5 className="font-bold mb-2">Allowed Checks</h5>

          {assessment.allowedChecks.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 opacity-90">
              {assessment.allowedChecks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          ) : (
            <p className="opacity-70">No active checks allowed.</p>
          )}
        </div>

        <div className="bg-black/30 border border-current/20 rounded-xl p-4">
          <h5 className="font-bold mb-2">Blocked Checks</h5>

          {assessment.blockedChecks.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 opacity-90">
              {assessment.blockedChecks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          ) : (
            <p className="opacity-70">No checks blocked for this target type.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScanningStatus({
  assessment,
}: {
  assessment: TargetAssessment;
}) {
  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-30 animate-ping" />
        </div>

        <div>
          <h4 className="font-bold text-blue-300 text-lg">
            {assessment.scanMode} Active
          </h4>

          <p className="text-blue-200/80">
            Running checks suitable for the detected target type. Results should
            be calculated from backend findings, evidence, and CVSS-based
            severity rules.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            {assessment.allowedChecks.map((check) => (
              <div key={check} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-sm font-mono">
                  {check.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function assessTarget(rawTarget: string): TargetAssessment {
  const normalizedTarget = rawTarget.trim();

  if (!normalizedTarget) {
    return {
      normalizedTarget: "",
      targetType: "unknown",
      scanMode: "Unknown Target",
      canScan: false,
      statusLabel: "NO TARGET",
      statusTone: "gray",
      description: "Enter a target to classify the scan mode.",
      allowedChecks: [],
      blockedChecks: [],
    };
  }

  if (isGithubRepo(normalizedTarget)) {
    return {
      normalizedTarget,
      targetType: "github_repo",
      scanMode: "Repository Security Scan",
      canScan: true,
      statusLabel: "REPOSITORY SCAN ALLOWED",
      statusTone: "green",
      description:
        "GitHub repository detected. Network port scanning is not suitable. The scan should focus on dependency issues, exposed secrets, unsafe code patterns, and security configuration.",
      allowedChecks: [
        "Dependency analysis",
        "Secret pattern check",
        "Unsafe code pattern check",
        "Security policy check",
      ],
      blockedChecks: [
        "Port enumeration",
        "Service fingerprinting",
        "Aggressive network probing",
      ],
    };
  }

  const hostname = extractHostname(normalizedTarget);

  if (!hostname) {
    return {
      normalizedTarget,
      targetType: "unknown",
      scanMode: "Unknown Target",
      canScan: false,
      statusLabel: "INVALID TARGET",
      statusTone: "red",
      description:
        "The target format could not be identified. Use localhost, a private lab IP address, an authorized domain, or a GitHub repository URL.",
      allowedChecks: [],
      blockedChecks: ["All active checks"],
    };
  }

  if (isLocalhost(hostname)) {
    return {
      normalizedTarget,
      targetType: "localhost",
      scanMode: "Local Lab Security Scan",
      canScan: true,
      statusLabel: "LOCAL TARGET ALLOWED",
      statusTone: "green",
      description:
        "Localhost target detected. This is suitable for safe project demonstrations and local testing.",
      allowedChecks: [
        "Local port check",
        "HTTP header check",
        "Local service review",
        "Risk classification",
      ],
      blockedChecks: [],
    };
  }

  if (isValidIPv4(hostname) && isPrivateIPv4(hostname)) {
    return {
      normalizedTarget,
      targetType: "private_ip",
      scanMode: "Local Lab Security Scan",
      canScan: true,
      statusLabel: "PRIVATE LAB TARGET ALLOWED",
      statusTone: "green",
      description:
        "Private network IP detected. This should be used only in your own lab or authorized internal network.",
      allowedChecks: [
        "Port check",
        "Service review",
        "Basic vulnerability mapping",
        "Risk classification",
      ],
      blockedChecks: [],
    };
  }

  if (isAuthorizedPublicHost(hostname)) {
    return {
      normalizedTarget,
      targetType: "domain",
      scanMode: "Authorized Domain Scan",
      canScan: true,
      statusLabel: "AUTHORIZED PUBLIC TARGET",
      statusTone: "yellow",
      description:
        "This public host is listed in AUTHORIZED_PUBLIC_HOSTS. Active scanning is allowed only because you configured it as an authorized target.",
      allowedChecks: [
        "HTTP header check",
        "TLS configuration check",
        "Basic web security review",
        "Risk classification",
      ],
      blockedChecks: ["Aggressive network probing"],
    };
  }

  if (isValidIPv4(hostname)) {
    return {
      normalizedTarget,
      targetType: "public_ip",
      scanMode: "Restricted Public Target",
      canScan: false,
      statusLabel: "PUBLIC IP BLOCKED",
      statusTone: "red",
      description:
        "Public IP address detected. Active scanning is blocked unless this target is explicitly authorized and configured in the backend allowlist.",
      allowedChecks: [],
      blockedChecks: [
        "Port enumeration",
        "Service fingerprinting",
        "Vulnerability probing",
      ],
    };
  }

  if (looksLikeDomain(hostname)) {
    return {
      normalizedTarget,
      targetType: "public_website",
      scanMode: "Restricted Public Target",
      canScan: false,
      statusLabel: "PUBLIC WEBSITE BLOCKED",
      statusTone: "red",
      description:
        "Public website detected. Active scanning is disabled by default to avoid unauthorized testing of third-party systems.",
      allowedChecks: [],
      blockedChecks: [
        "Port enumeration",
        "Service fingerprinting",
        "Aggressive vulnerability scan",
      ],
    };
  }

  return {
    normalizedTarget,
    targetType: "unknown",
    scanMode: "Unknown Target",
    canScan: false,
    statusLabel: "UNKNOWN TARGET",
    statusTone: "gray",
    description:
      "The target type could not be safely classified, so active scanning is disabled.",
    allowedChecks: [],
    blockedChecks: ["All active checks"],
  };
}

function isGithubRepo(target: string): boolean {
  try {
    const url = new URL(target);

    if (url.hostname !== "github.com") {
      return false;
    }

    const parts = url.pathname.split("/").filter(Boolean);

    return parts.length >= 2;
  } catch {
    return false;
  }
}

function extractHostname(target: string): string | null {
  const value = target.trim();

  try {
    const url = value.includes("://")
      ? new URL(value)
      : new URL(`http://${value}`);

    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isLocalhost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
}

function isValidIPv4(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) {
      return false;
    }

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

function isAuthorizedPublicHost(hostname: string): boolean {
  return AUTHORIZED_PUBLIC_HOSTS.some(
    (allowedHost) =>
      hostname === allowedHost || hostname.endsWith(`.${allowedHost}`)
  );
}