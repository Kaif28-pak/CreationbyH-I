document.addEventListener('DOMContentLoaded', async () => {
    const contentArea = document.getElementById('event-detail-content');
    const breadcrumbEventName = document.getElementById('breadcrumb-event-name');

    // Fullscreen Reels Viewer elements
    const overlay = document.getElementById('reels-viewer-overlay');
    const slider = document.getElementById('reels-vertical-slider');
    const counterEl = document.getElementById('viewer-counter');
    const eventLabelEl = document.getElementById('viewer-event-label');
    const soundToggleBtn = document.getElementById('viewer-sound-toggle');
    const soundIconMuted = soundToggleBtn.querySelector('.sound-icon-muted');
    const soundIconUnmuted = soundToggleBtn.querySelector('.sound-icon-unmuted');
    const closeBtn = document.getElementById('viewer-close-btn');
    const prevBtn = document.getElementById('viewer-prev-btn');
    const nextBtn = document.getElementById('viewer-next-btn');

    let currentCategory = null;
    let mediaItems = [];
    let isMuted = true;
    let activeSlideIndex = 0;
    let observer = null;

    /**
     * Determine category slug from URL
     */
    function getSlugFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('slug')) return urlParams.get('slug').trim().toLowerCase();
        if (urlParams.get('event')) return urlParams.get('event').trim().toLowerCase();
        if (urlParams.get('id')) return urlParams.get('id').trim().toLowerCase();

        // Check path like /events/bridal-shower
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        const eventsIdx = pathParts.indexOf('events');
        if (eventsIdx !== -1 && pathParts[eventsIdx + 1]) {
            return pathParts[eventsIdx + 1].replace(/\.html$/, '').trim().toLowerCase();
        }

        return null;
    }

    const categorySlug = getSlugFromUrl();

    /**
     * WhatsApp inquiry URL generator
     */
    function createWaLink(eventName, mediaTitle = '') {
        const phone = '923282276532';
        let msg = `Hello Creations by H&I! I am viewing your ${eventName} portfolio.`;
        if (mediaTitle) {
            msg += ` I really loved '${mediaTitle}' and would like to inquire about this setup, pricing, and availability.`;
        } else {
            msg += ` I would like to inquire about booking, pricing, and availability.`;
        }
        return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    }

    /**
     * Fetch category data with multi-tier fallback
     */
    async function fetchCategory(slug) {
        if (!slug) return null;

        // 1. API endpoint
        try {
            const res = await fetch(`/api/event-categories?slug=${slug}&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.name) return data;
            }
        } catch (e) {}

        // 2. Direct local category file
        try {
            const res = await fetch(`data/events/${slug}.json?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.name) return data;
            }
        } catch (e) {}

        // 3. GitHub Raw live file
        try {
            const ghRes = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/events/${slug}.json?t=${Date.now()}`);
            if (ghRes.ok) {
                const data = await ghRes.json();
                if (data && data.name) return data;
            }
        } catch (e) {}

        // 4. Compiled events.json search
        try {
            const res = await fetch(`data/events.json?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const list = data.categories || data.events || [];
                const match = list.find(c => c.slug === slug || (c.name && c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug));
                if (match) return match;
            }
        } catch (e) {}

        return null;
    }

    /**
     * Render 404 Not Found State
     */
    function renderNotFound() {
        if (breadcrumbEventName) breadcrumbEventName.textContent = 'Event Not Found';
        contentArea.innerHTML = `
            <div class="error-box" style="margin: 50px auto; text-align: center; max-width: 550px;">
                <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--text-dark);">Event Section Not Found</h2>
                <p style="color: var(--text-light); margin-bottom: 25px;">The event category you are looking for does not exist or may have been renamed.</p>
                <a href="/events" class="btn btn-primary">&larr; Browse All Event Sections</a>
            </div>
        `;
    }

    /**
     * Render Category Detail Page & Media Grid
     */
    function renderCategoryDetail(cat) {
        currentCategory = cat;
        const name = cat.name || 'Event Celebration';
        const description = cat.description || 'Custom crafted styling, ambient illumination, floral decor, and bespoke ambiance.';
        const coverImg = cat.cover_image || 'assets/images/hero_showcase.jpg';

        if (breadcrumbEventName) breadcrumbEventName.textContent = name;
        document.title = `${name} | Event Portfolio & Reels | Creations by H&I`;

        // Extract active media items
        mediaItems = Array.isArray(cat.media) ? cat.media.filter(m => m.is_active !== false) : [];
        mediaItems.sort((a, b) => (Number(a.order) || 1) - (Number(b.order) || 1));

        const videosCount = mediaItems.filter(m => m.media_type === 'video').length;
        const photosCount = mediaItems.filter(m => m.media_type === 'photo').length;

        contentArea.innerHTML = `
            <!-- Category Hero Header -->
            <section class="category-detail-hero">
                <div class="category-hero-text">
                    <div class="category-hero-meta">
                        <span class="cat-dark-pill">${name}</span>
                        <span class="cat-count-pill">🎬 ${videosCount} Reels • 📷 ${photosCount} Photos</span>
                    </div>
                    <h1 class="category-detail-title">${name}</h1>
                    <p class="category-detail-desc">${description}</p>
                    <div class="category-hero-actions">
                        ${videosCount > 0 ? `
                            <button type="button" class="btn-play-all-reels" id="hero-watch-reels-btn">
                                <span>▶ Watch Video Reels</span>
                            </button>
                        ` : ''}
                        <a href="${createWaLink(name)}" class="btn-cat-wa-hero" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            <span>Inquire on WhatsApp</span>
                        </a>
                    </div>
                </div>
                <div class="category-hero-cover">
                    <img src="${coverImg}" alt="${name} Cover" loading="lazy">
                </div>
            </section>

            <!-- Media Grid Section -->
            <section class="category-media-section">
                <div class="media-section-header">
                    <h2>Gallery & Video Reels (${mediaItems.length})</h2>
                    <p>Click any card to watch fullscreen in HD with interactive controls.</p>
                </div>

                ${mediaItems.length === 0 ? `
                    <div class="empty-reels-box">
                        <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 8px;">No media items uploaded for this event yet.</p>
                        <p style="font-size: 0.95rem; color: var(--text-light);">Reels and photography will be added soon via Admin Panel.</p>
                    </div>
                ` : `
                    <div class="event-media-grid" id="event-media-grid">
                        ${mediaItems.map((item, index) => {
                            const isVideo = item.media_type === 'video';
                            const poster = item.thumbnail_url || (isVideo ? '' : item.file_url) || 'assets/images/hero_showcase.jpg';
                            const waItemLink = createWaLink(name, item.title);

                            return `
                                <div class="media-card" data-index="${index}" data-id="${item.id || index}" role="button" tabindex="0" aria-label="Open ${item.title}">
                                    <div class="media-card-media-wrap">
                                        <span class="media-card-event-badge">${name}</span>
                                        <span class="media-card-type-badge ${isVideo ? 'video-type' : 'photo-type'}">
                                            ${isVideo ? '🎬 Video' : '📷 Photo'}
                                        </span>
                                        
                                        ${isVideo ? `
                                            <video 
                                                src="${item.file_url}" 
                                                ${poster ? `poster="${poster}"` : ''} 
                                                muted 
                                                playsinline 
                                                preload="metadata">
                                            </video>
                                            <div class="media-play-icon" aria-hidden="true">
                                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                        ` : `
                                            <img 
                                                src="${item.file_url}" 
                                                alt="${item.title}" 
                                                loading="lazy" 
                                                onerror="this.onerror=null; this.src='assets/images/hero_showcase.jpg';">
                                            <div class="media-zoom-icon" aria-hidden="true">
                                                <span>🔍</span>
                                            </div>
                                        `}
                                    </div>
                                    <div class="media-card-content">
                                        <h3 class="media-card-title">${item.title}</h3>
                                        ${item.description ? `<p class="media-card-desc">${item.description}</p>` : ''}
                                        <a href="${waItemLink}" class="media-card-wa-btn" target="_blank" rel="noopener" onclick="event.stopPropagation();" aria-label="Inquire about ${item.title} on WhatsApp">
                                            <span>Inquire on WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </section>
        `;

        // Card Click Handlers
        const cards = contentArea.querySelectorAll('.media-card');
        cards.forEach(card => {
            const idx = parseInt(card.getAttribute('data-index'), 10);
            card.addEventListener('click', () => openViewer(idx));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openViewer(idx);
                }
            });
        });

        // Hero Button click
        const heroBtn = document.getElementById('hero-watch-reels-btn');
        if (heroBtn) {
            heroBtn.addEventListener('click', () => {
                const firstVideoIdx = mediaItems.findIndex(m => m.media_type === 'video');
                openViewer(firstVideoIdx !== -1 ? firstVideoIdx : 0);
            });
        }

        // Build Fullscreen Vertical Slider Slides
        buildSliderSlides();

        // Check if URL has ?media=ID parameter to auto-open
        const urlParams = new URLSearchParams(window.location.search);
        const mediaParam = urlParams.get('media');
        if (mediaParam) {
            const foundIdx = mediaItems.findIndex(m => String(m.id) === mediaParam || String(m.title) === mediaParam);
            if (foundIdx !== -1) {
                openViewer(foundIdx);
            }
        }
    }

    /**
     * Build Slides for 100vw x 100vh Vertical Snap Viewer
     */
    function buildSliderSlides() {
        if (!slider) return;
        slider.innerHTML = '';

        mediaItems.forEach((item, index) => {
            const isVideo = item.media_type === 'video';
            const slide = document.createElement('div');
            slide.className = 'reel-vertical-slide';
            slide.setAttribute('data-index', index);
            slide.setAttribute('data-id', item.id || index);

            const waSlideLink = createWaLink(currentCategory ? currentCategory.name : 'Event', item.title);

            slide.innerHTML = `
                <div class="slide-media-container" data-type="${item.media_type}">
                    ${isVideo ? `
                        <video 
                            id="viewer-video-${index}"
                            src="${item.file_url}" 
                            ${item.thumbnail_url ? `poster="${item.thumbnail_url}"` : ''}
                            playsinline 
                            loop 
                            preload="none"
                            aria-label="${item.title}">
                        </video>
                        <div class="slide-play-pause-indicator" aria-hidden="true">
                            <span class="icon">▶</span>
                        </div>
                        <div class="slide-progress-bar"><div class="progress-fill"></div></div>
                    ` : `
                        <div class="slide-photo-wrap">
                            <img src="${item.file_url}" alt="${item.title}" loading="lazy">
                        </div>
                    `}
                </div>

                <!-- Bottom Slide Info Overlay -->
                <div class="slide-bottom-overlay">
                    <span class="slide-cat-badge">${currentCategory ? currentCategory.name : 'Event'}</span>
                    <h3 class="slide-title">${item.title}</h3>
                    ${item.description ? `<p class="slide-desc">${item.description}</p>` : ''}
                    <div class="slide-actions">
                        <a href="${waSlideLink}" class="slide-wa-cta" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            <span>Inquire on WhatsApp</span>
                        </a>
                    </div>
                </div>
            `;

            // Tap to Play / Pause Video
            if (isVideo) {
                const vid = slide.querySelector('video');
                const indicator = slide.querySelector('.slide-play-pause-indicator');
                const progressFill = slide.querySelector('.progress-fill');

                slide.addEventListener('click', (e) => {
                    if (e.target.closest('.slide-bottom-overlay') || e.target.closest('a') || e.target.closest('button')) return;
                    if (vid.paused) {
                        vid.play();
                        showIndicator(indicator, '▶');
                    } else {
                        vid.pause();
                        showIndicator(indicator, '⏸');
                    }
                });

                vid.addEventListener('timeupdate', () => {
                    if (vid.duration && progressFill) {
                        const pct = (vid.currentTime / vid.duration) * 100;
                        progressFill.style.width = `${pct}%`;
                    }
                });
            }

            slider.appendChild(slide);
        });

        setupSlideObserver();
    }

    function showIndicator(el, icon) {
        if (!el) return;
        el.querySelector('.icon').textContent = icon;
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 500);
    }

    /**
     * Setup IntersectionObserver for auto-playing visible slide and pausing others
     */
    function setupSlideObserver() {
        if (observer) observer.disconnect();

        const slides = slider.querySelectorAll('.reel-vertical-slide');
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const slide = entry.target;
                const idx = parseInt(slide.getAttribute('data-index'), 10);
                const vid = slide.querySelector('video');

                if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                    activeSlideIndex = idx;
                    updateTopBar(idx);

                    // Update URL ?media=ID without page reload
                    const item = mediaItems[idx];
                    if (item && item.id) {
                        const newUrl = new URL(window.location);
                        newUrl.searchParams.set('media', item.id);
                        window.history.replaceState({ viewerOpen: true, index: idx }, '', newUrl.toString());
                    }

                    if (vid) {
                        vid.muted = isMuted;
                        vid.play().catch(() => {
                            vid.muted = true;
                            vid.play().catch(() => {});
                        });
                    }

                    // Preload next & previous videos
                    preloadAdjacent(idx);
                } else {
                    if (vid && !vid.paused) {
                        vid.pause();
                    }
                }
            });
        }, {
            root: slider,
            threshold: [0.6]
        });

        slides.forEach(s => observer.observe(s));
    }

    function preloadAdjacent(idx) {
        const nextSlide = slider.querySelector(`.reel-vertical-slide[data-index="${idx + 1}"] video`);
        if (nextSlide && nextSlide.preload === 'none') nextSlide.preload = 'auto';

        const prevSlide = slider.querySelector(`.reel-vertical-slide[data-index="${idx - 1}"] video`);
        if (prevSlide && prevSlide.preload === 'none') prevSlide.preload = 'auto';
    }

    function updateTopBar(idx) {
        if (counterEl) counterEl.textContent = `${idx + 1} / ${mediaItems.length}`;
        if (eventLabelEl && currentCategory) eventLabelEl.textContent = currentCategory.name;
    }

    /**
     * Open Fullscreen Viewer at index
     */
    function openViewer(index) {
        if (!mediaItems || mediaItems.length === 0) return;
        activeSlideIndex = Math.max(0, Math.min(index, mediaItems.length - 1));

        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Scroll slider to active slide
        const targetSlide = slider.querySelector(`.reel-vertical-slide[data-index="${activeSlideIndex}"]`);
        if (targetSlide) {
            targetSlide.scrollIntoView({ behavior: 'instant' });
        }

        // Add history state for back button navigation
        const item = mediaItems[activeSlideIndex];
        const newUrl = new URL(window.location);
        if (item && item.id) newUrl.searchParams.set('media', item.id);
        window.history.pushState({ viewerOpen: true, index: activeSlideIndex }, '', newUrl.toString());
    }

    /**
     * Close Fullscreen Viewer
     */
    function closeViewer() {
        if (!overlay.classList.contains('active')) return;

        // Pause all videos
        const allVids = slider.querySelectorAll('video');
        allVids.forEach(v => {
            v.pause();
            v.currentTime = 0;
        });

        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Clean URL query
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('media');
        window.history.replaceState({}, '', cleanUrl.toString());
    }

    // Scroll to Slide
    function scrollToSlide(index) {
        if (index < 0 || index >= mediaItems.length) return;
        const target = slider.querySelector(`.reel-vertical-slide[data-index="${index}"]`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Sound Toggle
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                soundIconMuted.style.display = 'inline';
                soundIconUnmuted.style.display = 'none';
            } else {
                soundIconMuted.style.display = 'none';
                soundIconUnmuted.style.display = 'inline';
            }

            // Apply to all videos
            const allVids = slider.querySelectorAll('video');
            allVids.forEach(v => {
                v.muted = isMuted;
            });
        });
    }

    // Close button
    if (closeBtn) closeBtn.addEventListener('click', closeViewer);

    // Prev / Next Side Arrow Buttons
    if (prevBtn) prevBtn.addEventListener('click', () => scrollToSlide(activeSlideIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollToSlide(activeSlideIndex + 1));

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!overlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToSlide(activeSlideIndex + 1);
        }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToSlide(activeSlideIndex - 1);
        }
        if (e.key === 'm' || e.key === 'M') {
            soundToggleBtn.click();
        }
    });

    // Browser Back Button Handler
    window.addEventListener('popstate', (e) => {
        if (overlay.classList.contains('active')) {
            closeViewer();
        }
    });

    // Initialize Page
    if (categorySlug) {
        const catData = await fetchCategory(categorySlug);
        if (catData) {
            renderCategoryDetail(catData);
        } else {
            renderNotFound();
        }
    } else {
        window.location.replace('/events');
    }
});
