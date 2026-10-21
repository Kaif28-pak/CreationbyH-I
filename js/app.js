/**
 * Creations by H&I - Main Application Script
 * Dynamic content loader for Services & Decap CMS Event Planner collection
 */

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Element References
    const servicesGrid = document.getElementById('services-grid');
    const eventPlannerGrid = document.getElementById('event-planner-grid');
    const eventFilterBtns = document.querySelectorAll('.event-filter-btn');

    // Enhanced Lightbox with Multi-Video Playlist & Carousel Support
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxCaption = document.getElementById('lightbox-caption');

    let currentPlaylist = [];
    let currentPlaylistIndex = 0;

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
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevLightboxItem();
        } else if (e.key === 'ArrowRight') {
            nextLightboxItem();
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
    /**
     * Build WhatsApp URL for event category
     */
    function createEventWhatsAppLink(categoryName, title) {
        const cleanCategory = categoryName ? categoryName.trim() : 'Event Styling';
        const cleanTitle = title ? title.trim() : cleanCategory;
        const messageText = `Hello Creations by H&I! I am viewing your ${cleanCategory} portfolio. I would like to inquire about booking, pricing, and availability.`;
        return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(messageText)}`;
    }

    /**
     * Fetch event categories from public API / data sources:
     */
    async function fetchEventPlannerData() {
        let categories = [];

        // 1. Try public API endpoint
        try {
            const apiRes = await fetch(`/api/event-categories?t=${Date.now()}`);
            if (apiRes.ok) {
                const data = await apiRes.json();
                if (data && Array.isArray(data.categories) && data.categories.length > 0) {
                    return data.categories;
                }
            }
        } catch (e) {}

        // 2. Try compiled data/events.json with cache-busting
        try {
            const res = await fetch(`data/events.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (res.ok) {
                const data = await res.json();
                const list = data.categories || data.events;
                if (data && Array.isArray(list) && list.length > 0) {
                    return list;
                }
            }
        } catch (err) {
            console.info('[EventPlanner] Local events.json fetch skipped/failed, attempting GitHub API sync...');
        }

        // 3. Try GitHub API for repo Kaif28-pak/CreationbyH-I
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
                                if (r.ok) {
                                    const itemData = await r.json();
                                    if (itemData) {
                                        itemData.slug = itemData.slug || file.name.replace(/\.json$/, '');
                                    }
                                    return itemData;
                                }
                            } catch (e) {
                                return null;
                            }
                        })
                    );
                    categories = fetchedItems.filter(Boolean);
                    if (categories.length > 0) {
                        return categories;
                    }
                }
            }
        } catch (err) {
            console.warn('[EventPlanner] GitHub API fallback error:', err);
        }

        return categories;
    }

    /**
     * Render dynamic event filter tabs
     */
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
            btn.addEventListener('click', (e) => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter') || 'All';
                renderEventPlanner(allEvents, currentFilter);
            });
        });
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
            const name = item.name || item.title;
            return name && typeof name === 'string' && name.trim().length > 0 && item.is_active !== false;
        });

        // Normalize filter comparison
        const filtered = filter === 'All'
            ? validItems
            : validItems.filter(item => {
                const slugMatch = item.slug && item.slug.toLowerCase() === filter.toLowerCase();
                const nameMatch = (item.name || item.title || '').toLowerCase() === filter.toLowerCase();
                return slugMatch || nameMatch;
            });

        if (filtered.length === 0) {
            eventPlannerGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-light);">
                    <p style="font-size: 1.1rem; margin-bottom: 10px;">No events currently listed under this filter.</p>
                    <p style="font-size: 0.9rem;">New portfolio moments and video memories will be added soon via our admin panel!</p>
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
            const waLink = createEventWhatsAppLink(category, title);

            // Collect all media items & videos
            const mediaList = Array.isArray(eventItem.media) ? eventItem.media.filter(m => m.is_active !== false) : [];
            const videos = mediaList.filter(m => m.media_type === 'video');
            const photos = mediaList.filter(m => m.media_type === 'photo');

            // Fallback for previous single video / videos list schema
            const eventVideos = [];
            if (videos.length > 0) {
                videos.forEach((v, idx) => {
                    eventVideos.push({
                        type: 'video',
                        src: v.file_url,
                        title: `${title} - ${v.title || `Reel ${idx + 1}`}`,
                        label: v.title || `Reel ${idx + 1}`
                    });
                });
            } else if (eventItem.video) {
                eventVideos.push({
                    type: 'video',
                    src: eventItem.video,
                    title: `${title} - Highlight Reel`,
                    label: 'Reel 1'
                });
            }

            const hasVideos = eventVideos.length > 0;
            const primaryVideo = hasVideos ? eventVideos[0].src : null;
            const coverImage = eventItem.cover_image || eventItem.image || (photos[0] ? photos[0].file_url : null);

            let mediaBadgeText = '';
            if (videos.length > 0 && photos.length > 0) {
                mediaBadgeText = `🎬 ${videos.length} Reels • 📷 ${photos.length} Photos`;
            } else if (videos.length > 0) {
                mediaBadgeText = `🎬 ${videos.length} Reels`;
            } else if (photos.length > 0) {
                mediaBadgeText = `📷 ${photos.length} Photos`;
            } else {
                mediaBadgeText = `✨ Event Section`;
            }

            // Media HTML
            let mediaHtml = '';
            if (hasVideos) {
                const posterAttr = coverImage ? `poster="${coverImage}"` : '';
                mediaHtml = `
                    <video 
                        id="card-video-${slug}"
                        src="${primaryVideo}" 
                        ${posterAttr} 
                        playsinline 
                        controls 
                        preload="metadata"
                        aria-label="${title} Video Showcase">
                        Your browser does not support HTML5 video.
                    </video>
                `;
            } else if (coverImage) {
                mediaHtml = `
                    <img 
                        src="${coverImage}" 
                        alt="${title}" 
                        loading="lazy" 
                        onerror="this.onerror=null; this.src='assets/images/category-flower-bouquet.jpg';">
                `;
            } else {
                mediaHtml = `
                    <img 
                        src="assets/images/hero_showcase.jpg" 
                        alt="${title}" 
                        loading="lazy">
                `;
            }

            // Reels Strip HTML if multiple videos exist
            let reelsStripHtml = '';
            if (eventVideos.length > 1) {
                reelsStripHtml = `
                    <div class="event-reels-strip">
                        <div class="event-reels-strip-header">
                            <span>🎬 Video Reels (${eventVideos.length}):</span>
                            <span style="font-size: 0.7rem; color: var(--accent-pink); font-weight: 600;">Tap to watch fullscreen</span>
                        </div>
                        <div class="event-reels-buttons">
                            ${eventVideos.map((vid, idx) => `
                                <button type="button" class="event-reel-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Play ${vid.label}">
                                    <span class="reel-icon">▶</span>
                                    <span class="reel-name">${vid.label}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = 'event-card reveal active';
            card.innerHTML = `
                <div class="event-media-wrap" title="${hasVideos ? 'Tap ⛶ Fullscreen to expand' : 'Click to view full photo'}">
                    <span class="event-category-badge">${category}</span>
                    <span class="event-media-badge">${mediaBadgeText}</span>
                    ${mediaHtml}
                    ${hasVideos 
                        ? `<span class="event-zoom-badge" data-action="expand" style="pointer-events: auto;">⛶ Fullscreen</span>` 
                        : `<span class="event-zoom-badge">🔍 Tap to Zoom</span>`}
                </div>
                ${reelsStripHtml}
                <div class="event-card-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
                <div class="event-card-actions">
                    <a href="${detailUrl}" class="btn-event-view-reels" aria-label="View all media for ${title}">
                        <span>View Gallery & Reels</span>
                        <span>&rarr;</span>
                    </a>
                    <a href="${waLink}" class="btn-event-wa" target="_blank" rel="noopener noreferrer" aria-label="Inquire about ${title} on WhatsApp">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        <span>WhatsApp</span>
                    </a>
                </div>
            `;

            // Card Video management
            const cardVideo = card.querySelector('video');
            if (cardVideo) {
                cardVideo.addEventListener('play', () => {
                    const allVideos = document.querySelectorAll('.event-card video');
                    allVideos.forEach(v => {
                        if (v !== cardVideo && !v.paused) v.pause();
                    });
                });
            }

            // Reel buttons click handlers
            const reelBtns = card.querySelectorAll('.event-reel-btn');
            reelBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.getAttribute('data-index'), 10) || 0;
                    reelBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    openLightbox('video', eventVideos[idx].src, eventVideos[idx].title, eventVideos, idx);
                });
            });

            // Media wrap click
            const mediaWrap = card.querySelector('.event-media-wrap');
            if (mediaWrap) {
                if (hasVideos) {
                    const expandBtn = mediaWrap.querySelector('.event-zoom-badge[data-action="expand"]');
                    if (expandBtn) {
                        expandBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            openLightbox('video', eventVideos[0].src, eventVideos[0].title, eventVideos, 0);
                        });
                    }
                    mediaWrap.addEventListener('click', (e) => {
                        if (e.target.tagName !== 'VIDEO') {
                            openLightbox('video', eventVideos[0].src, eventVideos[0].title, eventVideos, 0);
                        }
                    });
                } else {
                    mediaWrap.addEventListener('click', () => {
                        const targetSrc = coverImage || 'assets/images/category-flower-bouquet.jpg';
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

        renderEventFilters(allEvents);
        renderEventPlanner(allEvents, currentFilter);
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
