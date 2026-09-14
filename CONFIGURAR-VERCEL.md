# Configurar Vercel sin saber programacion

Entra a Vercel y abre el proyecto `johnbarbas`.

Ve a:

Settings -> Environment Variables

Agrega estas variables:

## 1. Supabase URL

Nombre:

`SUPABASE_URL`

Valor:

`https://vwyfakgvzghjkodhsmbe.supabase.co`

## 2. Llave publica de Supabase

Nombre:

`SUPABASE_ANON_KEY`

Valor:

La llave `anon` que aparece en Supabase.

Ruta en Supabase:

Project Settings -> API -> anon public key

## 3. Link del libro

Nombre:

`GUIDE_DOWNLOAD_URL`

Valor:

El link real del libro.

## 4. Link del grupo

Nombre:

`WHATSAPP_GROUP_URL`

Valor:

El link real del grupo de WhatsApp.

Despues de agregar las variables, vuelve a Vercel y haz Redeploy.

El link que debes probar es:

https://johnbarbas.vercel.app/guia
