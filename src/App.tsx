import { useEffect, useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { SecurityDashboard } from "./SecurityDashboard";

type UserRole = "Admin" | "Security Analyst" | "Viewer";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 relative overflow-hidden text-white">
      <AnimatedBackground />

      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <BrandSection />

          <Authenticated>
            <div className="flex items-center gap-3">
              <SystemStatus />
              <SignOutButton />
            </div>
          </Authenticated>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Content />
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.85)",
            border: "1px solid rgba(6, 182, 212, 0.35)",
            color: "#06b6d4",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Authenticated>
        <AuthenticatedHome user={loggedInUser} />
      </Authenticated>

      <Unauthenticated>
        <LoginScreen />
      </Unauthenticated>
    </div>
  );
}

function AuthenticatedHome({ user }: { user: unknown }) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const savedAuthorization = localStorage.getItem("ehif_authorized");
    if (savedAuthorization === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const currentUser = user as {
    name?: string;
    email?: string;
    role?: UserRole;
  } | null;

  const userRole: UserRole = currentUser?.role ?? "Security Analyst";

  const handleAuthorize = () => {
    localStorage.setItem("ehif_authorized", "true");
    setIsAuthorized(true);
  };

  if (!isAuthorized) {
    return <AuthorizationGate onAuthorize={handleAuthorize} />;
  }

  return (
    <div className="space-y-8">
      <WelcomePanel userRole={userRole} />
      <FeatureOverview />

      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 shadow-2xl shadow-cyan-500/10">
        <SecurityDashboard />
      </div>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="circuit"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 10 L 10 10 L 10 0 M 10 20 L 10 10 L 20 10"
                stroke="rgba(139,92,246,0.3)"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>
    </>
  );
}

function BrandSection() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/40">
          <span className="text-black font-bold text-lg">🛡️</span>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-lg blur opacity-25" />
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Safehex Security Framework
        </h1>
        <p className="hidden sm:block text-xs text-cyan-300/70 font-mono">
          Ethical Hacking Integrity Protocol v2.1
        </p>
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-green-300 text-sm font-mono">SECURE</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent border-t-cyan-400 border-r-violet-400" />
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-cyan-400/30" />
      </div>
      <p className="text-cyan-300/70 font-mono text-sm">
        Initializing secure session...
      </p>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/50">
            <span className="text-black font-bold text-4xl">🛡️</span>
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-2xl blur opacity-20" />
        </div>

        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Ethical Security Framework
        </h2>

        <p className="text-cyan-300/80 text-lg">
          AI-Powered Vulnerability Assessment
        </p>

        <p className="text-violet-300/60 text-sm font-mono mt-2">
          Authorized Personnel Only • Integrity Protocol Active
        </p>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
        <SignInForm />
      </div>
    </div>
  );
}

function AuthorizationGate({ onAuthorize }: { onAuthorize: () => void }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-black/50 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6 shadow-2xl shadow-yellow-500/10">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/20 border border-yellow-400/40 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>

        <h2 className="text-2xl font-bold text-yellow-300">
          Ethical Authorization Required
        </h2>

        <p className="text-slate-300 mt-3 leading-relaxed">
          This framework is designed only for ethical hacking, authorized
          security testing, and academic cybersecurity research.
        </p>
      </div>

      <div className="space-y-3 text-sm text-slate-300 bg-slate-900/60 border border-slate-700 rounded-xl p-4">
        <p>Before continuing, confirm that:</p>

        <ul className="list-disc list-inside space-y-2">
          <li>You own the target system or have written permission.</li>
          <li>You will not scan public or third-party systems illegally.</li>
          <li>You will use the results only for defensive security purposes.</li>
          <li>You understand that unauthorized scanning may be illegal.</li>
        </ul>
      </div>

      <label className="flex items-start gap-3 mt-5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1 h-4 w-4 accent-cyan-400"
        />
        <span className="text-sm text-cyan-100">
          I confirm that I will use this tool only on authorized systems.
        </span>
      </label>

      <button
        onClick={onAuthorize}
        disabled={!checked}
        className="w-full mt-6 px-4 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-cyan-400 to-violet-500 text-black disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/30"
      >
        Continue to Security Dashboard
      </button>
    </div>
  );
}

function WelcomePanel({ userRole }: { userRole: UserRole }) {
  return (
    <section className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-cyan-300/70 font-mono text-sm">
            Dashboard Access Granted
          </p>

          <h2 className="text-3xl font-bold mt-1 bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
            Ethical Hacking Integrity Framework
          </h2>

          <p className="text-slate-300 mt-2 max-w-2xl">
            Monitor vulnerability scans, analyze CVE risks, generate reports,
            and manage secure assessment workflows from one dashboard.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-sm font-mono">
            Role: {userRole}
          </span>

          <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-200 text-sm font-mono">
            Session Protected
          </span>
        </div>
      </div>
    </section>
  );
}

function FeatureOverview() {
  const features = [
    {
      title: "Real Scan Engine",
      description: "Ready to connect with Nmap, OWASP ZAP, or Nikto.",
      icon: "📡",
    },
    {
      title: "CVE + CVSS Mapping",
      description: "Classify vulnerabilities as Low, Medium, High, or Critical.",
      icon: "🧬",
    },
    {
      title: "Report Export",
      description: "Plan support for PDF, CSV, and JSON scan reports.",
      icon: "📄",
    },
    {
      title: "Role-Based Access",
      description: "Supports Admin, Security Analyst, and Viewer workflows.",
      icon: "👥",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-5 shadow-lg shadow-cyan-500/5 hover:border-cyan-400/40 transition-all"
        >
          <div className="text-3xl mb-3">{feature.icon}</div>

          <h3 className="text-lg font-semibold text-cyan-200">
            {feature.title}
          </h3>

          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </section>
  );
}