// Enhanced WhatsApp Button with modern features and analytics
class WhatsAppButton {
    constructor() {
        this.phoneNumber = '525569380408';
        this.init();
        this.setupAnalytics();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.createFloatingButton();
            this.setupClickTracking();
            this.setupVisibilityAnimation();
        });
    }

    createFloatingButton() {
        // Remove existing button if any
        const existingButton = document.querySelector('.whatsapp-float');
        if (existingButton) {
            existingButton.remove();
        }

        const whatsappButtonHTML = `
            <a href="https://wa.me/${this.phoneNumber}?text=${encodeURIComponent('Hola John, vengo de tu página web y me interesa conocer más sobre tus productos de Minoxidil.')}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="whatsapp-float"
               aria-label="Contactar por WhatsApp"
               title="¡Chatea con nosotros en WhatsApp!">
                <i class="fab fa-whatsapp"></i>
                <span class="whatsapp-tooltip">¡Chatea con nosotros!</span>
            </a>
        `;
        
        document.body.insertAdjacentHTML('beforeend', whatsappButtonHTML);
        
        // Add tooltip styles
        this.addTooltipStyles();
    }

    addTooltipStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .whatsapp-tooltip {
                position: absolute;
                right: 70px;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(135deg, #25D366, #128C7E);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .whatsapp-tooltip::after {
                content: '';
                position: absolute;
                left: 100%;
                top: 50%;
                transform: translateY(-50%);
                border: 6px solid transparent;
                border-left-color: #25D366;
            }

            .whatsapp-float:hover .whatsapp-tooltip {
                opacity: 1;
                visibility: visible;
                transform: translateY(-50%) translateX(-5px);
            }

            @media (max-width: 640px) {
                .whatsapp-tooltip {
                    display: none;
                }
            }

            /* Enhanced floating animation */
            @keyframes whatsapp-bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0) scale(1);
                }
                40% {
                    transform: translateY(-10px) scale(1.05);
                }
                60% {
                    transform: translateY(-5px) scale(1.02);
                }
            }

            .whatsapp-float.animate-bounce {
                animation: whatsapp-bounce 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    setupClickTracking() {
        document.addEventListener('click', (e) => {
            const whatsappLink = e.target.closest('.whatsapp-float, a[href*="wa.me"]');
            if (whatsappLink) {
                this.trackWhatsAppClick(whatsappLink);
                this.showClickFeedback(whatsappLink);
            }
        });
    }

    trackWhatsAppClick(element) {
        // Extract context information
        const context = this.getClickContext(element);
        
        // Track with Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_click', {
                event_category: 'engagement',
                event_label: context.source,
                custom_parameter_1: context.product || 'general',
                custom_parameter_2: context.page
            });
        }

        // Track with Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Contact', {
                content_name: context.product || 'WhatsApp Contact',
                content_category: 'Communication',
                source: context.source
            });
        }

        // Custom analytics
        this.sendCustomAnalytics('whatsapp_click', context);

        console.log('WhatsApp click tracked:', context);
    }

    getClickContext(element) {
        const currentPage = window.location.pathname;
        let source = 'floating_button';
        let product = null;

        // Determine source
        if (element.classList.contains('whatsapp-float')) {
            source = 'floating_button';
        } else if (element.closest('.product-card')) {
            source = 'product_card';
            // Extract product name from the card
            const productCard = element.closest('.product-card');
            const productTitle = productCard.querySelector('h3');
            if (productTitle) {
                product = productTitle.textContent.trim();
            }
        } else {
            source = 'inline_button';
        }

        return {
            source,
            product,
            page: currentPage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
    }

    showClickFeedback(element) {
        // Visual feedback
        element.style.transform = 'scale(0.9)';
        element.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            element.style.transform = '';
        }, 100);

        // Show toast notification if available
        if (window.modernWebsite && window.modernWebsite.showToast) {
            window.modernWebsite.showToast('Abriendo WhatsApp...', 'success', 2000);
        }

        // Add temporary glow effect
        element.classList.add('animate-pulse-glow');
        setTimeout(() => {
            element.classList.remove('animate-pulse-glow');
        }, 1000);
    }

    setupVisibilityAnimation() {
        // Animate button entrance after page load
        setTimeout(() => {
            const button = document.querySelector('.whatsapp-float');
            if (button) {
                button.style.opacity = '0';
                button.style.transform = 'scale(0) translateY(20px)';
                button.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                
                setTimeout(() => {
                    button.style.opacity = '1';
                    button.style.transform = 'scale(1) translateY(0)';
                }, 100);
            }
        }, 1000);

        // Add periodic bounce animation
        setInterval(() => {
            const button = document.querySelector('.whatsapp-float');
            if (button && !button.matches(':hover')) {
                button.classList.add('animate-bounce');
                setTimeout(() => {
                    button.classList.remove('animate-bounce');
                }, 2000);
            }
        }, 10000); // Every 10 seconds
    }

    setupAnalytics() {
        // Track button visibility
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.trackButtonVisibility();
                    }
                });
            }, { threshold: 0.1 });

            // Observe button when it's created
            setTimeout(() => {
                const button = document.querySelector('.whatsapp-float');
                if (button) {
                    observer.observe(button);
                }
            }, 1000);
        }
    }

    trackButtonVisibility() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_button_view', {
                event_category: 'engagement',
                event_label: 'floating_button_visible'
            });
        }
    }

    sendCustomAnalytics(event, data) {
        // Send to custom analytics endpoint (if available)
        if (navigator.sendBeacon) {
            const analyticsData = JSON.stringify({
                event,
                data,
                timestamp: Date.now(),
                url: window.location.href
            });

            // Replace with your analytics endpoint
            // navigator.sendBeacon('/analytics', analyticsData);
        }
    }

    // Public method to update phone number
    updatePhoneNumber(newNumber) {
        this.phoneNumber = newNumber;
        const button = document.querySelector('.whatsapp-float');
        if (button) {
            const href = button.getAttribute('href');
            const newHref = href.replace(/wa\.me\/\d+/, `wa.me/${newNumber}`);
            button.setAttribute('href', newHref);
        }
    }

    // Public method to update message
    updateMessage(newMessage) {
        const button = document.querySelector('.whatsapp-float');
        if (button) {
            const href = button.getAttribute('href');
            const baseUrl = href.split('?')[0];
            const newHref = `${baseUrl}?text=${encodeURIComponent(newMessage)}`;
            button.setAttribute('href', newHref);
        }
    }

    // Public method to hide/show button
    toggleVisibility(show = true) {
        const button = document.querySelector('.whatsapp-float');
        if (button) {
            button.style.display = show ? 'flex' : 'none';
        }
    }
}

// Initialize WhatsApp button
const whatsappButton = new WhatsAppButton();

// Make it globally accessible
window.whatsappButton = whatsappButton;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhatsAppButton;
}