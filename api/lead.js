const LEADS_TABLE = 'johnbarbas_leads';

function json(response, statusCode, res) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(response));
}

function cleanText(value, maxLength) {
    return String(value || '').trim().slice(0, maxLength);
}

function cleanEmail(value) {
    return cleanText(value, 180).toLowerCase();
}

function cleanPhone(value) {
    return cleanText(value, 40).replace(/[^\d+]/g, '');
}

function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSegment(goal) {
    const segments = {
        barba: 'barba',
        cabello: 'cabello',
        'cejas-pestanas': 'cejas_pestanas',
        orientacion: 'necesita_orientacion'
    };

    return segments[goal] || 'general';
}

function getLeadScore(lead) {
    let score = 50;
    if (lead.whatsapp_marketing_consent) score += 25;
    if (lead.email_marketing_consent) score += 15;
    if (lead.goal === 'orientacion') score += 10;
    return Math.min(score, 100);
}

function getIp(request) {
    return request.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';
}

async function insertLead(lead) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        const error = new Error('Supabase is not configured.');
        error.code = 'SUPABASE_NOT_CONFIGURED';
        throw error;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/${LEADS_TABLE}`, {
        method: 'POST',
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(lead)
    });

    const body = await response.text();
    if (!response.ok) {
        throw new Error(body || 'Supabase insert failed.');
    }

    return JSON.parse(body)[0];
}

async function notifyWebhook(lead) {
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
    });
}

async function sendGuideEmail(lead) {
    const apiKey = process.env.BREVO_API_KEY;
    const templateId = Number(process.env.BREVO_TEMPLATE_ID || 0);

    if (!apiKey || !templateId) return;

    await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: [{ email: lead.email, name: lead.name }],
            templateId,
            params: {
                name: lead.name,
                guide_url: process.env.GUIDE_DOWNLOAD_URL,
                whatsapp_group_url: process.env.WHATSAPP_GROUP_URL,
                goal: lead.goal
            }
        })
    });
}

async function upsertBrevoContact(lead) {
    const apiKey = process.env.BREVO_API_KEY;
    const listId = Number(process.env.BREVO_LIST_ID || 0);

    if (!apiKey || !listId) return;

    await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: lead.email,
            updateEnabled: true,
            listIds: [listId],
            attributes: {
                FIRSTNAME: lead.name,
                SMS: lead.whatsapp,
                WHATSAPP: lead.whatsapp,
                OBJETIVO: lead.goal,
                FUENTE: lead.source_page,
                CONSENT_EMAIL: lead.email_marketing_consent,
                CONSENT_WHATSAPP: lead.whatsapp_marketing_consent
            }
        })
    });
}

module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        return json({ ok: false, error: 'Method not allowed.' }, 405, response);
    }

    let body;
    try {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    } catch (_error) {
        return json({ ok: false, error: 'Invalid JSON.' }, 400, response);
    }

    if (cleanText(body.website, 120)) {
        return json({ ok: true, guideUrl: process.env.GUIDE_DOWNLOAD_URL || '', whatsappGroupUrl: process.env.WHATSAPP_GROUP_URL || '' }, 200, response);
    }

    const lead = {
        name: cleanText(body.name, 120),
        email: cleanEmail(body.email),
        whatsapp: cleanPhone(body.whatsapp),
        goal: cleanText(body.goal, 80),
        guide_consent: Boolean(body.guideConsent),
        email_marketing_consent: Boolean(body.emailMarketingConsent),
        whatsapp_marketing_consent: Boolean(body.whatsappMarketingConsent),
        source_page: cleanText(body.sourcePage, 160),
        referrer: cleanText(body.referrer, 500),
        funnel_stage: 'lead_magnet',
        segment: getSegment(cleanText(body.goal, 80)),
        consent_version: 'johnbarbas-lead-v1',
        utm_source: cleanText(body.utm?.utm_source, 120),
        utm_medium: cleanText(body.utm?.utm_medium, 120),
        utm_campaign: cleanText(body.utm?.utm_campaign, 160),
        utm_content: cleanText(body.utm?.utm_content, 160),
        utm_term: cleanText(body.utm?.utm_term, 160),
        user_agent: cleanText(request.headers['user-agent'], 500),
        ip_address: getIp(request)
    };

    if (!lead.name || !isEmail(lead.email) || lead.whatsapp.length < 10 || !lead.goal) {
        return json({ ok: false, error: 'Completa nombre, email, WhatsApp y objetivo.' }, 400, response);
    }

    if (!lead.guide_consent || !lead.whatsapp_marketing_consent) {
        return json({ ok: false, error: 'Falta consentimiento para enviar la guía y acceso al grupo.' }, 400, response);
    }

    lead.lead_score = getLeadScore(lead);

    try {
        const savedLead = await insertLead(lead);
        const fullLead = { ...lead, id: savedLead.id, created_at: savedLead.created_at };

        await Promise.allSettled([
            upsertBrevoContact(fullLead),
            sendGuideEmail(fullLead),
            notifyWebhook(fullLead)
        ]);

        return json({
            ok: true,
            leadId: savedLead.id,
            guideUrl: process.env.GUIDE_DOWNLOAD_URL || '',
            whatsappGroupUrl: process.env.WHATSAPP_GROUP_URL || ''
        }, 200, response);
    } catch (error) {
        console.error(error);
        if (error.code === 'SUPABASE_NOT_CONFIGURED') {
            return json({
                ok: false,
                error: 'Aun estamos activando el registro automatico. Manda tus datos por WhatsApp para recibir tu acceso.',
                fallback: true
            }, 503, response);
        }

        return json({ ok: false, error: 'No se pudo guardar el lead.' }, 500, response);
    }
};
