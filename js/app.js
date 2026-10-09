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
        .gallery-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            gap: 30px !important;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        }
        .product-card {
            background: var(--white);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            transition: all 0.4s ease;
            display: flex;
            flex-direction: column;
            width: 100%;
            border: 1px solid rgba(227, 153, 182, 0.2);
        }
        .product-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(227, 153, 182, 0.4);
            border-color: var(--accent-pink);
        }
        .product-media {
            position: relative;
            width: 100%;
            padding-top: 100%; /* 1:1 Aspect Ratio */
            overflow: hidden;
        }
        .product-media img, .product-media video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .product-card:hover .product-media img {
            transform: scale(1.05);
        }
        .product-media video {
            opacity: 0;
            z-index: 2;
        }
        .product-card:hover .product-media video {
            opacity: 1;
        }
        .product-content {
            padding: 20px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            text-align: left;
        }
        .product-title {
            font-family: 'Lora', serif;
            font-size: 1.25rem;
            color: var(--text-dark);
            margin-bottom: 10px;
            font-weight: 600;
        }
        .product-desc {
            font-size: 0.95rem;
            color: var(--text-light);
            margin-bottom: 20px;
            flex-grow: 1;
        }
        .product-action {
            margin-top: auto;
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

    const categories = [
        { file: 'data/flower_bouquets.json', name: 'Flower Bouquet' },
        { file: 'data/cakes.json', name: 'Cakes / Customized Cakes' },
        { file: 'data/baskets.json', name: 'Baskets' },
        { file: 'data/balloon_boxes.json', name: 'Balloon Boxes' },
        { file: 'data/crates.json', name: 'Crates' },
        { file: 'data/frames.json', name: 'Frames' },
        { file: 'data/customized_items.json', name: 'Customized Items' }
    ];

    try {
        const fetchPromises = categories.map(async (cat) => {
            try {
                const response = await fetch(cat.file);
                if (!response.ok) return [];
                const data = await response.json();
                let items = data.products ? data.products : (Array.isArray(data) ? data : []);
                return items.map(item => ({ ...item, category: cat.name }));
            } catch (e) {
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        products = results.flat();

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
                    <img src="${item.image || 'assets/images/category-flower-bouquet.jpg'}" alt="${item.title}">
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
            galleryGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Items coming soon to this category!</p>';
            return;
        }

        filteredItems.forEach(item => {
            const waLink = createWhatsAppLink(item.title);
            const videoTag = item.video ? `<video src="${item.video}" loop muted playsinline></video>` : '';

            const div = document.createElement('div');
            div.className = 'product-card reveal active';
            div.innerHTML = `
                <div class="product-media">
                    <img src="${item.image || 'assets/images/category-flower-bouquet.jpg'}" alt="${item.title}">
                    ${videoTag}
                </div>
                <div class="product-content">
                    <div class="product-title">${item.title}</div>
                    <div class="product-desc">${item.description || ''}</div>
                    <div class="product-action">
                        <a href="${waLink}" class="btn btn-primary" target="_blank" style="width: 100%; text-align: center; display: inline-block;">Inquire on WhatsApp</a>
                    </div>
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
