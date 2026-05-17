import { useState } from "react";

interface EthicalPrinciple {
  id: string;
  title: string;
  icon: string;
  description: string;
  details: string;
  status: "active" | "verified" | "protected";
  color: string;
}

const ethicalPrinciples: EthicalPrinciple[] = [
  {
    id: "authorization",
    title: "Authorization Protocol",
    icon: "🔐",
    description: "Explicit permission verification before any security assessment",
    details: "All scanning activities require documented authorization from system owners. Unauthorized access attempts are automatically blocked and logged.",
    status: "active",
    color: "from-green-400 to-emerald-500"
  },
  {
    id: "transparency",
    title: "Transparency Matrix",
    icon: "👁️",
    description: "Full disclosure of methods, findings, and potential impacts",
    details: "Complete visibility into scanning methodologies, discovered vulnerabilities, and recommended remediation steps. No hidden backdoors or undisclosed access.",
    status: "verified",
    color: "from-blue-400 to-cyan-500"
  },
  {
    id: "minimization",
    title: "Impact Minimization",
    icon: "⚖️",
    description: "Least intrusive methods to achieve security objectives",
    details: "Scanning techniques are optimized to minimize system disruption while maintaining thorough security assessment capabilities.",
    status: "protected",
    color: "from-violet-400 to-purple-500"
  },
  {
    id: "confidentiality",
    title: "Data Confidentiality",
    icon: "🔒",
    description: "Strict protection of discovered vulnerabilities and sensitive data",
    details: "All vulnerability data is encrypted, access-controlled, and shared only with authorized personnel following responsible disclosure protocols.",
    status: "active",
    color: "from-orange-400 to-red-500"
  },
  {
    id: "responsibility",
    title: "Responsible Disclosure",
    icon: "📢",
    description: "Ethical reporting of vulnerabilities to appropriate stakeholders",
    details: "Vulnerabilities are reported through secure channels with appropriate timelines for remediation before any public disclosure.",
    status: "verified",
    color: "from-yellow-400 to-orange-500"
  },
  {
    id: "compliance",
    title: "Legal Compliance",
    icon: "⚖️",
    description: "Adherence to all applicable laws and regulations",
    details: "All activities comply with local, national, and international cybersecurity laws, privacy regulations, and industry standards.",
    status: "protected",
    color: "from-pink-400 to-rose-500"
  }
];

export function IntegrityFramework() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"beginner" | "advanced">("beginner");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 border-green-400/30 bg-green-500/20";
      case "verified": return "text-blue-400 border-blue-400/30 bg-blue-500/20";
      case "protected": return "text-violet-400 border-violet-400/30 bg-violet-500/20";
      default: return "text-gray-400 border-gray-400/30 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return "🟢";
      case "verified": return "🔵";
      case "protected": return "🟣";
      default: return "⚪";
    }
  };

  return (
    <div className="space-y-8">
      {/* Central Framework Hub */}
      <div className="relative flex justify-center items-center min-h-[400px]">
        {/* Central Core */}
        <div className="relative">
          <div className="w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 rounded-full border-2 border-cyan-400/30 flex items-center justify-center backdrop-blur-md shadow-2xl shadow-cyan-500/20">
            <div className="text-center">
              <div className="text-4xl mb-2">🛡️</div>
              <div className="text-cyan-300 font-bold text-lg">INTEGRITY</div>
              <div className="text-violet-300 font-mono text-sm">FRAMEWORK</div>
            </div>
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/10 to-violet-500/10 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Orbiting Principles */}
        {ethicalPrinciples.map((principle, index) => {
          const angle = (index * 60) - 90; // 60 degrees apart, starting from top
          const radius = 180;
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;

          return (
            <div
              key={principle.id}
              className="absolute transition-all duration-500 hover:scale-110 cursor-pointer"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                animation: `orbit 20s linear infinite`,
                animationDelay: `${index * -3.33}s`
              }}
              onClick={() => setSelectedPrinciple(selectedPrinciple === principle.id ? null : principle.id)}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${principle.color} rounded-full border border-white/20 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}>
                <span className="text-2xl">{principle.icon}</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-violet-500/20 rounded-full blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Connection Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`${50 - (x / radius) * 50}%`}
                  y2={`${50 - (y / radius) * 50}%`}
                  stroke="rgba(6, 182, 212, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-1 flex">
          {["beginner", "advanced"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                viewMode === mode
                  ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-400/30"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)} View
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Ethics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ethicalPrinciples.map((principle) => (
          <div
            key={principle.id}
            className={`bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 ${
              selectedPrinciple === principle.id ? "ring-2 ring-cyan-400/50 scale-105" : ""
            }`}
            onClick={() => setSelectedPrinciple(selectedPrinciple === principle.id ? null : principle.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${principle.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-xl">{principle.icon}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(principle.status)}`}>
                <span className="text-xs">{getStatusIcon(principle.status)}</span>
                <span className="text-xs font-mono uppercase">{principle.status}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-cyan-300 mb-2">{principle.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{principle.description}</p>

            {selectedPrinciple === principle.id && (
              <div className="border-t border-cyan-500/20 pt-4 animate-fadeIn">
                <p className="text-gray-400 text-sm leading-relaxed">
                  {viewMode === "advanced" ? principle.details : principle.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs font-mono">OPERATIONAL</span>
              </div>
              <span className="text-cyan-400 text-xs">Click to expand</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Visualization */}
      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center">Framework Status Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(6, 182, 212, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient1)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.95} ${2 * Math.PI * 40}`}
                  className="animate-pulse"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
            </div>
            <div className="text-cyan-300 font-bold">Integrity Level</div>
            <div className="text-green-400 text-2xl font-mono">95%</div>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(139, 92, 246, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient2)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.88} ${2 * Math.PI * 40}`}
                  className="animate-pulse"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
            </div>
            <div className="text-violet-300 font-bold">Compliance Score</div>
            <div className="text-blue-400 text-2xl font-mono">88%</div>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(34, 197, 94, 0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient3)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40 * 0.92} ${2 * Math.PI * 40}`}
                  className="animate-pulse"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="text-green-300 font-bold">Trust Rating</div>
            <div className="text-emerald-400 text-2xl font-mono">92%</div>
          </div>
        </div>
      </div>

      {/* SVG Gradients */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>


    </div>
  );
}
