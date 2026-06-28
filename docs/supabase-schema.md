# Supabase Schema

Project: Optra Studio  
Project ref: `pothvkhxqbuyehzmkcdh`

The NoA Client Portal uses only dedicated prefixed tables:

- `noa_client_portal_clients`
- `noa_client_portal_proposals`
- `noa_client_portal_packages`
- `noa_client_portal_selections`
- `noa_client_portal_asset_links`
- `noa_client_portal_campaign_requests`

Existing Opera/Optra, Ledger, NoA, jobs, clients, and dashboard tables are not used or modified by this app.

## Access Model

- Dashboard users sign in through Supabase Auth.
- Dashboard data is scoped by `owner_user_id`.
- Public proposal pages can only read published proposal/package data.
- Public visitors can submit a package selection for a published proposal.
- Client portal access codes are hashed before saving.

## Current Boundary

This is the first Supabase phase. It supports cloud sync and public proposal data, but it does not yet implement the final lightweight client portal login flow.
