create table if not exists public.johnbarbas_leads (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null,
    email text not null,
    whatsapp text not null,
    goal text not null,
    guide_consent boolean not null default false,
    email_marketing_consent boolean not null default false,
    whatsapp_marketing_consent boolean not null default false,
    funnel_stage text not null default 'lead_magnet',
    segment text not null default 'general',
    lead_score integer not null default 0,
    consent_version text not null default 'johnbarbas-lead-v1',
    source_page text,
    referrer text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_content text,
    utm_term text,
    user_agent text,
    ip_address text
);

create index if not exists johnbarbas_leads_email_whatsapp_idx
    on public.johnbarbas_leads (lower(email), whatsapp);

create index if not exists johnbarbas_leads_created_at_idx
    on public.johnbarbas_leads (created_at desc);

create index if not exists johnbarbas_leads_goal_idx
    on public.johnbarbas_leads (goal);

create index if not exists johnbarbas_leads_segment_idx
    on public.johnbarbas_leads (segment);

create index if not exists johnbarbas_leads_score_idx
    on public.johnbarbas_leads (lead_score desc);

alter table public.johnbarbas_leads enable row level security;

revoke all on table public.johnbarbas_leads from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant insert on table public.johnbarbas_leads to anon, authenticated;

drop policy if exists "Anyone can submit a John Barbas lead" on public.johnbarbas_leads;
create policy "Anyone can submit a John Barbas lead"
    on public.johnbarbas_leads
    for insert
    to anon, authenticated
    with check (
        guide_consent = true
        and whatsapp_marketing_consent = true
        and name <> ''
        and email <> ''
        and whatsapp <> ''
    );
