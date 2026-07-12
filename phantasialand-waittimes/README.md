# Phantasialand Wait Times

A tiny mobile webapp showing live ride wait times for Phantasialand, pulled from
the public [queue-times.com](https://queue-times.com) API. It's a single
self-contained `index.html` file — HTML, CSS, and JS all inline, no build
step, no backend, no other files needed.

## Run it on your phone

It needs to be served over `http(s)://`, not opened as a local file. When a
browser loads a page from `file://`, it sends `Origin: null` on every
request, and queue-times.com (plus the public CORS-proxy fallbacks) reject
that origin — so opening the downloaded file directly and tapping it fails
with "Failed to fetch" every time.

- **GitHub Pages** (recommended, free, no accounts beyond GitHub): this repo
  also has a copy at `/docs/index.html` for exactly this purpose. Enable it
  once under Settings → Pages → Source: "Deploy from a branch" → pick this
  branch → folder `/docs` → Save. Then just open the resulting
  `https://<user>.github.io/<repo>/` URL on your phone and "Add to Home
  Screen".
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
  through a fetch-based proxy, then a JSONP script-tag fallback.

### Navigation

queue-times.com doesn't provide ride coordinates, so instead of guessing GPS
positions, each ride is calibrated on-site: tap the 📍 next to a ride (List
view), and the first time you're standing near it, tap "Set my location as
this ride" to save your phone's real GPS fix for it (kept in `localStorage`).
Once calibrated, it shows live distance + compass bearing to that ride and a
button that opens native Maps for real walking directions.

### Map view

The **Map** tab plots every calibrated ride on an OpenStreetMap tile mosaic
(plain `<img>` tile requests, no API key), colored/labeled by live wait time,
with a live "you are here" dot. Tap a marker to open its navigation panel.
Uncalibrated rides simply don't appear yet — calibrate them from List view,
or tap **"Import from OpenStreetMap"** in the Map tab, which queries
[Overpass](https://overpass-api.de) for attractions tagged inside
Phantasialand's OSM boundary and matches them to the live ride list by name.
It only fills in rides that don't already have a location — manual on-site
calibration always takes precedence and is never overwritten — and OSM's
per-ride coverage varies, so anything it misses still just needs the normal
📍 calibration. Map tiles and data are © OpenStreetMap contributors.

No API keys, accounts, or server needed.
