# Changelog

All notable changes to this project are documented in this file. The project follows [Semantic Versioning](https://semver.org/).

## 0.1.0

First version.

- **Mergado OAuth2 API** credential: sign-in to Mergado with OAuth 2 and Dynamic Client Registration (public client, PKCE). No client ID or secret is needed.
- **Mergado** node:
  - Element: Get Many (element tree of a project)
  - Product: Get, Search (MQL, Values to Extract, Visibility)
  - Project: Get, Get Many (including `output_feed_url`)
  - Query: Create, Get Many
  - Rule: Get, Get Many, Pause, Resume
  - Shop: Get Many
  - User: Get Current
  - Custom API Call
- **Mergado Trigger**: Feed Exported, Import Failed (polling).
- All requests send `use-mergado-api-version: 2026-10-30`.
