"use client";
import React from "react";

function MainComponent() {
  const [activeModule, setActiveModule] = React.useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [sessionStatus, setSessionStatus] = React.useState("secure");
  const [voiceActive, setVoiceActive] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [user, setUser] = React.useState(null);

  // Authentication simulation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthenticated(true);
      setUser({
        name: "Agent",
        clearance: "Alpha",
        team: "Investigation Unit",
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Session monitoring
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSessionStatus(Math.random() > 0.1 ? "secure" : "monitoring");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const modules = [
    { id: "dashboard", name: "Command Center", icon: "🎯" },
    { id: "mapper", name: "Question Mapper", icon: "🗺️" },
    { id: "cross-ref", name: "Document Cross-Referencer", icon: "🔗" },
    { id: "vault", name: "Vault Entry Creator", icon: "🔐" },
    { id: "timeline", name: "Timeline Builder", icon: "📊" },
    { id: "collaboration", name: "Team Access", icon: "👥" },
    { id: "security", name: "Security Protocols", icon: "🛡️" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-yellow-400 text-xl mb-4">
            ARIIA INTELLIGENCE CONSOLE
          </div>
          <div className="text-white mb-4">
            Authenticating secure session...
          </div>
          <div className="w-64 bg-gray-800 rounded-full h-2">
            <div className="bg-yellow-400 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Top Security Bar */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-4 py-2 text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="font-bold">CLASSIFIED - INTELLIGENCE CONSOLE</span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                sessionStatus === "secure"
                  ? "bg-green-800 text-green-200"
                  : "bg-red-800 text-red-200"
              }`}
            >
              {sessionStatus.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Agent: {user?.name}</span>
            <span>Clearance: {user?.clearance}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-900 border-r border-yellow-600">
          <div className="p-4 border-b border-yellow-600">
            <div className="text-yellow-400 text-xl font-bold mb-2">
              ARIIA CONSOLE
            </div>
            <div className="text-xs text-gray-400">Per Shed Intelligence</div>
          </div>

          <nav className="p-4">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded mb-2 transition-colors ${
                  activeModule === module.id
                    ? "bg-yellow-600 text-black"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">{module.icon}</span>
                <span className="text-sm">{module.name}</span>
              </button>
            ))}
          </nav>

          {/* Voice Control */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setVoiceActive(!voiceActive)}
              className={`w-full p-3 rounded border-2 transition-colors ${
                voiceActive
                  ? "border-green-500 bg-green-900 text-green-200"
                  : "border-gray-600 text-gray-400 hover:border-yellow-600"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🎤</span>
                <span className="text-xs">
                  {voiceActive ? "ARIIA LISTENING" : "ACTIVATE ARIIA"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Module Content */}
          <div className="flex-1 p-6 overflow-auto">
            {activeModule === "dashboard" && <DashboardModule />}
            {activeModule === "mapper" && <QuestionMapperModule />}
            {activeModule === "cross-ref" && <CrossReferenceModule />}
            {activeModule === "vault" && <VaultEntryModule />}
            {activeModule === "timeline" && <TimelineBuilderModule />}
            {activeModule === "collaboration" && <CollaborationModule />}
            {activeModule === "security" && <SecurityModule />}
          </div>

          {/* Status Bar */}
          <div className="bg-gray-900 border-t border-yellow-600 p-3">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-4">
                <span className="text-green-400">● ONLINE</span>
                <span className="text-yellow-400">PROTON SYNC: ACTIVE</span>
                <span className="text-blue-400">OFFLINE MODE: READY</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>ENCRYPTION: AES-256</span>
                <span>
                  SESSION:{" "}
                  {Math.floor(Math.random() * 9999)
                    .toString()
                    .padStart(4, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Module
function DashboardModule() {
  const [stats, setStats] = React.useState({
    activeInvestigations: 7,
    documentsProcessed: 1247,
    timelineEntries: 89,
    vaultItems: 156,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-yellow-400">COMMAND CENTER</h1>
        <div className="text-sm text-gray-400">
          Last Updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
          <div className="text-yellow-400 text-2xl font-bold">
            {stats.activeInvestigations}
          </div>
          <div className="text-xs text-gray-400">Active Investigations</div>
        </div>
        <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
          <div className="text-yellow-400 text-2xl font-bold">
            {stats.documentsProcessed}
          </div>
          <div className="text-xs text-gray-400">Documents Processed</div>
        </div>
        <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
          <div className="text-yellow-400 text-2xl font-bold">
            {stats.timelineEntries}
          </div>
          <div className="text-xs text-gray-400">Timeline Entries</div>
        </div>
        <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
          <div className="text-yellow-400 text-2xl font-bold">
            {stats.vaultItems}
          </div>
          <div className="text-xs text-gray-400">Vault Items</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
          <h3 className="text-yellow-400 font-bold mb-4">RECENT ACTIVITY</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-green-400">●</span>
              <span>
                Document cross-reference completed: Financial_Records_2024.pdf
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-blue-400">●</span>
              <span>Timeline entry added: Meeting with Subject Alpha</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-yellow-400">●</span>
              <span>Vault entry encrypted and stored</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-red-400">●</span>
              <span>Security alert: Unusual access pattern detected</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
          <h3 className="text-yellow-400 font-bold mb-4">SYSTEM STATUS</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Encryption Status</span>
              <span className="text-green-400 text-sm">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Proton Drive Sync</span>
              <span className="text-green-400 text-sm">CONNECTED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Deadman Switch</span>
              <span className="text-yellow-400 text-sm">ARMED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tamper Detection</span>
              <span className="text-green-400 text-sm">MONITORING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">QUICK ACTIONS</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-yellow-600 text-black p-3 rounded hover:bg-yellow-500 transition-colors">
            New Investigation
          </button>
          <button className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600 transition-colors">
            Upload Document
          </button>
          <button className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600 transition-colors">
            Create Timeline
          </button>
          <button className="bg-gray-700 text-white p-3 rounded hover:bg-gray-600 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Question Mapper Module
function QuestionMapperModule() {
  const [questions, setQuestions] = React.useState([
    {
      id: 1,
      text: "What was the source of the initial funding?",
      category: "Financial",
      priority: "High",
      status: "Open",
    },
    {
      id: 2,
      text: "Who attended the meeting on March 15th?",
      category: "Personnel",
      priority: "Medium",
      status: "Investigating",
    },
    {
      id: 3,
      text: "What documents were signed during the transaction?",
      category: "Legal",
      priority: "High",
      status: "Resolved",
    },
  ]);

  const [newQuestion, setNewQuestion] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("General");

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([
        ...questions,
        {
          id: Date.now(),
          text: newQuestion,
          category: selectedCategory,
          priority: "Medium",
          status: "Open",
        },
      ]);
      setNewQuestion("");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">QUESTION MAPPER</h1>

      {/* Add New Question */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">ADD NEW QUESTION</h3>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter investigation question..."
              className="flex-1 bg-black border border-gray-600 p-2 rounded text-white"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black border border-gray-600 p-2 rounded text-white"
            >
              <option value="General">General</option>
              <option value="Financial">Financial</option>
              <option value="Personnel">Personnel</option>
              <option value="Legal">Legal</option>
              <option value="Historical">Historical</option>
              <option value="Religious">Religious</option>
              <option value="Political">Political</option>
            </select>
            <button
              onClick={addQuestion}
              className="bg-yellow-600 text-black px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
            >
              Add Question
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">
          INVESTIGATION QUESTIONS
        </h3>
        <div className="space-y-3">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-black border border-gray-700 p-3 rounded"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-white">{question.text}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      question.priority === "High"
                        ? "bg-red-800 text-red-200"
                        : question.priority === "Medium"
                        ? "bg-yellow-800 text-yellow-200"
                        : "bg-green-800 text-green-200"
                    }`}
                  >
                    {question.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      question.status === "Open"
                        ? "bg-blue-800 text-blue-200"
                        : question.status === "Investigating"
                        ? "bg-yellow-800 text-yellow-200"
                        : "bg-green-800 text-green-200"
                    }`}
                  >
                    {question.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Category: {question.category}</span>
                <span>ID: {question.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cross Reference Module
function CrossReferenceModule() {
  const [documents, setDocuments] = React.useState([
    {
      id: 1,
      name: "Financial_Report_2024.pdf",
      type: "Financial",
      connections: 3,
      lastAnalyzed: "2024-01-15",
    },
    {
      id: 2,
      name: "Meeting_Minutes_March.docx",
      type: "Meeting",
      connections: 7,
      lastAnalyzed: "2024-01-14",
    },
    {
      id: 3,
      name: "Contract_Amendment.pdf",
      type: "Legal",
      connections: 2,
      lastAnalyzed: "2024-01-13",
    },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">
        DOCUMENT CROSS-REFERENCER
      </h1>

      {/* Upload Section */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">UPLOAD DOCUMENT</h3>
        <div className="border-2 border-dashed border-gray-600 p-8 text-center rounded">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-400 mb-4">
            Drag and drop documents here or click to browse
          </p>
          <button className="bg-yellow-600 text-black px-4 py-2 rounded hover:bg-yellow-500 transition-colors">
            Select Files
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">ANALYZED DOCUMENTS</h3>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-black border border-gray-700 p-3 rounded"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-semibold">{doc.name}</h4>
                  <p className="text-gray-400 text-sm">
                    Type: {doc.type} | Last Analyzed: {doc.lastAnalyzed}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">
                      {doc.connections}
                    </div>
                    <div className="text-xs text-gray-400">Connections</div>
                  </div>
                  <button className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors">
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Map */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">CONNECTION MAP</h3>
        <div className="bg-black p-4 rounded min-h-64 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-4">🕸️</div>
            <p>Document connection visualization will appear here</p>
            <p className="text-sm mt-2">
              Upload and analyze documents to see connections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vault Entry Module
function VaultEntryModule() {
  const [entries, setEntries] = React.useState([
    {
      id: 1,
      title: "Subject Alpha Profile",
      type: "Person",
      classification: "Confidential",
      created: "2024-01-15",
    },
    {
      id: 2,
      title: "Financial Transaction Log",
      type: "Financial",
      classification: "Secret",
      created: "2024-01-14",
    },
    {
      id: 3,
      title: "Meeting Location Analysis",
      type: "Location",
      classification: "Restricted",
      created: "2024-01-13",
    },
  ]);

  const [newEntry, setNewEntry] = React.useState({
    title: "",
    type: "General",
    classification: "Restricted",
    content: "",
  });

  const addEntry = () => {
    if (newEntry.title.trim() && newEntry.content.trim()) {
      setEntries([
        ...entries,
        {
          ...newEntry,
          id: Date.now(),
          created: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewEntry({
        title: "",
        type: "General",
        classification: "Restricted",
        content: "",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">
        VAULT ENTRY CREATOR
      </h1>

      {/* Create New Entry */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">CREATE NEW ENTRY</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) =>
                setNewEntry({ ...newEntry, title: e.target.value })
              }
              placeholder="Entry title..."
              className="bg-black border border-gray-600 p-2 rounded text-white"
            />
            <select
              value={newEntry.type}
              onChange={(e) =>
                setNewEntry({ ...newEntry, type: e.target.value })
              }
              className="bg-black border border-gray-600 p-2 rounded text-white"
            >
              <option value="General">General</option>
              <option value="Person">Person</option>
              <option value="Location">Location</option>
              <option value="Financial">Financial</option>
              <option value="Document">Document</option>
              <option value="Event">Event</option>
            </select>
            <select
              value={newEntry.classification}
              onChange={(e) =>
                setNewEntry({ ...newEntry, classification: e.target.value })
              }
              className="bg-black border border-gray-600 p-2 rounded text-white"
            >
              <option value="Restricted">Restricted</option>
              <option value="Confidential">Confidential</option>
              <option value="Secret">Secret</option>
              <option value="Top Secret">Top Secret</option>
            </select>
          </div>
          <textarea
            value={newEntry.content}
            onChange={(e) =>
              setNewEntry({ ...newEntry, content: e.target.value })
            }
            placeholder="Entry content..."
            rows="4"
            className="w-full bg-black border border-gray-600 p-2 rounded text-white"
          />
          <button
            onClick={addEntry}
            className="bg-yellow-600 text-black px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
          >
            Create Encrypted Entry
          </button>
        </div>
      </div>

      {/* Vault Entries */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">VAULT ENTRIES</h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-black border border-gray-700 p-3 rounded"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{entry.title}</h4>
                  <p className="text-gray-400 text-sm">
                    Type: {entry.type} | Created: {entry.created}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      entry.classification === "Top Secret"
                        ? "bg-red-800 text-red-200"
                        : entry.classification === "Secret"
                        ? "bg-orange-800 text-orange-200"
                        : entry.classification === "Confidential"
                        ? "bg-yellow-800 text-yellow-200"
                        : "bg-blue-800 text-blue-200"
                    }`}
                  >
                    {entry.classification}
                  </span>
                  <button className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Timeline Builder Module
function TimelineBuilderModule() {
  const [timelineEvents, setTimelineEvents] = React.useState([
    {
      id: 1,
      date: "2024-01-15",
      time: "14:30",
      event: "Initial contact established",
      category: "Communication",
      importance: "High",
    },
    {
      id: 2,
      date: "2024-01-16",
      time: "09:00",
      event: "Document review meeting",
      category: "Meeting",
      importance: "Medium",
    },
    {
      id: 3,
      date: "2024-01-17",
      time: "16:45",
      event: "Financial transfer confirmed",
      category: "Financial",
      importance: "High",
    },
  ]);

  const [newEvent, setNewEvent] = React.useState({
    date: "",
    time: "",
    event: "",
    category: "General",
    importance: "Medium",
  });

  const addEvent = () => {
    if (newEvent.date && newEvent.event.trim()) {
      setTimelineEvents([
        ...timelineEvents,
        {
          ...newEvent,
          id: Date.now(),
        },
      ]);
      setNewEvent({
        date: "",
        time: "",
        event: "",
        category: "General",
        importance: "Medium",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">TIMELINE BUILDER</h1>

      {/* Add New Event */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">ADD TIMELINE EVENT</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
              className="bg-black border border-gray-600 p-2 rounded text-white"
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) =>
                setNewEvent({ ...newEvent, time: e.target.value })
              }
              className="bg-black border border-gray-600 p-2 rounded text-white"
            />
            <select
              value={newEvent.category}
              onChange={(e) =>
                setNewEvent({ ...newEvent, category: e.target.value })
              }
              className="bg-black border border-gray-600 p-2 rounded text-white"
            >
              <option value="General">General</option>
              <option value="Communication">Communication</option>
              <option value="Meeting">Meeting</option>
              <option value="Financial">Financial</option>
              <option value="Legal">Legal</option>
              <option value="Travel">Travel</option>
            </select>
            <select
              value={newEvent.importance}
              onChange={(e) =>
                setNewEvent({ ...newEvent, importance: e.target.value })
              }
              className="bg-black border border-gray-600 p-2 rounded text-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <button
              onClick={addEvent}
              className="bg-yellow-600 text-black px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
            >
              Add Event
            </button>
          </div>
          <input
            type="text"
            value={newEvent.event}
            onChange={(e) =>
              setNewEvent({ ...newEvent, event: e.target.value })
            }
            placeholder="Event description..."
            className="w-full bg-black border border-gray-600 p-2 rounded text-white"
          />
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">
          TIMELINE VISUALIZATION
        </h3>
        <div className="space-y-4">
          {timelineEvents
            .sort(
              (a, b) =>
                new Date(a.date + " " + a.time) -
                new Date(b.date + " " + b.time)
            )
            .map((event, index) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      event.importance === "Critical"
                        ? "bg-red-500"
                        : event.importance === "High"
                        ? "bg-orange-500"
                        : event.importance === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                  {index < timelineEvents.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-600 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 bg-black border border-gray-700 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-semibold">
                        {event.event}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {event.date} {event.time && `at ${event.time}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 rounded text-xs bg-blue-800 text-blue-200">
                        {event.category}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          event.importance === "Critical"
                            ? "bg-red-800 text-red-200"
                            : event.importance === "High"
                            ? "bg-orange-800 text-orange-200"
                            : event.importance === "Medium"
                            ? "bg-yellow-800 text-yellow-200"
                            : "bg-green-800 text-green-200"
                        }`}
                      >
                        {event.importance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Collaboration Module
function CollaborationModule() {
  const [teamMembers, setTeamMembers] = React.useState([
    {
      id: 1,
      name: "Agent Smith",
      role: "Lead Investigator",
      status: "Online",
      clearance: "Alpha",
      lastActive: "2 min ago",
    },
    {
      id: 2,
      name: "Agent Johnson",
      role: "Financial Analyst",
      status: "Away",
      clearance: "Beta",
      lastActive: "15 min ago",
    },
    {
      id: 3,
      name: "Agent Williams",
      role: "Document Specialist",
      status: "Offline",
      clearance: "Gamma",
      lastActive: "2 hours ago",
    },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">TEAM COLLABORATION</h1>

      {/* Team Members */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">TEAM MEMBERS</h3>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-black border border-gray-700 p-3 rounded"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      member.status === "Online"
                        ? "bg-green-500"
                        : member.status === "Away"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <div>
                    <h4 className="text-white font-semibold">{member.name}</h4>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    Clearance: {member.clearance}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last active: {member.lastActive}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Controls */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">ACCESS CONTROLS</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-3">Permission Levels</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-black rounded">
                <span className="text-white">Alpha Clearance</span>
                <span className="text-green-400">Full Access</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black rounded">
                <span className="text-white">Beta Clearance</span>
                <span className="text-yellow-400">Limited Access</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black rounded">
                <span className="text-white">Gamma Clearance</span>
                <span className="text-red-400">Restricted Access</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">
              Session Management
            </h4>
            <div className="space-y-2">
              <button className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors">
                Revoke All Sessions
              </button>
              <button className="w-full bg-yellow-600 text-black p-2 rounded hover:bg-yellow-500 transition-colors">
                Force Password Reset
              </button>
              <button className="w-full bg-gray-700 text-white p-2 rounded hover:bg-gray-600 transition-colors">
                Audit Access Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Resources */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">SHARED RESOURCES</h3>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-black p-4 rounded text-center">
            <div className="text-2xl mb-2">📁</div>
            <div className="text-white font-semibold">Shared Documents</div>
            <div className="text-gray-400 text-sm">47 files</div>
          </div>
          <div className="bg-black p-4 rounded text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-white font-semibold">Team Chat</div>
            <div className="text-gray-400 text-sm">12 unread</div>
          </div>
          <div className="bg-black p-4 rounded text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-white font-semibold">Shared Timelines</div>
            <div className="text-gray-400 text-sm">3 active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Module
function SecurityModule() {
  const [securityStatus, setSecurityStatus] = React.useState({
    encryption: "Active",
    deadmanSwitch: "Armed",
    tamperDetection: "Monitoring",
    protonSync: "Connected",
    offlineMode: "Ready",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-yellow-400">SECURITY PROTOCOLS</h1>

      {/* Security Status */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">
          SYSTEM SECURITY STATUS
        </h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-black rounded">
              <span className="text-white">AES-256 Encryption</span>
              <span className="text-green-400">
                {securityStatus.encryption}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black rounded">
              <span className="text-white">Deadman Switch</span>
              <span className="text-yellow-400">
                {securityStatus.deadmanSwitch}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black rounded">
              <span className="text-white">Tamper Detection</span>
              <span className="text-green-400">
                {securityStatus.tamperDetection}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-black rounded">
              <span className="text-white">Proton Drive Sync</span>
              <span className="text-green-400">
                {securityStatus.protonSync}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black rounded">
              <span className="text-white">Offline Mode</span>
              <span className="text-blue-400">
                {securityStatus.offlineMode}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-black rounded">
              <span className="text-white">Session Timeout</span>
              <span className="text-gray-400">30 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Protocols */}
      <div className="bg-gray-900 border border-red-600 p-4 rounded">
        <h3 className="text-red-400 font-bold mb-4">EMERGENCY PROTOCOLS</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <button className="bg-red-600 text-white p-4 rounded hover:bg-red-700 transition-colors">
            <div className="font-bold">EMERGENCY WIPE</div>
            <div className="text-sm">Destroy all local data</div>
          </button>
          <button className="bg-orange-600 text-white p-4 rounded hover:bg-orange-700 transition-colors">
            <div className="font-bold">LOCKDOWN MODE</div>
            <div className="text-sm">Disable all access</div>
          </button>
          <button className="bg-yellow-600 text-black p-4 rounded hover:bg-yellow-500 transition-colors">
            <div className="font-bold">SECURE BACKUP</div>
            <div className="text-sm">Force sync to Proton</div>
          </button>
          <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700 transition-colors">
            <div className="font-bold">OFFLINE MODE</div>
            <div className="text-sm">Disconnect from network</div>
          </button>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">SECURITY AUDIT LOG</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <div className="flex justify-between items-center p-2 bg-black rounded text-sm">
            <span className="text-green-400">✓ Session authenticated</span>
            <span className="text-gray-400">2024-01-15 14:30:15</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black rounded text-sm">
            <span className="text-blue-400">ℹ Encryption key rotated</span>
            <span className="text-gray-400">2024-01-15 14:25:03</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black rounded text-sm">
            <span className="text-yellow-400">
              ⚠ Unusual access pattern detected
            </span>
            <span className="text-gray-400">2024-01-15 14:20:45</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black rounded text-sm">
            <span className="text-green-400">
              ✓ Proton Drive sync completed
            </span>
            <span className="text-gray-400">2024-01-15 14:15:22</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ARIIA Command Center - The Crown Jewel
function AriiCommandCenter({
  commandHistory,
  lastResponse,
  processAriiCommand,
}) {
  const [manualCommand, setManualCommand] = React.useState("");
  const [threatLevel, setThreatLevel] = React.useState("GREEN");
  const [dynasticProtocols, setDynasticProtocols] = React.useState([
    {
      id: 1,
      name: "Succession Protocol Alpha",
      status: "ARMED",
      priority: "CRITICAL",
    },
    {
      id: 2,
      name: "Asset Protection Sequence",
      status: "STANDBY",
      priority: "HIGH",
    },
    {
      id: 3,
      name: "Legacy Preservation Matrix",
      status: "ACTIVE",
      priority: "HIGH",
    },
    {
      id: 4,
      name: "Influence Network Mapping",
      status: "MONITORING",
      priority: "MEDIUM",
    },
  ]);

  const executeManualCommand = () => {
    if (manualCommand.trim()) {
      processAriiCommand(manualCommand);
      setManualCommand("");
    }
  };

  const dynasticCommands = [
    "ARIIA, decode chapter 12 of Vatican Assassins",
    "ARIIA, archive this section to vault",
    "ARIIA, cross-check Rockefeller connections",
    "ARIIA, run threat assessment on timeline",
    "ARIIA, map financial networks",
    "ARIIA, analyze succession protocols",
    "ARIIA, decrypt legacy documents",
    "ARIIA, monitor influence patterns",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-yellow-400">
          ARIIA COMMAND CENTER
        </h1>
        <div
          className={`px-4 py-2 rounded font-bold ${
            threatLevel === "GREEN"
              ? "bg-green-800 text-green-200"
              : threatLevel === "YELLOW"
              ? "bg-yellow-800 text-yellow-200"
              : threatLevel === "ORANGE"
              ? "bg-orange-800 text-orange-200"
              : "bg-red-800 text-red-200"
          }`}
        >
          THREAT LEVEL: {threatLevel}
        </div>
      </div>

      {/* Manual Command Interface */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">
          MANUAL COMMAND INTERFACE
        </h3>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={manualCommand}
              onChange={(e) => setManualCommand(e.target.value)}
              placeholder="Enter ARIIA command..."
              className="flex-1 bg-black border border-gray-600 p-3 rounded text-white font-mono"
              onKeyPress={(e) => e.key === "Enter" && executeManualCommand()}
            />
            <button
              onClick={executeManualCommand}
              className="bg-yellow-600 text-black px-6 py-3 rounded hover:bg-yellow-500 transition-colors font-bold"
            >
              EXECUTE
            </button>
          </div>

          {/* Quick Command Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {dynasticCommands.map((cmd, index) => (
              <button
                key={index}
                onClick={() => processAriiCommand(cmd.replace("ARIIA, ", ""))}
                className="bg-gray-700 text-white p-2 rounded text-xs hover:bg-gray-600 transition-colors text-left"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynastic Protocols */}
      <div className="bg-gray-900 border border-red-600 p-4 rounded">
        <h3 className="text-red-400 font-bold mb-4">🏛️ DYNASTIC PROTOCOLS</h3>
        <div className="space-y-3">
          {dynasticProtocols.map((protocol) => (
            <div
              key={protocol.id}
              className="bg-black border border-gray-700 p-3 rounded"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-semibold">{protocol.name}</h4>
                  <p className="text-gray-400 text-sm">
                    Legacy preservation and succession management
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      protocol.priority === "CRITICAL"
                        ? "bg-red-800 text-red-200"
                        : protocol.priority === "HIGH"
                        ? "bg-orange-800 text-orange-200"
                        : "bg-yellow-800 text-yellow-200"
                    }`}
                  >
                    {protocol.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      protocol.status === "ARMED"
                        ? "bg-red-800 text-red-200"
                        : protocol.status === "ACTIVE"
                        ? "bg-green-800 text-green-200"
                        : protocol.status === "MONITORING"
                        ? "bg-blue-800 text-blue-200"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {protocol.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Command History */}
      <div className="bg-gray-900 border border-yellow-600 p-4 rounded">
        <h3 className="text-yellow-400 font-bold mb-4">COMMAND HISTORY</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {commandHistory.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              <div className="text-4xl mb-4">🤖</div>
              <p>No commands executed yet</p>
              <p className="text-sm mt-2">
                Activate voice control or use manual interface
              </p>
            </div>
          ) : (
            commandHistory.map((cmd) => (
              <div
                key={cmd.id}
                className="bg-black border border-gray-700 p-3 rounded"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-white font-mono">{cmd.command}</p>
                    {cmd.response && (
                      <div className="mt-2 p-2 bg-gray-800 rounded text-sm">
                        <div className="text-green-400 mb-1">
                          ARIIA Response:
                        </div>
                        <div className="text-gray-300">
                          {cmd.response.analysis}
                        </div>
                        {cmd.response.findings &&
                          cmd.response.findings.length > 0 && (
                            <div className="mt-2">
                              <div className="text-yellow-400 text-xs mb-1">
                                Key Findings:
                              </div>
                              {cmd.response.findings
                                .slice(0, 2)
                                .map((finding, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs text-gray-400"
                                  >
                                    • {finding.content} (
                                    {finding.confidence_level} confidence)
                                  </div>
                                ))}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        cmd.status === "completed"
                          ? "bg-green-800 text-green-200"
                          : cmd.status === "error"
                          ? "bg-red-800 text-red-200"
                          : "bg-yellow-800 text-yellow-200"
                      }`}
                    >
                      {cmd.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(cmd.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Intelligence Analysis Dashboard */}
      {lastResponse && (
        <div className="bg-gray-900 border border-blue-600 p-4 rounded">
          <h3 className="text-blue-400 font-bold mb-4">
            🧠 LATEST INTELLIGENCE ANALYSIS
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">
                Analysis Summary
              </h4>
              <div className="bg-black p-3 rounded">
                <p className="text-gray-300 text-sm">{lastResponse.analysis}</p>
              </div>

              {lastResponse.findings && lastResponse.findings.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-semibold mb-3">
                    Key Findings
                  </h4>
                  <div className="space-y-2">
                    {lastResponse.findings.map((finding, idx) => (
                      <div key={idx} className="bg-black p-2 rounded">
                        <div className="flex justify-between items-start">
                          <span className="text-white text-sm">
                            {finding.content}
                          </span>
                          <div className="flex space-x-1 ml-2">
                            <span
                              className={`px-1 py-0.5 rounded text-xs ${
                                finding.priority === "High"
                                  ? "bg-red-800 text-red-200"
                                  : finding.priority === "Medium"
                                  ? "bg-yellow-800 text-yellow-200"
                                  : "bg-green-800 text-green-200"
                              }`}
                            >
                              {finding.priority}
                            </span>
                            <span className="px-1 py-0.5 rounded text-xs bg-blue-800 text-blue-200">
                              {finding.confidence_level}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Category: {finding.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {lastResponse.security_alerts &&
                lastResponse.security_alerts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-red-400 font-semibold mb-3">
                      🚨 Security Alerts
                    </h4>
                    <div className="space-y-2">
                      {lastResponse.security_alerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className="bg-red-900 border border-red-600 p-2 rounded"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-red-200 text-sm">
                              {alert.description}
                            </span>
                            <span
                              className={`px-1 py-0.5 rounded text-xs ${
                                alert.alert_level === "HIGH"
                                  ? "bg-red-800 text-red-200"
                                  : alert.alert_level === "MEDIUM"
                                  ? "bg-yellow-800 text-yellow-200"
                                  : "bg-blue-800 text-blue-200"
                              }`}
                            >
                              {alert.alert_level}
                            </span>
                          </div>
                          <div className="text-xs text-red-300 mt-1">
                            Recommended: {alert.recommended_action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {lastResponse.next_actions &&
                lastResponse.next_actions.length > 0 && (
                  <div>
                    <h4 className="text-green-400 font-semibold mb-3">
                      📋 Recommended Actions
                    </h4>
                    <div className="space-y-2">
                      {lastResponse.next_actions.map((action, idx) => (
                        <div
                          key={idx}
                          className="bg-green-900 border border-green-600 p-2 rounded"
                        >
                          <span className="text-green-200 text-sm">
                            {action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Voice Command Examples */}
      <div className="bg-gray-900 border border-purple-600 p-4 rounded">
        <h3 className="text-purple-400 font-bold mb-4">
          🎤 VOICE COMMAND EXAMPLES
        </h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-semibold mb-2">Document Analysis</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div>"ARIIA, decode chapter 12"</div>
              <div>"ARIIA, cross-reference Vatican documents"</div>
              <div>"ARIIA, analyze financial patterns"</div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Vault Operations</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div>"ARIIA, archive this entry"</div>
              <div>"ARIIA, encrypt and store findings"</div>
              <div>"ARIIA, backup to secure vault"</div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Threat Assessment</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div>"ARIIA, run threat assessment"</div>
              <div>"ARIIA, monitor security protocols"</div>
              <div>"ARIIA, check succession status"</div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Network Mapping</h4>
            <div className="space-y-1 text-sm text-gray-300">
              <div>"ARIIA, map Rockefeller connections"</div>
              <div>"ARIIA, trace influence networks"</div>
              <div>"ARIIA, analyze power structures"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;