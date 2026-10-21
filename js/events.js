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
            const staticRes = await fetch(`data/events.json?t=${Date.now()}`);
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
     * Render category cover cards
     */
    function renderGrid(categories, filter = 'all') {
        if (!gridContainer) return;

        const filtered = filter === 'all' 
            ? categories 
            : categories.filter(c => c.slug === filter);

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div class="empty-reels-box" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <p style="font-size: 1.15rem; color: var(--text-dark); margin-bottom: 8px;">No event sections currently found under this filter.</p>
                    <p style="font-size: 0.95rem; color: var(--text-light);">New categories and media can be added anytime from the Admin Panel.</p>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = filtered.map(cat => {
            const mediaList = Array.isArray(cat.media) ? cat.media.filter(m => m.is_active !== false) : [];
            const videosCount = mediaList.filter(m => m.media_type === 'video').length;
            const photosCount = mediaList.filter(m => m.media_type === 'photo').length;

            let badgeText = '';
            if (videosCount > 0 && photosCount > 0) {
                badgeText = `🎬 ${videosCount} Reels • 📷 ${photosCount} Photos`;
            } else if (videosCount > 0) {
                badgeText = `🎬 ${videosCount} Video Reels`;
            } else if (photosCount > 0) {
                badgeText = `📷 ${photosCount} Photos`;
            } else {
                badgeText = `✨ Bespoke Portfolio`;
            }

            const coverImg = cat.cover_image || (mediaList[0] ? (mediaList[0].thumbnail_url || mediaList[0].file_url) : 'assets/images/hero_showcase.jpg');
            const pageUrl = `/events/${cat.slug}`;

            return `
                <article class="event-category-card">
                    <a href="${pageUrl}" class="cat-card-media-wrap" aria-label="Explore ${cat.name} Gallery">
                        <img 
                            src="${coverImg}" 
                            alt="${cat.name} Showcase" 
                            loading="lazy" 
                            onerror="this.onerror=null; this.src='assets/images/hero_showcase.jpg';">
                        <span class="cat-dark-pill">${cat.name}</span>
                        <span class="cat-media-count-pill">${badgeText}</span>
                    </a>
                    <div class="cat-card-content">
                        <h2 class="cat-card-title">
                            <a href="${pageUrl}">${cat.name}</a>
                        </h2>
                        <p class="cat-card-desc">${cat.description || 'Custom crafted styling, ambient illumination, floral decor, and bespoke ambiance.'}</p>
                        <div class="cat-card-actions">
                            <a href="${pageUrl}" class="btn-view-gallery">
                                <span>View Gallery</span>
                                <span class="arrow">&rarr;</span>
                            </a>
                            <a href="https://wa.me/923282276532?text=${encodeURIComponent(`Hello Creations by H&I! I am interested in inquiring about ${cat.name} styling.`)}" class="btn-cat-wa" target="_blank" rel="noopener" aria-label="Inquire about ${cat.name} on WhatsApp">
                                <span>Inquire</span>
                            </a>
                        </div>
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

    // Initialize
    allCategories = await fetchCategories();
    allCategories = allCategories.filter(c => c && c.is_active !== false);
    renderFilters(allCategories);
    renderGrid(allCategories, activeFilter);
    updateFooter(allCategories);
});
