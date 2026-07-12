# Phantasialand Wait Times

A tiny mobile webapp showing live ride wait times for Phantasialand, pulled from
the public [queue-times.com](https://queue-times.com) API. It's a single
self-contained `index.html` file — HTML, CSS, and JS all inline, no build
step, no backend, no other files needed.

## Run it on your phone

Simplest: just open `index.html` directly in your phone's browser (e.g. AirDrop
it, email it to yourself, or save it from a cloud drive) and tap to open. You
can also "Add to Home Screen" for an app-like icon.

Other options:
- **GitHub Pages**: enable Pages for this repo (Settings → Pages → deploy from
  branch, folder `/phantasialand-waittimes`), then open the resulting URL.
- **Any static host** (Netlify, Vercel, S3, etc.): drop the file in as-is.
- **Locally on your own machine, phone on the same Wi-Fi**:
  ```
  cd phantasialand-waittimes
  python3 -m http.server 8000
  ```
  Then visit `http://<your-computer's-LAN-IP>:8000` from your phone's browser.

## How it works

- On load, it fetches `https://queue-times.com/parks.json`, finds the
  "Phantasialand" entry, and caches its park ID in `localStorage`.
- It then polls `https://queue-times.com/parks/<id>/queue_times.json` every
  60 seconds for live wait times per ride/land.
- Rides are color-coded: green (≤20 min), amber (21–45 min), red (45+ min),
  gray (closed). You can search by ride name or sort by wait time instead of
  park layout.
- If the browser blocks the direct request (CORS), it automatically retries
  through a couple of public CORS proxies.

No API keys, accounts, or server needed.
