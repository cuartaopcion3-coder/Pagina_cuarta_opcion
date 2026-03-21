/**
 * CUARTA OPCIÓN - Main Scripts
 * Handling mobile navigation and basic interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        const toggleMenu = () => {
            const isOpened = navMenu.classList.toggle('active');
            menuToggle.querySelectorAll('span').forEach(span => {
                span.classList.toggle('active', isOpened);
            });
            
            // Update ARIA
            menuToggle.setAttribute('aria-expanded', isOpened);
            menuToggle.setAttribute('aria-label', isOpened ? 'Cerrar menú' : 'Abrir menú');
        };

        const closeMenu = () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.querySelectorAll('span').forEach(span => {
                    span.classList.remove('active');
                });
                
                // Update ARIA
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menú');
            }
        };

        menuToggle.addEventListener('click', toggleMenu);

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
            }
        });
    }

    // Optimized scroll listener for INP
    const header = document.querySelector('.header');
    if (header) {
        let ticking = false;

        const handleScroll = () => {
            header.classList.toggle('is-scrolled', window.scrollY > 50);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }, { passive: true });

        // Initial state
        handleScroll();
    }
});

/**
 * GA4 Conversion Tracking
 * Measurements for CTAs and navigation clicks using data-attributes
 */
document.addEventListener('click', (e) => {
    // Fail silently if GA4 is not present
    if (typeof window.gtag !== 'function') return;

    const target = e.target.closest('a');
    if (!target) return;

    // A) CTA Click Tracking
    if (target.dataset.track === 'cta') {
        window.gtag('event', 'cta_click', {
            'cta_type': target.dataset.ctaType || 'unknown',
            'content_type': target.dataset.contentType || 'unknown',
            'source_page': target.dataset.sourcePage || window.location.pathname,
            'link_url': target.href
        });
    }

    // B) Navigation to Contact Tracking
    if (target.dataset.track === 'nav-contact') {
        window.gtag('event', 'nav_contact_click', {
            'source_page': window.location.pathname
        });
    }
});