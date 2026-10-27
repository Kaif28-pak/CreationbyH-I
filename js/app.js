/**
 * Creations by H&I - Main Application Script
 * Dynamic content loader for Services, Featured Products & Event Planner
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Element References
    const servicesGrid = document.getElementById('services-grid');
    const featuredGrid = document.getElementById('featured-grid');
    const eventPlannerGrid = document.getElementById('event-planner-grid');

    // Lightbox Modal Elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxCaption = document.getElementById('lightbox-caption');

    let currentPlaylist = [];
    let currentPlaylistIndex = 0;

    // Contact WhatsApp Phone
    const WA_PHONE = '923096708144';

    // Global Conversion Tracker
    window.trackWhatsAppConversion = function(label = 'General Order') {
        try {
            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    event_category: 'WhatsApp Order',
                    event_label: label
                });
            }
            if (typeof fbq === 'function') {
                fbq('track', 'Contact', {
                    content_name: label
                });
            }
        } catch (e) {
            console.debug('Analytics tracker error:', e);
        }
    };

    // Attach tracking to all WhatsApp links
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', () => {
            const label = link.getAttribute('aria-label') || link.innerText || 'WhatsApp Click';
            window.trackWhatsAppConversion(label.trim());
        });
    });

    function renderActiveLightboxItem() {
        if (!lightboxContent || currentPlaylist.length === 0) return;
        const item = currentPlaylist[currentPlaylistIndex];
        lightboxContent.innerHTML = '';

        if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            video.autoplay = true;
            video.playsinline = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '85vh';
            video.style.borderRadius = '12px';
            lightboxContent.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.alt || 'Event Media';
            lightboxContent.appendChild(img);
        }

        if (lightboxCaption) {
            if (currentPlaylist.length > 1) {
                lightboxCaption.innerHTML = `<span class="lightbox-counter">🎬 ${currentPlaylistIndex + 1} of ${currentPlaylist.length}</span> <span class="lightbox-item-title">${item.title || item.alt || ''}</span>`;
                lightboxCaption.style.display = 'block';
            } else if (item.title || item.alt) {
                lightboxCaption.innerHTML = `<span class="lightbox-item-title">${item.title || item.alt}</span>`;
                lightboxCaption.style.display = 'block';
            } else {
                lightboxCaption.style.display = 'none';
            }
        }

        if (lightboxPrev && lightboxNext) {
            if (currentPlaylist.length > 1) {
                lightboxPrev.style.display = 'flex';
                lightboxNext.style.display = 'flex';
            } else {
                lightboxPrev.style.display = 'none';
                lightboxNext.style.display = 'none';
            }
        }
    }

    function openLightbox(type, src, altText, playlist = [], startIndex = 0) {
        if (!lightboxModal) return;

        if (Array.isArray(playlist) && playlist.length > 0) {
            currentPlaylist = playlist;
            currentPlaylistIndex = Math.max(0, Math.min(startIndex, playlist.length - 1));
        } else {
            currentPlaylist = [{ type, src, alt: altText, title: altText }];
            currentPlaylistIndex = 0;
        }

        renderActiveLightboxItem();
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function prevLightboxItem() {
        if (currentPlaylist.length <= 1) return;
        currentPlaylistIndex = (currentPlaylistIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        renderActiveLightboxItem();
    }

    function nextLightboxItem() {
        if (currentPlaylist.length <= 1) return;
        currentPlaylistIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
        renderActiveLightboxItem();
    }

    function closeLightbox() {
        if (!lightboxModal || !lightboxContent) return;
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        lightboxContent.innerHTML = '';
        currentPlaylist = [];
        currentPlaylistIndex = 0;
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevLightboxItem(); });
    if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextLightboxItem(); });

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target === lightboxClose) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') prevLightboxItem();
        else if (e.key === 'ArrowRight') nextLightboxItem();
    });

    // =========================================================================
    // 1. SERVICES SECTION LOADER (8 Main Categories)
    // =========================================================================
    async function loadServices() {
        if (!servicesGrid) return;

        try {
            const response = await fetch(`data/products.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (!response.ok) throw new Error('Failed to fetch services data');
            const data = await response.json();

            const rawProducts = data.products ? data.products : (Array.isArray(data) ? data : []);
            // Filter only active categories with titles
            const products = rawProducts.filter(p => p && p.title && p.title.trim().length > 0 && p.active !== false);
            products.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

            renderServices(products);
        } catch (error) {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-light);">
                    <p>Services are loading. Please refresh if this takes too long.</p>
                </div>
            `;
        }
    }

    function renderServices(items) {
        servicesGrid.innerHTML = '';
        if (!items || items.length === 0) {
            servicesGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No categories available.</p>';
            return;
        }

        items.forEach(item => {
            const pageLink = item.slug ? `/${item.slug}` : (item.category ? `/products.html?id=${item.category}` : '#');
            const fallbackImg = 'assets/images/category-flower-bouquet.jpg';
            const imgSrc = item.image || fallbackImg;

            const card = document.createElement('div');
            card.className = 'service-card reveal active';
            card.innerHTML = `
                <a href="${pageLink}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="service-img">
                        <img src="${imgSrc}" alt="${item.title} by Creations by H&I" loading="lazy" width="400" height="300" onerror="this.onerror=null; this.src='${fallbackImg}';">
                    </div>
                </a>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <a href="${pageLink}" class="btn wa-btn" style="border: 1.5px solid var(--accent-pink); padding: 8px 20px; font-size: 13px;">View ${item.title}</a>
            `;

            servicesGrid.appendChild(card);
        });
    }

    // =========================================================================
    // 2. FEATURED BEST SELLERS LOADER (4-6 Products)
    // =========================================================================
    async function loadFeaturedProducts() {
        if (!featuredGrid) return;

        let featuredItems = [];

        // 1. Try Firebase Firestore
        if (window.CreationsFirebase && window.CreationsFirebase.isConfigured()) {
            try {
                const fbFeatured = await window.CreationsFirebase.getFeaturedProducts();
                if (fbFeatured && fbFeatured.length > 0) {
                    featuredItems = fbFeatured;
                }
            } catch (fbErr) {
                console.warn('[App] Firebase featured fallback:', fbErr);
            }
        }

        // 2. Local fallback if empty
        if (featuredItems.length === 0) {
            const categoriesToFetch = ['baskets', 'flower_bouquets', 'cakes', 'balloon_boxes', 'crates', 'trousseau_packing'];
            for (const catId of categoriesToFetch) {
                try {
                    const res = await fetch(`data/${catId}.json?t=${Date.now()}`, { cache: 'no-store' });
                    if (res.ok) {
                        const data = await res.json();
                        const prods = data.products || (Array.isArray(data) ? data : []);
                        const matched = prods.find(p => p.featured && p.active !== false);
                        if (matched) {
                            matched.categoryId = catId;
                            featuredItems.push(matched);
                        }
                    }
                } catch (e) {}
                if (featuredItems.length >= 6) break;
            }
        }

        renderFeatured(featuredItems);
    }

    function renderFeatured(items) {
        if (!featuredGrid) return;
        featuredGrid.innerHTML = '';

        if (!items || items.length === 0) {
            featuredGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Featured collections coming soon.</p>';
            return;
        }

        items.forEach((product, idx) => {
            const docId = product.id && !product.id.startsWith('local_') ? product.id : idx;
            const detailUrl = `product-view.html?category=${product.categoryId || product.category || 'baskets'}&id=${docId}`;
            const encodedTitle = encodeURIComponent(`Hi! I want to order "${product.title}" from your website.`);
            const waLink = `https://wa.me/${WA_PHONE}?text=${encodedTitle}`;
            const fallbackImg = 'assets/images/category-baskets.jpg';
            const imgSrc = product.image || fallbackImg;

            const card = document.createElement('div');
            card.className = 'product-card reveal active';
            card.innerHTML = `
                <a href="${detailUrl}" class="product-card-link-wrap">
                    <div class="product-media">
                        <img src="${imgSrc}" alt="${product.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
                        <div class="product-media-overlay">
                            <span class="overlay-view-badge">View Details &rarr;</span>
                        </div>
                    </div>
                </a>
                <div class="product-content">
                    <a href="${detailUrl}" style="text-decoration: none; color: inherit;">
                        <h3 class="product-title">${product.title}</h3>
                    </a>
                    <p class="product-desc">${product.description || 'Bespoke luxury handcrafted with care.'}</p>
                    <div class="product-card-actions">
                        <a href="${detailUrl}" class="btn-card-view">View Details</a>
                        <a href="${waLink}" class="btn-card-wa" target="_blank" rel="noopener noreferrer">Order on WhatsApp</a>
                    </div>
                </div>
            `;

            featuredGrid.appendChild(card);
        });
    }

    // =========================================================================
    // 3. EVENT PLANNER SECTION (Dynamic 4 Categories)
    // =========================================================================
    let allEvents = [];
    let currentFilter = 'All';

    function createEventWhatsAppLink(categoryName) {
        const cleanCategory = categoryName ? categoryName.trim() : 'Event Styling';
        const messageText = `Hello Creations by H&I! I am viewing your ${cleanCategory} portfolio. I would like to inquire about booking, pricing, and availability.`;
        return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(messageText)}`;
    }

    async function fetchEventPlannerData() {
        try {
            const res = await fetch(`data/events.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (res.ok) {
                const data = await res.json();
                const list = data.categories || data.events;
                if (Array.isArray(list) && list.length > 0) {
                    return list.filter(item => item && item.is_active !== false);
                }
            }
        } catch (e) {
            console.info('[EventPlanner] Local events.json fetch fallback to individual files...');
        }

        const fallbackCategories = [
            {
                name: "Bridal Shower",
                slug: "bridal-shower",
                description: "Bespoke pastel florals, custom bridal favor crates, macrame backdrops, and cozy luxury floor seating in Karachi.",
                cover_image: "assets/images/bridal-shower-decoration-karachi.jpg",
                order: 1
            },
            {
                name: "Wedding Event",
                slug: "wedding-event",
                description: "Opulent floral stages, candlelit Nikah walkways, royal sofa seating arrangements, and grand fairy light tunnels.",
                cover_image: "assets/images/creations-by-handi-luxury-gifting-event-banner.webp",
                order: 2
            },
            {
                name: "Birthday Event",
                slug: "birthday-event",
                description: "Enchanted balloon garlands, customized marquee letter lighting, themed backdrop installations, and dessert table styling.",
                cover_image: "assets/images/category-balloon-boxes.jpg",
                order: 3
            },
            {
                name: "Aqeeqah Decor",
                slug: "aqeeqah-decor",
                description: "Bespoke Islamic Aqeeqah event styling with personalized baby name marquees, crescent floral arches, and traditional cradle decor.",
                cover_image: "assets/images/category-crates.jpg",
                order: 4
            }
        ];
        return fallbackCategories;
    }

    function renderEventFilters(categories) {
        const filterContainer = document.getElementById('event-filters');
        if (!filterContainer) return;

        let html = `<button class="event-filter-btn active" data-filter="All">All Events</button>`;
        categories.forEach(cat => {
            const name = cat.name || cat.title;
            html += `<button class="event-filter-btn" data-filter="${cat.slug}">${name}</button>`;
        });

        filterContainer.innerHTML = html;

        const btns = filterContainer.querySelectorAll('.event-filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter') || 'All';
                renderEventPlanner(allEvents, currentFilter);
            });
        });
    }

    function renderEventPlanner(items, filter = 'All') {
        if (!eventPlannerGrid) return;
        eventPlannerGrid.innerHTML = '';

        const validItems = (items || []).filter(item => {
            if (!item || typeof item !== 'object') return false;
            const name = item.name || item.title;
            return name && typeof name === 'string' && name.trim().length > 0 && item.is_active !== false;
        });

        const filtered = filter === 'All'
            ? validItems
            : validItems.filter(item => {
                const slugMatch = item.slug && item.slug.toLowerCase() === filter.toLowerCase();
                const nameMatch = (item.name || item.title || '').toLowerCase() === filter.toLowerCase();
                return slugMatch || nameMatch;
            });

        if (filtered.length === 0) {
            eventPlannerGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-light);">
                    <p>No events found for this category.</p>
                </div>
            `;
            return;
        }

        filtered.forEach((eventItem) => {
            const title = eventItem.name || eventItem.title || 'Special Event Celebration';
            const category = eventItem.name || eventItem.category || 'Event';
            const description = eventItem.description || 'Custom crafted styling, ambient illumination, and bespoke floral decor.';
            const slug = eventItem.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
            const detailUrl = `/events/${slug}`;
            const waLink = createEventWhatsAppLink(category);

            const mediaList = Array.isArray(eventItem.media) ? eventItem.media.filter(m => m.is_active !== false) : [];
            const videos = mediaList.filter(m => m.media_type === 'video');
            const photos = mediaList.filter(m => m.media_type === 'photo');

            let mediaBadgeText = '';
            if (videos.length > 0 && photos.length > 0) {
                mediaBadgeText = `${videos.length} Reels · ${photos.length} Photos`;
            } else if (videos.length > 0) {
                mediaBadgeText = `${videos.length} Reels`;
            } else if (photos.length > 0) {
                mediaBadgeText = `${photos.length} Photos`;
            } else {
                mediaBadgeText = 'Featured Decor';
            }

            const coverPoster = eventItem.cover_image || 'assets/images/bridal-shower-decoration-karachi.jpg';

            const card = document.createElement('div');
            card.className = 'event-card reveal active';
            card.setAttribute('role', 'article');
            card.innerHTML = `
                <div class="event-media-wrap">
                    <span class="event-dark-pill">${category}</span>
                    <span class="event-count-pill">${mediaBadgeText}</span>
                    <img 
                        src="${coverPoster}" 
                        alt="${title} in Karachi by Creations by H&I" 
                        loading="lazy" 
                        width="500" 
                        height="350"
                        onerror="this.onerror=null; this.src='assets/images/bridal-shower-decoration-karachi.jpg';">
                </div>
                <div class="event-card-content">
                    <h3 class="event-card-title">${title}</h3>
                    <p class="event-card-desc">${description}</p>
                </div>
                <div class="event-card-actions">
                    <a href="${detailUrl}" class="btn-event-view-gallery">View Portfolio &rarr;</a>
                    <a href="${waLink}" class="btn-event-wa-icon" target="_blank" rel="noopener noreferrer" aria-label="Inquire about ${title} on WhatsApp" title="Inquire on WhatsApp">
                        💬
                    </a>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-event-wa-icon')) return;
                window.location.href = detailUrl;
            });

            eventPlannerGrid.appendChild(card);
        });
    }

    // Initialize all sections
    loadServices();
    loadFeaturedProducts();

    try {
        allEvents = await fetchEventPlannerData();
        allEvents.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
        renderEventFilters(allEvents);
        renderEventPlanner(allEvents, currentFilter);
    } catch (err) {
        console.error('Failed to initialize Event Planner:', err);
    }
});
