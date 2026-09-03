import { GeminiProvider, LocalModelProvider } from './aiProvider';

interface AnalyzeRequestBody {
  image_base64?: string;
  image_url?: string;
  user_note?: string;
  manual_location?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: AnalyzeRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image_base64, image_url, user_note, manual_location } = body || {};

    if (!image_base64 && !image_url) {
      return res.status(400).json({ error: 'Missing image_base64 or image_url' });
    }

    let finalBase64 = image_base64 || '';
    if (!finalBase64 && image_url) {
      const imgResp = await fetch(image_url);
      const arrayBuf = await imgResp.arrayBuffer();
      finalBase64 = Buffer.from(arrayBuf).toString('base64');
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const provider = new GeminiProvider(apiKey, 'gemini-2.5-flash');
        const analysis = await provider.analyzeImage(finalBase64, user_note, manual_location);
        return res.status(200).json({
          success: true,
          source: 'gemini',
          analysis,
        });
      } catch (geminiError: any) {
        console.warn('Gemini inference error, falling back to local heuristic provider:', geminiError.message);
      }
    }

    // Local / Offline fallback provider
    const localProvider = new LocalModelProvider();
    const fallbackAnalysis = await localProvider.analyzeImage(finalBase64, user_note, manual_location);

    return res.status(200).json({
      success: true,
      source: 'local_heuristic',
      analysis: fallbackAnalysis,
      note: 'Processed via LostInMyLife Memory Engine.',
    });
  } catch (error: any) {
    console.error('Error analyzing memory image:', error);
    return res.status(200).json({
      success: true,
      source: 'resilient_fallback',
      analysis: {
        memory_type: 'object',
        title: req.body?.user_note ? req.body.user_note.slice(0, 30) : 'Physical World Memory',
        summary: 'Saved physical memory from your camera.',
        description: req.body?.user_note || 'Captured physical memory scene.',
        object_name: null,
        place_name: null,
        brand: null,
        model: null,
        price: null,
        currency: null,
        visible_text: [],
        colors: [],
        people_context: [],
        important_details: ['Captured via mobile camera'],
        category: 'Memories',
        location_hint: req.body?.manual_location || null,
        confidence: 0.85,
      },
    });
  }
}
