/**
 * Creations by H&I - Firebase & Firestore Configuration
 */

const firebaseConfig = {
    apiKey: "AIzaSyBfpBpMnfI5pUo3XOryByfW4Lyx11LQSgU",
    authDomain: "creationbyhandi.firebaseapp.com",
    projectId: "creationbyhandi",
    storageBucket: "creationbyhandi.firebasestorage.app",
    messagingSenderId: "228112600635",
    appId: "1:228112600635:web:0debba094a00f9ac07561e",
    measurementId: "G-2JZCD0GF2M"
};

// Check if valid credentials have been set
function isFirebaseConfigured() {
    return firebaseConfig && 
           firebaseConfig.apiKey && 
           firebaseConfig.apiKey !== "YOUR_API_KEY" && 
           firebaseConfig.projectId && 
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

let db = null;

if (typeof firebase !== 'undefined' && isFirebaseConfigured()) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        console.log('[Firebase] Initialized Cloud Firestore successfully for creationbyhandi.');
    } catch (err) {
        console.warn('[Firebase] Initialization error:', err);
    }
} else {
    console.log('[Firebase] Running in Local Fallback mode.');
}

// Global Firebase Helpers - Firestore is the SOLE Source of Truth
window.CreationsFirebase = {
    isConfigured: isFirebaseConfigured,
    getDb: () => db,
    
    // Fetch products for a category
    async getProductsByCategory(categoryId) {
        if (db && isFirebaseConfigured()) {
            try {
                // Query by single field to avoid requiring custom composite indexes in Firebase Console
                const snapshot = await db.collection('products')
                    .where('category', '==', categoryId)
                    .get();

                const products = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data && data.active !== false) {
                        products.push({ id: doc.id, ...data });
                    }
                });
                products.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
                return products; // Return exact products (empty array if user deleted/has none)
            } catch (err) {
                console.warn('[Firebase] Firestore fetch failed:', err);
            }
        }
        return null; // Fallback only when Firebase is unconfigured
    },

    // Fetch featured products for homepage
    async getFeaturedProducts() {
        if (db && isFirebaseConfigured()) {
            try {
                const snapshot = await db.collection('products')
                    .where('featured', '==', true)
                    .get();

                const featured = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data && data.active !== false) {
                        featured.push({ id: doc.id, ...data });
                    }
                });
                featured.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
                return featured.slice(0, 6);
            } catch (err) {
                console.warn('[Firebase] Firestore featured fetch failed:', err);
            }
        }
        return null;
    },

    // Fetch event media / reels for event pages
    async getEventMedia(slug) {
        if (db && isFirebaseConfigured()) {
            try {
                const snapshot = await db.collection('products')
                    .where('category', '==', slug)
                    .get();

                const media = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data && data.active !== false) {
                        media.push({
                            id: doc.id,
                            title: data.title || '',
                            description: data.description || '',
                            media_type: data.video ? 'video' : 'photo',
                            file_url: data.video || data.image || '',
                            thumbnail_url: data.image || '',
                            order: Number(data.order) || 1,
                            is_active: true
                        });
                    }
                });
                media.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
                return media;
            } catch (err) {
                console.warn('[Firebase] Firestore event media fetch error:', err);
            }
        }
        return null;
    },

    // Fetch single product by ID
    async getProductById(productId) {
        if (db && isFirebaseConfigured()) {
            try {
                const doc = await db.collection('products').doc(productId).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
            } catch (err) {
                console.warn('[Firebase] Error fetching product doc:', err);
            }
        }
        return null;
    },

    // Fetch special deals for homepage
    async getDeals() {
        if (db && isFirebaseConfigured()) {
            try {
                const snapshot = await db.collection('deals').get();
                const deals = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data && data.active !== false) {
                        deals.push({ id: doc.id, ...data });
                    }
                });
                if (deals.length > 0) {
                    deals.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
                    return deals;
                }
            } catch (err) {
                console.warn('[Firebase] Firestore deals fetch error:', err);
            }
        }
        return null;
    }
};
