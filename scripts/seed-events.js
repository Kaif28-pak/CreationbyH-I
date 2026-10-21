const fs = require('fs');
const path = require('path');

const eventsDir = path.join(__dirname, '..', 'data', 'events');
const settingsFile = path.join(__dirname, '..', 'data', 'settings.json');

if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
}

// 1. Settings Seed
const settings = {
    whatsapp_number: "923282276532",
    whatsapp_template: "Hello Creations by H&I! I am viewing your {event_name} gallery. I loved '{media_title}' and would like to inquire about booking, pricing, and customization."
};
fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');

// 2. Default 3 Categories Seed
const defaultCategories = [
    {
        name: "Bridal Shower",
        slug: "bridal-shower",
        description: "Bespoke pastel florals, custom bridal favor crates, macrame backdrops, and cozy luxury floor seating in Karachi.",
        cover_image: "assets/images/category-crates.jpg",
        order: 1,
        is_active: true,
        media: [
            {
                id: "bs-reel-1",
                title: "Boho Chic Floral Setup & Overview",
                description: "Full venue styling with earthy pampas grass, custom backdrop and luxury ambiance.",
                media_type: "video",
                file_url: "https://res.cloudinary.com/djjvgubrk/video/upload/v1792587282/VID-20260408-WA0025.mp4",
                thumbnail_url: "assets/images/category-crates.jpg",
                order: 1,
                is_active: true
            },
            {
                id: "bs-photo-1",
                title: "Luxury Pastel Floral Arch & Neon Sign",
                description: "Handcrafted fresh floral arch with custom bride-to-be signage.",
                media_type: "photo",
                file_url: "assets/images/category-flower-bouquet.jpg",
                thumbnail_url: "assets/images/category-flower-bouquet.jpg",
                order: 2,
                is_active: true
            },
            {
                id: "bs-reel-2",
                title: "Intimate Dinner Table & Ambient Candles",
                description: "Romantic candlelit table styling with gold cutlery and personalized menus.",
                media_type: "video",
                file_url: "https://res.cloudinary.com/djjvgubrk/video/upload/f_auto/q_auto/v1791548735/12291760_1920_1080_24fps.mp4",
                thumbnail_url: "assets/images/category-baskets.jpg",
                order: 3,
                is_active: true
            },
            {
                id: "bs-photo-2",
                title: "Bespoke Bridal Favor Gift Hampers",
                description: "Personalized wooden crates filled with scented candles and luxury souvenirs.",
                media_type: "photo",
                file_url: "assets/images/hero_showcase.jpg",
                thumbnail_url: "assets/images/hero_showcase.jpg",
                order: 4,
                is_active: true
            }
        ]
    },
    {
        name: "Wedding Event",
        slug: "wedding-event",
        description: "Opulent floral stages, candlelit Nikah walkways, royal sofa seating arrangements, and grand fairy light tunnels.",
        cover_image: "assets/images/hero_showcase.jpg",
        order: 2,
        is_active: true,
        media: [
            {
                id: "we-reel-1",
                title: "Royal Stage & Fairy Light Tunnel Entrance",
                description: "Grand couple entrance decor with cascading fairy lights and fresh rose runners.",
                media_type: "video",
                file_url: "https://res.cloudinary.com/djjvgubrk/video/upload/f_auto/q_auto/v1791548735/12291760_1920_1080_24fps.mp4",
                thumbnail_url: "assets/images/hero_showcase.jpg",
                order: 1,
                is_active: true
            },
            {
                id: "we-photo-1",
                title: "Floating Candle Mirror Pathway",
                description: "Romantic pathway with floating candles and calligraphic mirror welcome signs.",
                media_type: "photo",
                file_url: "assets/images/category-baskets.jpg",
                thumbnail_url: "assets/images/category-baskets.jpg",
                order: 2,
                is_active: true
            },
            {
                id: "we-reel-2",
                title: "Candlelit Nikah Stage Reveal",
                description: "Intimate Nikah decor with sheer drapery, chandeliers, and floral crescent arch.",
                media_type: "video",
                file_url: "https://res.cloudinary.com/djjvgubrk/video/upload/v1792587282/VID-20260408-WA0025.mp4",
                thumbnail_url: "assets/images/category-crates.jpg",
                order: 3,
                is_active: true
            }
        ]
    },
    {
        name: "Birthday Event",
        slug: "birthday-event",
        description: "Enchanted balloon garlands, customized marquee letter lighting, themed backdrop installations, and dessert table styling.",
        cover_image: "assets/images/category-balloon-boxes.jpg",
        order: 3,
        is_active: true,
        media: [
            {
                id: "bd-reel-1",
                title: "Enchanted Garden Balloon Installation",
                description: "Organic pastel balloon garland with fairy lights and custom name plaque.",
                media_type: "video",
                file_url: "https://res.cloudinary.com/djjvgubrk/video/upload/f_auto/q_auto/v1791548735/12291760_1920_1080_24fps.mp4",
                thumbnail_url: "assets/images/category-balloon-boxes.jpg",
                order: 1,
                is_active: true
            },
            {
                id: "bd-photo-1",
                title: "Golden Glam Marquee Light Setup",
                description: "Light-up numbers, shimmer wall backdrop, and customized cake pedestal.",
                media_type: "photo",
                file_url: "assets/images/category-balloon-boxes.jpg",
                thumbnail_url: "assets/images/category-balloon-boxes.jpg",
                order: 2,
                is_active: true
            }
        ]
    }
];

// Write category JSON files
defaultCategories.forEach(cat => {
    const filePath = path.join(eventsDir, `${cat.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cat, null, 2), 'utf8');
    console.log(`[Seed] Created category: ${cat.name} -> ${filePath}`);
});

console.log('[Seed] Seeding completed successfully.');
