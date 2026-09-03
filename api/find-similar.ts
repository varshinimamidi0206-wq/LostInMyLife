interface FindSimilarRequestBody {
  title?: string;
  object_name?: string;
  memory_type?: string;
  category?: string;
  brand?: string | null;
  colors?: string[];
  visible_text?: string[];
  memories: any[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: FindSimilarRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { title, object_name, memory_type, category, brand, colors = [], visible_text = [], memories = [] } = body || {};

    const currentTitle = (title || object_name || '').toLowerCase();
    const currentType = (memory_type || '').toLowerCase();
    const currentCategory = (category || '').toLowerCase();
    const currentBrand = (brand || '').toLowerCase();

    if (!currentTitle && !currentType) {
      return res.status(400).json({ error: 'Title or memory type is required.' });
    }

    let bestMatch: any = null;
    let highestScore = 0;
    let matchReason = '';

    for (const mem of memories) {
      const memTitle = (mem.title || mem.object_name || '').toLowerCase();
      const memType = (mem.memory_type || '').toLowerCase();
      const memCategory = (mem.category || '').toLowerCase();
      const memBrand = (mem.brand || '').toLowerCase();
      const memVisible = (mem.visible_text || []).join(' ').toLowerCase();
      let score = 0;

      // Exact or direct match
      if (currentTitle && (memTitle.includes(currentTitle) || currentTitle.includes(memTitle))) {
        score += 10;
      }

      // Word token overlap
      const currentWords = currentTitle.split(/\s+/).filter((w: string) => w.length > 2);
      const memWords = memTitle.split(/\s+/).filter((w: string) => w.length > 2);
      const commonWords = currentWords.filter((w: string) => memWords.includes(w));
      score += commonWords.length * 4;

      // Same memory type
      if (currentType && memType && currentType === memType) {
        score += 3;
      }

      // Brand match
      if (currentBrand && memBrand && currentBrand === memBrand) {
        score += 6;
      }

      // Category match
      if (currentCategory && memCategory && currentCategory === memCategory) {
        score += 3;
      }

      // Shared visible text tokens (e.g. university name or concert venue)
      if (Array.isArray(visible_text) && visible_text.length > 0) {
        for (const vt of visible_text) {
          if (vt.length > 3 && memVisible.includes(vt.toLowerCase())) {
            score += 4;
          }
        }
      }

      // Color overlap
      if (Array.isArray(mem.colors) && colors.length > 0) {
        const sharedColors = mem.colors.filter((c: string) =>
          colors.some(currC => currC.toLowerCase().includes(c.toLowerCase()))
        );
        score += sharedColors.length * 2;
      }

      if (score > highestScore && score >= 7) {
        highestScore = score;
        bestMatch = mem;
        if (commonWords.length > 0 || currentTitle.includes(memTitle) || memTitle.includes(currentTitle)) {
          matchReason = `Similar ${mem.memory_type || 'item'}: "${mem.title || mem.object_name}"`;
        } else if (currentBrand && memBrand && currentBrand === memBrand) {
          matchReason = `Same creator / brand (${mem.brand})`;
        } else if (currentType && memType && currentType === memType) {
          matchReason = `Related ${mem.memory_type} memory in ${mem.category || 'your archive'}`;
        } else {
          matchReason = `Related visual memory in ${mem.category || 'archive'}`;
        }
      }
    }

    if (bestMatch) {
      let daysText = 'previously';
      if (bestMatch.captured_at) {
        const diffMs = Date.now() - new Date(bestMatch.captured_at).getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (days === 0) daysText = 'earlier today';
        else if (days === 1) daysText = 'yesterday';
        else if (days > 1) daysText = `${days} days ago`;
      }

      const matchTitle = bestMatch.title || bestMatch.object_name;
      const matchLoc = bestMatch.location || bestMatch.place_name || '';

      let message = `You captured a similar ${matchTitle}`;
      if (daysText) message += ` ${daysText}`;
      if (matchLoc) message += ` at ${matchLoc}`;
      message += '.';

      return res.status(200).json({
        success: true,
        match_found: true,
        similar_memory: bestMatch,
        similarity_reason: matchReason,
        time_ago_text: daysText,
        message,
      });
    }

    return res.status(200).json({
      success: true,
      match_found: false,
      similar_memory: null,
      similarity_reason: '',
      message: "I couldn't find a similar memory in your physical world archive.",
    });
  } catch (error: any) {
    console.error('Error finding similar memory:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
