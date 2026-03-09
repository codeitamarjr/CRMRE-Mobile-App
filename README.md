# Real Enquiries Marketplace

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Marketplace API

The mobile marketplace tabs consume the Laravel Units API (`/api/v1/units`).
Appwrite authentication is no longer used by this app.

Set these environment variables before running the app:

- `EXPO_PUBLIC_API_BASE_URL` (example: `https://your-domain.com/api/v1`)
- `EXPO_PUBLIC_MOBILE_APP_API_KEY`

### Current request behavior

- List requests use `GET /units` with:
  - `include=attachments,property,property.attachments`
  - `per_page` from the screen limit
  - optional `featured=1` for the home featured rail
  - optional `filters[type]=...` from the filter pills
  - optional advanced filters (`filters[bedrooms]`, `filters[bathrooms]`, `filters[vacant]`)
  - pagination with `page=...` for infinite scroll
- Detail requests use `GET /units/{id}` with:
  - `include=attachments,property,property.attachments,property.facilities,property.client,property.client.agents,property.client.prs,terms`
- Free-text search and price range (`minPrice`/`maxPrice`) are currently applied client-side after fetch.

Server-side visibility filtering is enforced by the CRM API (public units, marketplace-active properties, non-placeholder unit numbers, and allowed statuses only).

### Favorites

- Users can mark units as favorites from cards and unit detail.
- Favorites are persisted locally on device storage (AsyncStorage).

### Theme

- Users can choose `System`, `Light`, or `Dark` mode from the in-app Settings page.
- Theme preference is persisted locally on device storage (AsyncStorage).
