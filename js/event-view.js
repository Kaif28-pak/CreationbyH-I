document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.getElementById('event-content-area');
    const breadcrumbEventName = document.getElementById('breadcrumb-event-name');

    // Lightbox modal elements
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxWaBtn = document.getElementById('lightbox-wa-btn');

    // Parse URL params
    const urlParams = new URLSearchParams(window.location.search);
    const eventSlug = urlParams.get('event') || urlParams.get('id') || urlParams.get('slug');

    let currentEvent = null;
    let eventReels = [];
    let currentReelIndex = 0;

    /**
     * Create pre-filled WhatsApp inquiry link
     */
    function createWaLink(eventTitle, reelTitle = '') {
        const phone = '923282276532';
        let message = `Hello Creations by H&I! I am viewing your Event: "${eventTitle}".`;
        if (reelTitle) {
            message += ` I really loved the video reel "${reelTitle}" and would like to inquire about this setup and pricing.`;
        } else {
            message += ` I would like to inquire about your event styling packages and availability.`;
        }
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }

    /**
     * Extract all video reels from an event object
     */
    function extractReels(eventData) {
        const reels = [];
        const seenUrls = new Set();
        const baseTitle = eventData.title || 'Event Celebration';

        // 1. Primary/Cover video
        if (eventData.video && typeof eventData.video === 'string' && eventData.video.trim() !== '') {
            const url = eventData.video.trim();
            seenUrls.add(url);
            reels.push({
                src: url,
                title: `${baseTitle} - Reel 1 (Cover)`,
                label: 'Reel 1'
            });
        }

        // 2. Additional list of videos
        if (Array.isArray(eventData.videos)) {
            eventData.videos.forEach((v) => {
                if (!v) return;
                const vUrl = typeof v === 'string' ? v.trim() : (v.video ? v.video.trim() : (v.url ? v.url.trim() : ''));
                if (!vUrl || seenUrls.has(vUrl)) return;
                seenUrls.add(vUrl);

                const reelNumber = reels.length + 1;
                const rawTitle = typeof v === 'object' && v.title ? v.title.trim() : (typeof v === 'object' && v.caption ? v.caption.trim() : `Reel ${reelNumber}`);
                
                reels.push({
                    src: vUrl,
                    title: rawTitle.toLowerCase().startsWith('reel') ? `${baseTitle} - ${rawTitle}` : `${baseTitle} - Reel ${reelNumber}: ${rawTitle}`,
                    label: rawTitle
                });
            });
        }

        return reels;
    }

    /**
     * Fetch event by slug
     */
    async function loadEventData(slug) {
        if (!slug) return null;

        // 1. Priority: live GitHub Raw file with cache-busting
        try {
            const ghRes = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/events/${slug}.json?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            if (ghRes.ok) {
                const data = await ghRes.json();
                if (data && data.title) {
                    data.slug = data.slug || slug;
                    return data;
                }
            }
        } catch (e) {
            console.warn('[EventView] GitHub raw fetch failed:', e);
        }

        // 2. Local individual event file
        try {
            const localRes = await fetch(`data/events/${slug}.json?t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (localRes.ok) {
                const data = await localRes.json();
                if (data && data.title) {
                    data.slug = data.slug || slug;
                    return data;
                }
            }
        } catch (e) {
            console.warn('[EventView] Local event file fetch failed:', e);
        }

        // 3. Fallback to precompiled data/events.json
        try {
            const eventsRes = await fetch(`data/events.json?t=${Date.now()}`, { cache: 'no-store' });
            if (eventsRes.ok) {
                const json = await eventsRes.json();
                if (json && Array.isArray(json.events)) {
                    const match = json.events.find(ev => (ev.slug === slug) || (ev.title && ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug));
                    if (match) return match;
                }
            }
        } catch (e) {
            console.warn('[EventView] events.json fallback failed:', e);
        }

        return null;
    }

    /**
     * Lightbox Controls & Playback
     */
    function openLightbox(index) {
        if (!eventReels || eventReels.length === 0) return;
        currentReelIndex = (index + eventReels.length) % eventReels.length;
        const currentReel = eventReels[currentReelIndex];

        // Update counter & caption
        if (lightboxCounter) {
            lightboxCounter.textContent = `Reel ${currentReelIndex + 1} of ${eventReels.length}`;
        }
        if (lightboxCaption) {
            lightboxCaption.textContent = currentReel.label || `Reel ${currentReelIndex + 1}`;
        }

        // Update WhatsApp CTA button
        if (lightboxWaBtn) {
            lightboxWaBtn.href = createWaLink(currentEvent ? currentEvent.title : 'Event', currentReel.label);
        }

        // Show/hide prev/next buttons based on reel count
        if (lightboxPrev && lightboxNext) {
            if (eventReels.length > 1) {
                lightboxPrev.style.display = 'flex';
                lightboxNext.style.display = 'flex';
            } else {
                lightboxPrev.style.display = 'none';
                lightboxNext.style.display = 'none';
            }
        }

        // Render video element inside lightbox
        lightboxContent.innerHTML = `
            <video 
                id="lightbox-reel-player"
                src="${currentReel.src}" 
                controls 
                autoplay 
                playsinline 
                preload="auto"
                aria-label="${currentReel.title}">
                Your browser does not support HTML5 video.
            </video>
        `;

        const player = document.getElementById('lightbox-reel-player');
        if (player) {
            player.play().catch(() => {
                // Autoplay with sound might be blocked initially by browser policy
                player.muted = true;
                player.play().catch(e => console.info('Autoplay prevented:', e));
            });
        }

        // Open modal
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightboxModal.classList.contains('active')) return;
        const player = lightboxContent.querySelector('video');
        if (player) {
            player.pause();
            player.src = '';
        }
        lightboxContent.innerHTML = '';
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showNextReel() {
        if (eventReels.length <= 1) return;
        openLightbox(currentReelIndex + 1);
    }

    function showPrevReel() {
        if (eventReels.length <= 1) return;
        openLightbox(currentReelIndex - 1);
    }

    // Attach Lightbox event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevReel();
        });
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextReel();
        });
    }
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal || e.target.classList.contains('lightbox-reel-wrapper')) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextReel();
        if (e.key === 'ArrowLeft') showPrevReel();
    });

    /**
     * Render the Event Reels Page
     */
    function renderEventView(event) {
        currentEvent = event;
        const title = event.title || 'Special Event Celebration';
        const category = event.category || 'Event Styling';
        const description = event.description || 'Custom crafted styling, ambient illumination, floral decor, and bespoke ambiance.';
        const waLink = createWaLink(title);

        if (breadcrumbEventName) {
            breadcrumbEventName.textContent = title;
        }
        document.title = `${title} | Event Reels & Highlights | Creations by H&I`;

        eventReels = extractReels(event);

        if (eventReels.length === 0) {
            contentArea.innerHTML = `
                <div class="event-view-hero">
                    <span class="event-category-badge">${category}</span>
                    <h1 class="event-view-title">${title}</h1>
                    <p class="event-view-desc">${description}</p>
                    <div style="margin-top: 25px;">
                        <a href="${waLink}" class="btn-event-wa-primary" target="_blank" rel="noopener">
                            💬 Inquire About This Event on WhatsApp
                        </a>
                    </div>
                </div>
                <div class="empty-reels-box">
                    <p style="font-size: 1.1rem; color: var(--text-dark); margin-bottom: 8px;">No video reels currently uploaded for this event.</p>
                    <p style="font-size: 0.9rem; color: var(--text-light);">You can upload videos easily from the Admin Panel.</p>
                    <div style="margin-top: 20px;">
                        <a href="index.html#event-planner" class="btn btn-outline">&larr; Back to Event Planner</a>
                    </div>
                </div>
            `;
            return;
        }

        // Render Hero & Reels Grid
        contentArea.innerHTML = `
            <div class="event-view-hero">
                <div class="event-hero-meta">
                    <span class="event-category-badge">${category}</span>
                    <span class="reels-count-badge">🎬 ${eventReels.length} Full Video Reels</span>
                </div>
                <h1 class="event-view-title">${title}</h1>
                <p class="event-view-desc">${description}</p>
                <div class="event-hero-actions">
                    <button type="button" id="play-all-reels-btn" class="btn-play-all">
                        <span>▶ Watch First Reel Fullscreen</span>
                    </button>
                    <a href="${waLink}" class="btn-event-wa-primary" target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        <span>Inquire on WhatsApp</span>
                    </a>
                </div>
            </div>

            <!-- Reels Grid Section -->
            <div class="event-reels-section">
                <div class="reels-section-header">
                    <h2 class="reels-section-title">Video Reels & Setup Highlights</h2>
                    <p class="reels-section-subtitle">Click or tap any reel to watch in fullscreen with sound</p>
                </div>

                <div class="reels-grid" id="reels-grid">
                    ${eventReels.map((reel, index) => `
                        <div class="reel-card" data-index="${index}" role="button" tabindex="0" aria-label="Play ${reel.label}">
                            <div class="reel-video-container">
                                <video 
                                    src="${reel.src}" 
                                    preload="metadata" 
                                    muted 
                                    playsinline 
                                    loop>
                                </video>
                                <div class="reel-overlay-top">
                                    <span class="reel-index-badge">Reel #${index + 1}</span>
                                </div>
                                <div class="reel-play-btn-circle" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                                <div class="reel-overlay-bottom">
                                    <div class="reel-title-text">${reel.label}</div>
                                    <span class="reel-tap-hint">⛶ Tap to watch full reel</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Attach Click Handlers to Reel Cards
        const reelCards = contentArea.querySelectorAll('.reel-card');
        reelCards.forEach(card => {
            const idx = parseInt(card.getAttribute('data-index'), 10) || 0;
            const cardVideo = card.querySelector('video');

            // Quick mouse hover preview on desktop
            card.addEventListener('mouseenter', () => {
                if (cardVideo && cardVideo.paused) {
                    cardVideo.play().catch(() => {});
                }
            });
            card.addEventListener('mouseleave', () => {
                if (cardVideo && !cardVideo.paused) {
                    cardVideo.pause();
                    cardVideo.currentTime = 0;
                }
            });

            // Click or Enter opens fullscreen lightbox
            card.addEventListener('click', () => openLightbox(idx));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                }
            });
        });

        // Play All / First Reel button
        const playAllBtn = document.getElementById('play-all-reels-btn');
        if (playAllBtn) {
            playAllBtn.addEventListener('click', () => openLightbox(0));
        }
    }

    /**
     * Fallback when no event slug is given: Display list of all events
     */
    async function renderAllEventsList() {
        let events = [];
        try {
            const res = await fetch(`data/events.json?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                events = data.events || [];
            }
        } catch (e) {}

        if (breadcrumbEventName) breadcrumbEventName.textContent = 'All Events';

        contentArea.innerHTML = `
            <div class="event-view-hero">
                <h1 class="event-view-title">Browse Event Reels</h1>
                <p class="event-view-desc">Select an event below to watch all video reels and styling highlights.</p>
            </div>
            <div class="events-picker-grid">
                ${events.map(ev => {
                    const slug = ev.slug || (ev.title ? ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
                    const reelsCount = (ev.video ? 1 : 0) + (Array.isArray(ev.videos) ? ev.videos.length : 0);
                    return `
                        <a href="event-view.html?event=${slug}" class="event-picker-card">
                            <div class="picker-card-media">
                                ${ev.video 
                                    ? `<video src="${ev.video}" muted playsinline preload="metadata"></video>` 
                                    : `<img src="${ev.image || 'assets/images/hero_showcase.jpg'}" alt="${ev.title}">`}
                                <span class="reels-count-badge">🎬 ${reelsCount > 0 ? `${reelsCount} Reels` : 'Event'}</span>
                            </div>
                            <div class="picker-card-info">
                                <span class="event-category-badge">${ev.category || 'Event'}</span>
                                <h3>${ev.title}</h3>
                                <p>${ev.description || ''}</p>
                                <span class="btn-picker-view">Watch Reels &rarr;</span>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Initialize Page
    if (eventSlug) {
        const eventData = await loadEventData(eventSlug);
        if (eventData) {
            renderEventView(eventData);
        } else {
            contentArea.innerHTML = `
                <div class="error-box">
                    <p>Event "${eventSlug}" could not be found.</p>
                    <div style="margin-top: 20px;">
                        <a href="index.html#event-planner" class="btn btn-primary">Back to Event Planner</a>
                    </div>
                </div>
            `;
        }
    } else {
        await renderAllEventsList();
    }
});
