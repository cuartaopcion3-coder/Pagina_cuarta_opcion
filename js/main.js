/**
 * CUARTA OPCIÓN — Main Scripts v2
 * Mobile navigation, scroll handling, scroll-reveal animations, GA4 tracking
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. MOBILE NAVIGATION
    // =========================================================
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        const toggleMenu = () => {
            const isOpened = navMenu.classList.toggle('active');
            menuToggle.querySelectorAll('span').forEach(span => {
                span.classList.toggle('active', isOpened);
            });
            menuToggle.setAttribute('aria-expanded', isOpened);
            menuToggle.setAttribute('aria-label', isOpened ? 'Cerrar menú' : 'Abrir menú');
            // Prevent body scroll while menu is open
            document.body.style.overflow = isOpened ? 'hidden' : '';
        };

        const closeMenu = () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.querySelectorAll('span').forEach(span => span.classList.remove('active'));
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menú');
                document.body.style.overflow = '';
            }
        };

        menuToggle.addEventListener('click', toggleMenu);
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // =========================================================
    // 2. STICKY HEADER SCROLL EFFECT (optimized with RAF)
    // =========================================================
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
        handleScroll(); // initial state
    }

    // =========================================================
    // 3. SCROLL-REVEAL ANIMATION (IntersectionObserver)
    // =========================================================
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target); // fire once
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: just show everything if observer not supported
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    // =========================================================
    // 4. HERO BACKGROUND AUTO-SLIDER
    // =========================================================
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        const bgSlides = heroSection.querySelectorAll('.hero-bg-slide');
        const INTERVAL = 3000; // ms between slides

        // Eliminamos el chequeo estricto de prefers-reduced-motion para asegurar 
        // que el slider funcione siempre en celulares iOS y Android.
        if (bgSlides.length > 1) {
            let current = 0;

            setInterval(() => {
                bgSlides[current].classList.remove('active');
                current = (current + 1) % bgSlides.length;
                bgSlides[current].classList.add('active');
            }, INTERVAL);
        }
    }

    // =========================================================
    // 5. GALLERY: ASPECT RATIO VARIANCE (masonry feel)
    // =========================================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, i) => {
        if ((i + 1) % 4 === 0 || (i + 1) % 7 === 0) {
            item.style.gridRowEnd = 'span 2';
        }
    });

    // ========================================================
    // 6. BLOG MODAL LOGIC (Offline / No-CORS Content Loading)
    // ========================================================
    const modal = document.getElementById('blog-modal');
    if (modal) {
        const modalBody = document.getElementById('modal-body');
        const closeModalBtn = modal.querySelector('.modal-close');
        const modalOverlay = modal.querySelector('.modal-overlay');

        const openModal = (articleId) => {
            document.body.classList.add('modal-open');
            modal.style.display = 'flex';
            
            // Resetear el scroll del modal al principio
            const wrapper = modal.querySelector('.modal-content-wrapper');
            if (wrapper) wrapper.scrollTop = 0;
            
            // Ligeros ms de retraso para que la transición CSS se aplique
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
            
            modalBody.innerHTML = '<div style="text-align:center; padding: 40px;"><div class="spinner">Cargando artículo...</div></div>';

            try {
                // Leer datos del archivo js/blog-data.js pre-cargado
                if (typeof windowBlogData !== 'undefined' && windowBlogData[articleId]) {
                    // Injectamos el contenido directamente
                    // Ocultamos el título h1 que pueda venir en el extraction para no duplicarlo si ya está en article-header
                    // (el script extrajo <article class="article-header"> y <section class="article-body">)
                    modalBody.innerHTML = windowBlogData[articleId];
                    
                    // Extraer solo la caja blanca interna si se extrajo toda la sección
                    const containerMatches = modalBody.querySelector('section.article-body .container');
                    if(containerMatches) {
                        const headerContent = modalBody.querySelector('.article-header h1')?.outerHTML || '';
                        modalBody.innerHTML = headerContent + containerMatches.innerHTML;
                    }
                    
                } else {
                    throw new Error("Article data not found in windowBlogData");
                }
            } catch (err) {
                console.error('Error fetching article:', err);
                modalBody.innerHTML = '<p style="color:var(--color-primary-dark);text-align:center;margin-top:20px;"><strong>Hubo un error al cargar el artículo.</strong><br> Por favor, asegúrese de estar en un servidor o recargue la página.</p>';
            }
        };

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                modalBody.innerHTML = ''; // Clear content
            }, 300); // Matches CSS transition duration
        };

        // Attach listeners to entire article cards
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // If they specifically clicked the button, prevent default to avoid double actions or jumping
                if(e.target.tagName.toLowerCase() === 'button') {
                    e.preventDefault();
                }
                const btn = card.querySelector('.article-card-link');
                if (btn) {
                    const articleId = btn.getAttribute('data-article');
                    openModal(articleId);
                }
            });
        });

        // Close listeners
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

});

// =========================================================
// 5. GA4 CONVERSION TRACKING (passive, fail-safe)
// =========================================================
document.addEventListener('click', (e) => {
    if (typeof window.gtag !== 'function') return;

    const target = e.target.closest('a');
    if (!target) return;

    if (target.dataset.track === 'cta') {
        window.gtag('event', 'cta_click', {
            'cta_type':      target.dataset.ctaType     || 'unknown',
            'content_type':  target.dataset.contentType  || 'unknown',
            'source_page':   target.dataset.sourcePage   || window.location.pathname,
            'link_url':      target.href
        });
    }

    if (target.dataset.track === 'nav-contact') {
        window.gtag('event', 'nav_contact_click', {
            'source_page': window.location.pathname
        });
    }
});