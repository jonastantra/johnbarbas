// Libro gratis «Barba con Método»: el registro va al sistema propio en el VPS
// (https://libro.johnbarbas.com). Guarda en Listmonk y pide confirmar el correo;
// al confirmar le llega el PDF. Si el servidor no responde, queda la salida por WhatsApp.
(function () {
    const form = document.getElementById('guideLeadForm');
    if (!form) return;

    const API = 'https://libro.johnbarbas.com/registro';
    const submitButton = document.getElementById('guideSubmitButton');
    const label = submitButton.querySelector('span');
    const status = document.getElementById('guideLeadStatus');
    const fallbackLink = document.getElementById('leadFallbackLink');

    function setStatus(message, type) {
        status.textContent = message;
        status.dataset.type = type || '';
    }

    function getUtmParams() {
        const params = new URLSearchParams(window.location.search);
        const out = {};
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
            if (params.get(k)) out[k] = params.get(k);
        });
        return out;
    }

    function showFallback(payload) {
        if (!fallbackLink) return;
        const msg = [
            'Hola John, quiero recibir el libro gratis Barba con Método.',
            payload.nombre ? 'Mi nombre es ' + payload.nombre + '.' : '',
            'Mi correo es ' + payload.email + '.'
        ].join(' ');
        fallbackLink.href = 'https://wa.me/525569380408?text=' + encodeURIComponent(msg);
        fallbackLink.classList.add('is-visible');
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        setStatus('', '');

        const data = new FormData(form);
        const payload = {
            nombre: String(data.get('name') || '').trim(),
            email: String(data.get('email') || '').trim().toLowerCase(),
            whatsapp: String(data.get('whatsapp') || '').replace(/[^\d+]/g, ''),
            objetivo: String(data.get('goal') || '').trim(),
            guideConsent: data.get('guideConsent') === 'on',
            emailMarketingConsent: data.get('emailMarketingConsent') === 'on',
            whatsappMarketingConsent: data.get('whatsappMarketingConsent') === 'on',
            website: String(data.get('website') || ''),
            sitio: 'johnbarbas.com' + window.location.pathname,
            utm: getUtmParams()
        };

        if (!payload.email) {
            setStatus('Escribe tu correo para mandarte el libro.', 'error');
            return;
        }
        if (!payload.guideConsent) {
            setStatus('Marca la primera casilla para poder mandarte el libro.', 'error');
            return;
        }

        submitButton.disabled = true;
        label.textContent = 'Enviando...';

        try {
            const response = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(function () { return {}; });

            if (response.ok && result.ok) {
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead', { content_name: 'Libro Barba con Metodo', content_category: payload.objetivo || 'sin-objetivo' });
                }
                Array.prototype.forEach.call(form.children, function (el) {
                    if (el !== status) el.hidden = true;
                });
                setStatus('¡Listo! Te mandé un correo. Ábrelo y toca «Confirmar y recibir el libro». Si no lo ves en 2 minutos, busca en spam o promociones.', 'ok');
                return;
            }
            if (response.status === 400 || response.status === 429) {
                setStatus(result.error || 'Revisa tu correo e intenta de nuevo.', 'error');
                submitButton.disabled = false;
                label.textContent = 'Quiero el libro gratis';
                return;
            }
            throw new Error(result.error || 'Sin respuesta');
        } catch (error) {
            showFallback(payload);
            setStatus('No pudimos registrarte ahorita. Toca el enlace de WhatsApp y te lo mando yo.', 'error');
            submitButton.disabled = false;
            label.textContent = 'Quiero el libro gratis';
        }
    });
})();
