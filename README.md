# Catan Map

A random board generator for Catan, for the base game and the 5–6 player extension. Boards are balanced: no resource clumps, and the 6s and 8s, the 2 and 12, and matching numbers never touch.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-catan-map-builder/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- Standard (3–4 players) and expanded (5–6 players) boards
- Board rules you can switch on or off in settings: red numbers (6 and 8) apart (the official rule), matching numbers apart, 2 and 12 apart, no resource clumps, deserts apart
- Number tokens show their pips, so you can see the odds at a glance
- Keeps the screen on while the board is up, and keeps the last board after a reload
- Light and dark mode, no ads, accounts or tracking

Unofficial, not affiliated with Catan GmbH.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # board generator tests
npm run build      # production build in dist/
```

`npm run deploy` builds the app and publishes it to GitHub Pages.
