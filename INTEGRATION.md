# Carta integration

## Status

Demo only. The portal does not contact Carta. What exists today:

- `src/integrations/carta.ts`: the list of Carta API scopes the portal would use, the `CartaSource` interface a real connector implements, CSV exports, and the tie out logic.
- Team view, Data sync page: simulated connection and sync log, scope map, CSV exports, and a tie out tool.
- Investor pages show a "Synced from Carta" tag once the simulated connection is on.

## What Carta provides (from Carta's public API documentation)

- OAuth 2.0 with two flows: authorization code (for data owned by others) and client credentials (for your own account). Access tokens last one hour.
- Read scopes named `read_<package>_<resource>`. The ones this portal maps to: `read_investor_firms`, `read_investor_funds`, `read_investor_partners`, `read_investor_fundperformance`, `read_portfolio_securities`, `read_portfolio_transactions`, `read_portfolio_issuervaluations`, `read_portfolio_fundinvestmentdocuments`.

Source: https://docs.carta.com/api-platform/docs/scopes and https://docs.carta.com/api-platform/guides/guides/authorization/

## Not yet confirmed

- Exact endpoint paths and response fields. Take these from the Carta developer documentation once API access is granted. They are deliberately not hard coded.
- Whether capital account statements and K1s are available over the API or only inside Carta's LP portal.
- Whether SKK administers its funds on Carta at all. API access depends on that relationship and on an administrator approving the application.

## Going live

1. Register an application with Carta and keep the client ID and secret on a server.
2. Implement `CartaSource` on the server and sync on a schedule into your own database.
3. Serve investor data to the portal only after investor sign in with two factor authentication and per investor permissions.
4. Run the tie out against a Carta export every quarter before releasing statements.
5. Have compliance review all investor facing content (SEC Marketing Rule).

## Until then

Use the CSV exports to see the data shape, and the tie out tool to compare a Carta valuation export with the portal.
