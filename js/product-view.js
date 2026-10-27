document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.getElementById('product-content-area');
    const breadcrumbCategoryLink = document.getElementById('breadcrumb-category-link');
    const breadcrumbProductName = document.getElementById('breadcrumb-product-name');
    const backToCategoryBtn = document.getElementById('back-to-category-btn');

    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxContent = document.getElementById('lightbox-content');

    const WA_PHONE = '923096708144';

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category') || urlParams.get('cat') || urlParams.get('id');
    const productParam = urlParams.get('id') || urlParams.get('product') || urlParams.get('index');

    const categoryMap = {
        'flower_bouquets': { 
            title: 'Fresh Flower Bouquets', 
            slug: 'flower-bouquets-karachi'
        },
        'cakes': { 
            title: 'Customized Theme Cakes', 
            slug: 'customized-theme-cakes-karachi'
        },
        'baskets': { 
            title: 'Luxury Gift Baskets & Hampers', 
            slug: 'gift-baskets-hampers-karachi'
        },
        'balloon_boxes': { 
            title: 'Customized Balloon Boxes', 
            slug: 'customized-balloon-boxes'
        },
        'crates': { 
            title: 'Wooden Gift Crates', 
            slug: 'wooden-gift-crates-pakistan'
        },
        'frames': { 
            title: 'Personalized Photo Frames', 
            slug: 'personalized-photo-frames-gift'
        },
        'customized_items': { 
            title: 'Personalized Mugs, Pens & Notebooks', 
            slug: 'personalized-gifts-pakistan'
        },
        'trousseau_packing': {
            title: 'Wedding Trousseau Packing',
            slug: 'wedding-trousseau-packing-karachi'
        }
    };

    if (!categoryId || !categoryMap[categoryId]) {
        contentArea.innerHTML = `
            <div class="error-box" style="text-align: center; padding: 40px;">
                <p>No valid collection selected. Please explore our collections.</p>
                <div style="margin-top: 20px;">
                    <a href="/#services" class="btn btn-primary">Browse Collections</a>
                </div>
            </div>
        `;
        return;
    }

    const categoryInfo = categoryMap[categoryId];
    const categoryPageUrl = `/${categoryInfo.slug}`;

    if (breadcrumbCategoryLink) {
        breadcrumbCategoryLink.href = categoryPageUrl;
        breadcrumbCategoryLink.textContent = categoryInfo.title;
    }
    if (backToCategoryBtn) {
        backToCategoryBtn.href = categoryPageUrl;
        backToCategoryBtn.innerHTML = `&larr; Back to ${categoryInfo.title}`;
    }

    try {
        let data = null;

        // 1. Fetch live real-time data from GitHub Raw first
        try {
            const ghResponse = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/${categoryId}.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (ghResponse.ok) {
                const ghData = await ghResponse.json();
                const ghProducts = (ghData && Array.isArray(ghData.products)) ? ghData.products : (Array.isArray(ghData) ? ghData : []);
                if (ghProducts.length > 0) data = ghData;
            }
        } catch (ghErr) {}

        // 2. Local fallback
        if (!data) {
            try {
                const localResponse = await fetch(`data/${categoryId}.json?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });
                if (localResponse.ok) data = await localResponse.json();
            } catch (localErr) {}
        }

        const rawProducts = (data && data.products) ? data.products : (Array.isArray(data) ? data : []);
        const products = rawProducts.filter(p => p && p.title && p.title.trim().length > 0 && p.active !== false);

        if (products.length === 0) {
            contentArea.innerHTML = `
                <div class="media-placeholder-block" style="max-width: 600px; margin: 40px auto;">
                    <span class="ph-icon">🎁</span>
                    <p class="ph-text">New Product Details Coming Soon</p>
                    <p class="ph-sub">Contact our team directly on WhatsApp for photos and custom orders.</p>
                    <div style="margin-top: 20px;">
                        <a href="https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`Hi, I want to inquire about custom orders in ${categoryInfo.title}`)}" class="btn wa-btn" target="_blank" rel="noopener noreferrer">Inquire on WhatsApp</a>
                    </div>
                </div>
            `;
            return;
        }

        products.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

        let currentIndex = 0;
        const parsedIndex = parseInt(productParam, 10);
        if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < products.length) {
            currentIndex = parsedIndex;
        }

        const product = products[currentIndex];
        document.title = `${product.title} | Creations by H&I`;
        if (breadcrumbProductName) breadcrumbProductName.textContent = product.title;

        const encodedOrderMessage = encodeURIComponent(
            `Hello Creations by H&I!\n\nI want to order:\n*${product.title}*\nCollection: ${categoryInfo.title}\n\nPlease share availability and customization options.`
        );
        const waOrderLink = `https://wa.me/${WA_PHONE}?text=${encodedOrderMessage}`;

        const pageUrl = window.location.href;
        const encodedShareMessage = encodeURIComponent(
            `Check out this custom creation from Creations by H&I (Karachi):\n${product.title}\n${pageUrl}`
        );
        const waShareLink = `https://api.whatsapp.com/send?text=${encodedShareMessage}`;

        const hasImage = !!product.image;
        const hasVideo = !!product.video;
        const activeImg = product.image || 'assets/images/category-baskets.jpg';

        contentArea.innerHTML = `
            <div class="product-detail-layout" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: clamp(24px, 4vw, 48px); margin-top: 20px; align-items: start;">
                
                <!-- Left: Media Showcase -->
                <div class="media-showcase-box" style="background: #FFF9FB; border-radius: 18px; padding: 16px; border: 1px solid rgba(227, 153, 182, 0.3);">
                    <div class="media-display-viewport" style="border-radius: 14px; overflow: hidden; aspect-ratio: 4/3; background: #FFF5F8; display: flex; align-items: center; justify-content: center;">
                        <img src="${activeImg}" alt="${product.alt || product.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/images/category-baskets.jpg';">
                    </div>
                    ${hasVideo ? `
                        <div style="margin-top: 14px;">
                            <video src="${product.video}" controls playsinline style="width: 100%; border-radius: 12px; max-height: 300px;"></video>
                        </div>
                    ` : ''}
                </div>

                <!-- Right: Product Information & CTAs -->
                <div class="product-info-panel" style="display: flex; flex-direction: column; gap: 16px;">
                    <span class="category-pill" style="align-self: flex-start; background: #FCE8EE; color: var(--text-dark); padding: 6px 16px; border-radius: 20px; font-size: 0.82rem; font-weight: 600;">${categoryInfo.title}</span>
                    <h1 class="product-view-title" style="font-size: clamp(1.6rem, 3.5vw, 2.3rem); line-height: 1.25; margin: 0;">${product.title}</h1>
                    <p class="product-view-desc" style="font-size: 1rem; color: var(--text-light); line-height: 1.6; margin: 0;">${product.description || 'Each creation is uniquely handcrafted to bring artistic elegance and joy to your special occasions.'}</p>
                    
                    <div class="product-price-badge" style="font-size: 1.25rem; font-weight: 700; color: var(--text-dark);">
                        <span>Price: </span><span style="color: var(--accent-pink);">${product.price || 'Custom Quote'}</span>
                    </div>

                    <!-- Perks & Trust -->
                    <div class="product-perks" style="background: #FFF9FB; border-radius: 12px; padding: 14px; border: 1px solid rgba(227, 153, 182, 0.2); display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-size: 0.88rem;"><strong>🎀 100% Handcrafted:</strong> Tailored to your choice and budget.</div>
                        <div style="font-size: 0.88rem;"><strong>🌸 Fresh & Premium:</strong> Quality chocolates, florals, and keepsakes.</div>
                        <div style="font-size: 0.88rem;"><strong>🚚 Surprise Delivery:</strong> Karachi, Lahore, Islamabad, UAE & KSA.</div>
                    </div>

                    <!-- Dual WhatsApp CTA Buttons -->
                    <div class="product-action-buttons" style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                        <a href="${waOrderLink}" class="btn wa-btn" style="padding: 14px 24px; font-size: 1rem; justify-content: center; width: 100%; border-radius: 30px;" target="_blank" rel="noopener noreferrer">
                            💬 Order on WhatsApp
                        </a>
                        <a href="${waShareLink}" class="btn btn-outline" style="padding: 12px 24px; font-size: 0.92rem; justify-content: center; width: 100%; border-radius: 30px; display: inline-flex; align-items: center; gap: 8px;" target="_blank" rel="noopener noreferrer">
                            📤 Share on WhatsApp
                        </a>
                    </div>

                    <!-- Prev / Next Navigation -->
                    ${products.length > 1 ? `
                        <div class="product-pager-bar" style="display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; border-top: 1px solid rgba(227, 153, 182, 0.2); padding-top: 16px;">
                            <a href="product-view.html?category=${categoryId}&id=${currentIndex > 0 ? currentIndex - 1 : products.length - 1}" class="back-link-btn" style="font-size: 0.88rem;">
                                &larr; Previous Item
                            </a>
                            <a href="product-view.html?category=${categoryId}&id=${currentIndex < products.length - 1 ? currentIndex + 1 : 0}" class="back-link-btn" style="font-size: 0.88rem;">
                                Next Item &rarr;
                            </a>
                        </div>
                    ` : ''}

                </div>

            </div>
        `;

    } catch (error) {
        console.error('Error fetching product:', error);
        contentArea.innerHTML = `
            <div class="error-box" style="text-align: center; padding: 40px;">
                <p>Could not load product details. Please refresh or return to collections.</p>
                <div style="margin-top: 20px;">
                    <a href="/#services" class="btn btn-primary">Browse Collections</a>
                </div>
            </div>
        `;
    }
});
