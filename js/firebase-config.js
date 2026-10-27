/**
 * Creations by H&I - Firebase & Firestore Configuration
 * 
 * Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a project: "creations-by-handi"
 * 3. Create Cloud Firestore in "Test Mode"
 * 4. Register a Web App (</>) and copy the firebaseConfig object below.
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
        console.log('[Firebase] Initialized Cloud Firestore successfully.');
    } catch (err) {
        console.warn('[Firebase] Initialization error:', err);
    }
} else {
    console.log('[Firebase] Running in Local Fallback mode (Firebase credentials pending).');
}

// Global Firebase Helpers
window.CreationsFirebase = {
    isConfigured: isFirebaseConfigured,
    getDb: () => db,
    
    // Fetch products for a category (with fallback)
    async getProductsByCategory(categoryId) {
        if (db && isFirebaseConfigured()) {
            try {
                const snapshot = await db.collection('products')
                    .where('category', '==', categoryId)
                    .where('active', '!=', false)
                    .get();

                if (!snapshot.empty) {
                    const products = [];
                    snapshot.forEach(doc => {
                        products.push({ id: doc.id, ...doc.data() });
                    });
                    products.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
                    return products;
                }
            } catch (err) {
                console.warn('[Firebase] Firestore fetch failed, falling back to local JSON:', err);
            }
        }
        return null; // Signals to use local JSON fallback
    },

    // Fetch featured products
    async getFeaturedProducts() {
        if (db && isFirebaseConfigured()) {
            try {
                const snapshot = await db.collection('products')
                    .where('featured', '==', true)
                    .where('active', '!=', false)
                    .limit(6)
                    .get();

                if (!snapshot.empty) {
                    const featured = [];
                    snapshot.forEach(doc => {
                        featured.push({ id: doc.id, ...doc.data() });
                    });
                    return featured;
                }
            } catch (err) {
                console.warn('[Firebase] Firestore featured fetch failed:', err);
            }
        }
        return null;
    },

    // Fetch single product by ID or Slug
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
    }
};
