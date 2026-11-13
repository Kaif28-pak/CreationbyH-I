const fs = require('fs');
const path = require('path');
const https = require('https');

const CATEGORIES = [
    'baskets',
    'flower_bouquets',
    'cakes',
    'balloon_boxes',
    'crates',
    'frames',
    'customized_items',
    'trousseau_packing'
];

function parseFirestoreField(field) {
    if (!field) return null;
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.integerValue !== undefined) return parseInt(field.integerValue, 10);
    if (field.doubleValue !== undefined) return parseFloat(field.doubleValue);
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.nullValue !== undefined) return null;
    if (field.arrayValue && field.arrayValue.values) {
        return field.arrayValue.values.map(parseFirestoreField);
    }
    if (field.mapValue && field.mapValue.fields) {
        const obj = {};
        for (const [k, v] of Object.entries(field.mapValue.fields)) {
            obj[k] = parseFirestoreField(v);
        }
        return obj;
    }
    return null;
}

function fetchAllFirestoreProducts() {
    return new Promise((resolve, reject) => {
        const url = 'https://firestore.googleapis.com/v1/projects/creationbyhandi/databases/(default)/documents/products?pageSize=300';
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (!parsed.documents) {
                        return resolve([]);
                    }
                    const products = parsed.documents.map(doc => {
                        const id = doc.name.split('/').pop();
                        const fields = doc.fields || {};
                        const p = { id };
                        for (const [key, val] of Object.entries(fields)) {
                            p[key] = parseFirestoreField(val);
                        }
                        return p;
                    });
                    resolve(products);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function sync() {
    console.log('Fetching live products from Firestore...');
    const allProducts = await fetchAllFirestoreProducts();
    console.log(`Fetched ${allProducts.length} total products from Firestore.`);

    const byCategory = {};
    CATEGORIES.forEach(cat => byCategory[cat] = []);

    allProducts.forEach(prod => {
        const cat = prod.category;
        if (byCategory[cat]) {
            byCategory[cat].push(prod);
        } else {
            console.warn(`Product ${prod.id} has unknown category: ${cat}`);
        }
    });

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    CATEGORIES.forEach(cat => {
        const items = byCategory[cat] || [];
        items.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

        const filePath = path.join(dataDir, `${cat}.json`);
        const jsonContent = JSON.stringify({ products: items }, null, 2);
        fs.writeFileSync(filePath, jsonContent, 'utf8');
        console.log(`✔ Synced ${cat}.json: ${items.length} products`);
    });

    console.log('\nAll category JSON files successfully synced with live Firestore catalog!');
}

sync().catch(err => {
    console.warn('Sync skipped or failed (offline/sandbox):', err.message);
});
