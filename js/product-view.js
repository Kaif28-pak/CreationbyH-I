document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.getElementById('product-content-area');
    const breadcrumbCategoryLink = document.getElementById('breadcrumb-category-link');
    const breadcrumbProductName = document.getElementById('breadcrumb-product-name');
    const backToCategoryBtn = document.getElementById('back-to-category-btn');

    // Lightbox modal elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxContent = document.getElementById('lightbox-content');

    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category') || urlParams.get('cat') || urlParams.get('id');
    const productParam = urlParams.get('id') || urlParams.get('product') || urlParams.get('index');

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
        contentArea.innerHTML = `
            <div class="error-box">
                <p>No valid category selected. Please explore our categories.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html#services" class="btn btn-primary">Browse Categories</a>
                </div>
            </div>
        `;
        return;
    }

    const categoryInfo = categoryMap[categoryId];
    const categoryPageUrl = `products.html?id=${categoryId}`;

    // Setup breadcrumbs & back button
    breadcrumbCategoryLink.href = categoryPageUrl;
    breadcrumbCategoryLink.textContent = categoryInfo.title;
    backToCategoryBtn.href = categoryPageUrl;
    backToCategoryBtn.innerHTML = `&larr; Back to ${categoryInfo.title}`;

    try {
        let data = null;

        // 1. Fetch with cache-busting and no-store
        try {
            const localResponse = await fetch(`data/${categoryId}.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (localResponse.ok) {
                data = await localResponse.json();
            }
        } catch (localErr) {
            console.warn('[ProductView] Local fetch failed, trying live GitHub fallback...', localErr);
        }

        // 2. Real-time GitHub fallback if local file is missing or failed
        if (!data) {
            try {
                const ghResponse = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/${categoryId}.json?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });
                if (ghResponse.ok) {
                    data = await ghResponse.json();
                }
            } catch (ghErr) {
                console.warn('[ProductView] GitHub fallback also failed:', ghErr);
            }
        }

        if (!data) {
            contentArea.innerHTML = `
                <div class="error-box">
                    <p>Could not load products for this category. Coming soon!</p>
                    <div style="margin-top: 20px;">
                        <a href="${categoryPageUrl}" class="btn btn-primary">Back to Category</a>
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
            contentArea.innerHTML = `
                <div class="error-box">
                    <p>No products found in this category.</p>
                    <div style="margin-top: 20px;">
                        <a href="${categoryPageUrl}" class="btn btn-primary">Back to Category</a>
                    </div>
                </div>
            `;
            return;
        }

        // Sort by order if available
        products.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

        // Determine current product index
        let currentIndex = 0;
        const parsedIndex = parseInt(productParam, 10);
        if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < products.length) {
            currentIndex = parsedIndex;
        } else if (productParam) {
            // Try title match
            const foundIndex = products.findIndex(p => p.title.toLowerCase() === decodeURIComponent(productParam).toLowerCase());
            if (foundIndex !== -1) currentIndex = foundIndex;
        }

        const product = products[currentIndex];
        document.title = `${product.title} | Creations by H&I`;
        breadcrumbProductName.textContent = product.title;

        // WhatsApp message setup
        const encodedMessage = encodeURIComponent(
            `Hello Creations by H&I!\n\nI am interested in ordering:\n*${product.title}*\nCategory: ${categoryInfo.title}\n\nPlease share price, availability, and customization details.`
        );
        const waLink = `https://wa.me/923096708144?text=${encodedMessage}`;

        const hasImage = !!product.image;
        const hasVideo = !!product.video;
        const fallbackImg = 'assets/images/category-flower-bouquet.jpg';
        const activeImg = product.image || fallbackImg;

        // Render Product Detail Layout
        contentArea.innerHTML = `
            <div class="product-detail-layout">
                
                <!-- Left: Media Showcase -->
                <div class="media-showcase-box">
                    
                    ${(hasImage && hasVideo) ? `
                        <div class="media-tabs">
                            <button class="media-tab-btn active" id="tab-photo">📸 Photos</button>
                            <button class="media-tab-btn" id="tab-video">🎬 Video Clip</button>
                        </div>
                    ` : ''}

                    <div class="media-display-viewport" id="media-viewport">
                        <!-- Dynamic Media will be rendered here -->
                    </div>

                    ${(hasImage && hasVideo) ? `
                        <div class="media-thumbnails-strip">
                            <div class="media-thumb-item active" id="thumb-photo" title="View Photo">
                                <img src="${activeImg}" alt="${product.title}">
                            </div>
                            <div class="media-thumb-item" id="thumb-video" title="Play Video">
                                <video src="${product.video}" muted preload="metadata"></video>
                                <div class="thumb-video-icon">&#9658;</div>
                            </div>
                        </div>
                    ` : ''}

                </div>

                <!-- Right: Product Information & Ordering -->
                <div class="product-info-panel">
                    <span class="category-pill">${categoryInfo.title}</span>
                    <h1 class="product-view-title">${product.title}</h1>
                    <div class="product-view-desc">${product.description || 'Each creation is uniquely handcrafted to bring artistic elegance and joy to your special occasions.'}</div>

                    <!-- Highlights & Reassurance -->
                    <div class="product-perks">
                        <div class="perk-item">
                            <span class="perk-icon">🌸</span>
                            <span><strong>100% Handcrafted:</strong> Tailored with care for every event.</span>
                        </div>
                        <div class="perk-item">
                            <span class="perk-icon">✨</span>
                            <span><strong>Personalized:</strong> Custom names, cards, colors & themes.</span>
                        </div>
                        <div class="perk-item">
                            <span class="perk-icon">🚚</span>
                            <span><strong>Karachi Delivery:</strong> Safe and punctual doorstep dispatch.</span>
                        </div>
                    </div>

                    <!-- WhatsApp CTA Card -->
                    <div class="order-action-card">
                        <h4>Book or Inquire About This Creation</h4>
                        <p>Directly chat with our team on WhatsApp for customization, price, and dates.</p>
                        <a href="${waLink}" class="btn-whatsapp-large" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            Book on WhatsApp
                        </a>
                    </div>

                    <!-- Prev / Next Navigation -->
                    ${products.length > 1 ? `
                        <div class="product-pager-bar">
                            <a href="product-view.html?category=${categoryId}&id=${currentIndex - 1}" 
                               class="pager-btn ${currentIndex === 0 ? 'disabled' : ''}">
                                &larr; Previous Product
                            </a>
                            <a href="product-view.html?category=${categoryId}&id=${currentIndex + 1}" 
                               class="pager-btn ${currentIndex === products.length - 1 ? 'disabled' : ''}">
                                Next Product &rarr;
                            </a>
                        </div>
                    ` : ''}

                </div>

            </div>
        `;

        // Media switching logic
        const mediaViewport = document.getElementById('media-viewport');
        const tabPhoto = document.getElementById('tab-photo');
        const tabVideo = document.getElementById('tab-video');
        const thumbPhoto = document.getElementById('thumb-photo');
        const thumbVideo = document.getElementById('thumb-video');

        function showPhotoView() {
            mediaViewport.innerHTML = `
                <img src="${activeImg}" alt="${product.title}" id="main-view-image" onerror="this.onerror=null; this.src='${fallbackImg}';">
                <button class="zoom-hint-badge" id="zoom-badge">
                    <span>🔍</span> Tap to Zoom
                </button>
            `;

            if (tabPhoto) tabPhoto.classList.add('active');
            if (tabVideo) tabVideo.classList.remove('active');
            if (thumbPhoto) thumbPhoto.classList.add('active');
            if (thumbVideo) thumbVideo.classList.remove('active');

            // Zoom triggers
            const mainImg = document.getElementById('main-view-image');
            const zoomBadge = document.getElementById('zoom-badge');
            if (mainImg) mainImg.addEventListener('click', () => openLightbox('image', activeImg, product.title));
            if (zoomBadge) zoomBadge.addEventListener('click', () => openLightbox('image', activeImg, product.title));
        }

        function showVideoView() {
            mediaViewport.innerHTML = `
                <video src="${product.video}" controls autoplay playsinline loop></video>
            `;

            if (tabPhoto) tabPhoto.classList.remove('active');
            if (tabVideo) tabVideo.classList.add('active');
            if (thumbPhoto) thumbPhoto.classList.remove('active');
            if (thumbVideo) thumbVideo.classList.add('active');
        }

        // Initialize media state
        if (hasImage) {
            showPhotoView();
        } else if (hasVideo) {
            showVideoView();
        } else {
            mediaViewport.innerHTML = `<img src="${fallbackImg}" alt="${product.title}">`;
        }

        // Event listeners for tabs and thumbs
        if (tabPhoto) tabPhoto.addEventListener('click', showPhotoView);
        if (tabVideo) tabVideo.addEventListener('click', showVideoView);
        if (thumbPhoto) thumbPhoto.addEventListener('click', showPhotoView);
        if (thumbVideo) thumbVideo.addEventListener('click', showVideoView);

    } catch (error) {
        console.error('Error rendering product view:', error);
        contentArea.innerHTML = `
            <div class="error-box">
                <p>Failed to load product details. Please try again later.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html" class="btn btn-primary">Go to Home</a>
                </div>
            </div>
        `;
    }

    // Lightbox functions
    function openLightbox(type, src, altText) {
        lightboxContent.innerHTML = '';
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = src;
            img.alt = altText || 'Product Preview';
            lightboxContent.appendChild(img);
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            lightboxContent.appendChild(video);
        }
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        lightboxContent.innerHTML = '';
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target === lightboxClose) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });
});
