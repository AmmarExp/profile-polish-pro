# Wire UI to real backend

Connect the existing pages to Supabase + AI without touching any UI/design. AI runs through **Lovable AI Gateway** (`LOVABLE_API_KEY`, model `google/gemini-2.5-flash`) instead of OpenAI — Lovable Cloud does not use `OPENAI_API_KEY`, and the gateway is the sanctioned path (no key setup required, same quality for these tasks). All AI calls stay server-side via `createServerFn`.

## 1. Migration: `weekly_plans`

New migration exactly as specified (table + GRANTs + RLS + own-row policy).

## 2. AI server functions — `src/lib/ai.functions.ts`

Rewrite/extend the existing file with 5 functions, all `createServerFn` + `requireSupabaseAuth`, all reading `LOVABLE_API_KEY` inside the handler, all Arabic errors:

- `generateLinkedInPost({ topic, tone, profile })` → string (system prompt as specified, adapted to Lovable AI chat completion body).
- `generateWeeklyPlan({ profile })` → parsed JSON array of 3 items (`response_format: json_object`, then parse + validate).
- `improveHeadline({ headline })` → JSON array of 3 `{headline, reason}`.
- `generateComment({ post })` → JSON array of 3 `{type, comment}`.
- `improveSummary({ summary })` → string.

Errors surfaced in Arabic: rate limit (429) → "تم تجاوز حد الاستخدام، حاول لاحقاً"، credits (402) → "انتهت أرصدة الذكاء الاصطناعي"، other → "تعذر توليد المحتوى".

## 3. `/posts/new` (PostComposer)

- On mount load `profiles` row for current user (needed for prompt + LinkedIn status).
- Replace TODO with `generateLinkedInPost` call; show Arabic spinner state.
- If `?id=` in search → load that post and prefill (edit mode). If `?topic=&tone=` → prefill step 1/2.
- "احفظ مسودة" → insert/update `posts` with `status='draft'`.
- "انشر على LinkedIn" → if `linkedin_connected=false` show red banner "ربط حساب LinkedIn مطلوب" linking to `/linkedin`; else call existing `publishPostNow` and toast success.

## 4. `/posts` (Posts manager)

- Replace dummy list with Supabase select filtered by `user_id`, ordered `created_at desc`.
- Tab counts (all/drafts/scheduled/published/failed) from real rows.
- "نشر الآن" → `publishPostNow`.
- "حذف" → AlertDialog confirm → delete row → refetch.
- "تعديل" → `navigate({ to: '/posts/new', search: { id } })`.
- "عرض على LinkedIn" → external link using `linkedin_post_id`.
- Live countdown for scheduled rows via `setInterval(1000)` from `scheduled_at`.

## 5. `/planner`

- Compute current week_start (Saturday, per existing UI).
- On mount: `select * from weekly_plans where user_id and week_start` and hydrate suggestions.
- "اقترح خطة هذا الأسبوع" → `generateWeeklyPlan` → upsert into `weekly_plans` (conflict on `user_id, week_start`).
- Green dot on a day if a post exists in `posts` whose `scheduled_at`/`created_at` falls on that day.
- "استخدم هذه الفكرة" → navigate to `/posts/new?topic=...&tone=...`.

## 6. `/tools`

- Headline / Comment / Summary tabs each call their AI function on button click, replace static cards with returned data.
- Each "نسخ" button → `navigator.clipboard.writeText` + inline "تم النسخ ✓" for 1.5s.
- Arabic loading + error states.

## 7. `/settings`

- Load profile row on mount, populate all fields (remove hard-coded defaults).
- "حفظ التغييرات" → upsert `profiles`.
- Completion % = filled fields (full_name, headline, specialty, industry, bio, goal, tone, language) / 8.
- Toast on save; also persist `schedule_settings` block (posts/day, timezone, times, auto_publish, active).

## 8. `/dashboard`

- Total posts = count from `posts` where `user_id=auth.uid()`.
- This-week posts = count where `created_at >= start of current week`.
- LinkedIn badge from `profiles.linkedin_connected`.
- Recent posts = last 3 by `created_at desc`.
- Onboarding banner shown only when `headline` or `specialty` is empty.

## Technical notes

- All data reads use `createServerFn` + `requireSupabaseAuth` (or existing browser Supabase client where already used) — no changes to LinkedIn OAuth files.
- Loader-safe: pages call server fns from components via `useServerFn` + `useQuery` (they live under `_authenticated`, so protected server fns are safe).
- Search params for `/posts/new` added via route `validateSearch` (`{ id?, topic?, tone? }`).
- No design/styling changes; only replace TODOs, dummy arrays, and wire handlers.

## Deviation from spec

Using Lovable AI Gateway (`LOVABLE_API_KEY` + `google/gemini-2.5-flash`) instead of OpenAI, since this project is on Lovable Cloud and has no OpenAI key configured. Prompts and return shapes stay exactly as specified.
