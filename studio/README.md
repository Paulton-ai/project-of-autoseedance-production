# Auto Seedance — Sanity Studio

Hosted content studio for the existing Sanity project.

- **Project ID:** `n58pco6y`
- **Dataset:** `production`

The website (`src/lib/sanity.ts`) already reads from this project via the public CDN, so publishing a post in this Studio makes it appear on the live site automatically — no code changes, no redeploy.

## One-time deploy (from your machine, not the Lovable sandbox)

You must run these commands locally because deploying a hosted Studio requires logging in as the Sanity account that owns project `n58pco6y`.

```bash
cd studio
npm install
npx sanity login              # log in with the account that owns n58pco6y
npx sanity deploy             # pick a subdomain, e.g. autoseedance
```

After `sanity deploy` finishes it prints your hosted Studio URL, for example:

```
https://autoseedance.sanity.studio
```

That is the URL you use to create posts, edit posts, upload images, manage categories & authors, configure SEO fields, and publish. Published documents flow through the CDN and appear on `/blog` immediately.

## Local editing

```bash
npm run dev    # http://localhost:3333
```

## Schema

- `post` — title, slug, excerpt, cover image, category, author, publishedAt, readingMinutes, body (Portable Text with images), faqs, SEO group (seoTitle, seoDescription)
- `category` — title, slug, description
- `author` — name, slug, avatar, bio
- `faq` — question, answer (embedded in posts)
- `blockContent` — rich-text schema used by `post.body`

The GROQ queries in `src/lib/sanity.ts` (`POSTS_LIST_QUERY`, `POST_DETAIL_QUERY`) match this schema exactly.

## Redeploy after schema changes

```bash
npx sanity deploy
```
