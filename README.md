# For the Record

A tiny Expo SDK 54 + Supabase movie/series diary.

## 1. Install

```bash
npm install
```

## 2. Create Supabase project

Create a project at Supabase, then run `supabase/schema.sql` in the SQL Editor.

In **Authentication → Providers → Email**, turn **Confirm email** OFF if you want the lazy/no-confirmation flow.

## 3. Environment

Copy `.env.example` to `.env` and fill in your project URL and anon/publishable key.

## 4. Run

```bash
npx expo start
```

## What is included

- Animated splash/loading screen
- Sign in + register switcher
- Supabase session persistence
- Create/edit/delete watch records
- Title, actors, release date, media type, 0–5 star rating, notes
- Home search and media-type filters
- Profile nickname + background color + logout
- Row-level security so each user only sees their own records

## Next nice additions

- Poster/photo upload via Supabase Storage
- Genre tags
- Watched date
- Favorite toggle
- Sort by rating/date/title
- Profile statistics (films watched, average rating, etc.)
