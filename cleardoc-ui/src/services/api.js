import { API_ENDPOINTS } from '../constants/apiConfig';
import { SAMPLE_ANALYSIS, getMockChatAnswer } from '../constants/mockData';

/**
 * Normalizes red flag items from strings or objects into structured flag models.
 */
export function normalizeRedFlags(rawFlags) {
  if (!Array.isArray(rawFlags)) return [];
  return rawFlags.map((flag, idx) => {
    if (typeof flag === 'string') {
      const isCritical =
        flag.toLowerCase().includes('evict') ||
        flag.toLowerCase().includes('structural') ||
        flag.toLowerCase().includes('all maintenance') ||
        flag.toLowerCase().includes('terminate');

      return {
        id: `rf-${idx + 1}`,
        title: isCritical ? 'High Legal Risk Clause' : 'Cautionary Clause',
        text: flag,
        severity: isCritical ? 'critical' : 'warning',
        category: isCritical ? 'High Exposure' : 'Contract Advisory',
        recommendation: isCritical
          ? 'Propose an amendment to strike or establish reciprocal limitations on this term before signing.'
          : 'Review and request clarification in writing to avoid unexpected obligations.',
      };
    }
    return {
      id: flag.id || `rf-${idx + 1}`,
      title: flag.title || 'Risk Notice',
      text: flag.text || String(flag),
      severity: flag.severity === 'critical' ? 'critical' : 'warning',
      category: flag.category || 'General Risk',
      recommendation:
        flag.recommendation ||
        'Discuss this clause with the counterparty to adjust liability.',
    };
  });
}

/**
 * Normalizes green flag items from strings or objects into structured models.
 */
export function normalizeGreenFlags(rawFlags) {
  if (!Array.isArray(rawFlags)) return [];
  return rawFlags.map((flag, idx) => {
    if (typeof flag === 'string') {
      return {
        id: `gf-${idx + 1}`,
        title: 'Standard Protection',
        text: flag,
        benefit: 'This term aligns with customary protective standards for tenants/signers.',
      };
    }
    return {
      id: flag.id || `gf-${idx + 1}`,
      title: flag.title || 'Protective Term',
      text: flag.text || String(flag),
      benefit: flag.benefit || 'Provides standard legal safeguards.',
    };
  });
}

/**
 * Computes an overall document risk profile from flags.
 */
export function calculateRiskProfile(redFlags, greenFlags) {
  const criticalCount = redFlags.filter((f) => f.severity === 'critical').length;
  const warningCount = redFlags.filter((f) => f.severity !== 'critical').length;
  const greenCount = greenFlags.length;

  let riskScore = 30 + criticalCount * 25 + warningCount * 12 - greenCount * 5;
  riskScore = Math.max(15, Math.min(95, riskScore));

  let riskLevel = 'Low';
  if (riskScore >= 70 || criticalCount >= 2) {
    riskLevel = 'High';
  } else if (riskScore >= 45 || criticalCount === 1 || warningCount >= 2) {
    riskLevel = 'Moderate';
  }

  return { riskLevel, riskScore };
}

/**
 * Obtains pre-signed upload URL from backend using dual-contract strategy.
 * Tries GET /upload?filename=... first (standard SAM template),
 * falls back to POST /upload if GET returns 404/405.
 */
export async function getUploadUrl(file) {
  const fileName = file.name;
  const contentType = file.type || 'application/pdf';

  try {
    // Attempt 1: GET /upload with query params
    const getUrl = `${API_ENDPOINTS.UPLOAD}?filename=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`;
    const res = await fetch(getUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        uploadUrl: data.uploadUrl,
        documentId: data.documentId || data.document_id,
        objectKey: data.objectKey || data.key,
      };
    }

    // Attempt 2: POST /upload with JSON body (dual contract support)
    const postRes = await fetch(API_ENDPOINTS.UPLOAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: fileName, contentType }),
    });

    if (postRes.ok) {
      const data = await postRes.json();
      return {
        uploadUrl: data.uploadUrl,
        documentId: data.documentId || data.document_id,
        objectKey: data.objectKey || data.key,
      };
    }

    throw new Error(`Upload endpoint returned status: ${res.status}`);
  } catch (err) {
    // Return mock upload parameters for offline/demo fallback
    console.warn('Backend /upload unavailable, operating in mock fallback:', err.message);
    const mockDocId = `doc-${Date.now()}`;
    return {
      uploadUrl: `https://mock-s3.cleardoc.local/${mockDocId}/${encodeURIComponent(fileName)}`,
      documentId: mockDocId,
      objectKey: `${mockDocId}/${fileName}`,
      isMock: true,
    };
  }
}

/**
 * Uploads file to S3 via pre-signed URL.
 */
export async function uploadFileToS3(uploadUrl, file) {
  if (uploadUrl.includes('mock-s3') || uploadUrl.includes('mock.local')) {
    // Simulate S3 transfer delay for mock fallback
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  }

  try {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/pdf' },
      body: file,
    });
    if (!res.ok) {
      console.warn('S3 upload non-OK status, proceeding to analysis fallback:', res.status);
    }
    return true;
  } catch (err) {
    console.warn('S3 direct PUT failed, proceeding with analysis fallback:', err.message);
    return false;
  }
}

/**
 * Dispatches document to /analyze endpoint with dual contract parameters.
 */
export async function analyzeDocument({ objectKey, documentId, file }) {
  try {
    const res = await fetch(API_ENDPOINTS.ANALYZE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objectKey,
        documentId,
        key: objectKey, // Dual contract compatibility
        document_id: documentId,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const redFlags = normalizeRedFlags(data.redFlags || []);
      const greenFlags = normalizeGreenFlags(data.greenFlags || []);
      const riskProfile = calculateRiskProfile(redFlags, greenFlags);

      return {
        documentId: data.documentId || data.document_id || documentId,
        documentName: file?.name || 'Uploaded Document',
        summary: data.summary || 'Document analysis completed.',
        redFlags,
        greenFlags,
        riskLevel: data.riskLevel || riskProfile.riskLevel,
        riskScore: data.riskScore ?? riskProfile.riskScore,
        is_mock: Boolean(data.is_mock),
      };
    }
    throw new Error(`Analyze API returned status: ${res.status}`);
  } catch (err) {
    console.warn('Analyze API unreachable, using realistic mock analysis:', err.message);
    // Realistic fallback data
    return {
      documentId: documentId || 'mock-doc-id',
      documentName: file?.name || SAMPLE_ANALYSIS.documentName,
      summary:
        `Plain English analysis for ${file?.name || 'your document'}: This agreement contains typical commercial and residential clauses, but has notable liability imbalances requiring negotiation.`,
      redFlags: SAMPLE_ANALYSIS.redFlags,
      greenFlags: SAMPLE_ANALYSIS.greenFlags,
      riskLevel: SAMPLE_ANALYSIS.riskLevel,
      riskScore: SAMPLE_ANALYSIS.riskScore,
      is_mock: true,
    };
  }
}

/**
 * Dispatches a question to /chat with dual contract parameters.
 */
export async function sendChatMessage({ documentId, question }) {
  try {
    const res = await fetch(API_ENDPOINTS.CHAT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        document_id: documentId, // Dual contract compatibility
        question,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        answer: data.answer || 'No answer provided.',
        is_mock: Boolean(data.is_mock),
      };
    }
    throw new Error(`Chat API status: ${res.status}`);
  } catch (err) {
    console.warn('Chat API unreachable, using contextual fallback:', err.message);
    return {
      answer: getMockChatAnswer(question),
      is_mock: true,
    };
  }
}
