document.addEventListener('DOMContentLoaded', async () => {
    const filtersContainer = document.getElementById('events-hub-filters');
    const gridContainer = document.getElementById('events-categories-grid');
    const footerEventLinks = document.getElementById('footer-event-links');

    let allCategories = [];
    let activeFilter = 'all';

    /**
     * Fetch event categories with multi-tier fallback
     */
    async function fetchCategories() {
        // 1. Try public API endpoint
        try {
            const apiRes = await fetch(`/api/event-categories?t=${Date.now()}`);
            if (apiRes.ok) {
                const data = await apiRes.json();
                if (data && Array.isArray(data.categories) && data.categories.length > 0) {
                    return data.categories;
                }
            }
        } catch (e) {
            console.info('[EventsHub] API fetch fallback to static file...');
        }

        // 2. Try compiled data/events.json
        try {
            const staticRes = await fetch(`/data/events.json?t=${Date.now()}`);
            if (staticRes.ok) {
                const data = await staticRes.json();
                const list = data.categories || data.events;
                if (Array.isArray(list) && list.length > 0) {
                    return list;
                }
            }
        } catch (e) {
            console.info('[EventsHub] Static fetch fallback to GitHub raw...');
        }

        // 3. Try GitHub Raw fallback for live zero-build-delay CMS updates
        try {
            const ghRes = await fetch(`https://raw.githubusercontent.com/Kaif28-pak/CreationbyH-I/main/data/events.json?t=${Date.now()}`);
            if (ghRes.ok) {
                const data = await ghRes.json();
                const list = data.categories || data.events;
                if (Array.isArray(list) && list.length > 0) {
                    return list;
                }
            }
        } catch (e) {}

        return [];
    }

    /**
     * Render dynamic filter tabs
     */
    function renderFilters(categories) {
        if (!filtersContainer) return;

        let tabsHtml = `<button class="event-filter-btn active" data-filter="all" role="tab" aria-selected="true">All Events</button>`;
        categories.forEach(cat => {
            tabsHtml += `<button class="event-filter-btn" data-filter="${cat.slug}" role="tab" aria-selected="false">${cat.name}</button>`;
        });

        filtersContainer.innerHTML = tabsHtml;

        const buttons = filtersContainer.querySelectorAll('.event-filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                activeFilter = btn.getAttribute('data-filter');
                renderGrid(allCategories, activeFilter);
            });
        });
    }

    /**
     * Render 3 skeleton placeholder cards during loading
     */
    function renderSkeletons() {
        if (!gridContainer) return;
        gridContainer.innerHTML = Array(3).fill(0).map(() => `
            <div class="event-card event-card-skeleton" aria-hidden="true">
                <div class="skeleton-box skeleton-media"></div>
                <div class="skeleton-box skeleton-title"></div>
                <div class="skeleton-box skeleton-desc"></div>
                <div class="skeleton-box skeleton-btn"></div>
            </div>
        `).join('');
    }

    /**
     * Render category cover cards
     */
    function renderGrid(categories, filter = 'all') {
        if (!gridContainer) return;

        const filtered = filter === 'all' 
            ? categories 
            : categories.filter(c => c.slug === filter);

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div class="event-planner-empty">
                    <h4>Abhi koi event section available nahi hai.</h4>
                    <p>Naye categories aur portfolio moments jald hi add kiye jayenge!</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = filtered.map(cat => {
            const mediaList = Array.isArray(cat.media) ? cat.media.filter(m => m.is_active !== false) : [];
            const videos = mediaList.filter(m => m.media_type === 'video');
            const photos = mediaList.filter(m => m.media_type === 'photo');
            const hasVideos = videos.length > 0;

            let badgeText = '';
            if (videos.length > 0 && photos.length > 0) {
                badgeText = `${videos.length} Reels · ${photos.length} Photos`;
            } else if (videos.length > 0) {
                badgeText = `${videos.length} ${videos.length === 1 ? 'Reel' : 'Reels'}`;
            } else if (photos.length > 0) {
                badgeText = `${photos.length} ${photos.length === 1 ? 'Photo' : 'Photos'}`;
            } else {
                badgeText = 'Coming Soon';
            }

            const coverImg = cat.cover_image || (photos[0] ? photos[0].file_url : (videos[0] ? (videos[0].thumbnail_url || videos[0].poster) : 'assets/images/hero_showcase.jpg'));
            const pageUrl = `/events/${cat.slug}`;
            const waUrl = `https://wa.me/923282276532?text=${encodeURIComponent(`Hello Creations by H&I! I am interested in inquiring about ${cat.name} styling.`)}`;

            return `
                <article class="event-card" onclick="if(!event.target.closest('.btn-event-wa-icon')) window.location.href='${pageUrl}'">
                    <div class="event-media-wrap">
                        <span class="event-dark-pill">${cat.name}</span>
                        <span class="event-count-pill">${badgeText}</span>
                        <img 
                            src="${coverImg}" 
                            alt="${cat.name} Showcase" 
                            loading="lazy" 
                            onerror="this.onerror=null; this.src='assets/images/hero_showcase.jpg';">
                        ${hasVideos ? `
                            <div class="event-play-overlay" aria-hidden="true">
                                <div class="event-play-circle" title="Watch Reels">
                                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="event-card-content">
                        <h2 class="event-card-title">${cat.name}</h2>
                        <p class="event-card-desc">${cat.description || 'Custom crafted styling, ambient illumination, floral decor, and bespoke ambiance.'}</p>
                    </div>
                    <div class="event-card-actions">
                        <a href="${pageUrl}" class="btn-event-view-gallery">VIEW GALLERY</a>
                        <a href="${waUrl}" class="btn-event-wa-icon" target="_blank" rel="noopener noreferrer" aria-label="Inquire about ${cat.name} on WhatsApp" title="Inquire on WhatsApp">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    /**
     * Update footer links with dynamic event categories
     */
    function updateFooter(categories) {
        if (!footerEventLinks) return;
        footerEventLinks.innerHTML = categories.map(cat => `
            <li><a href="/events/${cat.slug}">${cat.name}</a></li>
        `).join('');
    }

    // Initialize with skeleton loading
    renderSkeletons();
    allCategories = await fetchCategories();
    allCategories = allCategories.filter(c => c && c.is_active !== false);
    renderFilters(allCategories);
    renderGrid(allCategories, activeFilter);
    updateFooter(allCategories);
});
