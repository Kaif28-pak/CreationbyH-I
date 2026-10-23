document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryTitle = document.getElementById('category-title');
    const categoryDesc = document.getElementById('category-desc');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');

    // Get the category ID from URL query or path slug
    function getCategoryIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id')) return urlParams.get('id').trim();
        if (urlParams.get('category')) return urlParams.get('category').trim();

        // Check path slug like /flower-bouquets-karachi
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

    // Map ID to comprehensive SEO titles and 150-250 words intro texts
    const categoryMap = {
        'flower_bouquets': {
            title: 'Fresh Flower Bouquets in Karachi',
            metaTitle: 'Fresh Flower Bouquets Karachi | Roses & Floral Delivery',
            desc: 'Surprise your loved ones with breathtaking, hand-tied fresh floral bouquets and imported rose arrangements handcrafted by Creations by H&I. Whether it\'s a romantic anniversary, a milestone birthday, Valentine\'s Day, or a luxury bridal shower surprise, our florists curate each bouquet using fresh baby\'s breath, pastel carnations, and velvety roses wrapped in Korean aesthetic sheets and satin ribbons. We provide prompt same-day and scheduled surprise flower delivery across Karachi, with customized gift basket combos sent to Lahore, Islamabad, and overseas families in Dubai and Jeddah.'
        },
        'cakes': {
            title: 'Customized Theme Cakes in Karachi',
            metaTitle: 'Customized Theme Cakes Karachi | Birthday & Wedding Cakes',
            desc: 'Celebrate life’s sweetest moments with bespoke designer cakes from Creations by H&I. From pastel multi-tiered wedding cakes and floral bridal shower bento cakes to whimsical cartoon character birthday cakes and rich chocolate fudge creations, each cake is baked fresh with premium ingredients. Customized according to your preferred color palette, theme, and personalized cake topper messages, our artisan cakes bring your dream event vision to reality across Karachi.'
        },
        'baskets': {
            title: 'Luxury Gift Baskets & Hampers in Pakistan',
            metaTitle: 'Luxury Gift Baskets Karachi | Customized Gift Hampers Pakistan',
            desc: 'Elevate your gifting experience with our signature luxury gift hampers and personalized baskets in Karachi. Designed for corporate celebrations, weddings, Eid festivities, and intimate surprises, our baskets are thoughtfully curated with premium branded chocolates (Godiva, Lindt, Ferrero Rocher), aromatic scented candles, designer body mists, personalized mugs, and fresh florals. We offer seamless door-to-door delivery across Karachi, Lahore, Islamabad, and international overseas ordering from Dubai (UAE) and Jeddah (KSA).'
        },
        'balloon_boxes': {
            title: 'Customized Balloon Boxes for Birthdays & Celebrations',
            metaTitle: 'Customized Balloon Boxes | Birthday & Proposal Surprise Gifts',
            desc: 'Make every birthday, graduation, or proposal truly unforgettable with our customized transparent balloon boxes. Each acrylic box is filled with coordinated pastel balloons, delicate warm LED fairy lights, and customized vinyl lettering with your personal message. Conceal hidden gifts such as jewelry boxes, perfume bottles, or sweets inside the base for the ultimate interactive unboxing surprise. Available with Karachi delivery and nationwide hamper packing.'
        },
        'crates': {
            title: 'Handcrafted Wooden Gift Crates in Pakistan',
            metaTitle: 'Wooden Gift Crates Pakistan | Luxury Bespoke Gift Boxes',
            desc: 'Add rustic charm and bespoke elegance to your gifts with our handcrafted wooden gift crates. Finished with smooth natural wooden tones, laser-engraved personal names, and satin bow accents, our crates are ideal for groomsmen favors, bridal trousseau hampers, baby birth announcements, and festive gifts. Each crate is custom-filled with your curated selection of luxury souvenirs, dry fruits, and branded delicacies.'
        },
        'frames': {
            title: 'Personalized Photo Frames & Keepsake Gifts',
            metaTitle: 'Personalized Photo Frames Pakistan | Custom Keepsake Gifts',
            desc: 'Preserve your most cherished milestones with bespoke personalized photo frames by Creations by H&I. Featuring elegant gold borders, acrylic collage layouts, illuminated LED night lamps, and custom couple anniversary quotes, our photo frames make sentimental keepsakes for bedrooms, offices, and living rooms. Handcrafted with precision and carefully bubble-wrapped for safe delivery throughout Pakistan.'
        },
        'customized_items': {
            title: 'Personalized Mugs, Pens & Custom Gifts in Pakistan',
            metaTitle: 'Personalized Gifts Pakistan | Custom Mugs, Pens & Journals',
            desc: 'Make daily moments special with personalized everyday accessories. Our customized collection features glossy ceramic name mugs, magic heat-sensitive color-changing mugs, luxury engraved metallic rollerball pens, and hardbound foil-stamped personal journals. Ideal for teachers\' day gifts, corporate brand giveaways, colleague farewells, and custom stationery sets delivered across Karachi and nationwide.'
        },
        'trousseau_packing': {
            title: 'Wedding Trousseau Packing Services in Karachi',
            metaTitle: 'Wedding Trousseau Packing Karachi | Shadi Saman & Dress Trays',
            desc: 'Present your bridal wedding trousseau and shadi saman with unmatched royal grandeur. Creations by H&I specializes in luxury bridal trousseau packing in Karachi, including designer acrylic dress trays, embellished jewelry boxes, vanity hampers, floral suit wraps, and coordinate luggage styling. Whether preparing groom sherwani trays, bridal lehenga presentations, or sweet box hampers, we transform traditional wedding preparations into an aesthetic work of art.'
        }
    };

    if (!categoryId || !categoryMap[categoryId]) {
        productsGrid.innerHTML = `
            <div class="error-box">
                <p>Please select a category from the home page.</p>
                <div style="margin-top: 20px;">
                    <a href="/#services" class="btn btn-primary">Browse Categories</a>
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
    document.title = `${currentCat.metaTitle || currentCat.title} | Creations by H&I`;

    try {
        let data = null;

        // 1. Fetch live real-time data directly from GitHub Raw first (bypasses any Netlify build delay)
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
            console.warn('[Products] Live GitHub fetch failed, attempting local fallback...', ghErr);
        }

        // 2. Local file fallback if GitHub fetch didn't return data
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
                console.warn('[Products] Local fetch also failed:', localErr);
            }
        }

        if (!data) {
            productsGrid.innerHTML = `
                <div class="error-box">
                    <p>No products found in this category yet. New arrivals coming soon!</p>
                    <div style="margin-top: 20px;">
                        <a href="index.html#services" class="btn btn-primary">Browse Other Categories</a>
                    </div>
                </div>
            `;
            return;
        }

        const rawProducts = data.products ? data.products : (Array.isArray(data) ? data : []);

        // Strict filter: Exclude any deleted, empty, or blank items
        const products = rawProducts.filter(p => {
            if (!p || typeof p !== 'object') return false;
            const hasTitle = p.title && typeof p.title === 'string' && p.title.trim().length > 0;
            const hasMedia = (p.image && p.image.trim().length > 0) || (p.video && p.video.trim().length > 0);
            return hasTitle && hasMedia;
        });

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="error-box">
                    <p>No products found in this category yet. New arrivals coming soon!</p>
                    <div style="margin-top: 20px;">
                        <a href="index.html#services" class="btn btn-primary">Browse Other Categories</a>
                    </div>
                </div>
            `;
            return;
        }

        // Sort by order if available
        products.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

        productsGrid.innerHTML = '';

        products.forEach((product, index) => {
            const detailUrl = `product-view.html?category=${categoryId}&id=${index}`;
            const encodedTitle = encodeURIComponent(`Hi! I want to inquire about "${product.title}" from ${categoryMap[categoryId].title} on your website.`);
            const waLink = `https://wa.me/923096708144?text=${encodedTitle}`;
            
            const hasVideo = !!product.video;
            const videoBadge = hasVideo ? `<div class="product-media-badge">🎬 Video Available</div>` : '';

            const fallbackImg = 'assets/images/category-flower-bouquet.jpg';
            const imgSrc = product.image || fallbackImg;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="${detailUrl}" class="product-card-link-wrap">
                    <div class="product-media">
                        ${videoBadge}
                        <img src="${imgSrc}" alt="${product.title}" onerror="this.onerror=null; this.src='${fallbackImg}';">
                        <div class="product-media-overlay">
                            <span class="overlay-view-badge">View Details & Media &rarr;</span>
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
                        <a href="${waLink}" class="btn-card-wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </div>
                </div>
            `;

            productsGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
            <div class="error-box">
                <p>Failed to load products. Please refresh the page or try again later.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html" class="btn btn-primary">Go to Home</a>
                </div>
            </div>
        `;
    }
});

