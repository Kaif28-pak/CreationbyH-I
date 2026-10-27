const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Normalize line endings to \n
css = css.replace(/\r\n/g, '\n');

// 2. Fix the .page-header gradient bug and .products-grid bug
const oldHeaderBlock = `/* Page Header & Breadcrumbs */
.page-header {
    padding: 130px 8% 50px;
    background: linear-gradient(to bottom, var(--primary-pink) 65%, var(--white) 35%);
    text-align: center;
}
.page-header h1 {
    font-size: 3rem;
    color: var(--text-dark);
    margin-bottom: 15px;
}
.page-header p {
    font-size: 1.1rem;
    color: var(--text-light);
    max-width: 650px;
    margin: 0 auto;
    line-height: 1.6;
}
.breadcrumb-nav {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    color: var(--text-light);
}
.breadcrumb-nav a {
    color: var(--text-dark);
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.3s;
}
.breadcrumb-nav a:hover {
    color: var(--accent-pink);
}

/* Products Grid Section */
.products-container {
    padding: 50px 8% 90px;
    background-color: var(--white);
    min-height: 55vh;
}
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 35px;
    max-width: 1200px;
    margin: 0 auto;
}`;

const newHeaderBlock = `/* Page Header & Breadcrumbs (Zero Overflow Bugfix) */
.page-header {
    min-height: auto;
    padding: clamp(100px, 13vw, 140px) clamp(16px, 6vw, 8%) clamp(45px, 6vw, 65px);
    background: #FCE8EE;
    background: linear-gradient(180deg, #FDF8F5 0%, #FDE4EC 60%, #FAD7E3 100%);
    text-align: center;
    position: relative;
    overflow-wrap: anywhere;
    word-break: break-word;
    border-bottom: 1px solid rgba(227, 153, 182, 0.3);
}
.page-header h1 {
    font-size: clamp(1.8rem, 4.5vw, 2.9rem);
    color: var(--text-dark);
    margin-bottom: 15px;
    line-height: 1.25;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    overflow-wrap: anywhere;
    word-break: break-word;
}
.page-header p {
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    color: var(--text-light);
    max-width: 65ch;
    margin: 0 auto;
    line-height: 1.65;
    overflow-wrap: anywhere;
    word-break: break-word;
}
.breadcrumb-nav {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    color: var(--text-light);
    flex-wrap: wrap;
    justify-content: center;
}
.breadcrumb-nav a {
    color: var(--text-dark);
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.3s;
}
.breadcrumb-nav a:hover {
    color: var(--accent-pink);
}

/* Products Grid Section (Centered with Auto-Fit) */
.products-container {
    padding: clamp(40px, 6vw, 60px) clamp(16px, 6vw, 8%) clamp(60px, 8vw, 90px);
    background-color: var(--white);
    min-height: 55vh;
}
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    justify-content: center;
    gap: clamp(20px, 3.5vw, 35px);
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}`;

if (css.includes(oldHeaderBlock)) {
    css = css.replace(oldHeaderBlock, newHeaderBlock);
    console.log('[Update] Successfully replaced .page-header and .products-grid');
} else {
    console.warn('[Update] oldHeaderBlock not found directly, will check partial replace');
    css = css.replace(/background:\s*linear-gradient\(to bottom,\s*var\(--primary-pink\)\s*65%,\s*var\(--white\)\s*35%\);/g, 
        'background: linear-gradient(180deg, #FDF8F5 0%, #FDE4EC 60%, #FAD7E3 100%);');
    css = css.replace(/grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(290px,\s*1fr\)\);/g, 
        'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); justify-content: center;');
}

// 3. Append Comprehensive Master Styles for Tasks 0, 1, 4, 5, 6
const masterUpgrades = `
/* ==========================================================================
   CREATIONS BY H&I - MASTER RESPONSIVE & UX OVERHAUL (TASKS 0 - 6)
   ========================================================================== */

/* Universal Responsive Foundation */
:root {
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-top: env(safe-area-inset-top, 0px);
}

html, body {
    overflow-x: hidden;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

body {
    padding-bottom: clamp(70px, 10vw, 95px); /* Prevents floating WhatsApp from covering content */
    font-size: 1rem;
    line-height: 1.6;
}

*, *::before, *::after {
    box-sizing: inherit;
}

/* Fluid Typography */
h1 {
    font-size: clamp(1.6rem, 5vw, 3rem);
    line-height: 1.25;
    overflow-wrap: anywhere;
    word-break: break-word;
}

h2 {
    font-size: clamp(1.3rem, 3.5vw, 2.2rem);
    line-height: 1.3;
    overflow-wrap: anywhere;
    word-break: break-word;
}

h3 {
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    line-height: 1.35;
    overflow-wrap: anywhere;
    word-break: break-word;
}

p, span, li, a {
    overflow-wrap: anywhere;
    word-break: break-word;
}

/* Header & Sticky Navigation */
nav {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(227, 153, 182, 0.25);
    padding: 12px clamp(12px, 4vw, 8%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-shadow: 0 2px 12px rgba(58, 43, 50, 0.05);
}

.nav-actions-mobile {
    display: none;
    align-items: center;
    gap: 8px;
}

.header-wa-btn-compact {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #25D366;
    color: #FFFFFF !important;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    font-size: 18px;
    text-decoration: none;
    box-shadow: 0 3px 10px rgba(37, 211, 102, 0.3);
    flex-shrink: 0;
    min-width: 38px;
    min-height: 38px;
}

@media (max-width: 768px) {
    .nav-actions-mobile {
        display: flex;
    }
    .logo-container {
        gap: 8px;
    }
    .logo-icon {
        width: 34px;
        height: 34px;
        font-size: 15px;
    }
    .logo-text {
        font-size: 1.05rem;
    }
}

/* Trust Strip Section */
.trust-strip-section {
    background: #FFFFFF;
    border-top: 1px solid rgba(227, 153, 182, 0.2);
    border-bottom: 1px solid rgba(227, 153, 182, 0.2);
    padding: clamp(20px, 3.5vw, 30px) clamp(16px, 5vw, 8%);
}

.trust-strip-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(12px, 2.5vw, 24px);
    max-width: 1200px;
    margin: 0 auto;
}

.trust-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: #FFF9FB;
    border-radius: 12px;
    border: 1px solid rgba(227, 153, 182, 0.2);
    transition: transform 0.25s ease;
}

.trust-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent-pink);
}

.trust-icon {
    font-size: clamp(1.4rem, 2.5vw, 1.8rem);
    flex-shrink: 0;
}

.trust-text h4 {
    font-size: clamp(0.85rem, 1.4vw, 0.95rem);
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 2px;
    line-height: 1.2;
}

.trust-text p {
    font-size: clamp(0.75rem, 1.2vw, 0.85rem);
    color: var(--text-light);
    line-height: 1.25;
    margin: 0;
}

@media (max-width: 900px) {
    .trust-strip-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .trust-strip-grid {
        grid-template-columns: 1fr;
    }
}

/* How To Order Section */
.how-to-order-section {
    padding: clamp(50px, 8vw, 80px) clamp(16px, 6vw, 8%);
    background: #FFFFFF;
}

.how-to-order-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: clamp(20px, 3.5vw, 32px);
    max-width: 1100px;
    margin: 40px auto 0;
}

.order-step-card {
    background: #FFF9FB;
    border: 1px solid rgba(227, 153, 182, 0.25);
    border-radius: 18px;
    padding: clamp(24px, 4vw, 32px) 22px;
    text-align: center;
    position: relative;
    transition: all 0.3s ease;
}

.order-step-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(227, 153, 182, 0.2);
    border-color: var(--accent-pink);
}

.step-number-badge {
    width: 46px;
    height: 46px;
    background: var(--text-dark);
    color: #FFFFFF;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(58, 43, 50, 0.2);
}

.order-step-card h3 {
    font-size: 1.18rem;
    margin-bottom: 10px;
    color: var(--text-dark);
}

.order-step-card p {
    font-size: 0.92rem;
    color: var(--text-light);
    line-height: 1.55;
    max-width: 45ch;
    margin: 0 auto;
}

/* Featured Products Section */
.featured-section {
    padding: clamp(50px, 8vw, 80px) clamp(16px, 6vw, 8%);
    background: #FDF8F5;
}

.featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: clamp(20px, 3vw, 32px);
    max-width: 1200px;
    margin: 40px auto 0;
    justify-content: center;
}

/* Card Line Clamp & Formatting */
.product-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 2.7em;
    font-size: clamp(1.1rem, 2vw, 1.25rem);
}

.product-desc {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 4.5em;
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--text-light);
    margin-bottom: 16px;
}

.product-card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: auto;
}

.product-card-actions a, .product-card-actions button {
    flex: 1 1 120px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
    border-radius: 25px;
    font-size: 0.88rem;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    touch-action: manipulation;
}

.btn-card-wa {
    background: #25D366;
    color: #FFFFFF !important;
    border: none;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn-card-wa:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);
}

.btn-card-view {
    background: #FDF1F5;
    color: var(--text-dark) !important;
    border: 1px solid rgba(227, 153, 182, 0.5);
    transition: background 0.2s, border-color 0.2s;
}

.btn-card-view:hover {
    background: var(--accent-pink);
    color: #FFFFFF !important;
    border-color: var(--accent-pink);
}

/* Event Filter Chips Upgrades */
.event-filters, .events-hub-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin: 25px auto 35px;
    padding: 0 10px;
    max-width: 900px;
}

.event-filter-btn {
    font-size: 0.95rem; /* >= 14px */
    font-weight: 600;
    padding: 10px 20px;
    min-height: 44px;
    min-width: 44px;
    border-radius: 30px;
    border: 1.5px solid rgba(227, 153, 182, 0.4);
    background: #FFFFFF;
    color: var(--text-dark);
    cursor: pointer;
    touch-action: manipulation;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.event-filter-btn:hover, .event-filter-btn.active {
    background: var(--text-dark);
    color: #FFFFFF;
    border-color: var(--text-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(58, 43, 50, 0.15);
}

/* Contact Block & Map Embed */
.contact-section-home {
    padding: clamp(50px, 8vw, 80px) clamp(16px, 6vw, 8%);
    background: #FFFFFF;
}

.contact-home-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: clamp(24px, 4vw, 40px);
    max-width: 1200px;
    margin: 35px auto 0;
    align-items: start;
}

.contact-info-cards-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.contact-detail-card {
    background: #FFF9FB;
    border: 1px solid rgba(227, 153, 182, 0.25);
    border-radius: 14px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
}

.contact-card-icon {
    font-size: 1.6rem;
    flex-shrink: 0;
}

.contact-card-text h4 {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: 2px;
}

.contact-card-text p, .contact-card-text a {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-dark);
    text-decoration: none;
}

.contact-card-text a:hover {
    color: var(--accent-pink);
    text-decoration: underline;
}

.map-embed-wrapper {
    width: 100%;
    min-height: 320px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(227, 153, 182, 0.3);
    box-shadow: 0 8px 24px rgba(58, 43, 50, 0.06);
    background: #FFF5F8;
}

.map-embed-wrapper iframe {
    width: 100%;
    height: 100%;
    min-height: 320px;
    border: 0;
    display: block;
}

@media (max-width: 900px) {
    .contact-home-grid {
        grid-template-columns: 1fr;
    }
}

/* Master Footer Grid (Tasks 0, 1, 6) */
footer {
    background-color: var(--text-dark);
    color: #F8D9E3;
    padding: clamp(50px, 8vw, 75px) clamp(16px, 6vw, 8%) clamp(25px, 4vw, 35px);
    display: grid;
    grid-template-columns: 1.4fr 1fr 1.2fr 1fr;
    gap: clamp(24px, 4vw, 40px);
    width: 100%;
    box-sizing: border-box;
}

.footer-brand {
    display: flex;
    flex-direction: column;
}

.footer-brand p {
    font-size: 0.92rem;
    line-height: 1.6;
    margin: 16px 0 20px;
    color: rgba(255, 255, 255, 0.85);
    max-width: 320px;
}

.footer-links h4 {
    color: #FFFFFF;
    font-size: 1.15rem;
    margin-bottom: 18px;
    font-weight: 600;
}

.footer-links ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.footer-links ul li a {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.92rem;
    text-decoration: none;
    transition: color 0.25s ease, transform 0.25s ease;
    display: inline-block;
}

.footer-links ul li a:hover {
    color: var(--accent-pink);
    transform: translateX(3px);
}

.footer-contact-col p {
    font-size: 0.92rem;
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.5;
}

.footer-contact-col a {
    color: #FFFFFF;
    text-decoration: underline;
}

.footer-social-icons {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
}

.social-icon-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.social-icon-btn:hover {
    background: var(--accent-pink);
    color: #FFFFFF;
    transform: translateY(-3px);
    border-color: var(--accent-pink);
}

.social-icon-btn.wa-social:hover {
    background: #25D366;
    border-color: #25D366;
}

.footer-bottom {
    grid-column: 1 / -1;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    margin-top: 25px;
    padding-top: 25px;
    text-align: center;
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 1024px) {
    footer {
        grid-template-columns: repeat(2, 1fr);
        gap: 32px;
    }
}

@media (max-width: 640px) {
    footer {
        grid-template-columns: 1fr;
        gap: 28px;
        text-align: left;
    }
    .footer-brand p {
        max-width: 100%;
    }
}

/* Floating WhatsApp Button (Fixed on All Pages) */
.whatsapp-float-btn {
    position: fixed;
    bottom: calc(20px + var(--safe-bottom));
    right: 20px;
    z-index: 999;
    background: #25D366;
    color: #FFFFFF !important;
    border-radius: 50px;
    padding: 12px 20px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.95rem;
    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.45);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    touch-action: manipulation;
    min-height: 48px;
}

.whatsapp-float-btn:hover {
    background: #20BA56;
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 30px rgba(37, 211, 102, 0.55);
}

.wa-float-icon-svg {
    width: 26px;
    height: 26px;
    fill: currentColor;
    flex-shrink: 0;
}

@media (max-width: 480px) {
    .whatsapp-float-btn {
        padding: 12px;
        border-radius: 50%;
        width: 52px;
        height: 52px;
        justify-content: center;
        right: 16px;
        bottom: calc(16px + var(--safe-bottom));
    }
    .whatsapp-float-btn .wa-float-text {
        display: none;
    }
}

/* Neutral "Image Coming Soon" Elegant Placeholder */
.media-placeholder-block {
    width: 100%;
    height: 100%;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #FFF5F8 0%, #FCE8EE 100%);
    color: var(--text-light);
    padding: 24px;
    text-align: center;
    border: 1px dashed rgba(227, 153, 182, 0.4);
    border-radius: 12px;
}

.media-placeholder-block .ph-icon {
    font-size: 2.2rem;
    margin-bottom: 8px;
    opacity: 0.8;
}

.media-placeholder-block .ph-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-dark);
}

.media-placeholder-block .ph-sub {
    font-size: 0.78rem;
    opacity: 0.75;
    margin-top: 4px;
}

/* Dedicated Pages: About Us & Contact */
.about-page-main, .contact-page-main {
    min-height: 60vh;
    padding: clamp(40px, 6vw, 70px) clamp(16px, 6vw, 8%);
    background: #FFFFFF;
}

.about-page-wrap, .contact-page-wrap {
    max-width: 1000px;
    margin: 0 auto;
}

.about-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin: 35px 0;
}

.about-feature-box {
    background: #FFF9FB;
    border: 1px solid rgba(227, 153, 182, 0.25);
    border-radius: 14px;
    padding: 20px;
    text-align: center;
}

.about-feature-box .feat-icon {
    font-size: 2rem;
    margin-bottom: 10px;
}

.about-feature-box h4 {
    font-size: 1.05rem;
    color: var(--text-dark);
    margin-bottom: 6px;
}

.about-feature-box p {
    font-size: 0.88rem;
    color: var(--text-light);
    line-height: 1.5;
}

.contact-form-card {
    background: #FFF9FB;
    border: 1px solid rgba(227, 153, 182, 0.25);
    border-radius: 18px;
    padding: clamp(24px, 4vw, 36px);
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--text-dark);
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid rgba(227, 153, 182, 0.4);
    font-family: inherit;
    font-size: 0.95rem;
    color: var(--text-dark);
    background: #FFFFFF;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: var(--accent-pink);
    box-shadow: 0 0 0 3px rgba(227, 153, 182, 0.2);
}

/* 404 Page Styles */
.not-found-main {
    min-height: 65vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: clamp(50px, 8vw, 90px) clamp(16px, 6vw, 8%);
    background: linear-gradient(180deg, #FDF8F5 0%, #FCE8EE 100%);
}

.not-found-card {
    max-width: 600px;
    background: #FFFFFF;
    padding: clamp(30px, 6vw, 50px);
    border-radius: 24px;
    box-shadow: 0 15px 40px rgba(58, 43, 50, 0.08);
    border: 1px solid rgba(227, 153, 182, 0.3);
}

.not-found-card h1 {
    font-size: clamp(3rem, 8vw, 5rem);
    color: var(--accent-pink);
    line-height: 1;
    margin-bottom: 10px;
}

.not-found-card h2 {
    font-size: clamp(1.4rem, 3.5vw, 2rem);
    margin-bottom: 15px;
}
`;

css += masterUpgrades;

fs.writeFileSync(cssPath, css, 'utf8');
console.log('[Update] Successfully updated style.css with master upgrades');

