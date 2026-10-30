import Anthropic from '@anthropic-ai/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import { allowMethods } from '@/lib/api';
import { AssistantRefusal, runAssistant, type AssistantTurn } from '@/lib/assistant';

export const config = {
  api: { bodyParser: { sizeLimit: '64kb' } },
  // A turn can take a few model calls and catalogue searches.
  maxDuration: 60,
};

const MAX_TURNS = 16;
const MAX_USER_CHARS = 800;
const MAX_ASSISTANT_CHARS = 4000;

// Best-effort limit per visitor. Serverless instances each keep their own count, so this blunts
// runaway use rather than enforcing an exact quota; set a spending limit in the Anthropic Console too.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const recentRequests = new Map<string, number[]>();

function rateLimited(req: NextApiRequest): boolean {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || req.socket.remoteAddress || '?';
  const now = Date.now();
  const times = (recentRequests.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (times.length >= MAX_REQUESTS_PER_WINDOW) return true;
  times.push(now);
  recentRequests.set(ip, times);
  if (recentRequests.size > 5000) recentRequests.clear();
  return false;
}

/** The conversation from the request body, or null if it isn't a well-formed one ending with the visitor's message. */
function readHistory(body: unknown): AssistantTurn[] | null {
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const history = messages.slice(-MAX_TURNS);
  // The API needs the conversation to start with the visitor.
  while (history.length && (history[0] as AssistantTurn)?.role !== 'user') history.shift();
  const valid = history.every((turn: unknown, index) => {
    const { role, content } = (turn ?? {}) as Partial<AssistantTurn>;
    const expected = index % 2 === 0 ? 'user' : 'assistant';
    const limit = role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    return role === expected && typeof content === 'string' && content.trim() !== '' && content.length <= limit;
  });
  return valid && history.length % 2 === 1 ? (history as AssistantTurn[]) : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "The assistant isn't available right now. Please try again later." });
  }
  const history = readHistory(req.body);
  if (!history) {
    return res.status(400).json({ error: `Please send a message of up to ${MAX_USER_CHARS} characters.` });
  }
  if (rateLimited(req)) {
    return res.status(429).json({ error: "You've sent a lot of messages. Please wait a few minutes and try again." });
  }

  try {
    const header = req.headers['x-vercel-ip-country'];
    const country = (Array.isArray(header) ? header[0] : header) || null;
    const page = typeof req.body?.page === 'string' && req.body.page.length <= 300 ? req.body.page : undefined;
    res.status(200).json(await runAssistant(history, country, page));
  } catch (error) {
    if (error instanceof AssistantRefusal) {
      return res.status(200).json({ reply: "Sorry, I can't help with that. I can help you find pieces in the catalogue.", pieces: {}, resources: {} });
    }
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
      console.error('Assistant: Claude is busy:', error.message);
      return res.status(503).json({ error: 'The assistant is busy right now. Please try again in a moment.' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Assistant: Claude API error ${error.status}:`, error.message);
    } else {
      console.error('Assistant failed:', error);
    }
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
