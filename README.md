# CampusLoop

A campus marketplace app for university students: buy, sell and swap with
verified students on your own campus. *Buy it. Sell it. Loop it.*

This repo is the **front end only**, for testing the UI. Every screen works,
but the data comes from an in-memory mock API. The real backend will be
**NestJS**; the mock is shaped like its routes, so it can be swapped out
without changing the screens.

Built with Expo (SDK 58), React Native, Expo Router, NativeWind and
Reanimated.

## Run it

```bash
npm install
npx expo start
```

Then press `a` (Android), `i` (iOS) or `w` (web), or scan the QR code with
Expo Go.

All data lives in memory and resets when the app reloads.

### Demo accounts

| Gmail | Password | Campus |
|---|---|---|
| `demo@gmail.com` | `password123` | TUKSE |
| `wytu.demo@gmail.com` | `password123` | WYTU |

On the login screen, tap a demo account to fill it in. The TUKSE account
already has items on hold, a price change to answer, a buyer holding one of
its items, and a sale waiting for it to confirm.

## What's in it

- **Sign up** with a normal Gmail address, then pick your university from a
  list. Your campus sets your market and the app's colours.
- **Campus themes** for TUKSE, WYTU, UTYCC, MIIT and SFU: header, buttons,
  badge and the stickman uniform all change. Before a campus is chosen, the
  app uses the default CampusLoop theme.
- **Market** with categories, "Just listed" and "Trending on campus".
- **Search** for items and for students by name, with price, condition and
  category filters.
- **Sell** from the raised + button: up to 4 photos from the gallery or
  camera, price or free, condition, meet-up spot. Listings can be edited
  later.
- **Reserve** an item for 72 hours. If the seller changes the price, the
  buyer has 12 hours to accept or let the hold go.
- **Two-sided sale confirmation**: a sale only counts once both the seller
  and the buyer confirm it.
- **Badges** earned from confirmed sales and purchases, shown on profiles.
- **Activity** (Reserved / Selling), My listings, chat, notifications,
  reports, a public student profile, Settings, and Delete account.

Testing helpers on Profile let you preview any campus theme, approve your
own student ID and replay the campus splash. On the waiting screen, a sale
can also be confirmed on behalf of the other student.

## Project layout

```
src/
  app/            Screens (Expo Router: every file is a route)
    (tabs)/       Market, Search, Sell, Activity, Profile
  components/     Shared UI: controls, tab bar, sell form, badges, artwork
  lib/
    api/          Mock API (index.ts), seed data (mock-db.ts), types
    badges.ts     Badge rules
  state/          Session (signed-in user)
  theme/          Campus themes, colours, ThemeProvider
```

## Connecting the NestJS backend

Screens only talk to `api` in `src/lib/api/index.ts`. Each function there
is labelled with the route it stands in for, for example
`POST /reservations/:id/confirm`. To go live:

1. Replace each function's body with a `fetch` to that route, keeping its
   signature.
2. Keep `src/lib/api/types.ts` in step with the backend DTOs.
3. Move the badge rules in `src/lib/badges.ts` to the server; the API
   already returns badges and each user's `topBadge`.
4. Store the session token securely, for example with `expo-secure-store`.
   It is kept in memory today.

The campus palettes and badges in `src/theme/universities.ts` and
`src/components/UniCrest.tsx` were matched by eye to the Figma designs.
Check them against the Figma file before release.

## Commands

```bash
npx expo start      # dev server
npx expo lint       # lint
npx tsc --noEmit    # typecheck
```

There are no `ios/` or `android/` folders on purpose: they are generated
by Expo, so native settings live in `app.json`.
