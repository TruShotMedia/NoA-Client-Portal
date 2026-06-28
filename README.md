# NoA Client Portal

Local prototype for managing client proposals, package selection, invoice-ready details, asset links, and campaign requests.

## Run locally

Double-click:

```text
run-local.bat
```

Then open:

```text
http://localhost:5188
```

## What is included

- Dashboard overview
- Client list and client detail editing
- Proposal/package builder
- Public proposal route, for example `/proposal/coastal-cafe-co`
- Client package selection and billing detail form
- Client portal preview
- Asset link handoff
- Campaign request tracking
- Local browser storage for prototype data
- Optional Supabase cloud sync

## Notes

Supabase is now wired to the Optra Studio project using dedicated `noa_client_portal_*` tables only. Existing tables such as `clients`, `jobs`, `ledger_*`, and other NoA tables are not used by this app.

The app still works locally if Supabase is unavailable. To use cloud sync, sign in through the Supabase bar in the dashboard, then save/load client records.

This version does not connect to Xero yet. It collects invoice-ready details so Xero integration can be added later.
