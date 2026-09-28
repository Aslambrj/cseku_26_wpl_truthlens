const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** Analyze a claim with OpenRouter and return the result shape used by the API/UI. */
export const analyzeTextClaim = async (text, sourceUrl = '') => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'replace-with-your-openrouter-api-key') {
    throw new Error('Text analysis is not configured. Set OPENROUTER_API_KEY in backend/.env.');
  }

  const model = process.env.OPENROUTER_MODEL || 'qwen/qwen3.8-27b';
  const userContent = sourceUrl
    ? `Claim:\n${text}\n\nOptional source URL to consider:\n${sourceUrl}`
    : `Claim:\n${text}`;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'TruthLens',
    },
    body: JSON.stringify({
      model,
      max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS) || 3000,
      messages: [
        {
          role: 'system',
          content: 'Assess the factual claim carefully. Do not claim to have opened or verified a URL unless its contents are available to you. Return only a JSON object with: verdict (one of "Supported", "Unsupported", "Misleading", "Unverified"), confidence (integer from 0 to 100), explanation (brief plain language), key_claim (the core factual claim), claims (array of objects with claim, verdict, confidence, explanation), evidence (array of objects with url, title, excerpt, kind), and sourceCheck (object with url, status, summary). If you cannot verify the claim, use Unverified and say so. Do not invent evidence or URLs.',
        },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || `OpenRouter request failed (${response.status})`;
    throw new Error(message);
  }

  const choice = payload.choices?.[0];
  const message = choice?.message;
  const content = Array.isArray(message?.content)
    ? message.content.map((part) => typeof part === 'string' ? part : part?.text || '').join('')
    : message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    const finishReason = choice?.finish_reason || 'unknown';
    if (finishReason === 'length') {
      throw new Error('The text model used its output limit before returning an answer. Increase OPENROUTER_MAX_TOKENS in backend/.env and restart the backend.');
    }
    throw new Error(`The text model returned no answer (finish reason: ${finishReason}). Check that the selected OpenRouter model supports JSON responses, or try another model.`);
  }

  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new Error('The text model returned an unreadable response. Try again.');
  }

  const allowedVerdicts = new Set(['Supported', 'Unsupported', 'Misleading', 'Unverified']);
  const verdict = allowedVerdicts.has(result.verdict) ? result.verdict : 'Unverified';
  const numericConfidence = Number(result.confidence);

  return {
    verdict,
    confidence: Number.isFinite(numericConfidence)
      ? Math.max(0, Math.min(100, Math.round(numericConfidence)))
      : 0,
    explanation: typeof result.explanation === 'string' ? result.explanation : 'The model could not provide an explanation.',
    key_claim: typeof result.key_claim === 'string' ? result.key_claim : text,
    claims: Array.isArray(result.claims) ? result.claims : [],
    evidence: Array.isArray(result.evidence) ? result.evidence : [],
    sourceCheck: result.sourceCheck && typeof result.sourceCheck === 'object' ? result.sourceCheck : null,
  };
};
