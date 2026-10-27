document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryTitle = document.getElementById('category-title');
    const categoryDesc = document.getElementById('category-desc');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');

    const WA_PHONE = '923096708144';

    // Get category ID from URL query or path slug
    function getCategoryIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id')) return urlParams.get('id').trim();
        if (urlParams.get('category')) return urlParams.get('category').trim();

        const path = window.location.pathname.replace(/^\/|\/$/g, '');
        const slugMap = {
            'flower-bouquets-karachi': 'flower_bouquets',
            'customized-theme-cakes-karachi': 'cakes',
            'gift-baskets-hampers-karachi': 'baskets',
            'customized-balloon-boxes': 'balloon_boxes',
            'wooden-gift-crates-pakistan': 'crates',
            'personalized-photo-frames-gift': 'frames',
            'personalized-gifts-pakistan': 'customized_items',
            'wedding-trousseau-packing-karachi': 'trousseau_packing'
        };
        if (slugMap[path]) return slugMap[path];
        return null;
    }

    const categoryId = getCategoryIdFromUrl();

    // Human-Friendly, 40-60 Word Category Intros with Single Primary Keyword
    const categoryMap = {
        'flower_bouquets': {
            title: 'Fresh Flower Bouquets in Karachi',
            metaTitle: 'Fresh Flower Bouquets Karachi | Creations by H&I',
            metaDesc: 'Hand-tied fresh flower bouquets and imported rose arrangements in Karachi. Same-day surprise delivery. Order on WhatsApp!',
            desc: 'Surprise your loved ones in Karachi with hand-tied fresh flower bouquets. Our florists arrange velvety roses, lilies, and baby’s breath wrapped in pastel Korean paper and satin ribbons. Ideal for birthdays, anniversaries, and bridal showers, with prompt doorstep delivery across Karachi and personalized hamper combos.'
        },
        'cakes': {
            title: 'Customized Theme Cakes in Karachi',
            metaTitle: 'Customized Theme Cakes Karachi | Creations by H&I',
            metaDesc: 'Bespoke fondant and buttercream theme cakes in Karachi for birthdays, weddings, and bridal showers. Chat on WhatsApp to order!',
            desc: 'Celebrate special milestones with handcrafted theme cakes in Karachi. From whimsical birthday designs and elegant bridal shower bento cakes to multi-tier wedding cakes, each creation is baked fresh with premium chocolate fudge or vanilla flavors. Custom cake toppers and personal messages are designed on WhatsApp.'
        },
        'baskets': {
            title: 'Luxury Gift Baskets & Hampers in Karachi',
            metaTitle: 'Custom Gift Baskets Karachi | Creations by H&I',
            metaDesc: 'Curated gift baskets in Karachi with Godiva chocolates, perfumes & fresh flowers. Surprise delivery to Lahore, Islamabad & Gulf.',
            desc: 'Send heartfelt love with customized gift baskets in Karachi. We curate luxury gift hampers featuring chocolates from Godiva or Lindt, scented candles, fresh flowers, and personal keepsakes. Perfect for birthdays, weddings, Eid, and overseas surprises sent from Dubai and Jeddah to families across Pakistan.'
        },
        'balloon_boxes': {
            title: 'Customized Balloon Boxes in Karachi',
            metaTitle: 'Custom Balloon Boxes Karachi | Creations by H&I',
            metaDesc: 'Transparent balloon boxes with LED lights, mini balloons, and personalized name vinyl. Delivery in Karachi and nationwide.',
            desc: 'Make celebrations unforgettable with our customized balloon boxes. Each transparent display box features color-coordinated mini balloons, warm LED fairy lights, and personalized vinyl lettering. Add hidden gifts like perfumes, chocolates, or jewelry inside for an interactive surprise delivery in Karachi and courier gifts nationwide.'
        },
        'crates': {
            title: 'Handcrafted Wooden Gift Crates in Pakistan',
            metaTitle: 'Wooden Gift Crates Pakistan | Creations by H&I',
            metaDesc: 'Handcrafted wooden gift crates engraved with custom names. Packed with gourmet treats and dry fruits. Order on WhatsApp!',
            desc: 'Add rustic elegance to your gifting with handcrafted wooden gift crates in Pakistan. Each pine wood crate is custom-engraved with names or wedding dates and packed with artisanal goodies, perfumes, dry fruits, and florals. A timeless choice for groomsmen gifts, corporate hampers, and family celebrations.'
        },
        'frames': {
            title: 'Personalized Photo Frames in Karachi',
            metaTitle: 'Photo Frames & Gifts Karachi | Creations by H&I',
            metaDesc: 'Custom LED acrylic photo plaques and gold border keepsake frames in Karachi. Safe delivery across Pakistan. Order on WhatsApp!',
            desc: 'Preserve cherished memories with personalized photo frames in Karachi. Our collection includes illuminated acrylic LED photo frames, couple anniversary plaques, and classic gold-bordered keepsakes customized with your favorite photographs and personal messages. Safely packaged for surprise gift delivery across Karachi, Lahore, and Islamabad.'
        },
        'customized_items': {
            title: 'Personalized Mugs, Pens & Gifts in Pakistan',
            metaTitle: 'Personalized Gifts Pakistan | Creations by H&I',
            metaDesc: 'Custom ceramic mugs, engraved metal pens, and executive notebooks in Karachi. Corporate and personal gifts delivered nationwide.',
            desc: 'Add a personal touch to everyday essentials with customized gifts in Pakistan. We customize ceramic coffee mugs, executive engraved metal pens, and hardbound foil-stamped notebooks with your recipient\'s name or logo. Thoughtful keepsakes for birthdays, corporate appreciation, teachers, and colleague farewells delivered nationwide.'
        },
        'trousseau_packing': {
            title: 'Wedding Trousseau Packing in Karachi',
            metaTitle: 'Wedding Trousseau Packing | Creations by H&I',
            metaDesc: 'Luxury bridal trousseau packing in Karachi. Designer acrylic dress trays, lehenga wrapping & shadi saman vanity hampers.',
            desc: 'Transform your shadi saman with luxury wedding trousseau packing in Karachi. We design bespoke acrylic dress trays, bridal lehenga wraps, groom sherwani presentations, and embellished jewelry vanity hampers. Every tray is styled to match your wedding color palette, ensuring a royal presentation for your big day.'
        }
    };

    if (!categoryId || !categoryMap[categoryId]) {
        productsGrid.innerHTML = `
            <div class="error-box" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>Please select a collection to view our creations.</p>
                <div style="margin-top: 20px;">
                    <a href="/#services" class="btn btn-primary">Browse All Collections</a>
                </div>
            </div>
        `;
        return;
    }

    const currentCat = categoryMap[categoryId];
    categoryTitle.textContent = currentCat.title;
    categoryDesc.textContent = currentCat.desc;
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = currentCat.title;
    }
    document.title = currentCat.metaTitle;

    // Update Meta Description
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (metaDescTag) {
        metaDescTag.setAttribute('content', currentCat.metaDesc);
    }

    try {
        let data = null;

        // 1. Fetch live real-time data directly from GitHub Raw first (bypasses build delay)
        try {
            const ghResponse = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/${categoryId}.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (ghResponse.ok) {
                const ghData = await ghResponse.json();
                const ghProducts = (ghData && Array.isArray(ghData.products)) ? ghData.products : (Array.isArray(ghData) ? ghData : []);
                if (ghProducts.length > 0) {
                    data = ghData;
                }
            }
        } catch (ghErr) {
            console.debug('[Products] GitHub fetch fallback...');
        }

        // 2. Local file fallback
        if (!data) {
            try {
                const localResponse = await fetch(`data/${categoryId}.json?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });
                if (localResponse.ok) {
                    data = await localResponse.json();
                }
            } catch (localErr) {
                console.warn('[Products] Local fetch fallback...');
            }
        }

        const rawProducts = (data && data.products) ? data.products : (Array.isArray(data) ? data : []);

        // Filter active products with titles
        const products = rawProducts.filter(p => {
            if (!p || typeof p !== 'object') return false;
            const hasTitle = p.title && typeof p.title === 'string' && p.title.trim().length > 0;
            return hasTitle && p.active !== false;
        });

        // Hide category if 0 active items
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="media-placeholder-block" style="grid-column: 1 / -1; max-width: 600px; margin: 40px auto;">
                    <span class="ph-icon">🎁</span>
                    <p class="ph-text">New Creations Coming Soon</p>
                    <p class="ph-sub">We are handcrafting new items for this collection. Contact us on WhatsApp for custom orders!</p>
                    <div style="margin-top: 20px;">
                        <a href="https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`Hi, I would like to order a custom item from ${currentCat.title}`)}" class="btn wa-btn" target="_blank" rel="noopener noreferrer">Inquire on WhatsApp</a>
                    </div>
                </div>
            `;
            return;
        }

        products.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
        productsGrid.innerHTML = '';

        products.forEach((product, index) => {
            const detailUrl = `product-view.html?category=${categoryId}&id=${index}`;
            const encodedTitle = encodeURIComponent(`Hi! I want to order "${product.title}" from ${currentCat.title} on your website.`);
            const waLink = `https://wa.me/${WA_PHONE}?text=${encodedTitle}`;
            
            const hasVideo = !!product.video;
            const videoBadge = hasVideo ? `<div class="product-media-badge">🎬 Video Available</div>` : '';

            // Elegant fallback: neutral placeholder instead of broken image
            const hasImage = product.image && product.image.trim().length > 0;
            const mediaContent = hasImage ? `
                <img src="${product.image}" alt="${product.alt || product.title}" loading="lazy" width="400" height="300" onerror="this.parentElement.innerHTML='<div class=\\'media-placeholder-block\\'><span class=\\'ph-icon\\'>🎀</span><p class=\\'ph-text\\'>Photo Coming Soon</p></div>';">
            ` : `
                <div class="media-placeholder-block">
                    <span class="ph-icon">🎀</span>
                    <p class="ph-text">Photo Coming Soon</p>
                </div>
            `;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="${detailUrl}" class="product-card-link-wrap">
                    <div class="product-media">
                        ${videoBadge}
                        ${mediaContent}
                        <div class="product-media-overlay">
                            <span class="overlay-view-badge">View Details &rarr;</span>
                        </div>
                    </div>
                </a>
                <div class="product-content">
                    <a href="${detailUrl}" style="text-decoration: none; color: inherit;">
                        <h3 class="product-title">${product.title}</h3>
                    </a>
                    <p class="product-desc">${product.description || 'Artistic creation handcrafted with perfection.'}</p>
                    <div class="product-card-actions">
                        <a href="${detailUrl}" class="btn-card-view">View Details</a>
                        <a href="${waLink}" class="btn-card-wa" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
                    </div>
                </div>
            `;

            productsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
            <div class="error-box" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>Products could not be loaded at this moment. Please refresh.</p>
                <div style="margin-top: 20px;">
                    <a href="/" class="btn btn-primary">Go to Home</a>
                </div>
            </div>
        `;
    }
});
