"use client";
import React from "react";

import {
  useUpload,
  useHandleStreamResponse,
} from "../utilities/runtime-helpers";

function MainComponent() {
  const [evidence, setEvidence] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [officerInfo, setOfficerInfo] = useState({
    name: "",
    badge: "",
    department: "",
  });
  const [location, setLocation] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzingEvidence, setAnalyzingEvidence] = useState(false);
  const [error, setError] = useState(null);
  const [upload] = useUpload();

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setAiAnalysis,
    onFinish: (message) => {
      setAiAnalysis(message);
      setAnalyzingEvidence(false);
    },
  });

  const generateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          () => resolve(null)
        );
      } else {
        resolve(null);
      }
    });
  };

  const classifyFileType = (file) => {
    const extension = file.name.split(".").pop().toLowerCase();
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const videoTypes = ["mp4", "avi", "mov", "wmv", "flv", "webm"];
    const documentTypes = ["pdf", "doc", "docx", "txt", "rtf"];
    const audioTypes = ["mp3", "wav", "aac", "ogg", "flac"];

    if (imageTypes.includes(extension)) return "Image";
    if (videoTypes.includes(extension)) return "Video";
    if (documentTypes.includes(extension)) return "Document";
    if (audioTypes.includes(extension)) return "Audio";
    return "Other";
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !officerInfo.name || !officerInfo.badge) {
      setError("Please select a file and provide officer information");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const hash = await generateSHA256(selectedFile);
      const currentLocation = await getCurrentLocation();
      const { url, error: uploadError } = await upload({ file: selectedFile });

      if (uploadError) {
        throw new Error(uploadError);
      }

      const newEvidence = {
        id: Date.now(),
        fileName: selectedFile.name,
        fileType: classifyFileType(selectedFile),
        fileSize: selectedFile.size,
        sha256Hash: hash,
        url: url,
        uploadedAt: new Date().toISOString(),
        officer: { ...officerInfo },
        location: currentLocation,
        chainOfCustody: [
          {
            action: "Evidence Uploaded",
            officer: officerInfo.name,
            timestamp: new Date().toISOString(),
            location: currentLocation,
          },
        ],
        integrityVerified: true,
        metadata: {
          mimeType: selectedFile.type,
          lastModified: new Date(selectedFile.lastModified).toISOString(),
        },
      };

      setEvidence((prev) => [newEvidence, ...prev]);
      setSelectedFile(null);
      setOfficerInfo({ name: "", badge: "", department: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to upload evidence: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const verifyIntegrity = async (evidenceItem) => {
    try {
      const response = await fetch(evidenceItem.url);
      const blob = await response.blob();
      const currentHash = await generateSHA256(blob);

      const isValid = currentHash === evidenceItem.sha256Hash;

      setEvidence((prev) =>
        prev.map((item) =>
          item.id === evidenceItem.id
            ? {
                ...item,
                integrityVerified: isValid,
                lastVerified: new Date().toISOString(),
              }
            : item
        )
      );

      return isValid;
    } catch (err) {
      console.error("Integrity verification failed:", err);
      return false;
    }
  };

  const analyzeEvidence = async (evidenceItem) => {
    setAnalyzingEvidence(true);
    setAiAnalysis("");

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
                content: `Analyze this evidence file for forensic investigation:
            
            File Name: ${evidenceItem.fileName}
            File Type: ${evidenceItem.fileType}
            Upload Date: ${evidenceItem.uploadedAt}
            Officer: ${evidenceItem.officer.name}
            Location: ${
              evidenceItem.location
                ? `${evidenceItem.location.latitude}, ${evidenceItem.location.longitude}`
                : "Unknown"
            }
            
            Please provide:
            1. Evidence classification and significance
            2. Potential forensic value
            3. Recommended analysis procedures
            4. Chain of custody considerations
            5. Correlation opportunities with other evidence types
            6. Security and preservation recommendations`,
              },
            ],
            stream: true,
          }),
        }
      );

      handleStreamResponse(response);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAnalyzingEvidence(false);
      setError("Failed to analyze evidence");
    }
  };

  const filteredEvidence = evidence.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.officer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || item.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

  const addChainOfCustodyEntry = (evidenceId, action) => {
    if (!officerInfo.name) {
      setError("Officer information required for chain of custody");
      return;
    }

    setEvidence((prev) =>
      prev.map((item) =>
        item.id === evidenceId
          ? {
              ...item,
              chainOfCustody: [
                ...item.chainOfCustody,
                {
                  action,
                  officer: officerInfo.name,
                  timestamp: new Date().toISOString(),
                  location: location,
                },
              ],
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">
            <i className="fas fa-shield-alt mr-3"></i>
            Sovereign Evidence Vault
          </h1>
          <p className="text-gray-300">
            Secure evidence management with cryptographic integrity verification
          </p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">
              <i className="fas fa-upload mr-2"></i>
              Evidence Upload
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="officerName"
                  placeholder="Officer Name"
                  value={officerInfo.name}
                  onChange={(e) =>
                    setOfficerInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <input
                  type="text"
                  name="badgeNumber"
                  placeholder="Badge Number"
                  value={officerInfo.badge}
                  onChange={(e) =>
                    setOfficerInfo((prev) => ({
                      ...prev,
                      badge: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={officerInfo.department}
                  onChange={(e) =>
                    setOfficerInfo((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>

              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-gray-300 bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />

              <button
                onClick={handleFileUpload}
                disabled={uploading || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded font-medium transition-colors"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading & Hashing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock mr-2"></i>
                    Secure Upload
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-300">
              <i className="fas fa-chart-bar mr-2"></i>
              Vault Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Evidence:</span>
                <span className="text-white font-medium">
                  {evidence.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified:</span>
                <span className="text-green-400 font-medium">
                  {evidence.filter((e) => e.integrityVerified).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Images:</span>
                <span className="text-blue-400 font-medium">
                  {evidence.filter((e) => e.fileType === "Image").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Documents:</span>
                <span className="text-yellow-400 font-medium">
                  {evidence.filter((e) => e.fileType === "Document").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="Image">Images</option>
              <option value="Video">Videos</option>
              <option value="Document">Documents</option>
              <option value="Audio">Audio</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-300">File</th>
                  <th className="pb-3 text-gray-300">Type</th>
                  <th className="pb-3 text-gray-300">Officer</th>
                  <th className="pb-3 text-gray-300">Date</th>
                  <th className="pb-3 text-gray-300">Status</th>
                  <th className="pb-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvidence.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="py-3">
                      <div className="flex items-center">
                        <i
                          className={`fas ${
                            item.fileType === "Image"
                              ? "fa-image text-blue-400"
                              : item.fileType === "Video"
                              ? "fa-video text-purple-400"
                              : item.fileType === "Document"
                              ? "fa-file-alt text-yellow-400"
                              : item.fileType === "Audio"
                              ? "fa-volume-up text-green-400"
                              : "fa-file text-gray-400"
                          } mr-2`}
                        ></i>
                        <span className="font-medium">{item.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{item.fileType}</td>
                    <td className="py-3 text-gray-300">{item.officer.name}</td>
                    <td className="py-3 text-gray-300">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.integrityVerified
                            ? "bg-green-900 text-green-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {item.integrityVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedEvidence(item)}
                          className="text-blue-400 hover:text-blue-300"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => verifyIntegrity(item)}
                          className="text-green-400 hover:text-green-300"
                          title="Verify Integrity"
                        >
                          <i className="fas fa-shield-check"></i>
                        </button>
                        <button
                          onClick={() => analyzeEvidence(item)}
                          className="text-purple-400 hover:text-purple-300"
                          title="AI Analysis"
                        >
                          <i className="fas fa-brain"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedEvidence && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-blue-300">
                    Evidence Details
                  </h3>
                  <button
                    onClick={() => setSelectedEvidence(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-green-300">
                      File Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>{" "}
                        {selectedEvidence.fileName}
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>{" "}
                        {selectedEvidence.fileType}
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>{" "}
                        {(selectedEvidence.fileSize / 1024).toFixed(2)} KB
                      </div>
                      <div>
                        <span className="text-gray-400">SHA-256:</span>{" "}
                        <code className="text-xs bg-gray-700 px-1 rounded">
                          {selectedEvidence.sha256Hash}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-400">Uploaded:</span>{" "}
                        {new Date(selectedEvidence.uploadedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-3 text-yellow-300">
                      Officer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>{" "}
                        {selectedEvidence.officer.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Badge:</span>{" "}
                        {selectedEvidence.officer.badge}
                      </div>
                      <div>
                        <span className="text-gray-400">Department:</span>{" "}
                        {selectedEvidence.officer.department}
                      </div>
                      {selectedEvidence.location && (
                        <div>
                          <span className="text-gray-400">Location:</span>{" "}
                          {selectedEvidence.location.latitude.toFixed(6)},{" "}
                          {selectedEvidence.location.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3 text-red-300">
                    Chain of Custody
                  </h4>
                  <div className="space-y-2">
                    {selectedEvidence.chainOfCustody.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 p-3 rounded text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{entry.action}</span>
                          <span className="text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-gray-300">
                          Officer: {entry.officer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEvidence.fileType === "Image" && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-3 text-blue-300">
                      Preview
                    </h4>
                    <img
                      src={selectedEvidence.url}
                      alt="Evidence preview"
                      className="max-w-full h-auto rounded border border-gray-600"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {analyzingEvidence && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-purple-300">
                    <i className="fas fa-brain mr-2"></i>
                    AI Evidence Analysis
                  </h3>
                  <button
                    onClick={() => setAnalyzingEvidence(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="bg-gray-700 rounded p-4 min-h-[200px]">
                  {aiAnalysis ? (
                    <div className="whitespace-pre-wrap text-gray-200">
                      {aiAnalysis}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <i className="fas fa-spinner fa-spin text-2xl text-purple-400 mr-3"></i>
                      <span className="text-gray-300">
                        Analyzing evidence...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;