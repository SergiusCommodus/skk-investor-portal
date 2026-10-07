# SKK Investor Portal (demo)

A clickable concept of a white glove investor portal for Shepherd Kaplan Krochuk, built by Carlisle Capital LLC.
Every investor, company, person and figure in it is fictional. No credentials are collected.

## What's inside

**Investor view (Jonathan Ellery, 9 investments, 3 entities)**
- Overview: live portfolio value, value vs. invested chart, IRR, total value multiple, unfunded commitments, allocation, action items
- Holdings with a full tear sheet per company or property: business, key metrics, valuation history, thesis, risks, financing rounds, milestones
- Printable one page tear sheets (Save as PDF)
- Opportunities: pro rata and new fund allocations with "Indicate interest"
- Capital activity: commitments, capital calls, distributions and a full ledger
- Document vault: statements, K1s, notices, legal and reports with search, filters and preview
- Updates feed, secure messaging with the relationship team, notifications
- Concierge: increase an investment, request paperwork, request a company update, schedule a call, tax help, account changes, each tracked through a status stepper
- Ask SKK: plain English questions answered from the portfolio data

**SKK team view (switch from the sidebar or avatar menu)**
- Data sync: simulated Carta connection and sync log, scope map, CSV exports, and a tie out tool that flags differences against an uploaded valuation file (see INTEGRATION.md)
- Firm overview, request inbox (advancing a request notifies the investor), investors, capital call tracker, publish an update to every investor in a deal

## Run it

```bash
npm install
npm run dev          # local dev server
npm run build        # static site in dist/ (works on GitHub Pages or any static host)
npm run build:single # one self contained HTML file in dist-single/index.html
```

Demo state (requests, messages, read status) is saved in the browser; use **Reset demo data** in the avatar menu to start fresh.

## Branding

Colors (#03509F, #57B7E8, #80848A, #C7C8CD) and the Raleway typeface follow skk-llc.com. The header uses a text wordmark.
To use SKK's official logo, add the file to `public/brand/` and set `logoUrl` in `src/brand.ts`.

## Carta

See [INTEGRATION.md](INTEGRATION.md). The portal does not call Carta in this demo; it includes the data contract, scope map, CSV exports and a reconciliation tool.

## Where things live

- `src/data/portfolio.ts`: holdings, tear sheet content, cash flows, team, opportunities
- `src/data/content.ts`: documents, updates, messages, requests
- `src/integrations/carta.ts`: Carta scope map, source interface, CSV export and tie out logic
- `src/lib/calc.ts`: IRR (XIRR), multiples and portfolio math
- `src/pages/`: every screen
- `src/components/`: intro animation, triangle mosaic, charts, request flows, layout

## Before this goes in front of real investors

This is a front end prototype. A production version needs authentication with two factor sign in, per investor permissions, an audit log, encrypted document storage, a data feed from the fund administrator, and compliance review of all investor facing content (SEC Marketing Rule).
