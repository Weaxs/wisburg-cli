# Wisburg CLI

A Node/TypeScript command-line client for the 智堡 (Wisburg) Open API. It wraps every REST endpoint documented in the current 智堡 API documentation.

Chinese documentation: [README.md](./README.md)

## Installation

```bash
npm install
npm run build
npm link
```

## Authentication

The recommended setup is an environment variable:

```bash
export WISBURG_API_KEY="your-api-key"
```

You can also store the key in a local config file:

```bash
wisburg config set-api-key "your-api-key"
```

The default base URL is `https://api-omen.wisburg.com`. Override it with `WISBURG_BASE_URL` or `--base-url`.

## Examples

```bash
wisburg reports list --first 10 --query "macro"
wisburg reports get 123
wisburg articles list --start-time 2025-01-01 --end-time 2025-02-01
wisburg feed list --first 20
wisburg images list --query "US stocks"
wisburg request GET /api/reports --query first=5
```

For local development:

```bash
npm run build
node dist/cli.js reports list --first 10
```

## Supported APIs

Official documentation entry point: [智堡 Open API Docs](https://open-docs.wisburg.com/docs/getting-started/first-call)

| Resource | Command | Endpoint | API Docs |
| --- | --- | --- | --- |
| Research notes | `wisburg reports list` | `GET /api/reports` | [Docs](https://open-docs.wisburg.com/docs/api/reports) |
| Research notes | `wisburg reports get <id>` | `GET /api/reports/:id` | [Docs](https://open-docs.wisburg.com/docs/api/reports) |
| Archives | `wisburg archives list` | `GET /api/archives` | [Docs](https://open-docs.wisburg.com/docs/api/archives) |
| Archives | `wisburg archives get <id>` | `GET /api/archives/:id` | [Docs](https://open-docs.wisburg.com/docs/api/archives) |
| Company research | `wisburg company-reports list` | `GET /api/company-reports` | [Docs](https://open-docs.wisburg.com/docs/api/company-reports) |
| Company research | `wisburg company-reports get <id>` | `GET /api/company-reports/:id` | [Docs](https://open-docs.wisburg.com/docs/api/company-reports) |
| Earnings call notes | `wisburg earningscalls list` | `GET /api/earningscalls` | [Docs](https://open-docs.wisburg.com/docs/api/earningscalls) |
| Earnings call notes | `wisburg earningscalls get <id>` | `GET /api/earningscalls/:id` | [Docs](https://open-docs.wisburg.com/docs/api/earningscalls) |
| Articles | `wisburg articles list` | `GET /api/articles` | [Docs](https://open-docs.wisburg.com/docs/api/articles) |
| Articles | `wisburg articles get <id>` | `GET /api/articles/:id` | [Docs](https://open-docs.wisburg.com/docs/api/articles) |
| AI market daily | `wisburg market-daily list` | `GET /api/market-daily` | [Docs](https://open-docs.wisburg.com/docs/api/market-daily) |
| Feed | `wisburg feed list` | `GET /api/feed` | [Docs](https://open-docs.wisburg.com/docs/api/feed) |
| Image feed | `wisburg images list` | `GET /api/images` | [Docs](https://open-docs.wisburg.com/docs/api/images) |
| Asset management reports | `wisburg am-reports list` | `GET /api/am-reports` | [Docs](https://open-docs.wisburg.com/docs/api/am-reports) |
| Asset management reports | `wisburg am-reports get <id>` | `GET /api/am-reports/:id` | [Docs](https://open-docs.wisburg.com/docs/api/am-reports) |

All list commands support:

```text
--first
--after
--query
--start-time
--end-time
```

## Output

Responses are printed as formatted JSON by default. Use `--raw` to print the original response text.

## Development

```bash
npm run lint
npm test
```

## CI/CD

GitHub Actions runs on push, pull request, and manual dispatch:

```bash
npm ci
npm run lint
npm test
npm pack --dry-run
```

If the repository has a `WISBURG_API_KEY` secret, CI also runs live API integration tests:

```bash
npm run test:integration
```

You can run live integration tests locally as well:

```bash
export WISBURG_API_KEY="your-api-key"
npm run test:integration
```
