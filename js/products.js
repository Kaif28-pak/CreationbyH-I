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
        const response = await fetch(`data/${categoryId}.json`);
        
        if (!response.ok) {
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

        const data = await response.json();
        const products = data.products || [];

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
        products.sort((a, b) => (a.order || 0) - (b.order || 0));

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

