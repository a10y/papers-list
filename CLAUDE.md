# Zotero Research Papers Website

A research papers website powered by the Zotero Web API, built with Cloudflare Workers and SvelteKit.

## Project Structure

```
papers-list/
├── frontend/                    # SvelteKit SPA
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +layout.svelte   # Root layout with navigation
│   │   │   ├── +layout.ts       # SPA/prerender config
│   │   │   ├── +page.svelte     # Papers list (home)
│   │   │   └── paper/[id]/+page.svelte  # Paper detail
│   │   ├── lib/
│   │   │   ├── components/      # PaperCard.svelte
│   │   │   ├── api.ts           # API client
│   │   │   └── types.ts         # TypeScript interfaces
│   │   └── app.css              # Tailwind CSS
│   └── svelte.config.js         # adapter-static -> ../dist
├── src/                         # Cloudflare Worker
│   ├── index.ts                 # Main entry with itty-router
│   ├── routes/
│   │   ├── papers.ts            # GET /api/papers
│   │   └── paper.ts             # GET /api/papers/:id
│   ├── services/
│   │   ├── zotero.ts            # Zotero API client
│   │   └── cache.ts             # KV caching (1-min TTL)
│   ├── types.ts                 # Shared types
│   └── env.d.ts                 # Env type augmentation
├── dist/                        # Built SvelteKit output (gitignored)
├── test/                        # Vitest tests
├── wrangler.jsonc               # Worker config with KV + assets
└── package.json
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Build frontend to ./dist |
| `npm run dev` | Start local worker (requires built frontend) |
| `npm run dev:frontend` | Start SvelteKit dev server (port 5173) |
| `npm test` | Run Vitest tests |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npx wrangler types` | Regenerate TypeScript types after wrangler.jsonc changes |

## Secrets

Set via `npx wrangler secret put <NAME>`:

- `ZOTERO_USER_ID` - Zotero user ID (numeric)
- `ZOTERO_API_KEY` - Zotero API key
- `ZOTERO_COLLECTION_ID` - Collection key to display

## API Routes

- `GET /api/papers` - List all papers in collection
- `GET /api/papers/:id` - Get paper details with notes

All other routes serve the SPA from ./dist with fallback to index.html.

## Architecture

- **Frontend**: SvelteKit v5 with Svelte 5 runes ($state, $props), Tailwind CSS v4, adapter-static
- **Backend**: Cloudflare Workers with itty-router
- **Caching**: KV namespace `CACHE` with 1-minute TTL
- **Assets**: Served via Workers static assets binding with SPA fallback

## Development Workflow

1. Build frontend: `npm run build`
2. Start worker: `npm run dev`
3. Visit http://localhost:8787

For frontend-only dev with hot reload: `npm run dev:frontend` (API calls will fail without worker)

## Notes

- KV namespace ID: `239dad2dab8640158c9d4e71048df979`
- Paper types supported: journalArticle, conferencePaper, preprint, book, bookSection, thesis, report, manuscript
- Notes are fetched as child items and rendered as HTML
- DOI links go to https://doi.org/{doi}
