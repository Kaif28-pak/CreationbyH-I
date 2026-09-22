document.addEventListener('DOMContentLoaded', async () => {
    const servicesGrid = document.getElementById('services-grid');
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Add minimal CSS for the filter bar dynamically so we don't touch style.css
    const style = document.createElement('style');
    style.innerHTML = `
        .gallery-filters {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 30px;
        }
        .filter-btn {
            background: transparent;
            border: 2px solid var(--accent-pink);
            color: var(--text-dark);
            padding: 8px 16px;
            border-radius: 30px;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .filter-btn:hover, .filter-btn.active {
            background: var(--accent-pink);
            color: white;
        }
        .wa-btn {
            display: inline-block;
            margin-top: 15px;
            padding: 8px 16px;
            background: var(--white);
            color: var(--accent-pink);
            border: 2px solid var(--accent-pink);
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        .wa-btn:hover {
            background: var(--accent-pink);
            color: var(--white);
            transform: translateY(-2px);
        }
        .gallery-item {
            position: relative;
        }
        .gallery-item video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        .gallery-item:hover video {
            opacity: 1;
        }
        .service-card video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            border-radius: 50%;
        }
        .service-img {
            position: relative;
            overflow: hidden;
            border-radius: 50%;
        }
        .service-card:hover video {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Show loading states
    servicesGrid.innerHTML = '<p>Loading services...</p>';
    galleryGrid.innerHTML = '<p>Loading gallery...</p>';

    let products = [];

    try {
        const response = await fetch('data/products.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        // Handle Decap CMS output format {"products": [...]} or raw array [...]
        products = data.products ? data.products : (Array.isArray(data) ? data : []);
        
        // Sort by order
        products.sort((a, b) => (a.order || 0) - (b.order || 0));

        renderServices(products.filter(p => p.featured));
        renderGallery(products, 'All');

        // Setup filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderGallery(products, e.target.dataset.filter);
            });
        });

    } catch (error) {
        console.error('Error loading products:', error);
        servicesGrid.innerHTML = '<p>Failed to load services. Please try again later.</p>';
        galleryGrid.innerHTML = '<p>Failed to load gallery. Please try again later.</p>';
    }

    function createWhatsAppLink(title) {
        const encodedTitle = encodeURIComponent(title);
        return `https://wa.me/923096708144?text=Hello%2C%20mujhe%20is%20${encodedTitle}%20ki%20detail%20chahiye.`;
    }

    function renderServices(items) {
        servicesGrid.innerHTML = '';
        if (items.length === 0) {
            servicesGrid.innerHTML = '<p>No services available.</p>';
            return;
        }

        items.forEach(item => {
            const waLink = createWhatsAppLink(item.title);
            const videoTag = item.video ? `<video src="${item.video}" loop muted playsinline></video>` : '';
            
            const card = document.createElement('div');
            card.className = 'service-card reveal active';
            card.innerHTML = `
                <div class="service-img">
                    <img src="${item.image || 'assets/images/service_decor.jpg'}" alt="${item.title}">
                    ${videoTag}
                </div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="${waLink}" class="wa-btn" target="_blank">Contact on WhatsApp</a>
            `;
            
            // Video hover logic for mobile / error fallback
            if (item.video) {
                const videoElement = card.querySelector('video');
                card.addEventListener('mouseenter', () => videoElement.play().catch(e => console.log('Autoplay prevented', e)));
                card.addEventListener('mouseleave', () => videoElement.pause());
                card.addEventListener('touchstart', () => videoElement.play().catch(e => console.log('Autoplay prevented', e)));
                videoElement.addEventListener('error', () => videoElement.style.display = 'none');
            }

            servicesGrid.appendChild(card);
        });
    }

    function renderGallery(items, filter) {
        galleryGrid.innerHTML = '';
        const filteredItems = filter === 'All' ? items : items.filter(p => p.category === filter);
        
        if (filteredItems.length === 0) {
            galleryGrid.innerHTML = '<p>No items found for this category.</p>';
            return;
        }

        filteredItems.forEach(item => {
            const waLink = createWhatsAppLink(item.title);
            const videoTag = item.video ? `<video src="${item.video}" loop muted playsinline></video>` : '';

            const div = document.createElement('div');
            div.className = 'gallery-item reveal active';
            div.innerHTML = `
                <img src="${item.image || 'assets/images/sunflower_bouquet.jpg'}" alt="${item.title}">
                ${videoTag}
                <div class="gallery-overlay">
                    ${item.title}
                    <a href="${waLink}" class="wa-btn" target="_blank" style="margin-top: 10px;">Inquire</a>
                </div>
            `;

            if (item.video) {
                const videoElement = div.querySelector('video');
                div.addEventListener('mouseenter', () => videoElement.play().catch(e => console.log('Autoplay prevented', e)));
                div.addEventListener('mouseleave', () => videoElement.pause());
                div.addEventListener('touchstart', () => videoElement.play().catch(e => console.log('Autoplay prevented', e)));
                videoElement.addEventListener('error', () => videoElement.style.display = 'none');
            }

            galleryGrid.appendChild(div);
        });
    }
});
