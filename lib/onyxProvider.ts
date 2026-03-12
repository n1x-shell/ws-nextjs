// lib/onyxProvider.ts
// OpenAI-compatible provider pointed at your Onyx instance.
// Set in Vercel env:
//   OPENAI_BASE_URL=https://kai360.ngrok.io/v1
//   OPENAI_API_KEY=<your onyx key>

import { createOpenAI } from '@ai-sdk/openai';

export const onyx = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey:  process.env.OPENAI_API_KEY,
});
