// Modern JavaScript with performance optimizations and enhanced features
class ModernWebsite {
    constructor() {
        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupCounters();
        this.setupTabNavigation();
        this.setupWhatsAppTracking();
        this.setupLazyLoading();
        this.setupToastSystem();
        this.setupAnimations();
        this.setupPerformanceOptimizations();
        this.preloadCriticalResources();
    }

    // Enhanced tab navigation with smooth transitions
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const href = button.getAttribute('href');
                if (href && href !== '#') {
                    this.showToast('Navegando...', 'info');
                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            });
        });
    }

    // Lazy loading implementation with Intersection Observer
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observe all lazy-load images
        document.querySelectorAll('.lazy-load').forEach(img => {
            imageObserver.observe(img);
        });

        // Observe product cards for animation
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.product-card').forEach(card => {
            cardObserver.observe(card);
        });
    }

    // Toast notification system
    setupToastSystem() {
        this.toastContainer = document.getElementById('toast-container');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'fixed top-4 right-4 z-50';
            // Style manually since we removed Tailwind
            this.toastContainer.style.position = 'fixed';
            this.toastContainer.style.top = '20px';
            this.toastContainer.style.right = '20px';
            this.toastContainer.style.zIndex = '9999';
            document.body.appendChild(this.toastContainer);
        }
    }

    showToast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Inline styles for toast
        toast.style.background = type === 'success' ? '#10B981' : '#3B82F6';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.marginBottom = '10px';
        toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.justifyContent = 'space-between';
        toast.style.minWidth = '250px';
        toast.style.animation = 'slideInRight 0.3s ease-out';

        toast.innerHTML = `
            <span>${message}</span>
            <button style="background:none;border:none;color:white;margin-left:10px;cursor:pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;

        toast.querySelector('button').onclick = () => {
            toast.remove();
        };

        this.toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    // Enhanced counter animation with better performance
    setupCounters() {
        const counters = document.querySelectorAll('.counter');
        if (counters.length === 0) return;

        const animationDuration = 2000;
        let animationHasRun = false;

        const animateCounter = (counterElement) => {
            const targetStr = counterElement.getAttribute('data-target');
            if (!targetStr) return; // Skip if no data-target

            const target = parseInt(targetStr);
            // Preserve the '+' if it was in the original text or intended
            const originalText = counterElement.textContent;
            const hasPlus = originalText.includes('+') || counterElement.parentElement.textContent.includes('+');
            
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / animationDuration, 1);
                
                // Easing function for smooth animation (Ease Out Quart)
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(easeOutQuart * target);
                
                counterElement.textContent = currentValue.toLocaleString() + (hasPlus ? '+' : '');

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counterElement.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                }
            };

            requestAnimationFrame(updateCounter);
        };

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animationHasRun) {
                    counters.forEach(counter => animateCounter(counter));
                    animationHasRun = true;
                }
            });
        };

        const counterSection = document.getElementById('animated-counters-section');
        if (counterSection) {
            const observer = new IntersectionObserver(observerCallback, observerOptions);
            observer.observe(counterSection);
        } else {
            // Fallback: observe the container of the counters directly if section ID is missing
            const container = document.querySelector('.stats-container');
            if (container) {
                const observer = new IntersectionObserver(observerCallback, observerOptions);
                observer.observe(container);
            }
        }
    }

    // WhatsApp click tracking and analytics
    setupWhatsAppTracking() {
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('a[href*="wa.me"]');
            if (whatsappLink) {
                // Track WhatsApp clicks
                this.trackEvent('whatsapp_click', {
                    product: this.extractProductFromWhatsAppLink(whatsappLink.href),
                    source: 'product_page'
                });
                
                this.showToast('Abriendo WhatsApp...', 'success');
                
                // Add visual feedback
                whatsappLink.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    whatsappLink.style.transform = '';
                }, 150);
            }
        });
    }

    extractProductFromWhatsAppLink(href) {
        try {
            const urlParams = new URLSearchParams(href.split('?')[1]);
            const text = urlParams.get('text');
            if (text) {
                const match = text.match(/me interesa el (.+?) por/i) || text.match(/quiero comprar (.+?)/i);
                return match ? match[1] : 'unknown';
            }
        } catch (e) {
            console.log('Error parsing WhatsApp link', e);
        }
        return 'unknown';
    }

    // Performance optimizations
    setupPerformanceOptimizations() {
        // Preload next page resources on hover
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.hostname === window.location.hostname) {
                this.preloadPage(link.href);
            }
        });

        // Optimize scroll performance
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax effect for hero elements
        const heroElements = document.querySelectorAll('.hero-parallax');
        heroElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    }

    preloadPage(url) {
        if (!this.preloadedPages) {
            this.preloadedPages = new Set();
        }

        if (!this.preloadedPages.has(url)) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
            this.preloadedPages.add(url);
        }
    }

    preloadCriticalResources() {
        const criticalImages = [
            'images/profile_johnbarbas1.jpg',
            'images/product/1balsamo.jpg',
            'images/product/3balsamos.jpg',
            'images/product/3meses.jpg',
            'images/product/6meses.jpg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Enhanced animations setup
    setupAnimations() {
        // Add stagger animation to product cards
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Add hover effects to buttons
        document.querySelectorAll('.btn-unified').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    // Analytics and tracking
    trackEvent(eventName, properties = {}) {
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        // Facebook Pixel tracking
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, properties);
        }

        // Console log for debugging
        // console.log('Event tracked:', eventName, properties);
    }
}

// Initialize the modern website
const modernWebsite = new ModernWebsite();

// Helper for adding keyframes if they don't exist
if (!document.getElementById('dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
        }
    `;
    document.head.appendChild(style);
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}