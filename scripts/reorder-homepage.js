const fs = require('fs');

// =========================================================================
// 1. UPDATE index.html - REORDER SECTIONS FOR PRODUCT & EVENT FIRST UX
// =========================================================================

let html = fs.readFileSync('index.html', 'utf8');

// Extract the exact sections
const aboutStart = html.indexOf('<!-- 3. About Us (Short: 60–80 words, 3 icon bullet points, 1 button) -->');
const aboutEnd = html.indexOf('<!-- 4. Gifts & Services (8 cards: image + name + one line) -->');
const aboutSection = html.substring(aboutStart, aboutEnd);

const servicesStart = aboutEnd;
const servicesEnd = html.indexOf('<!-- 5. Featured / Best Sellers (4–6 products from admin) -->');
const servicesSection = html.substring(servicesStart, servicesEnd);

const featuredStart = servicesEnd;
const featuredEnd = html.indexOf('<!-- 6. How to Order (3 steps) -->');
const featuredSection = html.substring(featuredStart, featuredEnd);

const orderStart = featuredEnd;
const orderEnd = html.indexOf('<!-- 7. Wedding Trousseau Packing (max 40 words + 4 bullets) -->');
const orderSection = html.substring(orderStart, orderEnd);

const trousseauStart = orderEnd;
const trousseauEnd = html.indexOf('<!-- 8. Events (4 event cards with images/reels from admin) -->');
const trousseauSection = html.substring(trousseauStart, trousseauEnd);

const eventsStart = trousseauEnd;
const eventsEnd = html.indexOf('<!-- 9. Delivery Locations (city chips/cards with one short line each) -->');
const eventsSection = html.substring(eventsStart, eventsEnd);

const remainder = html.substring(eventsEnd);
const headerPart = html.substring(0, aboutStart);

// Build new order:
// 1. Services (Categories)
// 2. Featured (Best Sellers)
// 3. Events (Event Styling & Reels)
// 4. Wedding Trousseau Packing
// 5. How to Order (3 Steps)
// 6. About Us (Crafted with Love in Karachi)
// 7. Delivery Locations & beyond

// Update numbering in comment headers for neatness
const newServices = servicesSection.replace('<!-- 4. Gifts & Services', '<!-- 3. Gifts & Services');
const newFeatured = featuredSection.replace('<!-- 5. Featured / Best Sellers', '<!-- 4. Featured / Best Sellers');
const newEvents = eventsSection.replace('<!-- 8. Events', '<!-- 5. Events & Celebrations');
const newTrousseau = trousseauSection.replace('<!-- 7. Wedding Trousseau', '<!-- 6. Wedding Trousseau');
const newOrder = orderSection.replace('<!-- 6. How to Order', '<!-- 7. How to Order');
const newAbout = aboutSection.replace('<!-- 3. About Us', '<!-- 8. About Us');

const newHtml = headerPart + newServices + newFeatured + newEvents + newTrousseau + newOrder + newAbout + remainder;

fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('Successfully reordered sections in index.html!');

