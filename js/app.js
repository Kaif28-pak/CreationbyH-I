/**
 * Creations by H&I - Main Application Script
 * Dynamic content loader for Services & Decap CMS Event Planner collection
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Element References
    const servicesGrid = document.getElementById('services-grid');
    const eventPlannerGrid = document.getElementById('event-planner-grid');
    const eventFilterBtns = document.querySelectorAll('.event-filter-btn');

    // Lightbox Modal Elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxContent = document.getElementById('lightbox-content');

    function openLightbox(type, src, altText) {
        if (!lightboxModal || !lightboxContent) return;
        lightboxContent.innerHTML = '';
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = src;
            img.alt = altText || 'Event Showcase';
            lightboxContent.appendChild(img);
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.playsinline = true;
            lightboxContent.appendChild(video);
        }
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightboxModal || !lightboxContent) return;
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
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // WhatsApp Contact Number
    const WA_PHONE = '923096708144';

    // Set initial loading states
    if (servicesGrid) {
        servicesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
                <p>Loading our curated services...</p>
            </div>
        `;
    }

    if (eventPlannerGrid) {
        eventPlannerGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
                <p>Loading event portfolio & memories...</p>
            </div>
        `;
    }

    // =========================================================================
    // 1. SERVICES SECTION LOADER
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
            const products = rawProducts.filter(p => p && p.title && p.title.trim().length > 0);
            products.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

            const featuredServices = products.filter(p => p.featured);
            renderServices(featuredServices);
        } catch (error) {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-light);">
                    <p>Services could not be loaded at this moment. Please refresh.</p>
                </div>
            `;
        }
    }

    function renderServices(items) {
        servicesGrid.innerHTML = '';
        if (!items || items.length === 0) {
            servicesGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No services available.</p>';
            return;
        }

        const categoryMap = {
            'Flower Bouquet': 'flower_bouquets',
            'Cakes / Customized Cakes': 'cakes',
            'Baskets': 'baskets',
            'Balloon Boxes': 'balloon_boxes',
            'Crates': 'crates',
            'Frames': 'frames',
            'Customized Items': 'customized_items'
        };

        items.forEach(item => {
            const categoryId = categoryMap[item.title] || '';
            const pageLink = categoryId ? `products.html?id=${categoryId}` : '#';
            const videoTag = item.video ? `<video src="${item.video}" loop muted playsinline></video>` : '';

            const card = document.createElement('div');
            card.className = 'service-card reveal active';
            card.innerHTML = `
                <div class="service-img">
                    <img src="${item.image || 'assets/images/category-flower-bouquet.jpg'}" alt="${item.title}" onerror="this.onerror=null; this.src='assets/images/category-flower-bouquet.jpg';">
                    ${videoTag}
                </div>
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
                <a href="${pageLink}" class="btn wa-btn" style="border: 2px solid var(--accent-pink); padding: 8px 22px; font-size: 13px;">View Products</a>
            `;

            // Hover preview for video if present
            if (item.video) {
                const vid = card.querySelector('video');
                if (vid) {
                    card.addEventListener('mouseenter', () => vid.play().catch(() => {}));
                    card.addEventListener('mouseleave', () => vid.pause());
                    card.addEventListener('touchstart', () => vid.play().catch(() => {}));
                    vid.addEventListener('error', () => vid.style.display = 'none');
                }
            }

            servicesGrid.appendChild(card);
        });
    }

    // =========================================================================
    // 2. EVENT PLANNER SECTION (Decap CMS Folder Collection)
    // =========================================================================
    let allEvents = [];
    let currentFilter = 'All';

    /**
     * Build WhatsApp URL with the exact requested pre-filled inquiry format:
     * "Hi, I am interested in this [Category: Bridal Shower - Event Title] service."
     */
    function createEventWhatsAppLink(category, title) {
        const cleanCategory = category ? category.trim() : 'Event Planner';
        const cleanTitle = title ? title.trim() : 'Bespoke Setup';
        const messageText = `Hi, I am interested in this [Category: ${cleanCategory} - ${cleanTitle}] service.`;
        return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(messageText)}`;
    }

    /**
     * Fetch event items from Decap CMS data sources:
     * 1. Precompiled data/events.json (generated automatically via build script)
     * 2. Live GitHub API fallback for instant updates committed by Decap CMS
     * 3. Static local fallback files
     */
    async function fetchEventPlannerData() {
        let events = [];

        // 1. Try compiled data/events.json with cache-busting
        try {
            const res = await fetch(`data/events.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.events) && data.events.length > 0) {
                    return data.events;
                }
            }
        } catch (err) {
            console.info('[EventPlanner] Local events.json fetch skipped/failed, attempting GitHub API sync...');
        }

        // 2. Try GitHub API for repo Kaif28-pak/CreationbyH-I (live real-time files created by Decap CMS)
        try {
            const ghRes = await fetch(`https://api.github.com/repos/Kaif28-pak/CreationbyH-I/contents/data/events?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (ghRes.ok) {
                const files = await ghRes.json();
                if (Array.isArray(files) && files.length > 0) {
                    const jsonFiles = files.filter(f => f.name.endsWith('.json') && f.name !== 'events.json');
                    const fetchedItems = await Promise.all(
                        jsonFiles.map(async (file) => {
                            try {
                                const r = await fetch(`data/events/${file.name}?t=${Date.now()}`, { cache: 'no-store' }).catch(() => fetch(file.download_url));
                                if (r.ok) return await r.json();
                            } catch (e) {
                                return null;
                            }
                        })
                    );
                    events = fetchedItems.filter(Boolean);
                    if (events.length > 0) {
                        return events;
                    }
                }
            }
        } catch (err) {
            console.warn('[EventPlanner] GitHub API fallback error:', err);
        }

        return events;
    }

    /**
     * Render the Event Planner cards filtered by category
     */
    function renderEventPlanner(items, filter = 'All') {
        if (!eventPlannerGrid) return;
        eventPlannerGrid.innerHTML = '';

        // Exclude deleted, blank, or null items
        const validItems = (items || []).filter(item => {
            if (!item || typeof item !== 'object') return false;
            return item.title && typeof item.title === 'string' && item.title.trim().length > 0;
        });

        // Normalize filter comparison
        const filtered = filter === 'All'
            ? validItems
            : validItems.filter(item => {
                if (!item.category) return false;
                return item.category.trim().toLowerCase() === filter.trim().toLowerCase();
            });

        if (filtered.length === 0) {
            eventPlannerGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-light);">
                    <p style="font-size: 1.1rem; margin-bottom: 10px;">No events currently listed under <strong>${filter}</strong>.</p>
                    <p style="font-size: 0.9rem;">New portfolio moments and video memories will be added soon via our admin panel!</p>
                </div>
            `;
            return;
        }

        filtered.forEach((eventItem) => {
            const title = eventItem.title || 'Special Event Celebration';
            const category = eventItem.category || 'Event';
            const description = eventItem.description || 'Custom crafted styling, ambient illumination, and bespoke floral decor.';
            const videoUrl = (eventItem.video && eventItem.video.trim() !== '') ? eventItem.video.trim() : null;
            const imageUrl = (eventItem.image && eventItem.image.trim() !== '') ? eventItem.image.trim() : null;
            const waLink = createEventWhatsAppLink(category, title);

            // Conditional Media Element (Video-first, image fallback)
            let mediaHtml = '';
            let mediaBadgeHtml = '';

            if (videoUrl) {
                // Video is primary content
                const posterAttr = imageUrl ? `poster="${imageUrl}"` : '';
                mediaBadgeHtml = `<span class="event-media-badge">🎬 Video</span>`;
                mediaHtml = `
                    <video 
                        src="${videoUrl}" 
                        ${posterAttr} 
                        playsinline 
                        controls 
                        preload="metadata"
                        aria-label="${title} Video Showcase">
                        Your browser does not support HTML5 video.
                    </video>
                `;
            } else if (imageUrl) {
                // Secondary fallback: Image only
                mediaBadgeHtml = `<span class="event-media-badge" style="background: rgba(58, 43, 50, 0.75);">📷 Photo</span>`;
                mediaHtml = `
                    <img 
                        src="${imageUrl}" 
                        alt="${title}" 
                        loading="lazy" 
                        onerror="this.onerror=null; this.src='assets/images/category-flower-bouquet.jpg';">
                `;
            } else {
                // Default placeholder
                mediaHtml = `
                    <img 
                        src="assets/images/hero_showcase.jpg" 
                        alt="${title}" 
                        loading="lazy">
                `;
            }

            const card = document.createElement('div');
            card.className = 'event-card reveal active';
            card.innerHTML = `
                <div class="event-media-wrap" title="${videoUrl ? 'Click ⛶ Fullscreen to expand' : 'Click to view full photo'}">
                    <span class="event-category-badge">${category}</span>
                    ${mediaBadgeHtml}
                    ${mediaHtml}
                    ${videoUrl 
                        ? `<span class="event-zoom-badge" data-action="expand" style="pointer-events: auto;">⛶ Fullscreen</span>` 
                        : `<span class="event-zoom-badge">🔍 Tap to Zoom</span>`}
                </div>
                <div class="event-card-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
                <a href="${waLink}" class="btn-event-wa" target="_blank" rel="noopener noreferrer" aria-label="Inquire about ${title} on WhatsApp">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    <span>Inquire on WhatsApp</span>
                </a>
            `;

            // Smart Media Handling: Auto-fit for Vertical Reels (9:16) & Landscape (16:9)
            const videoElement = card.querySelector('video');
            if (videoElement) {
                videoElement.addEventListener('loadedmetadata', () => {
                    if (videoElement.videoWidth > videoElement.videoHeight) {
                        videoElement.style.objectFit = 'contain';
                    } else {
                        videoElement.style.objectFit = 'cover';
                    }
                });

                videoElement.addEventListener('play', () => {
                    const allVideos = document.querySelectorAll('.event-card video');
                    allVideos.forEach(v => {
                        if (v !== videoElement && !v.paused) {
                            v.pause();
                        }
                    });
                });
            }

            const imgElement = card.querySelector('.event-media-wrap img');
            if (imgElement) {
                imgElement.addEventListener('load', () => {
                    if (imgElement.naturalWidth > imgElement.naturalHeight * 1.25) {
                        imgElement.style.objectFit = 'contain';
                    } else {
                        imgElement.style.objectFit = 'cover';
                    }
                });
            }

            // Lightbox Click Triggers
            const mediaWrap = card.querySelector('.event-media-wrap');
            if (mediaWrap) {
                if (videoUrl) {
                    const expandBtn = mediaWrap.querySelector('.event-zoom-badge[data-action="expand"]');
                    if (expandBtn) {
                        expandBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            openLightbox('video', videoUrl, title);
                        });
                    }
                } else {
                    mediaWrap.addEventListener('click', () => {
                        const targetSrc = imageUrl || 'assets/images/category-flower-bouquet.jpg';
                        openLightbox('image', targetSrc, title);
                    });
                }
            }

            eventPlannerGrid.appendChild(card);
        });
    }

    // =========================================================================
    // 3. INITIALIZE BOTH SECTIONS & FILTER LISTENERS
    // =========================================================================
    loadServices();

    try {
        allEvents = await fetchEventPlannerData();

        // Sort by order ascending
        allEvents.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

        renderEventPlanner(allEvents, currentFilter);

        // Filter button click event listeners
        eventFilterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedFilter = e.currentTarget.getAttribute('data-filter') || 'All';
                currentFilter = selectedFilter;

                // Update active button state
                eventFilterBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Render matching items
                renderEventPlanner(allEvents, selectedFilter);
            });
        });
    } catch (err) {
        console.error('Failed to initialize Event Planner:', err);
        if (eventPlannerGrid) {
            eventPlannerGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-light);">
                    <p>Unable to display Event Planner moments right now.</p>
                </div>
            `;
        }
    }
});
