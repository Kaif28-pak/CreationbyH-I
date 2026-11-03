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
    let categoryId = urlParams.get('category') || urlParams.get('cat');
    let productParam = urlParams.get('id') || urlParams.get('product') || urlParams.get('index');

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

    // If only ?id= is given and matches a category key, treat as categoryId
    if (!categoryId && productParam && categoryMap[productParam]) {
        categoryId = productParam;
        productParam = null;
    }

    // Direct Firestore lookup if categoryId is missing but product doc ID is provided
    let directProductDoc = null;
    if (!categoryId && productParam && window.CreationsFirebase && window.CreationsFirebase.isConfigured()) {
        try {
            directProductDoc = await window.CreationsFirebase.getProductById(productParam);
            if (directProductDoc && directProductDoc.category && categoryMap[directProductDoc.category]) {
                categoryId = directProductDoc.category;
            }
        } catch (e) {
            console.warn('[ProductView] Direct lookup error:', e);
        }
    }

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
        let rawProducts = [];

        if (directProductDoc) {
            rawProducts = [directProductDoc];
        }

        // 1. Fetch live from Cloud Firestore if configured
        if (rawProducts.length === 0 && window.CreationsFirebase && window.CreationsFirebase.isConfigured()) {
            try {
                if (productParam && isNaN(parseInt(productParam, 10))) {
                    const singleDoc = await window.CreationsFirebase.getProductById(productParam);
                    if (singleDoc) {
                        rawProducts = [singleDoc];
                    }
                }
                if (rawProducts.length === 0) {
                    const fbProducts = await window.CreationsFirebase.getProductsByCategory(categoryId);
                    if (fbProducts && fbProducts.length > 0) {
                        rawProducts = fbProducts;
                    }
                }
            } catch (fbErr) {
                console.warn('[ProductView] Firebase fallback:', fbErr);
            }
        }

        // 2. Local fallback
        if (rawProducts.length === 0) {
            try {
                const localResponse = await fetch(`data/${categoryId}.json?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });
                if (localResponse.ok) {
                    const localData = await localResponse.json();
                    rawProducts = (localData && localData.products) ? localData.products : (Array.isArray(localData) ? localData : []);
                }
            } catch (localErr) {}
        }

        // 3. GitHub Raw fallback
        if (rawProducts.length === 0) {
            try {
                const ghResponse = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/${categoryId}.json?t=${Date.now()}`, {
                    cache: 'no-store'
                });
                if (ghResponse.ok) {
                    const ghData = await ghResponse.json();
                    rawProducts = (ghData && ghData.products) ? ghData.products : (Array.isArray(ghData) ? ghData : []);
                }
            } catch (ghErr) {}
        }

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

        let product = null;
        if (productParam) {
            product = products.find(p => p.id === productParam);
        }
        if (!product) {
            let currentIndex = 0;
            const parsedIndex = parseInt(productParam, 10);
            if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < products.length) {
                currentIndex = parsedIndex;
            }
            product = products[currentIndex];
        }

        document.title = `${product.title} | Creations by H&I`;
        if (breadcrumbProductName) breadcrumbProductName.textContent = product.title;

        // Dynamic Meta Description for SEO
        const metaDesc = product.description || product.shortDescription || `Order ${product.title} from Creations by H&I. Handcrafted in Karachi, customized for birthdays, weddings, and celebrations. Order on WhatsApp!`;
        const metaDescTag = document.querySelector('meta[name="description"]');
        if (metaDescTag) metaDescTag.setAttribute('content', metaDesc);

        // Dynamic OpenGraph / Social Share Meta Tags for WhatsApp & Social Previews
        function updateMeta(prop, val) {
            if (!val) return;
            let el = document.querySelector(`meta[property="${prop}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('property', prop);
                document.head.appendChild(el);
            }
            el.setAttribute('content', val);
        }
        updateMeta('og:title', `${product.title} | Creations by H&I Karachi`);
        updateMeta('og:description', metaDesc);
        if (product.image) updateMeta('og:image', product.image);
        updateMeta('og:url', window.location.href);

        // Schema.org Product Structured Data (JSON-LD) for Google Rich Snippets
        let jsonLdScript = document.getElementById('product-schema-jsonld');
        if (!jsonLdScript) {
            jsonLdScript = document.createElement('script');
            jsonLdScript.id = 'product-schema-jsonld';
            jsonLdScript.type = 'application/ld+json';
            document.head.appendChild(jsonLdScript);
        }
        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "description": metaDesc,
            "image": product.image ? [product.image] : [],
            "brand": {
                "@type": "Brand",
                "name": "Creations by H&I"
            },
            "offers": {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "PKR",
                "price": product.price ? product.price : 0,
                "availability": "https://schema.org/InStock"
            }
        };
        jsonLdScript.textContent = JSON.stringify(schema);

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

                <!-- Right: Product Information & Action Buttons -->
                <div class="product-info-box" style="display: flex; flex-direction: column; gap: 18px;">
                    <div>
                        <span class="category-badge" style="display: inline-block; background: #FFEAF1; color: var(--accent-pink-dark, #b5537d); font-size: 0.8rem; font-weight: 600; padding: 4px 14px; border-radius: 20px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${categoryInfo.title}
                        </span>
                        <h1 style="font-family: 'Lora', serif; font-size: clamp(1.6rem, 3.5vw, 2.4rem); color: var(--text-dark); margin: 0 0 10px 0; line-height: 1.25;">
                            ${product.title}
                        </h1>
                        ${product.price ? `
                            <div style="font-size: 1.3rem; font-weight: 700; color: #a26b7e; margin-bottom: 12px;">
                                Rs. ${Number(product.price).toLocaleString()}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Short Description (20-25 words guideline) -->
                    <div class="product-desc-box" style="background: #ffffff; border: 1px solid #fae1ea; border-radius: 12px; padding: 18px;">
                        <h4 style="font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px; color: #6b6462; margin-bottom: 8px;">Description</h4>
                        <p style="font-size: 1rem; line-height: 1.6; color: var(--text-dark); margin: 0;">
                            ${product.description || product.shortDescription || 'Each piece is uniquely handcrafted with utmost precision and artistic dedication in Karachi.'}
                        </p>
                    </div>

                    <!-- Customization Highlights -->
                    <div class="customization-highlights" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="background: #FFFDFE; border: 1px solid #fae1ea; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.4rem;">✨</span>
                            <span style="font-size: 0.85rem; font-weight: 500;">100% Customized to Order</span>
                        </div>
                        <div style="background: #FFFDFE; border: 1px solid #fae1ea; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.4rem;">🚚</span>
                            <span style="font-size: 0.85rem; font-weight: 500;">Karachi, Gulf & Pakistan</span>
                        </div>
                    </div>

                    <!-- CTA Actions -->
                    <div class="product-detail-actions" style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                        <a href="${waOrderLink}" class="btn wa-btn" style="padding: 14px 24px; font-size: 1.05rem; justify-content: center; font-weight: 600; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.25);" target="_blank" rel="noopener noreferrer">
                            💬 Order on WhatsApp
                        </a>
                        
                        <a href="${waShareLink}" class="btn" style="background: #ffffff; border: 1.5px solid #25D366; color: #128C7E; padding: 12px 20px; font-size: 0.95rem; justify-content: center; font-weight: 600; border-radius: 8px;" target="_blank" rel="noopener noreferrer">
                            📤 Share on WhatsApp
                        </a>
                    </div>
                </div>

            </div>
        `;

    } catch (err) {
        console.error('Error loading product details:', err);
        contentArea.innerHTML = `
            <div class="error-box" style="text-align: center; padding: 40px;">
                <p>Could not load the requested product details.</p>
                <div style="margin-top: 20px;">
                    <a href="/${categoryInfo.slug}" class="btn btn-primary">Back to ${categoryInfo.title}</a>
                </div>
            </div>
        `;
    }
});
