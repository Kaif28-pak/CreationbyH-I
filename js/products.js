document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryTitle = document.getElementById('category-title');
    const categoryDesc = document.getElementById('category-desc');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');

    const WA_PHONE = '923096708144';

    // Get category ID from URL query or path slug
    function getCategoryIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const queryVal = (urlParams.get('id') || urlParams.get('category') || urlParams.get('cat') || urlParams.get('slug') || '').trim();

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

        if (queryVal) {
            if (slugMap[queryVal]) return slugMap[queryVal];
            return queryVal;
        }

        const path = window.location.pathname.replace(/^\/|\/$/g, '').replace(/\.html$/, '');
        if (slugMap[path]) return slugMap[path];
        if (path && Object.values(slugMap).includes(path)) return path;
        return null;
    }

    const categoryId = getCategoryIdFromUrl();

    // Human-Friendly, 40-60 Word Category Intros with Single Primary Keyword
    const categoryMap = {
        'flower_bouquets': {
            title: 'Fresh Flower Bouquets in Karachi',
            metaTitle: 'Send Flowers to Karachi | Flower Delivery | Creations by H&I',
            metaDesc: 'Send fresh flowers to Karachi with same day surprise delivery. Velvet roses, lilies & flower combo hampers. Order on WhatsApp!',
            desc: 'Surprise your loved ones in Karachi with hand-tied fresh flower bouquets. Our florists arrange velvety roses, lilies, and baby’s breath wrapped in pastel Korean paper and satin ribbons. Ideal for birthdays, anniversaries, and bridal showers, with prompt doorstep delivery across Karachi and personalized hamper combos.'
        },
        'cakes': {
            title: 'Customized Theme Cakes & Birthday Cakes in Karachi',
            metaTitle: 'Customized Cakes Karachi | Birthday Cakes | Creations by H&I',
            metaDesc: 'Order customized theme cakes & bento cakes in Karachi. Freshly baked fondant birthday cakes with doorstep delivery across Karachi. Chat on WhatsApp!',
            desc: 'Celebrate special milestones with handcrafted theme cakes in Karachi. From whimsical birthday designs and elegant bridal shower bento cakes to multi-tier wedding cakes, each creation is baked fresh with premium chocolate fudge or vanilla flavors. Custom cake toppers and personal messages are designed on WhatsApp.'
        },
        'baskets': {
            title: 'Luxury Gift Baskets & Hampers in Karachi',
            metaTitle: 'Gift Baskets Karachi | Luxury Hampers | Creations by H&I',
            metaDesc: 'Order custom gift baskets in Karachi. Premium chocolate hampers, perfumes & floral gifts with same day surprise delivery in Karachi. Chat on WhatsApp!',
            desc: 'Send heartfelt love with customized gift baskets in Karachi. We curate luxury gift hampers featuring chocolates from Godiva or Lindt, scented candles, fresh flowers, and personal keepsakes. Perfect for birthdays, weddings, Eid, and overseas surprises sent from Dubai and Jeddah to families across Pakistan.'
        },
        'balloon_boxes': {
            title: 'Customized Balloon Boxes & Hampers in Karachi',
            metaTitle: 'Balloon Hampers & Bobo Balloons Karachi | Creations by H&I',
            metaDesc: 'Order customized Bobo balloon hampers & balloon baskets in Karachi. Clear balloons with chocolates, snacks & LED lights. Same day delivery on WhatsApp!',
            desc: 'Make celebrations unforgettable with our customized balloon boxes and hot air Bobo balloon hampers. Each clear display box features color-coordinated balloons, warm fairy lights, and custom name lettering, packed with chocolates, snacks, or flowers for surprise doorstep delivery across Karachi.'
        },
        'crates': {
            title: 'Handcrafted Wooden Gift Boxes & Crates in Pakistan',
            metaTitle: 'Wooden Gift Boxes & Crates Pakistan | Creations by H&I',
            metaDesc: 'Order custom wooden gift boxes, crates & dry fruit hampers in Pakistan. Personalized pine wood keepsake boxes with nationwide delivery. Order on WhatsApp!',
            desc: 'Add rustic elegance to your gifting with handcrafted wooden gift boxes and crates in Pakistan. Each pine wood box is custom-engraved with names or logos and packed with dry fruits, gourmet chocolates, perfumes, and keepsakes. Ideal for corporate gifts, weddings, and personalized keepsake hampers across Pakistan.'
        },
        'frames': {
            title: 'Customized LED Photo Frames & Plaques in Pakistan',
            metaTitle: 'LED Photo Frames & Light Frames Karachi | Creations by H&I',
            metaDesc: 'Order custom LED photo frames & light frames in Pakistan. Perfect wedding & anniversary photo frame gifts with warm LED lights. Safe delivery on WhatsApp!',
            desc: 'Preserve cherished moments with customized LED photo frames and illuminated picture frames in Pakistan. Our collection features acrylic LED light photo frames, couple wedding anniversary plaques, and glowing keepsakes customized with your favorite photos, special dates, and personal messages. Safely bubble-wrapped and delivered across Karachi, Lahore, Islamabad, and nationwide.'
        },
        'customized_items': {
            title: 'Personalized Gifts, Custom Pens & Mugs in Pakistan',
            metaTitle: 'Customized Gifts Pakistan | Mugs & Pens | Creations by H&I',
            metaDesc: 'Order customized gifts in Pakistan. Personalized pens with name, custom mugs & corporate gifts in Karachi. Fast nationwide delivery. Order on WhatsApp!',
            desc: 'Elevate your gifting with bespoke customized gifts in Pakistan. We specialize in personalized pens with name engraving, custom ceramic coffee mugs, metallic keychains, and executive corporate gifts in Karachi. Perfect for birthdays, employee appreciation, farewells, and custom branding, safely packaged with fast nationwide delivery across Pakistan.'
        },
        'trousseau_packing': {
            title: 'Wedding Trousseau Packing & Tray Decoration in Karachi',
            metaTitle: 'Wedding Trousseau Packing & Trays Karachi | Creations by H&I',
            metaDesc: 'Luxury wedding trousseau packing & tray decoration in Karachi. Designer bridal lehenga wraps, nikkah ring trays & shadi bari hampers. Order on WhatsApp!',
            desc: 'Elevate your wedding celebration with luxury wedding trousseau packing and tray decoration in Karachi. We design bespoke acrylic dress trays, bridal lehenga wraps, groom sherwani presentations, nikkah ring trays, and bridal vanity hampers. Exquisitely styled for shadi bari, jahez, and engagement ceremonies with doorstep delivery in Karachi.'
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
        let rawProducts = [];
        let isFirebaseActive = false;

        // 1. Cloud Firestore is the SOLE authority when configured
        if (window.CreationsFirebase && window.CreationsFirebase.isConfigured()) {
            isFirebaseActive = true;
            try {
                const fbProducts = await window.CreationsFirebase.getProductsByCategory(categoryId);
                if (Array.isArray(fbProducts)) {
                    rawProducts = fbProducts;
                    console.log(`[Products] Loaded ${rawProducts.length} items from Cloud Firestore.`);
                }
            } catch (fbErr) {
                console.warn('[Products] Firebase fetch error:', fbErr);
            }
        }

        // 2. Fallback only if Firebase is not active
        if (!isFirebaseActive) {
            try {
                const localResponse = await fetch(`data/${categoryId}.json?t=${Date.now()}`, {
                    cache: 'no-store'
                });
                if (localResponse.ok) {
                    const localData = await localResponse.json();
                    rawProducts = (localData && localData.products) ? localData.products : (Array.isArray(localData) ? localData : []);
                }
            } catch (localErr) {}
        }

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
            const docIdentifier = product.id && !product.id.startsWith('local_') ? product.id : index;
            const detailUrl = `product-view.html?category=${categoryId}&id=${docIdentifier}`;
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
                    <p class="product-desc">${product.description || product.shortDescription || 'Artistic creation handcrafted with perfection.'}</p>
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
