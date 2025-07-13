"use client";
import React from "react";

function MainComponent() {
  const [activeSection, setActiveSection] = React.useState("home");
  const [userProfile, setUserProfile] = React.useState(null);
  const [isOnboarding, setIsOnboarding] = React.useState(false);
  const [ariiaSession, setAriiaSession] = React.useState(null);
  const [systemStatus, setSystemStatus] = React.useState("online");

  // AI-powered rotating banner content - focused on intelligence platform only
  const bannerContent = [
    {
      title: "ARIIA Intelligence OS",
      subtitle: "Sovereign-grade digital archeologist lab & investigation hub",
      cta: "Access Console",
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Cryptographic Evidence Vault",
      subtitle: "Chain-of-custody tracking with SHA-256 integrity verification",
      cta: "Open Vault",
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "AI Timeline Constructor",
      subtitle: "Automated event correlation and pattern recognition",
      cta: "Build Timeline",
      bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Officer Command Interface",
      subtitle: "Secure authentication with RSA/Ed25519 dual-key verification",
      cta: "Authenticate",
      bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ];

  const [currentBanner, setCurrentBanner] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerContent.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ARIIA System Status Check
  React.useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch("/api/ariia-command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "system_status" }),
        });
        const result = await response.json();
        setSystemStatus(result.status === "success" ? "online" : "degraded");
      } catch (error) {
        setSystemStatus("offline");
      }
    };

    checkSystemStatus();
    const statusInterval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  const handleGetStarted = () => {
    setIsOnboarding(true);
  };

  const handleOnboardingComplete = (profile) => {
    setUserProfile(profile);
    setIsOnboarding(false);
    setActiveSection("dashboard");
  };

  const handleAccessConsole = () => {
    if (userProfile && ariiaSession) {
      setActiveSection("dashboard");
    } else {
      setActiveSection("authentication");
    }
  };

  const handleNavigation = (section) => {
    if (section === "console" && (!userProfile || !ariiaSession)) {
      setActiveSection("authentication");
    } else if (section === "console" && userProfile && ariiaSession) {
      setActiveSection("dashboard");
    } else {
      setActiveSection(section);
    }
  };

  const handleAuthentication = (session) => {
    setAriiaSession(session);
    setActiveSection("dashboard");
  };

  if (isOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (activeSection === "authentication") {
    return <OfficerAuthentication onAuthenticated={handleAuthentication} />;
  }

  if (ariiaSession && activeSection === "dashboard") {
    return (
      <IntelligenceDashboard
        session={ariiaSession}
        onNavigate={setActiveSection}
        systemStatus={systemStatus}
      />
    );
  }

  if (activeSection === "cases") {
    return (
      <CaseManagement session={ariiaSession} onNavigate={setActiveSection} />
    );
  }

  if (activeSection === "evidence") {
    return (
      <EvidenceVault session={ariiaSession} onNavigate={setActiveSection} />
    );
  }

  if (activeSection === "timeline") {
    return (
      <TimelineBuilder session={ariiaSession} onNavigate={setActiveSection} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveSection("home")}
                className="text-2xl font-bold text-white hover:text-purple-300 transition-colors"
              >
                ARIIA
              </button>
              <div className="text-sm text-purple-300">
                Intelligence OS v1.0.0-JDR-ROTH-X1M
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  systemStatus === "online"
                    ? "bg-green-500/20 text-green-300"
                    : systemStatus === "degraded"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {systemStatus.toUpperCase()}
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => handleNavigation("console")}
                className="text-white hover:text-purple-300 transition-colors"
              >
                Console
              </button>
              <button
                onClick={() => handleNavigation("cases")}
                className="text-white hover:text-purple-300 transition-colors"
              >
                Cases
              </button>
              <button
                onClick={() => handleNavigation("evidence")}
                className="text-white hover:text-purple-300 transition-colors"
              >
                Evidence
              </button>
              <button
                onClick={() => handleNavigation("timeline")}
                className="text-white hover:text-purple-300 transition-colors"
              >
                Timeline
              </button>
            </div>
            <button
              onClick={handleAccessConsole}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {ariiaSession ? "Access Console" : "Authenticate"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dynamic Banner */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{ background: bannerContent[currentBanner].bg }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {bannerContent[currentBanner].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {bannerContent[currentBanner].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-purple-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => setActiveSection("documentation")}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Banner Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentBanner ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Sovereign Intelligence Features */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Sovereign Intelligence Architecture
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Zero-trust cryptographic verification, chain-of-custody tracking,
              and AI-powered analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Cryptographic Authentication */}
            <div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => handleNavigation("authentication")}
            >
              <div className="text-purple-400 text-3xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">
                Officer Authentication
              </h3>
              <p className="text-gray-300 mb-4 text-sm">
                RSA/Ed25519 dual-key cryptographic verification with badge
                validation
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div>✓ Dual-key verification</div>
                <div>✓ Badge number validation</div>
                <div>✓ Session management</div>
              </div>
            </div>

            {/* Case Management */}
            <div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => handleNavigation("cases")}
            >
              <div className="text-purple-400 text-3xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-white mb-3">
                Case Intelligence
              </h3>
              <p className="text-gray-300 mb-4 text-sm">
                Sovereign case creation with classification and officer
                assignment
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div>✓ Classification levels</div>
                <div>✓ Officer assignment</div>
                <div>✓ Priority management</div>
              </div>
            </div>

            {/* Evidence Vault */}
            <div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => handleNavigation("evidence")}
            >
              <div className="text-purple-400 text-3xl mb-4">🗄️</div>
              <h3 className="text-xl font-bold text-white mb-3">
                Evidence Vault
              </h3>
              <p className="text-gray-300 mb-4 text-sm">
                SHA-256 integrity verification with chain-of-custody tracking
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div>✓ Hash verification</div>
                <div>✓ Chain of custody</div>
                <div>✓ Geo-location tracking</div>
              </div>
            </div>

            {/* Timeline Builder */}
            <div
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => handleNavigation("timeline")}
            >
              <div className="text-purple-400 text-3xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-white mb-3">AI Timeline</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Automated event correlation with confidence scoring
              </p>
              <div className="space-y-1 text-xs text-gray-400">
                <div>✓ Event correlation</div>
                <div>✓ Confidence scoring</div>
                <div>✓ Pattern recognition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARIIA Command Interface */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                ARIIA Command Interface
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Voice-activated intelligence processing with real-time audit
                logging and cryptographic verification.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-2 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      Cryptographic Verification
                    </h4>
                    <p className="text-gray-400">
                      Every action verified with officer credentials and logged
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-2 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      Real-time Intelligence
                    </h4>
                    <p className="text-gray-400">
                      AI-powered alerts and pattern recognition
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-600 rounded-full p-2 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Audit Trail</h4>
                    <p className="text-gray-400">
                      Complete forensic audit trail for all operations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  ARIIA Command Terminal
                </h3>
                <p className="text-gray-300 mb-6">
                  Sovereign intelligence operations
                </p>
                <div className="bg-black/40 rounded-lg p-4 text-left">
                  <div className="text-green-400 font-mono text-sm">
                    {`> ARIIA authenticate_officer`}
                    <br />
                    {`> ARIIA create_case --priority=1`}
                    <br />
                    {`> ARIIA upload_evidence --verify`}
                    <br />
                    {`> ARIIA build_timeline --ai`}
                    <br />
                    {`> ARIIA generate_brief --classified`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Statistics */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sovereign Intelligence Metrics
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Zero-compromise security with military-grade cryptographic
            verification
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                SHA-256
              </div>
              <div className="text-gray-300">Integrity Verification</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                RSA+Ed25519
              </div>
              <div className="text-gray-300">Dual-Key Authentication</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                100%
              </div>
              <div className="text-gray-300">Audit Trail Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                Real-time
              </div>
              <div className="text-gray-300">Intelligence Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">ARIIA</div>
              <p className="text-gray-400">
                Sovereign Intelligence OS - JDR Roth x1M Edition
              </p>
              <div className="text-xs text-gray-500 mt-2">
                v1.0.0-JDR-ROTH-X1M
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Intelligence</h4>
              <div className="space-y-2 text-gray-400">
                <div>Officer Authentication</div>
                <div>Case Management</div>
                <div>Evidence Vault</div>
                <div>Timeline Builder</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Security</h4>
              <div className="space-y-2 text-gray-400">
                <div>Cryptographic Verification</div>
                <div>Chain of Custody</div>
                <div>Audit Logging</div>
                <div>Integrity Checking</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Command</h4>
              <div className="space-y-2 text-gray-400">
                <div>Terminal Interface</div>
                <div>Voice Commands</div>
                <div>Script Integration</div>
                <div>API Access</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ARIIA Intelligence OS. Sovereign-grade security.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Officer Authentication Component
function OfficerAuthentication({ onAuthenticated }) {
  const [badgeNumber, setBadgeNumber] = React.useState("");
  const [credentialHash, setCredentialHash] = React.useState("");
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleAuthenticate = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError("");

    try {
      const response = await fetch("/api/ariia-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "authenticate_officer",
          data: { badge_number: badgeNumber, credential_hash: credentialHash },
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        onAuthenticated(result);
      } else {
        setError(result.message || "Authentication failed");
      }
    } catch (err) {
      setError("System error during authentication");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Officer Authentication
          </h2>
          <p className="text-gray-300">Cryptographic verification required</p>
        </div>

        <form onSubmit={handleAuthenticate} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              Badge Number
            </label>
            <input
              type="text"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
              placeholder="Enter badge number"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Credential Hash
            </label>
            <input
              type="password"
              value={credentialHash}
              onChange={(e) => setCredentialHash(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
              placeholder="Enter credential hash"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {isAuthenticating ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Demo credentials:</p>
          <p>Badge: ADMIN-001</p>
          <p>Hash: {`${Array(64).fill("0").join("")}`}</p>
        </div>
      </div>
    </div>
  );
}

// Intelligence Dashboard Component
function IntelligenceDashboard({ session, onNavigate, systemStatus }) {
  const [stats, setStats] = React.useState({
    activeCases: 0,
    evidenceItems: 0,
    alerts: 0,
    officers: 0,
  });

  React.useEffect(() => {
    // Simulate loading dashboard stats
    setStats({
      activeCases: 12,
      evidenceItems: 847,
      alerts: 3,
      officers: 8,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Intelligence Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome back, {session.officer.full_name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                systemStatus === "online"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-red-500/20 text-red-300"
              }`}
            >
              System {systemStatus}
            </div>
            <button
              onClick={() => onNavigate("home")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Exit Console
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-purple-400 text-2xl mb-2">📋</div>
            <div className="text-3xl font-bold text-white">
              {stats.activeCases}
            </div>
            <div className="text-gray-300">Active Cases</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-purple-400 text-2xl mb-2">🗄️</div>
            <div className="text-3xl font-bold text-white">
              {stats.evidenceItems}
            </div>
            <div className="text-gray-300">Evidence Items</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-purple-400 text-2xl mb-2">🚨</div>
            <div className="text-3xl font-bold text-white">{stats.alerts}</div>
            <div className="text-gray-300">Active Alerts</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-purple-400 text-2xl mb-2">👮</div>
            <div className="text-3xl font-bold text-white">
              {stats.officers}
            </div>
            <div className="text-gray-300">Active Officers</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate("cases")}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors text-left"
          >
            <div className="text-purple-400 text-3xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Case Management
            </h3>
            <p className="text-gray-300">
              Create and manage investigation cases
            </p>
          </button>

          <button
            onClick={() => onNavigate("evidence")}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors text-left"
          >
            <div className="text-purple-400 text-3xl mb-4">🗄️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Evidence Vault
            </h3>
            <p className="text-gray-300">
              Upload and verify evidence integrity
            </p>
          </button>

          <button
            onClick={() => onNavigate("timeline")}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors text-left"
          >
            <div className="text-purple-400 text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Timeline Builder
            </h3>
            <p className="text-gray-300">Construct event timelines with AI</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other sections
function OnboardingFlow({ onComplete }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Officer Onboarding
        </h2>
        <p className="text-gray-300 mb-6">Complete your profile setup</p>
        <button
          onClick={() =>
            onComplete({ name: "Demo Officer", role: "Investigator" })
          }
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}

function CaseManagement({ session, onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-4">Case Management</h2>
        <p className="text-gray-300 mb-6">
          Manage investigation cases and assignments
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function EvidenceVault({ session, onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-4">Evidence Vault</h2>
        <p className="text-gray-300 mb-6">
          Secure evidence storage with integrity verification
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function TimelineBuilder({ session, onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-4">Timeline Builder</h2>
        <p className="text-gray-300 mb-6">
          AI-powered event correlation and timeline construction
        </p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default MainComponent;