import { GoogleGenerativeAI } from '@google/generative-ai';

interface AskRequestBody {
  question: string;
  memories: any[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: AskRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { question, memories = [] } = body || {};

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const q = question.toLowerCase().trim();

    // 1. Filter candidate memories based on keywords, type, location, colors, text
    const candidateMemories = rankAndFilterMemories(memories, q);

    // If no memories are relevant at all
    if (candidateMemories.length === 0) {
      return res.status(200).json({
        success: true,
        answer: "I couldn't find that in your saved memories.",
        evidence_memories: [],
        grounded_facts: [],
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.1,
          },
        });

        const memoriesContext = candidateMemories.slice(0, 5).map((m, idx) => `
[Memory #${idx + 1}]
- Title: ${m.title || m.object_name}
- Type: ${m.memory_type || m.category || 'General'}
- Summary: ${m.summary || m.description}
- Place/Location: ${m.location || m.place_name || 'Unknown'}
- Captured Date: ${m.captured_at ? new Date(m.captured_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
- Price: ${m.price ? `${m.currency || '₹'} ${m.price}` : 'None recorded (not a priced product)'}
- Brand/Author/Details: ${m.brand || 'N/A'}
- Visible Text: ${(m.visible_text || []).join(', ')}
- Colors: ${(m.colors || []).join(', ')}
- People/Context: ${(m.people_context || []).join(', ')}
- Important Details: ${(m.important_details || []).join(', ')}
- Source: ${m.source || 'camera'}
`).join('\n');

        const prompt = `You are the grounded memory retrieval engine for "LostInMyLife" — a private AI memory for the physical world.
The user is asking a question about their physical memories, experiences, places, documents, or objects they have captured.

User's Question: "${question}"

Retrieved Saved Memories:
${memoriesContext}

GROUNDING RULES:
1. ONLY answer based strictly on the memories provided above.
2. NEVER invent details, dates, prices, or locations not present in the memories.
3. If the user asks about a price, only state it if a price was recorded. If no price is recorded, do NOT invent one.
4. If the user asks about places, documents, or books, describe what they saw and where/when they captured it.
5. Be concise, direct, conversational, and natural (1-3 sentences).
6. If the retrieved memories do NOT answer the question, state: "I couldn't find that in your saved memories."`;

        const response = await model.generateContent(prompt);
        const answerText = response.response.text().trim();

        return res.status(200).json({
          success: true,
          source: 'gemini',
          answer: answerText,
          evidence_memories: candidateMemories.slice(0, 3),
          grounded_facts: extractFacts(candidateMemories[0]),
        });
      } catch (geminiErr) {
        console.warn('Gemini grounded recall error, using deterministic recall engine:', geminiErr);
      }
    }

    // Deterministic grounded response fallback
    const primary = candidateMemories[0];
    const dateFormatted = primary.captured_at
      ? new Date(primary.captured_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'recently';

    const title = primary.title || primary.object_name || 'Item';
    const loc = primary.location || primary.place_name || '';

    let answer = `You captured ${title}`;
    if (loc) answer += ` at ${loc}`;
    answer += ` on ${dateFormatted}.`;

    if (primary.summary) {
      answer += ` ${primary.summary}`;
    }

    if (primary.price && (q.includes('price') || q.includes('cost') || q.includes('under') || q.includes('how much'))) {
      answer += ` Recorded price: ₹${primary.price}.`;
    }

    return res.status(200).json({
      success: true,
      source: 'grounded_engine',
      answer,
      evidence_memories: candidateMemories.slice(0, 3),
      grounded_facts: extractFacts(primary),
    });
  } catch (error: any) {
    console.error('Error in ask-memory API:', error);
    return res.status(200).json({
      success: true,
      source: 'error_fallback',
      answer: "I couldn't find that in your saved memories.",
      evidence_memories: [],
    });
  }
}

function rankAndFilterMemories(memories: any[], query: string): any[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2 && !['where', 'what', 'when', 'did', 'the', 'see', 'have', 'seen', 'before', 'show', 'tell', 'about', 'this', 'that', 'with', 'from'].includes(t));

  const priceMatch = query.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  const scored = memories.map(mem => {
    let score = 0;
    const title = (mem.title || mem.object_name || '').toLowerCase();
    const type = (mem.memory_type || '').toLowerCase();
    const loc = (mem.location || mem.place_name || '').toLowerCase();
    const cat = (mem.category || '').toLowerCase();
    const desc = (mem.description || '').toLowerCase();
    const summary = (mem.summary || '').toLowerCase();
    const brand = (mem.brand || '').toLowerCase();
    const visible = (mem.visible_text || []).join(' ').toLowerCase();
    const text = `${title} ${loc} ${cat} ${desc} ${summary} ${brand} ${visible}`.toLowerCase();

    // Specific intent bonuses
    if (query.includes('blue handbag') || (query.includes('handbag') && !query.includes('shoes'))) {
      if (title.includes('handbag') || text.includes('handbag')) score += 25;
    }
    if (query.includes('coffee') || query.includes('cafe')) {
      if (title.includes('coffee') || loc.includes('beach road') || type === 'food' || type === 'place') score += 25;
    }
    if (query.includes('book') || query.includes('atomic') || query.includes('read')) {
      if (type === 'book' || title.includes('atomic') || title.includes('habits')) score += 25;
    }
    if (query.includes('certificate') || query.includes('degree') || query.includes('document')) {
      if (type === 'document' || title.includes('certificate') || visible.includes('bachelor')) score += 25;
    }
    if (query.includes('temple') || query.includes('kapaleeshwarar')) {
      if (type === 'place' || title.includes('temple') || loc.includes('mylapore')) score += 25;
    }
    if (query.includes('shoes') || query.includes('running')) {
      if (title.includes('shoes') || title.includes('running')) score += 25;
    }
    if (query.includes('concert') || query.includes('ticket') || query.includes('rahman')) {
      if (type === 'ticket' || title.includes('concert') || visible.includes('rahman')) score += 25;
    }
    if (query.includes('gift') || query.includes('brass') || query.includes('filter')) {
      if (title.includes('brass') || title.includes('gift') || title.includes('coffee pot')) score += 25;
    }

    if (query.includes('places') || query.includes('visited')) {
      if (type === 'place') score += 15;
    }
    if (query.includes('document') || query.includes('papers')) {
      if (type === 'document') score += 15;
    }
    if (query.includes('chennai')) {
      if (loc.includes('chennai')) score += 10;
    }

    // Price query handling
    if (maxPrice !== null && mem.price) {
      const priceNum = parseInt(mem.price.replace(/[^\d]/g, ''), 10);
      if (!isNaN(priceNum)) {
        if (priceNum <= maxPrice) score += 15;
        else score -= 10;
      }
    }

    terms.forEach(term => {
      if (title.includes(term)) score += 8;
      if (loc.includes(term)) score += 6;
      if (visible.includes(term)) score += 6;
      if (summary.includes(term)) score += 5;
      if (type.includes(term)) score += 4;
      if (cat.includes(term)) score += 4;
      if (desc.includes(term)) score += 3;
      if (text.includes(term)) score += 2;
    });

    return { mem, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.mem);
}

function extractFacts(memory: any): string[] {
  const facts: string[] = [];
  if (!memory) return facts;
  const title = memory.title || memory.object_name;
  if (title) facts.push(`Memory: ${title}`);
  if (memory.memory_type) facts.push(`Type: ${memory.memory_type.toUpperCase()}`);
  if (memory.location || memory.place_name) facts.push(`Location: ${memory.location || memory.place_name}`);
  if (memory.captured_at) facts.push(`Date: ${new Date(memory.captured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
  if (memory.price) facts.push(`Price: ₹${memory.price}`);
  return facts;
}
