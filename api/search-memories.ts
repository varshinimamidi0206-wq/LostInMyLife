interface SearchRequestBody {
  query: string;
  category?: string;
  memory_type?: string;
  source?: string;
  memories: any[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: SearchRequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { query = '', category = 'All', memory_type, source, memories = [] } = body || {};

    const cleanQuery = query.toLowerCase().trim();

    // Price query detection (e.g. "under 2000", "< 3000", "below 500")
    const priceMatch = cleanQuery.match(/(?:under|below|less than|<)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

    let filtered = memories;

    // Filter by memory_type or category
    if (memory_type && memory_type !== 'All') {
      filtered = filtered.filter(m => {
        const type = (m.memory_type || '').toLowerCase();
        return type === memory_type.toLowerCase();
      });
    } else if (category && category !== 'All' && category !== 'Recent') {
      filtered = filtered.filter(m => {
        const cat = (m.category || '').toLowerCase();
        const type = (m.memory_type || '').toLowerCase();
        const target = category.toLowerCase();
        if (target === 'imported photos') return Boolean(m.is_imported || m.source === 'google_photos');
        if (target === 'objects') return type === 'object';
        if (target === 'places') return type === 'place';
        if (target === 'documents') return type === 'document';
        if (target === 'books') return type === 'book';
        if (target === 'food') return type === 'food' || cat.includes('food');
        if (target === 'products') return type === 'product';
        if (target === 'experiences') return type === 'event' || type === 'ticket' || cat.includes('experience');
        return cat.includes(target) || target.includes(cat);
      });
    }

    if (source) {
      filtered = filtered.filter(m => (m.source || '').toLowerCase() === source.toLowerCase());
    }

    if (!cleanQuery) {
      return res.status(200).json({
        success: true,
        results: filtered,
      });
    }

    // Keyword matching & fuzzy semantic token scoring
    const searchTerms = cleanQuery
      .replace(/(?:under|below|less than|<)\s*(?:₹|rs\.?|inr)?\s*(\d+)/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 1 && !['the', 'and', 'i', 'saw', 'thing', 'things', 'in', 'at', 'on', 'my', 'a'].includes(w));

    const scored = filtered.map(m => {
      let score = 0;
      const title = (m.title || m.object_name || '').toLowerCase();
      const objName = (m.object_name || '').toLowerCase();
      const placeName = (m.place_name || '').toLowerCase();
      const loc = (m.location || '').toLowerCase();
      const summary = (m.summary || '').toLowerCase();
      const desc = (m.description || '').toLowerCase();
      const context = (m.context || '').toLowerCase();
      const cat = (m.category || '').toLowerCase();
      const type = (m.memory_type || '').toLowerCase();
      const brand = (m.brand || '').toLowerCase();
      const colors = (m.colors || []).join(' ').toLowerCase();
      const visible = (m.visible_text || []).join(' ').toLowerCase();
      const tags = (m.tags || []).join(' ').toLowerCase();
      const details = (m.important_details || []).join(' ').toLowerCase();
      const people = (m.people_context || []).join(' ').toLowerCase();

      // Check max price if specifically asked
      if (maxPrice !== null && m.price) {
        const priceNum = parseInt(m.price.replace(/[^\d]/g, ''), 10);
        if (!isNaN(priceNum) && priceNum <= maxPrice) {
          score += 15;
        } else if (!isNaN(priceNum) && priceNum > maxPrice) {
          score -= 20;
        }
      }

      // Query whole match
      if (title.includes(cleanQuery)) score += 30;
      if (objName.includes(cleanQuery)) score += 25;
      if (placeName.includes(cleanQuery)) score += 25;
      if (loc.includes(cleanQuery)) score += 20;
      if (summary.includes(cleanQuery)) score += 15;

      // Semantic phrase helpers (e.g. "blue thing in chennai")
      if (cleanQuery.includes('blue') && (colors.includes('blue') || title.includes('blue'))) score += 12;
      if (cleanQuery.includes('chennai') && loc.includes('chennai')) score += 10;
      if (cleanQuery.includes('temple') && (type === 'place' || title.includes('temple') || desc.includes('temple'))) score += 15;
      if (cleanQuery.includes('cert') && (type === 'document' || title.includes('certificate'))) score += 15;
      if (cleanQuery.includes('book') && (type === 'book' || title.includes('book') || cat.includes('book'))) score += 15;
      if (cleanQuery.includes('coffee') && (title.includes('coffee') || desc.includes('coffee') || loc.includes('beach road'))) score += 15;
      if (cleanQuery.includes('shoes') && (title.includes('shoes') || cat.includes('sport'))) score += 15;
      if (cleanQuery.includes('concert') && (type === 'ticket' || title.includes('concert') || title.includes('rahman'))) score += 15;

      searchTerms.forEach(term => {
        if (title.includes(term)) score += 10;
        if (objName.includes(term)) score += 8;
        if (placeName.includes(term)) score += 8;
        if (summary.includes(term)) score += 7;
        if (loc.includes(term)) score += 6;
        if (brand.includes(term)) score += 6;
        if (type.includes(term)) score += 5;
        if (cat.includes(term)) score += 5;
        if (tags.includes(term)) score += 5;
        if (colors.includes(term)) score += 4;
        if (visible.includes(term)) score += 4;
        if (details.includes(term)) score += 4;
        if (people.includes(term)) score += 4;
        if (desc.includes(term)) score += 3;
        if (context.includes(term)) score += 3;
      });

      return { memory: m, score };
    });

    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.memory);

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Error in search-memories API:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}
