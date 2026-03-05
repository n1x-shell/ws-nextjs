// app/api/mud/tts/route.ts
// TUNNELCORE MUD — TTS Proxy
// Takes text + voiceKey, calls ElevenLabs TTS API, returns audio stream.
// Voice registry maps NPC IDs to ElevenLabs voice_ids.
// Server-side only — API key never exposed to client.

export const maxDuration = 15;

// ── Voice ID Resolution ─────────────────────────────────────────────────────
// Hardcoded ElevenLabs voice IDs with env var override.

const VOICE_IDS: Record<string, string> = {
  narrator:          '32ZDVYWQ6mhlrJhjZFvn',
  mara:              '8WUhtoiYalGE0wuI1VMo',
  cole:              'VYIIUxwX5Kc4wBrXeJk7',
  ren:               'b6RPds6ITpZn9YqVUTF3',
  doss:              'elzpSHzTbqdPLTr5iM0m',
  parish_residents:  '3h6v5PGyG3yTSkhgO9Vu',
};

function resolveVoiceId(voiceKey: string): string | null {
  // Allow env var override: ELEVENLABS_VOICE_MARA=xxx
  const envKey = `ELEVENLABS_VOICE_${voiceKey.toUpperCase()}`;
  const envId = process.env[envKey];
  if (envId) return envId;

  // Fall back to hardcoded registry
  return VOICE_IDS[voiceKey] ?? VOICE_IDS.narrator ?? null;
}

// ── Voice Settings ──────────────────────────────────────────────────────────

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  speed?: number;
}

function getVoiceSettings(voiceKey: string): VoiceSettings {
  switch (voiceKey) {
    case 'narrator':
      return { stability: 0.65, similarity_boost: 0.8, speed: 0.95 };
    case 'mara':
      return { stability: 0.6, similarity_boost: 0.75, speed: 0.9 };
    case 'cole':
      return { stability: 0.6, similarity_boost: 0.75, speed: 0.85 };
    case 'ren':
      return { stability: 0.55, similarity_boost: 0.75, speed: 1.05 };
    case 'doss':
      return { stability: 0.7, similarity_boost: 0.8, speed: 0.85 };
    case 'parish_residents':
      return { stability: 0.5, similarity_boost: 0.7, speed: 1.0 };
    default:
      return { stability: 0.5, similarity_boost: 0.75 };
  }
}

// ── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { text, voiceKey } = body as { text?: string; voiceKey?: string };

    if (!text || !voiceKey) {
      return new Response(JSON.stringify({ error: 'missing text or voiceKey' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return new Response(JSON.stringify({ error: 'text too long (max 5000 chars)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const voiceId = resolveVoiceId(voiceKey);
    if (!voiceId) {
      return new Response(JSON.stringify({ error: `voice not configured: ${voiceKey}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const settings = getVoiceSettings(voiceKey);

    // Call ElevenLabs TTS API
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            ...(settings.speed !== undefined ? { speed: settings.speed } : {}),
          },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => 'unknown error');
      console.error(`[tts] ElevenLabs error ${ttsRes.status}:`, errText);
      return new Response(JSON.stringify({ error: 'TTS generation failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the audio response back to client
    return new Response(ttsRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24h
      },
    });

  } catch (err) {
    console.error('[tts] Error:', err);
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
