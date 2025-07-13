"use client";
import React from "react";

import {
  useUpload,
  useHandleStreamResponse,
} from "../utilities/runtime-helpers";

function MainComponent() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [officers, setOfficers] = useState([
    { id: 1, name: "Agent Smith", badge: "A001", status: "active" },
    { id: 2, name: "Agent Johnson", badge: "A002", status: "active" },
    { id: 3, name: "Agent Williams", badge: "A003", status: "active" },
  ]);
  const [newCase, setNewCase] = useState({
    title: "",
    classification: "unclassified",
    priority: "medium",
    assignedOfficer: "",
    description: "",
  });
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [briefing, setBriefing] = useState("");
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [upload, { loading: uploadLoading }] = useUpload();
  const [error, setError] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState("");

  const handleFinish = useCallback((message) => {
    setBriefing(message);
    setStreamingMessage("");
    setIsGeneratingBriefing(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });

  const generateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const createCase = useCallback(async () => {
    if (!newCase.title.trim()) {
      setError("Case title is required");
      return;
    }

    const caseData = {
      id: Date.now(),
      ...newCase,
      createdAt: new Date().toISOString(),
      status: "active",
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          action: "case_created",
          officer: "System",
          details: "Case created in system",
        },
      ],
    };

    setCases((prev) => [...prev, caseData]);
    setNewCase({
      title: "",
      classification: "unclassified",
      priority: "medium",
      assignedOfficer: "",
      description: "",
    });
    setShowNewCaseModal(false);
    setError(null);
  }, [newCase]);

  const uploadEvidence = useCallback(
    async (file, caseId) => {
      try {
        const hash = await generateSHA256(file);
        const { url, error: uploadError } = await upload({ file });

        if (uploadError) {
          setError(uploadError);
          return;
        }

        const evidenceItem = {
          id: Date.now(),
          caseId,
          filename: file.name,
          url,
          hash,
          uploadedAt: new Date().toISOString(),
          size: file.size,
          type: file.type,
          chainOfCustody: [
            {
              timestamp: new Date().toISOString(),
              action: "uploaded",
              officer: "Current User",
              location: "Digital Evidence Locker",
            },
          ],
        };

        setEvidence((prev) => [...prev, evidenceItem]);

        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: "evidence_uploaded",
          officer: "Current User",
          details: `Evidence uploaded: ${file.name} (SHA-256: ${hash})`,
        };

        setCases((prev) =>
          prev.map((c) =>
            c.id === caseId
              ? { ...c, auditLog: [...c.auditLog, auditEntry] }
              : c
          )
        );
      } catch (err) {
        setError("Failed to upload evidence: " + err.message);
      }
    },
    [upload]
  );

  const addTimelineEvent = useCallback((caseId, event) => {
    const timelineEvent = {
      id: Date.now(),
      caseId,
      timestamp: new Date().toISOString(),
      ...event,
    };

    setTimeline((prev) => [...prev, timelineEvent]);

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: "timeline_event_added",
      officer: "Current User",
      details: `Timeline event: ${event.title}`,
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, auditLog: [...c.auditLog, auditEntry] } : c
      )
    );
  }, []);

  const generateIntelligenceBriefing = useCallback(
    async (caseId) => {
      setIsGeneratingBriefing(true);
      setError(null);

      const caseData = cases.find((c) => c.id === caseId);
      const caseEvidence = evidence.filter((e) => e.caseId === caseId);
      const caseTimeline = timeline.filter((t) => t.caseId === caseId);

      const prompt = `Generate an intelligence briefing for the following case:

Case: ${caseData?.title}
Classification: ${caseData?.classification}
Priority: ${caseData?.priority}
Description: ${caseData?.description}

Evidence Files: ${caseEvidence.map((e) => e.filename).join(", ")}
Timeline Events: ${caseTimeline
        .map((t) => `${t.timestamp}: ${t.title}`)
        .join("\n")}

Please provide a comprehensive intelligence briefing including:
1. Case Summary
2. Key Evidence Analysis
3. Timeline Assessment
4. Risk Factors
5. Recommended Actions
6. Intelligence Gaps`;

      try {
        const response = await fetch(
          "/integrations/anthropic-claude-sonnet-3-5/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [{ role: "user", content: prompt }],
              stream: true,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        handleStreamResponse(response);
      } catch (err) {
        setError("Failed to generate briefing: " + err.message);
        setIsGeneratingBriefing(false);
      }
    },
    [cases, evidence, timeline, handleStreamResponse]
  );

  const caseEvidence = evidence.filter((e) => e.caseId === selectedCase?.id);
  const caseTimeline = timeline
    .filter((t) => t.caseId === selectedCase?.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="min-h-screen bg-gray-900 text-white font-roboto">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <i className="fas fa-shield-alt text-blue-400 text-2xl"></i>
            <h1 className="text-2xl font-bold">
              ARIIA Case Management Console
            </h1>
          </div>
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>New Case</span>
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Active Cases</h2>
            {cases.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <i className="fas fa-folder-open text-4xl mb-4"></i>
                <p>No cases found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((case_) => (
                  <div
                    key={case_.id}
                    onClick={() => setSelectedCase(case_)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedCase?.id === case_.id
                        ? "bg-blue-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold truncate">{case_.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          case_.priority === "high"
                            ? "bg-red-600"
                            : case_.priority === "medium"
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                      >
                        {case_.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>
                        Classification: {case_.classification.toUpperCase()}
                      </p>
                      <p>
                        Officer:{" "}
                        {officers.find(
                          (o) => o.id.toString() === case_.assignedOfficer
                        )?.name || "Unassigned"}
                      </p>
                      <p>
                        Created:{" "}
                        {new Date(case_.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedCase ? (
            <>
              <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedCase.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
                      <span>ID: {selectedCase.id}</span>
                      <span>Status: {selectedCase.status.toUpperCase()}</span>
                      <span>
                        Classification:{" "}
                        {selectedCase.classification.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      generateIntelligenceBriefing(selectedCase.id)
                    }
                    disabled={isGeneratingBriefing}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <i className="fas fa-brain"></i>
                    <span>
                      {isGeneratingBriefing ? "Generating..." : "AI Briefing"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-700 px-6 py-2">
                <div className="flex space-x-6">
                  {[
                    "overview",
                    "evidence",
                    "timeline",
                    "briefing",
                    "audit",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-4 rounded-t-lg capitalize ${
                        activeTab === tab
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Case Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Priority
                          </label>
                          <p className="text-white">
                            {selectedCase.priority.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Assigned Officer
                          </label>
                          <p className="text-white">
                            {officers.find(
                              (o) =>
                                o.id.toString() === selectedCase.assignedOfficer
                            )?.name || "Unassigned"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <p className="text-white">
                            {selectedCase.description ||
                              "No description provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-file-alt text-blue-400 text-2xl"></i>
                          <div>
                            <h4 className="font-semibold">Evidence Files</h4>
                            <p className="text-2xl font-bold">
                              {caseEvidence.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-clock text-green-400 text-2xl"></i>
                          <div>
                            <h4 className="font-semibold">Timeline Events</h4>
                            <p className="text-2xl font-bold">
                              {caseTimeline.length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-calendar text-purple-400 text-2xl"></i>
                          <div>
                            <h4 className="font-semibold">Days Active</h4>
                            <p className="text-2xl font-bold">
                              {Math.ceil(
                                (new Date() -
                                  new Date(selectedCase.createdAt)) /
                                  (1000 * 60 * 60 * 24)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "evidence" && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Upload Evidence
                      </h3>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          Array.from(e.target.files).forEach((file) => {
                            uploadEvidence(file, selectedCase.id);
                          });
                        }}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                      {uploadLoading && (
                        <p className="text-blue-400 mt-2">Uploading...</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {caseEvidence.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-800 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">{item.filename}</h4>
                            <span className="text-sm text-gray-400">
                              {new Date(item.uploadedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">
                                SHA-256 Hash:
                              </span>
                              <p className="font-mono text-xs break-all">
                                {item.hash}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">File Size:</span>
                              <p>{(item.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">
                              Chain of Custody
                            </h5>
                            {item.chainOfCustody.map((entry, idx) => (
                              <div key={idx} className="text-sm text-gray-300">
                                <span className="text-gray-400">
                                  {new Date(entry.timestamp).toLocaleString()}:
                                </span>{" "}
                                {entry.action} by {entry.officer}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Add Timeline Event
                      </h3>
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          placeholder="Event title"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              addTimelineEvent(selectedCase.id, {
                                title: e.target.value.trim(),
                              });
                              e.target.value = "";
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input =
                              e.target.parentElement.querySelector("input");
                            if (input.value.trim()) {
                              addTimelineEvent(selectedCase.id, {
                                title: input.value.trim(),
                              });
                              input.value = "";
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                        >
                          Add Event
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {caseTimeline.map((event) => (
                        <div
                          key={event.id}
                          className="bg-gray-800 rounded-lg p-6"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-gray-400">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "briefing" && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Intelligence Briefing
                        </h3>
                        <button
                          onClick={() =>
                            generateIntelligenceBriefing(selectedCase.id)
                          }
                          disabled={isGeneratingBriefing}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <i className="fas fa-sync-alt"></i>
                          <span>Regenerate</span>
                        </button>
                      </div>

                      {isGeneratingBriefing && (
                        <div className="text-blue-400 mb-4">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Generating intelligence briefing...
                        </div>
                      )}

                      <div className="bg-gray-900 rounded-lg p-4 min-h-[400px]">
                        <pre className="whitespace-pre-wrap text-sm text-gray-300">
                          {streamingMessage ||
                            briefing ||
                            'Click "AI Briefing" to generate an intelligence briefing for this case.'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Audit Log</h3>
                    {selectedCase.auditLog?.map((entry, idx) => (
                      <div key={idx} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {entry.action.replace("_", " ").toUpperCase()}
                            </span>
                            <p className="text-sm text-gray-400">
                              {entry.details}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <p>{entry.officer}</p>
                            <p>{new Date(entry.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-folder-open text-6xl mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">No Case Selected</h3>
                <p>
                  Select a case from the sidebar or create a new one to get
                  started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Case</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Case Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newCase.title}
                  onChange={(e) =>
                    setNewCase((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter case title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Classification
                </label>
                <select
                  name="classification"
                  value={newCase.classification}
                  onChange={(e) =>
                    setNewCase((prev) => ({
                      ...prev,
                      classification: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="unclassified">Unclassified</option>
                  <option value="confidential">Confidential</option>
                  <option value="secret">Secret</option>
                  <option value="top-secret">Top Secret</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={newCase.priority}
                  onChange={(e) =>
                    setNewCase((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Assigned Officer
                </label>
                <select
                  name="assignedOfficer"
                  value={newCase.assignedOfficer}
                  onChange={(e) =>
                    setNewCase((prev) => ({
                      ...prev,
                      assignedOfficer: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Select Officer</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} ({officer.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newCase.description}
                  onChange={(e) =>
                    setNewCase((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
                  placeholder="Enter case description"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                onClick={createCase}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
              >
                Create Case
              </button>
              <button
                onClick={() => {
                  setShowNewCaseModal(false);
                  setError(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainComponent;