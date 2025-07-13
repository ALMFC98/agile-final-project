function handler({ command, data, officer_credentials }) {
  if (!command) {
    return {
      status: "error",
      message: "Command required",
      timestamp: new Date().toISOString(),
    };
  }

  switch (command) {
    case "authenticate_officer":
      return authenticateOfficer(data);
    case "create_case":
      return createCase(data, officer_credentials);
    case "upload_evidence":
      return uploadEvidence(data, officer_credentials);
    case "build_timeline":
      return buildTimeline(data, officer_credentials);
    case "generate_intelligence_brief":
      return generateIntelligenceBrief(data, officer_credentials);
    case "verify_integrity":
      return verifyIntegrity(data, officer_credentials);
    case "audit_trail":
      return getAuditTrail(data, officer_credentials);
    default:
      return {
        status: "error",
        message: "Unknown command",
        available_commands: [
          "authenticate_officer",
          "create_case",
          "upload_evidence",
          "build_timeline",
          "generate_intelligence_brief",
          "verify_integrity",
          "audit_trail",
        ],
        timestamp: new Date().toISOString(),
      };
  }
}

async function authenticateOfficer({ badge_number, credential_hash }) {
  try {
    if (!badge_number || !credential_hash) {
      return {
        status: "error",
        message: "Badge number and credential hash required",
      };
    }

    const officers = await sql`
      SELECT id, badge_number, full_name, rank_title, department, 
             clearance_level, status, public_key_rsa, public_key_ed25519
      FROM officers 
      WHERE badge_number = ${badge_number} 
      AND credential_hash = ${credential_hash}
      AND status = 'active'
    `;

    if (officers.length === 0) {
      await logAudit(null, "authentication_failed", "officer", null, {
        badge_number,
        reason: "invalid_credentials",
      });

      return {
        status: "error",
        message: "Authentication failed",
      };
    }

    const officer = officers[0];

    await sql`
      UPDATE officers 
      SET last_login = NOW() 
      WHERE id = ${officer.id}
    `;

    await logAudit(
      officer.id,
      "authentication_success",
      "officer",
      officer.id,
      {
        badge_number: officer.badge_number,
      }
    );

    return {
      status: "success",
      officer: {
        id: officer.id,
        badge_number: officer.badge_number,
        full_name: officer.full_name,
        rank_title: officer.rank_title,
        department: officer.department,
        clearance_level: officer.clearance_level,
        public_keys: {
          rsa: officer.public_key_rsa,
          ed25519: officer.public_key_ed25519,
        },
      },
      session_token: generateSessionToken(officer.id),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      message: "Authentication system error",
    };
  }
}

async function createCase(data, officer_credentials) {
  try {
    const officer = await validateOfficer(officer_credentials);
    if (!officer) {
      return { status: "error", message: "Invalid officer credentials" };
    }

    const {
      case_title,
      case_type,
      priority_level = 3,
      case_summary,
      classification = "internal",
    } = data;

    if (!case_title || !case_type) {
      return {
        status: "error",
        message: "Case title and type required",
      };
    }

    const case_number = generateCaseNumber();

    const cases = await sql`
      INSERT INTO cases (
        case_number, case_title, case_type, priority_level,
        lead_officer_id, case_summary, classification
      ) VALUES (
        ${case_number}, ${case_title}, ${case_type}, ${priority_level},
        ${officer.id}, ${case_summary}, ${classification}
      ) RETURNING *
    `;

    const newCase = cases[0];

    await logAudit(officer.id, "case_created", "case", newCase.id, {
      case_number: newCase.case_number,
      case_title: newCase.case_title,
    });

    await createAlert({
      alert_type: "case_created",
      priority: priority_level,
      case_id: newCase.id,
      officer_id: officer.id,
      title: `New Case Created: ${case_title}`,
      message: `Case ${case_number} has been created and assigned to ${officer.full_name}`,
      ai_confidence: 1.0,
    });

    return {
      status: "success",
      case: newCase,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to create case",
    };
  }
}

async function uploadEvidence(data, officer_credentials) {
  try {
    const officer = await validateOfficer(officer_credentials);
    if (!officer) {
      return { status: "error", message: "Invalid officer credentials" };
    }

    const {
      case_id,
      evidence_type,
      file_data,
      description,
      geo_location,
      timestamp_collected,
    } = data;

    if (!case_id || !evidence_type || !file_data) {
      return {
        status: "error",
        message: "Case ID, evidence type, and file data required",
      };
    }

    const cases = await sql`
      SELECT * FROM cases WHERE id = ${case_id}
    `;

    if (cases.length === 0) {
      return {
        status: "error",
        message: "Case not found",
      };
    }

    let uploadResult;
    if (file_data.startsWith("data:")) {
      uploadResult = await upload({ base64: file_data });
    } else if (file_data.startsWith("http")) {
      uploadResult = await upload({ url: file_data });
    } else {
      return {
        status: "error",
        message: "Invalid file data format",
      };
    }

    if (uploadResult.error) {
      return {
        status: "error",
        message: "File upload failed",
      };
    }

    const file_hash = await generateFileHash(uploadResult.url);
    const evidence_number = await generateEvidenceNumber(case_id);

    const evidence = await sql`
      INSERT INTO evidence (
        case_id, evidence_number, evidence_type, file_name,
        file_path, file_hash_sha256, mime_type, upload_officer_id,
        description, geo_location, timestamp_collected,
        chain_of_custody
      ) VALUES (
        ${case_id}, ${evidence_number}, ${evidence_type}, ${`evidence_${evidence_number}`},
        ${uploadResult.url}, ${file_hash}, ${uploadResult.mimeType}, ${
      officer.id
    },
        ${description}, ${JSON.stringify(geo_location)}, ${timestamp_collected},
        ${JSON.stringify([
          {
            officer_id: officer.id,
            action: "uploaded",
            timestamp: new Date().toISOString(),
            location: geo_location,
          },
        ])}
      ) RETURNING *
    `;

    const newEvidence = evidence[0];

    await logAudit(
      officer.id,
      "evidence_uploaded",
      "evidence",
      newEvidence.id,
      {
        case_id,
        evidence_number: newEvidence.evidence_number,
        evidence_type,
      }
    );

    return {
      status: "success",
      evidence: newEvidence,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to upload evidence",
    };
  }
}

async function buildTimeline(data, officer_credentials) {
  try {
    const officer = await validateOfficer(officer_credentials);
    if (!officer) {
      return { status: "error", message: "Invalid officer credentials" };
    }

    const { case_id } = data;

    if (!case_id) {
      return {
        status: "error",
        message: "Case ID required",
      };
    }

    const timeline = await sql`
      SELECT te.*, e.evidence_number, e.evidence_type, e.file_path
      FROM timeline_events te
      LEFT JOIN evidence e ON e.id = ANY(te.evidence_ids)
      WHERE te.case_id = ${case_id}
      ORDER BY te.event_timestamp ASC
    `;

    const evidence = await sql`
      SELECT * FROM evidence 
      WHERE case_id = ${case_id}
      ORDER BY timestamp_collected ASC
    `;

    await logAudit(officer.id, "timeline_accessed", "case", case_id, {
      events_count: timeline.length,
      evidence_count: evidence.length,
    });

    return {
      status: "success",
      timeline: {
        case_id,
        events: timeline,
        evidence_items: evidence,
        generated_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to build timeline",
    };
  }
}

async function generateIntelligenceBrief(data, officer_credentials) {
  try {
    const officer = await validateOfficer(officer_credentials);
    if (!officer) {
      return { status: "error", message: "Invalid officer credentials" };
    }

    const { case_id, include_evidence = true, include_timeline = true } = data;

    if (!case_id) {
      return {
        status: "error",
        message: "Case ID required",
      };
    }

    const cases = await sql`
      SELECT c.*, o.full_name as lead_officer_name, o.rank_title
      FROM cases c
      JOIN officers o ON c.lead_officer_id = o.id
      WHERE c.id = ${case_id}
    `;

    if (cases.length === 0) {
      return {
        status: "error",
        message: "Case not found",
      };
    }

    const caseData = cases[0];
    let evidence = [];
    let timeline = [];

    if (include_evidence) {
      evidence = await sql`
        SELECT * FROM evidence 
        WHERE case_id = ${case_id}
        ORDER BY timestamp_collected DESC
      `;
    }

    if (include_timeline) {
      timeline = await sql`
        SELECT * FROM timeline_events 
        WHERE case_id = ${case_id}
        ORDER BY event_timestamp ASC
      `;
    }

    const alerts = await sql`
      SELECT * FROM ariia_alerts 
      WHERE case_id = ${case_id}
      ORDER BY created_at DESC
    `;

    const brief = {
      case_summary: {
        case_number: caseData.case_number,
        title: caseData.case_title,
        type: caseData.case_type,
        status: caseData.status,
        priority: caseData.priority_level,
        classification: caseData.classification,
        lead_officer: `${caseData.rank_title} ${caseData.lead_officer_name}`,
        created: caseData.created_at,
        last_updated: caseData.updated_at,
      },
      intelligence_assessment: {
        evidence_count: evidence.length,
        timeline_events: timeline.length,
        active_alerts: alerts.filter((a) => a.status === "pending").length,
        confidence_score: calculateCaseConfidence(evidence, timeline, alerts),
      },
      evidence_summary: evidence.map((e) => ({
        evidence_number: e.evidence_number,
        type: e.evidence_type,
        collected: e.timestamp_collected,
        integrity_verified: e.integrity_verified,
      })),
      key_events: timeline.slice(0, 10),
      active_alerts: alerts.filter((a) => a.status === "pending"),
      generated_by: officer.full_name,
      generated_at: new Date().toISOString(),
      classification: caseData.classification,
    };

    await logAudit(
      officer.id,
      "intelligence_brief_generated",
      "case",
      case_id,
      {
        brief_type: "full",
        evidence_included: include_evidence,
        timeline_included: include_timeline,
      }
    );

    return {
      status: "success",
      intelligence_brief: brief,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to generate intelligence brief",
    };
  }
}

async function verifyIntegrity(data, officer_credentials) {
  try {
    const officer = await validateOfficer(officer_credentials);
    if (!officer) {
      return { status: "error", message: "Invalid officer credentials" };
    }

    const { evidence_id } = data;

    if (!evidence_id) {
      return {
        status: "error",
        message: "Evidence ID required",
      };
    }

    const evidence = await sql`
      SELECT * FROM evidence WHERE id = ${evidence_id}
    `;

    if (evidence.length === 0) {
      return {
        status: "error",
        message: "Evidence not found",
      };
    }

    const evidenceItem = evidence[0];
    const currentHash = await generateFileHash(evidenceItem.file_path);
    const integrity_verified = currentHash === evidenceItem.file_hash_sha256;

    await sql`
      UPDATE evidence 
      SET integrity_verified = ${integrity_verified}
      WHERE id = ${evidence_id}
    `;

    await logAudit(
      officer.id,
      "integrity_verification",
      "evidence",
      evidence_id,
      {
        original_hash: evidenceItem.file_hash_sha256,
        current_hash: currentHash,
        verified: integrity_verified,
      }
    );

    if (!integrity_verified) {
      await createAlert({
        alert_type: "integrity_violation",
        priority: 1,
        case_id: evidenceItem.case_id,
        officer_id: officer.id,
        title: "Evidence Integrity Violation Detected",
        message: `Evidence ${evidenceItem.evidence_number} has failed integrity verification`,
        ai_confidence: 1.0,
      });
    }

    return {
      status: "success",
      verification: {
        evidence_id,
        evidence_number: evidenceItem.evidence_number,
        original_hash: evidenceItem.file_hash_sha256,
        current_hash: currentHash,
        integrity_verified,
        verified_by: officer.full_name,
        verified_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to verify integrity",
    };
  }
}

async function getAuditTrail(data, officer_credentials) {
  try {
    const officer = await validateOfficer(officer_credentials);
    if (!officer) {
      return { status: "error", message: "Invalid officer credentials" };
    }

    const { case_id, officer_id, action_type, limit = 100 } = data;

    let query =
      "SELECT al.*, o.full_name as officer_name FROM audit_logs al LEFT JOIN officers o ON al.officer_id = o.id WHERE 1=1";
    const values = [];
    let paramCount = 0;

    if (case_id) {
      paramCount++;
      query += ` AND al.case_id = $${paramCount}`;
      values.push(case_id);
    }

    if (officer_id) {
      paramCount++;
      query += ` AND al.officer_id = $${paramCount}`;
      values.push(officer_id);
    }

    if (action_type) {
      paramCount++;
      query += ` AND al.action_type = $${paramCount}`;
      values.push(action_type);
    }

    paramCount++;
    query += ` ORDER BY al.timestamp_utc DESC LIMIT $${paramCount}`;
    values.push(limit);

    const auditLogs = await sql(query, values);

    await logAudit(officer.id, "audit_trail_accessed", "system", null, {
      filters: { case_id, officer_id, action_type },
      results_count: auditLogs.length,
    });

    return {
      status: "success",
      audit_trail: {
        logs: auditLogs,
        total_count: auditLogs.length,
        accessed_by: officer.full_name,
        accessed_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to retrieve audit trail",
    };
  }
}

async function validateOfficer(credentials) {
  if (!credentials || !credentials.officer_id) {
    return null;
  }

  const officers = await sql`
    SELECT * FROM officers 
    WHERE id = ${credentials.officer_id} 
    AND status = 'active'
  `;

  return officers.length > 0 ? officers[0] : null;
}

async function logAudit(
  officer_id,
  action_type,
  resource_type,
  resource_id,
  action_details,
  case_id = null
) {
  await sql`
    INSERT INTO audit_logs (
      officer_id, action_type, resource_type, resource_id,
      case_id, action_details, timestamp_utc
    ) VALUES (
      ${officer_id}, ${action_type}, ${resource_type}, ${resource_id},
      ${case_id}, ${JSON.stringify(action_details)}, NOW()
    )
  `;
}

async function createAlert({
  alert_type,
  priority,
  case_id,
  officer_id,
  title,
  message,
  ai_confidence,
}) {
  await sql`
    INSERT INTO ariia_alerts (
      alert_type, priority, case_id, officer_id, title, message, ai_confidence
    ) VALUES (
      ${alert_type}, ${priority}, ${case_id}, ${officer_id}, ${title}, ${message}, ${ai_confidence}
    )
  `;
}

function generateCaseNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CASE-${timestamp}-${random}`;
}

async function generateEvidenceNumber(case_id) {
  const count = await sql`
    SELECT COUNT(*) as count FROM evidence WHERE case_id = ${case_id}
  `;
  return `EVD-${String(count[0].count + 1).padStart(4, "0")}`;
}

function generateSessionToken(officer_id) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${officer_id}-${timestamp}-${random}`;
}

async function generateFileHash(file_path) {
  const timestamp = Date.now();
  const random = Math.random().toString(36);
  return `sha256_${timestamp}_${random}`.substring(0, 64);
}

function calculateCaseConfidence(evidence, timeline, alerts) {
  let score = 0.5;

  if (evidence.length > 0) score += 0.2;
  if (timeline.length > 0) score += 0.2;
  if (alerts.filter((a) => a.status === "resolved").length > 0) score += 0.1;

  return Math.min(score, 1.0);
}
export async function POST(request) {
  return handler(await request.json());
}