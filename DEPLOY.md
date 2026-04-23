# Deployment

404 Museum is deployed as a static site on **Vercel**.

## Build

```bash
npm run build
```

This runs TypeScript compilation and Vite bundling, producing static assets in `dist/`.

## Preview locally

```bash
npm run preview
```

Serves the production build at `http://localhost:4173` for local testing.

## Vercel setup

1. Import the GitHub repository in the [Vercel dashboard](https://vercel.com/new).
2. Vercel auto-detects the Vite framework. The `vercel.json` at the project root configures:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **SPA fallback**: all routes rewrite to `index.html`
3. Click **Deploy**. No environment variables or serverless functions are needed.

## Seeded URLs

Every generated site has a deterministic seed passed as a query parameter:

```
https://your-domain.vercel.app/?seed=abc123
```

The seed is assigned automatically on first load and preserved in the URL via `history.replaceState`. Sharing a seeded URL guarantees the recipient sees the exact same generated site. The SPA rewrite in `vercel.json` ensures direct access to seeded URLs works correctly.
