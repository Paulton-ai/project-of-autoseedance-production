Your request is huge (auth + 8 tables + 4 AI tools + 6 providers + credits + Stripe + admin panel + dashboards + i18n + dark/light mode + rate limiting). Trying to ship all of that in one turn would produce broken code. I'll keep the existing Auto Seedance site intact and add the new SaaS layer **in phases**. This plan covers all phases; we'll execute them one turn at a time so you can test each phase before moving on.

## Phase 1 — Foundation (this turn after you approve)

Database (new migration):
- `plans` (free / starter / pro / business — monthly credit allocations, prices)
- `credit_wallets` (user_id, balance, monthly_grant, period_end)
- `credit_ledger` (every debit/credit, reason, tool, prompt_id)
- `generations` (tool_type, prompt, settings, result_url, status, credits_used, favorite)
- `payments` (stripe session/invoice id, amount, status)
- `ai_providers` (name, enabled, config) — admin-managed catalog
- Extend existing `user_settings` with `theme` (already have dark; add light toggle)
- Grants + RLS for all (users see their own; service_role full)
- `has_role('admin')` already exists; reuse for admin policies
- `consume_credits(tool, amount)` SQL function (atomic debit + ledger insert + 0-balance reject)
- Trigger: on new auth user → wallet with 50 free credits + free plan row

Credit costs (hard-coded constants, editable later from admin):
text=1, image=5, video=30, animation=20

Pricing/landing:
- Replace `/pricing` Auto Seedance plans with the 4 SaaS plans (Free/Starter/Pro/Business)
- Keep current landing; add a "AI Tools" section linking to new tools

## Phase 2 — AI Tools (next turn)

Four new routes under `/tools/`:
- `/tools/text` — Lovable AI Gateway, `google/gemini-3-flash-preview`
- `/tools/image` — Lovable AI Gateway streaming image route (`openai/gpt-image-2`)
- `/tools/video` — stub UI + queued generation row (real video providers like Runway/Fal need their own API keys; we'll wire them when you provide keys)
- `/tools/animation` — same pattern as video

Each tool page: prompt box, settings, Generate button (calls server fn → debits credits via `consume_credits` → calls AI → stores in `generations` + Supabase Storage), history list with download / copy / share / favorite / delete.

Dashboard additions:
- `/dashboard/credits` — balance, used, ledger
- `/dashboard/history` — all generations across tools
- Existing `/dashboard/profile` and `/dashboard/billing` stay

## Phase 3 — Stripe (next turn)

- Enable seamless Stripe via `payments--enable_stripe_payments`
- Create products for Starter/Pro/Business (monthly + yearly)
- Checkout server route, customer portal, webhook at `/api/public/stripe/webhook` that:
  - On successful payment → upserts `subscriptions`, grants monthly credits, sets `period_end`
  - On cancel → downgrade at period end
- Invoices + payment history page

## Phase 4 — Admin Panel (next turn)

Extend existing `/dashboard/admin`:
- Users list (search, suspend, adjust credits)
- Plans editor
- AI providers toggle (uses `ai_providers` table)
- Revenue / API usage / active subs charts
- Refund button (calls Stripe refund via server fn)

## Phase 5 — Polish

- Light mode toggle (currently dark-only)
- Loading skeletons across tools
- Per-user soft rate limit (max N generations/min via `credit_ledger` count check — Lovable has no native rate-limit primitive)

## Things I will NOT do without your explicit go-ahead
- Bring multi-provider keys for OpenAI/Stability/Runway/Fal/Replicate. Lovable AI Gateway already covers text + image generation cheaply through one key — I recommend starting with just the gateway, and adding direct-provider API keys later only for video (Runway/Fal) when you're ready to provide those secrets.
- Email verification customization (Supabase default works out-of-the-box; custom templates need email-domain setup which is a separate flow).

## Confirm to proceed

Reply **"go"** and I'll execute **Phase 1** (database + plans + pricing page). Each subsequent phase ships in its own turn so you can test as we go.

If you want to change the phasing, the credit costs, the plan tiers, or skip/add anything, tell me now.