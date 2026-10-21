import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;
  const eventsDir = path.join(process.cwd(), 'data', 'events');
  const compiledFile = path.join(process.cwd(), 'data', 'events.json');

  try {
    // If slug requested, return single category
    if (slug) {
      const normalizedSlug = String(slug).toLowerCase().trim();
      const specificFile = path.join(eventsDir, `${normalizedSlug}.json`);

      if (fs.existsSync(specificFile)) {
        const raw = fs.readFileSync(specificFile, 'utf8');
        const data = JSON.parse(raw);
        if (data.is_active === false) {
          return res.status(404).json({ error: 'Event section not active' });
        }
        return res.status(200).json(data);
      }

      // Check inside compiled file
      if (fs.existsSync(compiledFile)) {
        const compiledRaw = fs.readFileSync(compiledFile, 'utf8');
        const compiled = JSON.parse(compiledRaw);
        const categories = compiled.categories || compiled.events || [];
        const found = categories.find(c => c.slug === normalizedSlug && c.is_active !== false);
        if (found) {
          return res.status(200).json(found);
        }
      }

      return res.status(404).json({ error: 'Event section not found' });
    }

    // Return list of all active categories
    let categories = [];
    if (fs.existsSync(eventsDir)) {
      const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.json') && f !== 'events.json');
      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(eventsDir, file), 'utf8');
          const data = JSON.parse(raw);
          if (data && data.is_active !== false) {
            data.slug = data.slug || file.replace(/\.json$/, '');
            categories.push(data);
          }
        } catch (e) {}
      }
    } else if (fs.existsSync(compiledFile)) {
      const compiledRaw = fs.readFileSync(compiledFile, 'utf8');
      const compiled = JSON.parse(compiledRaw);
      categories = (compiled.categories || compiled.events || []).filter(c => c.is_active !== false);
    }

    categories.sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));
    return res.status(200).json({ categories });
  } catch (error) {
    console.error('[api/event-categories] Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve event categories' });
  }
}
