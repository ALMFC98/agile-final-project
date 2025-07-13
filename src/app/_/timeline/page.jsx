"use client";
import React from "react";

import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineView, setTimelineView] = useState("chronological");
  const [filterCriteria, setFilterCriteria] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [streamingAnalysis, setStreamingAnalysis] = useState("");
  const [error, setError] = useState(null);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingAnalysis,
    onFinish: (message) => {
      setAnalysisResults(message);
      setStreamingAnalysis("");
      setIsAnalyzing(false);
    },
  });

  const addEvent = useCallback(() => {
    const newEvent = {
      id: Date.now(),
      title: "New Event",
      timestamp: new Date().toISOString(),
      description: "",
      confidence: 85,
      location: { lat: null, lng: null, address: "" },
      evidence: [],
      tags: [],
      connections: [],
    };
    setEvents((prev) => [...prev, newEvent]);
    setSelectedEvent(newEvent);
  }, []);

  const updateEvent = useCallback(
    (eventId, updates) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        )
      );
      if (selectedEvent?.id === eventId) {
        setSelectedEvent((prev) => ({ ...prev, ...updates }));
      }
    },
    [selectedEvent]
  );

  const deleteEvent = useCallback(
    (eventId) => {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
    },
    [selectedEvent]
  );

  const analyzeTimeline = useCallback(async () => {
    if (events.length === 0) {
      setError("No events to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(
        "/integrations/anthropic-claude-sonnet-3-5/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Analyze this timeline of events and provide insights on patterns, gaps, and correlations. Events: ${JSON.stringify(
                  events.map((e) => ({
                    title: e.title,
                    timestamp: e.timestamp,
                    description: e.description,
                    confidence: e.confidence,
                    location: e.location.address,
                    tags: e.tags,
                  }))
                )}`,
              },
            ],
            stream: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Analysis failed: ${response.status} ${response.statusText}`
        );
      }

      handleStreamResponse(response);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze timeline");
      setIsAnalyzing(false);
    }
  }, [events, handleStreamResponse]);

  const filteredEvents = events.filter((event) => {
    if (!filterCriteria) return event.confidence >= confidenceThreshold;
    const searchTerm = filterCriteria.toLowerCase();
    return (
      event.confidence >= confidenceThreshold &&
      (event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (timelineView === "chronological") {
      return new Date(a.timestamp) - new Date(b.timestamp);
    } else if (timelineView === "confidence") {
      return b.confidence - a.confidence;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4 text-blue-400">
                <i className="fas fa-timeline mr-2"></i>
                AI Timeline Builder
              </h1>

              <div className="space-y-4">
                <button
                  onClick={addEvent}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Event
                </button>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Timeline View
                  </label>
                  <select
                    value={timelineView}
                    onChange={(e) => setTimelineView(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="chronological">Chronological</option>
                    <option value="confidence">By Confidence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Filter Events
                  </label>
                  <input
                    type="text"
                    value={filterCriteria}
                    onChange={(e) => setFilterCriteria(e.target.value)}
                    placeholder="Search events..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confidence Threshold: {confidenceThreshold}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidenceThreshold}
                    onChange={(e) =>
                      setConfidenceThreshold(parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                <button
                  onClick={analyzeTimeline}
                  disabled={isAnalyzing || events.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="fas fa-brain mr-2"></i>
                  {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                </button>
              </div>
            </div>

            {selectedEvent && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedEvent.title}
                      onChange={(e) =>
                        updateEvent(selectedEvent.id, { title: e.target.value })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      value={selectedEvent.timestamp.slice(0, 16)}
                      onChange={(e) =>
                        updateEvent(selectedEvent.id, {
                          timestamp: e.target.value + ":00.000Z",
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedEvent.description}
                      onChange={(e) =>
                        updateEvent(selectedEvent.id, {
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confidence: {selectedEvent.confidence}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedEvent.confidence}
                      onChange={(e) =>
                        updateEvent(selectedEvent.id, {
                          confidence: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={selectedEvent.location.address}
                      onChange={(e) =>
                        updateEvent(selectedEvent.id, {
                          location: {
                            ...selectedEvent.location,
                            address: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter address or coordinates"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>

                  <button
                    onClick={() => deleteEvent(selectedEvent.id)}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Delete Event
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:w-2/3">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Timeline Visualization
                </h2>
                <div className="text-sm text-gray-400">
                  {sortedEvents.length} events displayed
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedEvents.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <i className="fas fa-timeline text-4xl mb-4"></i>
                    <p>No events match your criteria</p>
                    <p className="text-sm">Add events or adjust your filters</p>
                  </div>
                ) : (
                  sortedEvents.map((event, index) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`relative border-l-4 pl-6 pb-4 cursor-pointer transition-all ${
                        selectedEvent?.id === event.id
                          ? "border-blue-500 bg-blue-900/20"
                          : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                          {event.description && (
                            <p className="text-gray-300 mb-2">
                              {event.description}
                            </p>
                          )}
                          {event.location.address && (
                            <p className="text-sm text-gray-400 mb-2">
                              <i className="fas fa-map-marker-alt mr-1"></i>
                              {event.location.address}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end">
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              event.confidence >= 80
                                ? "bg-green-600"
                                : event.confidence >= 60
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                          >
                            {event.confidence}% confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {(analysisResults || streamingAnalysis || isAnalyzing) && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">
                  <i className="fas fa-brain mr-2"></i>
                  AI Timeline Analysis
                </h3>

                {isAnalyzing && (
                  <div className="flex items-center text-gray-400 mb-4">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Analyzing timeline patterns and correlations...
                  </div>
                )}

                <div className="bg-gray-900 rounded p-4 font-mono text-sm">
                  {streamingAnalysis && (
                    <div className="text-green-400 whitespace-pre-wrap">
                      {streamingAnalysis}
                      <span className="animate-pulse">|</span>
                    </div>
                  )}
                  {analysisResults && (
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {analysisResults}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2 text-red-400"></i>
                  <span className="text-red-200">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;