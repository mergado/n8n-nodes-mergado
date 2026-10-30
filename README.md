# n8n-nodes-mergado

This is an n8n community node. It lets you use [Mergado](https://www.mergado.com/) in your n8n workflows.

Mergado is a product feed management tool for online stores. It imports a store's product feed, transforms it with rules and publishes output feeds for advertising channels such as Google Shopping, Meta, Heureka or Zboží.cz.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Mergado

- **Element**
  - Get Many: the element tree of a project. Use the element paths in MQL queries and rules.
- **Product**
  - Get: a product with its input and output values.
  - Search: products of a project matching an MQL query, for example `PRICE_VAT < 100`, or all products when the query is empty. Optionally only hidden or only visible products, or only selected values (`values_to_extract`).
- **Project**
  - Get: a project, including the URL of its output feed.
  - Get Many: the projects of a shop.
- **Query** (a saved product selection)
  - Create: a new query with a name and an MQL condition.
  - Get Many: the queries of a project.
- **Rule**
  - Get: a rule with its settings.
  - Get Many: the rules of a project, ordered by priority.
  - Pause: stop applying a rule. Its settings are kept.
  - Resume: apply a paused rule again.
- **Shop**
  - Get Many: the shops (e-shops) you have access to.
- **User**
  - Get Current: the Mergado user the credential belongs to.
- **Custom API Call**: call any endpoint of the [Mergado API](https://api-docs.mergado.com/) with the Mergado credential already applied. n8n opens an HTTP Request node with the credential preselected.

Shops, projects and rules can be picked from a list or entered by ID. For Pause and Resume, the list offers only rules that Mergado lets you pause (not the format converter or rules created by apps, for example).

### Mergado Trigger

Polls a project and starts the workflow when:

- **Feed Exported**: the project finished generating its output feed (status `success` or `warning`).
- **Import Failed**: importing the input feed failed (status `failure`).

The first poll only remembers the newest log, so older exports and imports don't start the workflow.

## Credentials

The node signs in to Mergado with OAuth 2. You need a Mergado account; you don't need to create any app or copy any client ID or secret.

1. In n8n, create a new **Mergado OAuth2 API** credential.
2. Click **Connect my account**.
3. Sign in to Mergado and approve the access.

n8n registers its own OAuth client with Mergado for your n8n instance (Dynamic Client Registration, public client with PKCE). The access token is refreshed automatically.

## Compatibility

Requires n8n 1.119.0 or later (generic OAuth2 credentials with Dynamic Client Registration).

Tested with n8n 2.35.7.

## Usage

Paths in the Custom API Call are relative to `https://api.mergado.com`, for example `/me/`. The Mergado node sends the header `use-mergado-api-version: 2026-10-30`; add the same header to your Custom API Calls to get responses as described in the current API documentation. Without it, the API answers as it did on 2020-09-07.

MQL conditions in Product → Search are evaluated on the input values of the products. Element names are case-sensitive; get them with Element → Get Many.

Example workflows:

- **Seasonal campaign:** Schedule Trigger on Friday → Mergado → Rule → Resume (Black Friday rule). On Monday → Rule → Pause.
- **Feed monitoring:** Mergado Trigger (Import Failed) → send a message to Slack or email.
- **Product check:** Mergado → Product → Search `PRICE_VAT < 100` → Google Sheets.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Mergado API documentation](https://api-docs.mergado.com/)
- [Mergado help center](https://help.mergado.com/)

## Version history

See [CHANGELOG.md](CHANGELOG.md).

## Development

```bash
npm install --ignore-scripts
npm run lint
npm run build
npm run dev
```

- `npm run dev` starts the latest n8n with this node, which needs Node.js 24.
- The functions of this node and of the Mergado app for Make are kept in line with one specification, `mergado-moduly.json` in [mergado/make-app-mergado](https://github.com/mergado/make-app-mergado). CI runs its `check-parity.mjs` against this repository.
- CI also runs the checks of n8n's community package scanner before publishing (`scripts/scan-package.mjs`).
- Releases: `npm run release` bumps the version, updates the changelog and pushes a `vX.Y.Z` tag. The tag starts `.github/workflows/publish.yml`, which publishes to npm with provenance.
