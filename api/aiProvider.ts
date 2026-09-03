import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysisResult } from '../src/types/memory';

export interface AIProvider {
  name: string;
  analyzeImage(
    imageBase64: string,
    userNote?: string,
    manualLocation?: string
  ): Promise<AIAnalysisResult>;
}

/**
 * Gemini Provider: Cloud Multimodal Vision Intelligence
 * Uses Google's latest gemini-2.5-flash model with structured JSON enforcement.
 */
export class GeminiProvider implements AIProvider {
  name = 'GeminiProvider';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName = 'gemini-2.5-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async analyzeImage(
    imageBase64: string,
    userNote?: string,
    manualLocation?: string
  ): Promise<AIAnalysisResult> {
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `You are the vision understanding core of "LostInMyLife" — a private AI memory system for the physical world.
"Search your physical memories, not just your photos."

Your purpose is to remember:
- Objects, Places, Documents, Books, Food, Events, Signs, Tickets, Receipts, Products, Buildings, and Experiences.

IMPORTANT GUIDELINES:
1. First, UNDERSTAND THE NATURE OF THE IMAGE. Determine what type of physical memory this is.
   Options for memory_type: "object", "place", "person_context", "document", "book", "food", "product", "event", "receipt", "ticket", "sign", "other".
2. Create a memorable, human-readable "title" (e.g. "Kapaleeshwarar Temple", "College Degree Certificate", "Artisan Cold Brew Coffee", "Blue Handbag", "Atomic Habits Book", "Concert Ticket").
3. Provide a concise 1-sentence "summary" explaining why this physical memory is worth remembering.
4. Provide an objective 2-3 sentence "description" of the visual scene, texture, surroundings, and context.
5. Extract "visible_text" using OCR (signs, headings, serial numbers, labels).
6. Extract "colors", "people_context" (if people or group context is relevant, e.g. "Family gathering", "Solo study session"), and 2-4 "important_details".
7. PRICE IS STRICTLY OPTIONAL:
   - Only extract "price" if a price tag, bill, or cost is clearly visible or explicitly mentioned.
   - Do NOT invent or estimate prices for places, documents, books, or scenes.
   - If not visible, return null for price and currency.
8. If brand, model, or location_hint are not visible, return null. Do NOT invent them.

Context from user note: "${userNote || 'None provided'}"
Context from location: "${manualLocation || 'None provided'}"

Return STRICT JSON matching this schema:
{
  "memory_type": "object | place | person_context | document | book | food | product | event | receipt | ticket | sign | other",
  "title": "Clear concise memory title",
  "summary": "1-sentence summary of what this memory is and why it's useful to recall",
  "description": "2-3 sentences describing the physical item, surroundings, condition, and visual details",
  "object_name": "Name of object if this is an object/product, otherwise null",
  "place_name": "Name of place/building if this is a location or venue, otherwise null",
  "brand": "Brand name if visible, otherwise null",
  "model": "Model name if visible, otherwise null",
  "price": "Numerical price string ONLY if actually visible on a tag or bill, otherwise null",
  "currency": "Currency code (e.g. INR) if price is visible, otherwise null",
  "visible_text": ["Array of words, titles, signs, or printed text visible in the image"],
  "colors": ["Primary visible colors"],
  "people_context": ["Context about people, gatherings, or atmosphere if visible"],
  "important_details": ["Array of 2-4 key bullet details"],
  "category": "Broad category (e.g. Place, Document, Literature, Food & Beverage, Everyday Object, Event, Fashion)",
  "location_hint": "Store, street, landmark, or indoor context clue if visible, otherwise null",
  "confidence": 0.95
}`;

    // Prepare image payload
    const match = imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
    const data = match ? match[2] : imageBase64;

    const imagePart = {
      inlineData: {
        data,
        mimeType,
      },
    };

    const response = await model.generateContent([prompt, imagePart]);
    const responseText = response.response.text();
    const parsed = JSON.parse(responseText);

    return {
      memory_type: parsed.memory_type || 'object',
      title: parsed.title || parsed.object_name || 'Physical Memory',
      summary: parsed.summary || parsed.description?.slice(0, 100) || 'Saved physical world memory.',
      description: parsed.description || 'Captured physical memory.',
      object_name: parsed.object_name || null,
      place_name: parsed.place_name || null,
      brand: parsed.brand || null,
      model: parsed.model || null,
      price: parsed.price || null,
      currency: parsed.currency || (parsed.price ? 'INR' : null),
      visible_text: Array.isArray(parsed.visible_text) ? parsed.visible_text : [],
      colors: Array.isArray(parsed.colors) ? parsed.colors : [],
      people_context: Array.isArray(parsed.people_context) ? parsed.people_context : [],
      important_details: Array.isArray(parsed.important_details) ? parsed.important_details : [],
      category: parsed.category || 'General',
      location_hint: parsed.location_hint || null,
      confidence: parsed.confidence || 0.95,
    };
  }
}

/**
 * LocalModelProvider: Open-Source / On-Device AI Provider Interface
 * Placeholder for future offline models (e.g. MediaPipe / Gemma 2 / Transformers.js).
 */
export class LocalModelProvider implements AIProvider {
  name = 'LocalModelProvider (Prepared Architecture)';

  async analyzeImage(
    _imageBase64: string,
    userNote?: string,
    manualLocation?: string
  ): Promise<AIAnalysisResult> {
    const note = (userNote || '').toLowerCase();
    return generateHeuristicMemory(note, manualLocation);
  }
}

export function generateHeuristicMemory(note: string, location?: string): AIAnalysisResult {
  if (note.includes('cert') || note.includes('degree') || note.includes('diploma') || note.includes('doc')) {
    return {
      memory_type: 'document',
      title: 'College Degree Certificate',
      summary: 'Academic graduation certificate showing course completion.',
      description: 'Official degree completion certificate with university seal and signatures.',
      object_name: null,
      place_name: 'University Campus',
      brand: null,
      model: null,
      price: null,
      currency: null,
      visible_text: ['Bachelor of Technology', 'First Class with Distinction', 'Official Seal'],
      colors: ['parchment white', 'navy blue border', 'gold seal'],
      people_context: ['Academic achievement'],
      important_details: ['Official seal intact', 'Stored in protective folder'],
      category: 'Documents',
      location_hint: location || 'Anna University, Chennai',
      confidence: 0.96,
    };
  }

  if (note.includes('book') || note.includes('habit') || note.includes('read') || note.includes('novel')) {
    return {
      memory_type: 'book',
      title: 'Atomic Habits',
      summary: 'Personal development book seen on the study desk.',
      description: 'Hardcover edition of Atomic Habits resting beside a study lamp.',
      object_name: 'Atomic Habits Book',
      place_name: null,
      brand: 'James Clear',
      model: null,
      price: null,
      currency: null,
      visible_text: ['Atomic Habits', 'Tiny Changes, Remarkable Results', 'James Clear'],
      colors: ['white', 'yellow dot', 'black text'],
      people_context: ['Reading & learning'],
      important_details: ['Hardcover edition', 'Bookmark on chapter 4'],
      category: 'Books & Literature',
      location_hint: location || 'Study Desk',
      confidence: 0.95,
    };
  }

  if (note.includes('temple') || note.includes('monument') || note.includes('church') || note.includes('beach')) {
    return {
      memory_type: 'place',
      title: 'Kapaleeshwarar Temple',
      summary: 'Historic Dravidian temple gopuram captured in Mylapore.',
      description: 'Ornate multi-tiered temple tower featuring detailed sculpted deities and bright traditional colors.',
      object_name: null,
      place_name: 'Kapaleeshwarar Temple',
      brand: null,
      model: null,
      price: null,
      currency: null,
      visible_text: ['Arulmigu Kapaleeshwarar Thirukoil'],
      colors: ['terracotta', 'gold', 'sky blue'],
      people_context: ['Devotees and evening temple gathering'],
      important_details: ['7-tiered gopuram', 'Ancient Chola/Pallava architecture'],
      category: 'Places & Heritage',
      location_hint: location || 'Mylapore, Chennai',
      confidence: 0.94,
    };
  }

  if (note.includes('ticket') || note.includes('pass') || note.includes('concert') || note.includes('show')) {
    return {
      memory_type: 'ticket',
      title: 'AR Rahman Live Concert Pass',
      summary: 'Concert entry pass for live musical performance.',
      description: 'VIP zone pass for the live arena performance with holographic security strip.',
      object_name: 'Concert Entry Pass',
      place_name: 'YMCA Grounds',
      brand: null,
      model: null,
      price: null,
      currency: null,
      visible_text: ['AR Rahman Live in Concert', 'Gate 3', 'VIP Lounge', 'Admit One'],
      colors: ['deep violet', 'neon cyan', 'silver holographic'],
      people_context: ['Live music event'],
      important_details: ['Admit One', 'Gate 3 access', 'QR code verified'],
      category: 'Events & Experiences',
      location_hint: location || 'YMCA Grounds, Nandanam, Chennai',
      confidence: 0.97,
    };
  }

  if (note.includes('coffee') || note.includes('brew') || note.includes('cafe')) {
    return {
      memory_type: 'place',
      title: 'Artisan Coffee Shop',
      summary: 'Cold brew coffee and seaside café interior on Beach Road.',
      description: 'Glass of handcrafted cold brew coffee resting on wooden table overlooking the shore.',
      object_name: 'Artisan Cold Brew',
      place_name: 'Beachside Roasters',
      brand: null,
      model: null,
      price: null,
      currency: null,
      visible_text: ['Beachside Roasters', 'Specialty Coffee'],
      colors: ['amber brown', 'natural teak wood'],
      people_context: ['Casual café conversation'],
      important_details: ['Seaside patio seating', 'Roasted in-house'],
      category: 'Food & Beverage',
      location_hint: location || 'Beach Road, Chennai',
      confidence: 0.93,
    };
  }

  if (note.includes('bag') || note.includes('handbag')) {
    return {
      memory_type: 'object',
      title: 'Blue Handbag',
      summary: 'Navy blue leatherette shoulder tote bag seen at Lifestyle Store.',
      description: 'Navy blue shoulder handbag with gold metallic hardware on a boutique display rack.',
      object_name: 'Blue Handbag',
      place_name: 'Lifestyle Store',
      brand: 'Lavie',
      model: 'Classic Tote',
      price: '1499',
      currency: 'INR',
      visible_text: ['Lavie', '₹1,499'],
      colors: ['navy blue', 'gold accents'],
      people_context: [],
      important_details: ['Dual handles', 'Zippered closure', 'Matching gold charm'],
      category: 'Objects',
      location_hint: location || 'Lifestyle Store, Express Avenue, Chennai',
      confidence: 0.94,
    };
  }

  // Default fallback
  const fallbackTitle = note ? note.charAt(0).toUpperCase() + note.slice(1) : 'Physical World Memory';
  return {
    memory_type: 'object',
    title: fallbackTitle,
    summary: `Physical observation noted as "${note || 'visual memory'}".`,
    description: `Real-world physical scene or object captured for future recall.`,
    object_name: fallbackTitle,
    place_name: null,
    brand: null,
    model: null,
    price: null,
    currency: null,
    visible_text: [],
    colors: ['natural tones'],
    people_context: [],
    important_details: ['Captured for recall'],
    category: 'Visual Memories',
    location_hint: location || 'Physical Location',
    confidence: 0.90,
  };
}
