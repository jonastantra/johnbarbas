(function () {
    const form = document.getElementById('guideLeadForm');
    if (!form) return;

    const submitButton = document.getElementById('guideSubmitButton');
    const status = document.getElementById('guideLeadStatus');
    const fallbackLink = document.getElementById('leadFallbackLink');

    function setStatus(message, type) {
        status.textContent = message;
        status.dataset.type = type || '';
    }

    function getUtmParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            utm_content: params.get('utm_content') || '',
            utm_term: params.get('utm_term') || ''
        };
    }

    function normalizePhone(value) {
        return value.replace(/[^\d+]/g, '').trim();
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        setStatus('', '');

        const data = new FormData(form);
        const payload = {
            name: String(data.get('name') || '').trim(),
            email: String(data.get('email') || '').trim().toLowerCase(),
            whatsapp: normalizePhone(String(data.get('whatsapp') || '')),
            goal: String(data.get('goal') || '').trim(),
            guideConsent: data.get('guideConsent') === 'on',
            emailMarketingConsent: data.get('emailMarketingConsent') === 'on',
            whatsappMarketingConsent: data.get('whatsappMarketingConsent') === 'on',
            website: String(data.get('website') || ''),
            sourcePage: window.location.pathname,
            referrer: document.referrer || '',
            utm: getUtmParams()
        };

        if (!payload.name || !payload.email || !payload.whatsapp || !payload.goal) {
            setStatus('Completa nombre, email, WhatsApp y objetivo para desbloquear la guía.', 'error');
            return;
        }

        if (!payload.guideConsent || !payload.whatsappMarketingConsent) {
            setStatus('Marca los consentimientos necesarios para recibir la guía y entrar al grupo.', 'error');
            return;
        }

        submitButton.disabled = true;
        submitButton.querySelector('span').textContent = 'Guardando tus datos...';

        try {
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'No se pudo registrar el lead.');
            }

            sessionStorage.setItem('johnbarbasLeadAccess', JSON.stringify({
                guideUrl: result.guideUrl,
                whatsappGroupUrl: result.whatsappGroupUrl,
                leadId: result.leadId
            }));

            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Guia Minoxidil John Barbas',
                    content_category: payload.goal
                });
            }

            window.location.href = 'gracias.html';
        } catch (error) {
            const fallbackMessage = [
                'Hola John, quiero recibir el libro gratis y entrar al grupo.',
                `Mi nombre es ${payload.name}.`,
                `Mi correo es ${payload.email}.`,
                `Mi WhatsApp es ${payload.whatsapp}.`,
                `Mi objetivo es ${payload.goal}.`
            ].join(' ');

            if (fallbackLink) {
                fallbackLink.href = `https://wa.me/525569380408?text=${encodeURIComponent(fallbackMessage)}`;
                fallbackLink.classList.add('is-visible');
            }

            setStatus('No se pudo guardar automáticamente. Usa el enlace de WhatsApp para no perder tu acceso.', 'error');
            submitButton.disabled = false;
            submitButton.querySelector('span').textContent = 'Desbloquear guía y grupo';
        }
    });
})();
