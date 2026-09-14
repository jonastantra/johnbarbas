# Embudo John Barbas

Este proyecto ya incluye una pagina para captar leads:

https://johnbarbas.com/guia

La persona deja nombre, correo, WhatsApp y objetivo. Despues del registro, la pagina entrega el link del libro y del grupo de WhatsApp.

## Lo unico que falta llenar

En Vercel deben existir estas variables:

- `SUPABASE_URL`: `https://vwyfakgvzghjkodhsmbe.supabase.co`
- `SUPABASE_ANON_KEY`: llave publica `anon` de Supabase para guardar leads.
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

La tabla ya fue creada en el proyecto Supabase `johnbarbas`.

## Estado actual

- Pagina del embudo: lista.
- Vercel: desplegado desde GitHub.
- Supabase: tabla creada en el proyecto `johnbarbas` con permisos para recibir formularios.
- Pendiente: poner `SUPABASE_ANON_KEY`, `GUIDE_DOWNLOAD_URL` y `WHATSAPP_GROUP_URL` en Vercel.

Sin esas tres variables, el sitio muestra el formulario, pero usa WhatsApp como respaldo porque todavia no puede guardar automaticamente.

## Link recomendado para TikTok

Usa este:

https://johnbarbas.com/guia

Tambien puedes usar links con campana:

https://johnbarbas.com/guia?utm_source=tiktok&utm_medium=bio&utm_campaign=guia-minoxidil
