
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_MODEL = 'openrouter/free';
const DEFAULT_MAX_TOKENS = 1000;
const MIN_MAX_TOKENS = 350;
const MAX_OUTPUT_TOKENS = 2400;
const OUTPUT_TOKEN_INCREMENT = 600;

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 500;

/* --------------------------------------------------
   Utility
-------------------------------------------------- */

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const extractUrlCitations = (message) => {
  const annotations = [
    ...(Array.isArray(message?.annotations)
      ? message.annotations
      : []),

    ...(Array.isArray(message?.content)
      ? message.content.flatMap((part) =>
          Array.isArray(part?.annotations)
            ? part.annotations
            : []
        )
      : []),
  ];

  const citations = annotations
    .filter(
      (annotation) =>
        annotation?.type === 'url_citation' ||
        annotation?.url_citation
    )
    .map((annotation) => {
      const citation =
        annotation.url_citation || annotation;

      try {
        if (
          typeof citation.url !== 'string' ||
          !citation.url.trim()
        ) {
          return null;
        }

        const parsedUrl = new URL(citation.url);

        if (
          !['http:', 'https:'].includes(
            parsedUrl.protocol
          )
        ) {
          return null;
        }

        return {
          url: parsedUrl.href,

          title:
            typeof citation.title === 'string' &&
            citation.title.trim()
              ? citation.title.trim()
              : parsedUrl.hostname,

          excerpt:
            typeof citation.content === 'string'
              ? citation.content.trim()
              : '',

          kind: 'web',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return [
    ...new Map(
      citations.map((citation) => [
        citation.url,
        citation,
      ])
    ).values(),
  ];
};

/* --------------------------------------------------
   Token Configuration
-------------------------------------------------- */

const getInitialMaxTokens = () => {
  const configured = Number(
    process.env.OPENROUTER_MAX_TOKENS
  );

  if (
    !Number.isFinite(configured) ||
    configured <= 0
  ) {
    return DEFAULT_MAX_TOKENS;
  }

  /*
   * Keep TruthLens requests reasonably small.
   * Allow headroom for evidence and structured JSON output.
   */
  return Math.min(
    Math.max(Math.round(configured), MIN_MAX_TOKENS),
    MAX_OUTPUT_TOKENS
  );
};

const getRetryTokenLimits = (initialLimit) => {
  const limits = [
    initialLimit,
    Math.min(initialLimit, 600),
    Math.min(initialLimit, 450),
    MIN_MAX_TOKENS,
  ];

  return [
    ...new Set(limits),
  ].filter(
    (limit) =>
      limit >= MIN_MAX_TOKENS
  );
};

/* --------------------------------------------------
   Error Handling
-------------------------------------------------- */

const isRetryableStatus = (status) => {
  return (
    status === 408 ||
    status === 409 ||
    status === 429 ||
    status >= 500
  );
};

const isTokenBudgetError = (message = '') => {
  const normalized =
    message.toLowerCase();

  return (
    normalized.includes(
      'requires more credits'
    ) ||
    normalized.includes(
      'fewer max_tokens'
    ) ||
    normalized.includes(
      'can only afford'
    ) ||
    normalized.includes(
      'max_tokens'
    ) ||
    normalized.includes(
      'token limit'
    ) ||
    normalized.includes(
      'insufficient balance'
    )
  );
};

const getRetryDelay = (attempt) => {
  const exponentialDelay =
    RETRY_BASE_DELAY_MS *
    Math.pow(2, attempt);

  const jitter =
    Math.floor(
      Math.random() * 500
    );

  return (
    exponentialDelay + jitter
  );
};

/* --------------------------------------------------
   Response Content
-------------------------------------------------- */

const extractContent = (message) => {
  if (
    Array.isArray(message?.content)
  ) {
    return message.content
      .map((part) =>
        typeof part === 'string'
          ? part
          : typeof part?.text === 'string'
            ? part.text
            : ''
      )
      .join('');
  }

  return message?.content;
};

const parseJsonResponse = (content) => {
  const text = content.trim();

  try {
    const result = JSON.parse(text);
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return result;
    }
  } catch {
    // Providers sometimes wrap otherwise valid JSON in prose or Markdown.
  }

  let objectStart = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];

    if (objectStart === -1) {
      if (character !== '{') continue;
      objectStart = index;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === '{') {
      depth++;
    } else if (character === '}' && --depth === 0) {
      try {
        const result = JSON.parse(text.slice(objectStart, index + 1));
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          return result;
        }
      } catch {
        // Continue in case valid JSON follows the malformed content.
      }
      objectStart = -1;
    }
  }

  return null;
};

/* --------------------------------------------------
   System Prompt
-------------------------------------------------- */

const buildSystemPrompt = () => {
  return `
You are the TruthLens factual-claim analysis engine.

Analyze the user's factual claim carefully.

Use the web search tool to find current and reliable evidence before deciding the verdict.

Prefer:
1. Primary sources
2. Government or official sources
3. Reputable research organizations
4. Established news organizations
5. Independent reputable sources

Verdict must be exactly one of:
- Supported
- Unsupported
- Misleading
- Unverified

Rules:
- Supported requires sufficient reliable evidence supporting the key claim.
- If reliable evidence is insufficient, use Unverified.
- If evidence directly contradicts the claim, use Unsupported.
- If the claim contains a mixture of true and false or misleading information, use Misleading.
- Do not invent facts, sources, URLs, or excerpts.
- Do not claim that you opened or verified a URL unless the web-search results actually provide evidence for it.
- Keep explanations concise.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not wrap the JSON in code fences.
- Confidence must be an integer from 0 to 100.
- Include at most 2 claims and 2 evidence sources.
- Keep each explanation to 1-2 short sentences and each evidence excerpt under 20 words.

Return exactly this structure:

{
  "verdict": "Supported",
  "confidence": 0,
  "explanation": "Brief explanation",
  "key_claim": "Core factual claim",
  "claims": [
    {
      "claim": "Individual claim",
      "verdict": "Supported",
      "confidence": 0,
      "explanation": "Brief explanation"
    }
  ],
  "evidence": [
    {
      "url": "Actual URL returned by web search",
      "title": "Source title",
      "excerpt": "Relevant excerpt",
      "kind": "web"
    }
  ],
  "sourceCheck": {
    "url": "",
    "status": "checked",
    "summary": "Brief source assessment"
  }
}

Important:
- Only include URLs actually returned by web search.
- Never invent an evidence URL.
- If reliable evidence is insufficient, use Unverified.
- Keep the response concise.
`.trim();
};

/* --------------------------------------------------
   OpenRouter Request
-------------------------------------------------- */

const sendOpenRouterRequest = async ({
  apiKey,
  userContent,
  maxTokens,
}) => {
  const response = await fetch(
    OPENROUTER_URL,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${apiKey}`,

        'Content-Type':
          'application/json',

        'HTTP-Referer':
          process.env.CLIENT_URL ||
          'http://localhost:5173',

        'X-Title':
          'TruthLens',
      },

      body: JSON.stringify({
        model:
          process.env.OPENROUTER_MODEL ||
          DEFAULT_MODEL,

        max_tokens:
          maxTokens,

        temperature: 0.1,

        messages: [
          {
            role: 'system',
            content:
              buildSystemPrompt(),
          },

          {
            role: 'user',
            content:
              userContent,
          },
        ],

        tools: [
          {
            type:
              'openrouter:web_search',

            parameters: {
              max_results: 2,
              max_total_results: 2,
            },
          },
        ],

        max_tool_calls: 1,

        response_format: {
          type: 'json_object',
        },
      }),
    }
  );

  const payload =
    await response
      .json()
      .catch(() => ({}));

  return {
    response,
    payload,
  };
};

/* --------------------------------------------------
   Main Text Analysis Function
-------------------------------------------------- */

/**
 * Analyze a factual claim using OpenRouter.
 *
 * Default model:
 *   openrouter/free
 *
 * Features:
 * - Free model routing
 * - Web search
 * - JSON response
 * - Small token budget
 * - Token fallback
 * - Automatic retry
 * - Citation validation
 * - Existing TruthLens response format
 */
export const analyzeTextClaim = async (
  text,
  sourceUrl = ''
) => {
  /* -----------------------------------------------
     Validate API key
  ------------------------------------------------ */

  const apiKey =
    process.env.OPENROUTER_API_KEY;

  if (
    !apiKey ||
    apiKey ===
      'replace-with-your-openrouter-api-key'
  ) {
    throw new Error(
      'Text analysis is not configured. Set OPENROUTER_API_KEY in backend/.env.'
    );
  }

  /* -----------------------------------------------
     Validate text
  ------------------------------------------------ */

  if (
    typeof text !== 'string' ||
    !text.trim()
  ) {
    throw new Error(
      'Please provide a text claim to analyze.'
    );
  }

  /* -----------------------------------------------
     Prepare user content
  ------------------------------------------------ */

  const userContent = sourceUrl
    ? `Claim:
${text.trim()}

Optional source URL to consider:
${sourceUrl.trim()}`
    : `Claim:
${text.trim()}`;

  /* -----------------------------------------------
     Token fallback levels
  ------------------------------------------------ */

  const tokenLimits =
    getRetryTokenLimits(
      getInitialMaxTokens()
    );

  let lastError = null;

  /* -----------------------------------------------
     Token attempts
  ------------------------------------------------ */

  for (
    let tokenAttempt = 0;
    tokenAttempt <
    tokenLimits.length;
    tokenAttempt++
  ) {
    const maxTokens =
      tokenLimits[tokenAttempt];
    let outputLimitReached = false;

    /* ---------------------------------------------
       Retry attempts
    ---------------------------------------------- */

    for (
      let retryAttempt = 0;
      retryAttempt < MAX_RETRIES;
      retryAttempt++
    ) {
      try {
        const {
          response,
          payload,
        } =
          await sendOpenRouterRequest({
            apiKey,
            userContent,
            maxTokens,
          });

        /* -----------------------------------------
           API Error
        ------------------------------------------ */

        if (!response.ok) {
          const message =
            payload?.error?.message ||
            `OpenRouter request failed (${response.status})`;

          const error =
            new Error(message);

          error.status =
            response.status;

          error.retryable =
            isRetryableStatus(
              response.status
            );

          error.tokenBudgetError =
            isTokenBudgetError(
              message
            );

          lastError = error;

          /*
           * Token-budget problem:
           * immediately move to smaller
           * max_tokens.
           */
          if (
            error.tokenBudgetError
          ) {
            break;
          }

          /*
           * Temporary provider/rate
           * limit.
           */
          if (
            error.retryable
          ) {
            if (
              retryAttempt <
              MAX_RETRIES - 1
            ) {
              await sleep(
                getRetryDelay(
                  retryAttempt
                )
              );

              continue;
            }

            break;
          }

          throw error;
        }

        /* -----------------------------------------
           Extract response
        ------------------------------------------ */

        const choice =
          payload?.choices?.[0];

        if (choice?.finish_reason === 'length') {
          outputLimitReached = true;
          lastError = new Error(
            `The text model reached its output limit at ${maxTokens} tokens.`
          );
          break;
        }

        const message =
          choice?.message;

        const content =
          extractContent(message);

        /* -----------------------------------------
           Empty response
        ------------------------------------------ */

        if (
          typeof content !==
            'string' ||
          !content.trim()
        ) {
          const finishReason =
            choice?.finish_reason ||
            'unknown';

          throw new Error(
            `The text model returned no answer (finish reason: ${finishReason}).`
          );
        }

        /* -----------------------------------------
           Parse JSON
        ------------------------------------------ */

        let result;

        try {
          result = parseJsonResponse(content);
          if (!result) {
            throw new Error('Invalid JSON response');
          }
        } catch {
          /*
           * Retry malformed JSON.
           */
          if (
            retryAttempt <
            MAX_RETRIES - 1
          ) {
            lastError =
              new Error(
                'The text model returned invalid JSON.'
              );

            await sleep(
              getRetryDelay(
                retryAttempt
              )
            );

            continue;
          }

          throw new Error(
            'The text model returned an unreadable response. Please try again.'
          );
        }

        /* -----------------------------------------
           Validate verdict
        ------------------------------------------ */

        const allowedVerdicts =
          new Set([
            'Supported',
            'Unsupported',
            'Misleading',
            'Unverified',
          ]);

        let verdict =
          allowedVerdicts.has(
            result?.verdict
          )
            ? result.verdict
            : 'Unverified';

        /* -----------------------------------------
           Confidence
        ------------------------------------------ */

        const numericConfidence =
          Number(
            result?.confidence
          );

        /* -----------------------------------------
           Explanation
        ------------------------------------------ */

        let explanation =
          typeof result?.explanation ===
            'string' &&
          result.explanation.trim()
            ? result.explanation.trim()
            : 'The model could not provide an explanation.';

        /* -----------------------------------------
           Extract actual web citations
        ------------------------------------------ */

        const citedSources =
          extractUrlCitations(
            message
          );

        const citedUrls =
          new Set(
            citedSources.map(
              (source) =>
                source.url
            )
          );

        /* -----------------------------------------
           Validate model evidence
        ------------------------------------------ */

        const modelEvidence =
          Array.isArray(
            result?.evidence
          )
            ? result.evidence
                .filter(
                  (source) => {
                    try {
                      return citedUrls.has(
                        new URL(
                          source.url
                        ).href
                      );
                    } catch {
                      return false;
                    }
                  }
                )
                .map(
                  (source) => ({
                    ...source,

                    url: new URL(
                      source.url
                    ).href,
                  })
                )
            : [];

        /* -----------------------------------------
           Merge citations + evidence
        ------------------------------------------ */

        const evidence =
          citedSources.map(
            (source) => {
              const modelSource =
                modelEvidence.find(
                  (item) =>
                    item.url ===
                    source.url
                );

              return modelSource
                ? {
                    ...source,
                    ...modelSource,

                    kind: 'web',

                    excerpt:
                      source.excerpt ||
                      modelSource.excerpt ||
                      '',
                  }
                : source;
            }
          );

        /* -----------------------------------------
           Supported safety rule
        ------------------------------------------ */

        if (
          verdict ===
            'Supported' &&
          evidence.length < 2
        ) {
          verdict =
            'Unverified';

          explanation =
            'The search did not return enough cited sources to support this claim confidently, so the result is marked Unverified.';
        }

        /* -----------------------------------------
           Return TruthLens result
        ------------------------------------------ */

        return {
          verdict,

          confidence:
            Number.isFinite(
              numericConfidence
            )
              ? Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      numericConfidence
                    )
                  )
                )
              : 0,

          explanation,

          key_claim:
            typeof result?.key_claim ===
              'string' &&
            result.key_claim.trim()
              ? result.key_claim.trim()
              : text.trim(),

          claims:
            Array.isArray(
              result?.claims
            )
              ? result.claims
              : [],

          evidence,

          sourceCheck:
            result?.sourceCheck &&
            typeof result.sourceCheck ===
              'object'
              ? result.sourceCheck
              : null,
        };
      } catch (error) {
        lastError = error;

        /*
         * Retry network/temporary errors.
         */
        if (
          retryAttempt <
          MAX_RETRIES - 1
        ) {
          await sleep(
            getRetryDelay(
              retryAttempt
            )
          );

          continue;
        }

        break;
      }
    }

    if (outputLimitReached) {
      if (maxTokens >= MAX_OUTPUT_TOKENS) {
        break;
      }

      tokenLimits.splice(
        tokenAttempt + 1,
        0,
        Math.min(
          maxTokens + OUTPUT_TOKEN_INCREMENT,
          MAX_OUTPUT_TOKENS
        )
      );
      continue;
    }

    if (!lastError?.tokenBudgetError) {
      break;
    }
  }

  /* -----------------------------------------------
     Final user-friendly error
  ------------------------------------------------ */

  if (lastError) {
    const message =
      lastError.message ||
      'Unknown OpenRouter error';

    if (
      isTokenBudgetError(
        message
      )
    ) {
      throw new Error(
        'The free OpenRouter provider could not allocate enough output tokens right now. Please try again in a few seconds.'
      );
    }

    if (
      lastError.status ===
      429
    ) {
      throw new Error(
        'The free OpenRouter service is temporarily rate-limited. Please wait a few seconds and try again.'
      );
    }

    if (
      lastError.status >= 500
    ) {
      throw new Error(
        'The OpenRouter free service is temporarily unavailable. Please try again shortly.'
      );
    }

    throw new Error(
      message
    );
  }

  throw new Error(
    'Text analysis failed. Please try again.'
  );
};