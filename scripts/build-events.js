const fs = require('fs');
const path = require('path');

const eventsDir = path.join(__dirname, '..', 'data', 'events');
const outputFile = path.join(__dirname, '..', 'data', 'events.json');

try {
    if (!fs.existsSync(eventsDir)) {
        fs.mkdirSync(eventsDir, { recursive: true });
    }

    const files = fs.readdirSync(eventsDir).filter(file => file.endsWith('.json') && file !== 'events.json');
    const events = [];

    for (const file of files) {
        try {
            const raw = fs.readFileSync(path.join(eventsDir, file), 'utf8');
            const data = JSON.parse(raw);
            data.slug = data.slug || file.replace(/\.json$/, '');
            events.push(data);
        } catch (err) {
            console.error(`Error reading ${file}:`, err);
        }
    }

    // Sort by order ascending
    events.sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));

    fs.writeFileSync(outputFile, JSON.stringify({ categories: events, events }, null, 2), 'utf8');
    console.log(`[build-events] Successfully compiled ${events.length} categories into ${outputFile}`);
} catch (error) {
    console.error('[build-events] Failed to build events:', error);
    process.exit(1);
}
