# Embudo John Barbas

Este proyecto ya incluye una pagina para captar leads:

https://johnbarbas.com/guia

La persona deja nombre, correo, WhatsApp y objetivo. Despues del registro, la pagina entrega el link del libro y del grupo de WhatsApp.

## Lo unico que falta llenar

En Vercel deben existir estas variables:

- `SUPABASE_URL`: link de tu proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: llave privada para guardar leads.
- `GUIDE_DOWNLOAD_URL`: link del libro.
- `WHATSAPP_GROUP_URL`: link del grupo.

Opcional para enviar tambien el correo automatico:

- `BREVO_API_KEY`
- `BREVO_LIST_ID`
- `BREVO_TEMPLATE_ID`

## Donde ver los contactos

Los contactos se guardan en Supabase en la tabla:

`johnbarbas_leads`

Cada registro guarda nombre, correo, WhatsApp, objetivo, fecha, de donde vino la visita, segmento y puntaje de lead.

## Link recomendado para TikTok

Usa este:

https://johnbarbas.com/guia

Tambien puedes usar links con campana:

https://johnbarbas.com/guia?utm_source=tiktok&utm_medium=bio&utm_campaign=guia-minoxidil
