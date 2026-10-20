document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('products-grid');
    const categoryTitle = document.getElementById('category-title');
    const categoryDesc = document.getElementById('category-desc');
    const breadcrumbCategory = document.getElementById('breadcrumb-category');

    // Get the category ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');

    // Map ID to readable titles
    const categoryMap = {
        'flower_bouquets': { title: 'Flower Bouquets', desc: 'Beautiful, premium and elegant floral bouquets for every occasion.' },
        'cakes': { title: 'Cakes & Customized Cakes', desc: 'Beautiful custom designed fondant cakes with elegant decorations.' },
        'baskets': { title: 'Baskets', desc: 'Elegant gift baskets filled with premium goodies and wrapped beautifully.' },
        'balloon_boxes': { title: 'Balloon Boxes', desc: 'Transparent balloon boxes filled with colorful balloons for party decor.' },
        'crates': { title: 'Crates', desc: 'Premium wooden crates filled with luxury gifts and flowers.' },
        'frames': { title: 'Frames', desc: 'Elegant customized photo frames wrapped perfectly as a gift.' },
        'customized_items': { title: 'Customized Items', desc: 'Personalized gifts like custom mugs, notebooks, pens and more.' }
    };

    if (!categoryId || !categoryMap[categoryId]) {
        productsGrid.innerHTML = `
            <div class="error-box">
                <p>Please select a category from the home page.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html#services" class="btn btn-primary">Browse Categories</a>
                </div>
            </div>
        `;
        return;
    }

    categoryTitle.textContent = categoryMap[categoryId].title;
    categoryDesc.textContent = categoryMap[categoryId].desc;
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = categoryMap[categoryId].title;
    }
    document.title = `${categoryMap[categoryId].title} | Creations by H&I`;

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

