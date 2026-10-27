/**
 * Creations by H&I - Products Manager Script
 * Handles Firestore CRUD & Local JSON import
 */

document.addEventListener('DOMContentLoaded', async () => {
    const statusBadge = document.getElementById('firebase-status');
    const productForm = document.getElementById('product-form');
    const formHeading = document.getElementById('form-heading');
    const editDocIdInput = document.getElementById('edit-doc-id');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const productListEl = document.getElementById('product-list');
    const filterCategory = document.getElementById('filter-category');
    const productCountEl = document.getElementById('product-count');
    const syncLocalBtn = document.getElementById('sync-local-btn');

    // Form inputs
    const prodCategory = document.getElementById('prod-category');
    const prodTitle = document.getElementById('prod-title');
    const prodPrice = document.getElementById('prod-price');
    const prodDesc = document.getElementById('prod-desc');
    const prodImage = document.getElementById('prod-image');
    const prodVideo = document.getElementById('prod-video');
    const prodOrder = document.getElementById('prod-order');
    const prodFeatured = document.getElementById('prod-featured');
    const prodActive = document.getElementById('prod-active');

    // Counters
    const titleCounter = document.getElementById('title-counter');
    const descCounter = document.getElementById('desc-counter');

    // Cloudinary Upload Widget Elements
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewThumb = document.getElementById('image-preview-thumb');

    // Cloudinary Image Uploader
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', () => {
            if (!window.cloudinary) {
                alert('Cloudinary is loading. Please check your internet connection.');
                return;
            }
            window.cloudinary.openUploadWidget({
                cloudName: 'djjvgubrk',
                uploadPreset: 'ml_default',
                sources: ['local', 'camera', 'url'],
                multiple: false,
                resourceType: 'image',
                clientAllowedFormats: ['webp', 'jpg', 'jpeg', 'png']
            }, (error, result) => {
                if (!error && result && result.event === 'success') {
                    prodImage.value = result.info.secure_url;
                    if (imagePreview && imagePreviewThumb) {
                        imagePreviewThumb.src = result.info.secure_url;
                        imagePreview.style.display = 'block';
                    }
                }
            });
        });
    }

    // Cloudinary Video / Reel Uploader
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', () => {
            if (!window.cloudinary) {
                alert('Cloudinary is loading. Please check your internet connection.');
                return;
            }
            window.cloudinary.openUploadWidget({
                cloudName: 'djjvgubrk',
                uploadPreset: 'ml_default',
                sources: ['local', 'camera', 'url'],
                multiple: false,
                resourceType: 'video',
                clientAllowedFormats: ['mp4', 'mov']
            }, (error, result) => {
                if (!error && result && result.event === 'success') {
                    prodVideo.value = result.info.secure_url;
                    alert('Video reel uploaded to Cloudinary successfully!');
                }
            });
        });
    }

    const CATEGORIES = [
        'baskets', 'flower_bouquets', 'cakes', 'balloon_boxes',
        'crates', 'frames', 'customized_items', 'trousseau_packing'
    ];

    let cachedProducts = [];

    // Title input counter
    prodTitle.addEventListener('input', () => {
        titleCounter.textContent = `${prodTitle.value.length} / 60`;
    });

    // Word counter for description
    prodDesc.addEventListener('input', () => {
        const text = prodDesc.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        descCounter.textContent = `${words} words (target: 20-25)`;
        if (words >= 20 && words <= 25) {
            descCounter.style.color = 'var(--success)';
            descCounter.style.fontWeight = 'bold';
        } else if (words > 25) {
            descCounter.style.color = 'var(--danger)';
            descCounter.style.fontWeight = 'normal';
        } else {
            descCounter.style.color = 'var(--text-muted)';
            descCounter.style.fontWeight = 'normal';
        }
    });

    // 1. Check Firebase Status
    function checkStatus() {
        if (window.CreationsFirebase && window.CreationsFirebase.isConfigured()) {
            statusBadge.className = 'status-badge status-connected';
            statusBadge.innerHTML = '🟢 Firebase Firestore Connected';
            return true;
        } else {
            statusBadge.className = 'status-badge status-pending';
            statusBadge.innerHTML = '⚠️ Firebase Pending (js/firebase-config.js)';
            return false;
        }
    }

    const isConnected = checkStatus();

    // 2. Load Products (From Firestore if connected, else from local JSON files)
    async function loadAllProducts() {
        productListEl.innerHTML = '<div style="text-align: center; padding: 30px;">Loading catalog...</div>';
        cachedProducts = [];

        if (window.CreationsFirebase && window.CreationsFirebase.isConfigured()) {
            try {
                const db = window.CreationsFirebase.getDb();
                const snapshot = await db.collection('products').get();
                snapshot.forEach(doc => {
                    cachedProducts.push({ id: doc.id, ...doc.data() });
                });
            } catch (err) {
                console.error('Error reading from Firestore:', err);
            }
        }

        // If Firestore is empty or not yet connected, load local JSONs
        if (cachedProducts.length === 0) {
            for (const cat of CATEGORIES) {
                try {
                    const res = await fetch(`/data/${cat}.json?t=${Date.now()}`);
                    if (res.ok) {
                        const data = await res.json();
                        const items = data.products || (Array.isArray(data) ? data : []);
                        items.forEach((item, index) => {
                            cachedProducts.push({
                                id: `local_${cat}_${index}`,
                                category: cat,
                                ...item
                            });
                        });
                    }
                } catch (e) {}
            }
        }

        renderFilteredList();
    }

    // 3. Render Product List
    function renderFilteredList() {
        const selected = filterCategory.value;
        const filtered = selected === 'all' 
            ? cachedProducts 
            : cachedProducts.filter(p => p.category === selected);

        productCountEl.textContent = `${filtered.length} products`;
        productListEl.innerHTML = '';

        if (filtered.length === 0) {
            productListEl.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No products found for this category.
                </div>
            `;
            return;
        }

        filtered.forEach(p => {
            const row = document.createElement('div');
            row.className = 'product-row';

            const fallbackImg = '/assets/images/category-flower-bouquet.jpg';
            const imgSrc = p.image || fallbackImg;
            const priceText = p.price ? `Rs. ${Number(p.price).toLocaleString()}` : 'Price on Inquiry';
            const featuredTag = p.featured ? '<span style="color: #c48b9f; font-weight: 600;">★ Best Seller</span>' : '';
            const statusTag = p.active === false ? '<span style="color: var(--danger);">[Inactive]</span>' : '<span style="color: var(--success);">[Active]</span>';

            row.innerHTML = `
                <img src="${imgSrc}" class="product-thumb" alt="${p.title}" onerror="this.src='${fallbackImg}'">
                <div class="product-info">
                    <div class="product-row-title">${p.title || 'Untitled'}</div>
                    <div class="product-row-desc">${p.description || p.shortDescription || 'No description provided.'}</div>
                    <div class="product-row-meta">
                        <span>Category: <strong>${p.category}</strong></span>
                        <span>${priceText}</span>
                        ${featuredTag}
                        ${statusTag}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit" data-id="${p.id}">Edit</button>
                    <button class="btn btn-danger" data-id="${p.id}">Delete</button>
                </div>
            `;

            // Edit button handler
            row.querySelector('.btn-edit').addEventListener('click', () => editProduct(p));

            // Delete button handler
            row.querySelector('.btn-danger').addEventListener('click', () => deleteProduct(p.id, p.title));

            productListEl.appendChild(row);
        });
    }

    filterCategory.addEventListener('change', renderFilteredList);

    // 4. Edit Product into form
    function editProduct(p) {
        editDocIdInput.value = p.id;
        prodCategory.value = p.category || 'baskets';
        prodTitle.value = p.title || '';
        prodPrice.value = p.price || '';
        prodDesc.value = p.description || p.shortDescription || '';
        prodImage.value = p.image || '';
        prodVideo.value = p.video || '';
        prodOrder.value = p.order || 1;
        prodFeatured.checked = !!p.featured;
        prodActive.checked = p.active !== false;

        titleCounter.textContent = `${prodTitle.value.length} / 60`;
        const words = prodDesc.value.trim().split(/\s+/).length;
        descCounter.textContent = `${words} words (target: 20-25)`;

        if (p.image && imagePreview && imagePreviewThumb) {
            imagePreviewThumb.src = p.image;
            imagePreview.style.display = 'block';
        } else if (imagePreview) {
            imagePreview.style.display = 'none';
        }

        formHeading.textContent = `Edit: ${p.title}`;
        saveBtn.textContent = '💾 Update Product';
        cancelBtn.style.display = 'inline-flex';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelBtn.addEventListener('click', () => {
        resetForm();
    });

    function resetForm() {
        productForm.reset();
        editDocIdInput.value = '';
        formHeading.textContent = 'Add New Product';
        saveBtn.textContent = '💾 Save Product';
        cancelBtn.style.display = 'none';
        titleCounter.textContent = '0 / 60';
        descCounter.textContent = '0 words (target: 20-25)';
        prodActive.checked = true;
        if (imagePreview) imagePreview.style.display = 'none';
    }

    // 5. Save / Add Product Handler
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!window.CreationsFirebase || !window.CreationsFirebase.isConfigured()) {
            alert('Firebase credentials not set in js/firebase-config.js yet!\n\nPlease paste your firebaseConfig values in js/firebase-config.js to enable saving directly to Firestore.');
            return;
        }

        const db = window.CreationsFirebase.getDb();
        const docId = editDocIdInput.value.trim();

        const productData = {
            category: prodCategory.value,
            title: prodTitle.value.trim(),
            price: prodPrice.value ? Number(prodPrice.value) : null,
            description: prodDesc.value.trim(),
            shortDescription: prodDesc.value.trim(),
            image: prodImage.value.trim(),
            video: prodVideo.value.trim(),
            order: Number(prodOrder.value) || 1,
            featured: prodFeatured.checked,
            active: prodActive.checked,
            updatedAt: new Date().toISOString()
        };

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            if (docId && !docId.startsWith('local_')) {
                // Update existing Firestore doc
                await db.collection('products').doc(docId).set(productData, { merge: true });
                alert(`Product "${productData.title}" updated successfully in Firestore!`);
            } else {
                // Add new doc
                const newDocRef = await db.collection('products').add(productData);
                alert(`Product "${productData.title}" added successfully! Doc ID: ${newDocRef.id}`);
            }

            resetForm();
            await loadAllProducts();
        } catch (err) {
            console.error('Error saving product:', err);
            alert(`Error saving to Firebase: ${err.message}`);
        } finally {
            saveBtn.disabled = false;
        }
    });

    // 6. Delete Product Handler
    async function deleteProduct(id, title) {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        if (!window.CreationsFirebase || !window.CreationsFirebase.isConfigured()) {
            alert('Firebase not connected. Cannot delete from local static files directly from browser.');
            return;
        }

        if (id.startsWith('local_')) {
            alert('This is a local static JSON item. Once you import to Firebase, you can delete it anytime!');
            return;
        }

        try {
            const db = window.CreationsFirebase.getDb();
            await db.collection('products').doc(id).delete();
            alert(`Product "${title}" deleted from Firestore.`);
            await loadAllProducts();
        } catch (err) {
            alert(`Delete failed: ${err.message}`);
        }
    }

    // 7. 1-Click Sync Local JSON into Firestore
    syncLocalBtn.addEventListener('click', async () => {
        if (!window.CreationsFirebase || !window.CreationsFirebase.isConfigured()) {
            alert('Please add your Firebase credentials in js/firebase-config.js first!');
            return;
        }

        if (!confirm('This will upload all 16 current local products from JSON files directly into your Firebase Firestore database. Proceed?')) {
            return;
        }

        syncLocalBtn.disabled = true;
        syncLocalBtn.textContent = '⏳ Importing to Firestore...';

        try {
            const db = window.CreationsFirebase.getDb();
            let count = 0;

            for (const cat of CATEGORIES) {
                const res = await fetch(`/data/${cat}.json?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    const items = data.products || (Array.isArray(data) ? data : []);

                    for (const item of items) {
                        if (!item.title) continue;
                        const docData = {
                            category: cat,
                            title: item.title,
                            description: item.shortDescription || item.description || '',
                            shortDescription: item.shortDescription || item.description || '',
                            price: item.price || null,
                            image: item.image || '',
                            video: item.video || '',
                            order: Number(item.order) || (count + 1),
                            featured: !!item.featured,
                            active: item.active !== false,
                            importedAt: new Date().toISOString()
                        };

                        await db.collection('products').add(docData);
                        count++;
                    }
                }
            }

            alert(`Success! Imported ${count} products into Cloud Firestore.`);
            await loadAllProducts();
        } catch (err) {
            console.error('Import error:', err);
            alert(`Import failed: ${err.message}`);
        } finally {
            syncLocalBtn.disabled = false;
            syncLocalBtn.textContent = '🔄 Import Local JSON to Firebase';
        }
    });

    // Initial Load
    await loadAllProducts();
});

