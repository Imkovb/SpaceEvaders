# SpaceEvaders

A fast, lane-based arcade shooter you can play in the browser or host directly from an ESP32. The same web client runs in local development and on-device. Includes highscores, bosses, pixel-perfect sprites, and a captive-portal style Wi‑Fi AP for “plug-and-play” gaming.

- Web client: HTML/CSS/JS in `platformio/data`
- Firmware: ESP32 (Arduino) in `platformio/src`
- Local dev server: Flask app `server.py` with `/api/highscores`

## Features

- 3 lanes with smooth lane switching, tilt animation, and one-bullet gameplay
- Waves and boss encounters that occupy two lanes, leaving one free
- Intelligent spawns and special V-formation mini enemies (3 minis)
- Anti-edge-case safety: special minis won’t spawn too close to the boss in the free lane; drift-ins are auto-cleared to avoid unwinnable states
- Bullet award system for dodging enemies; challenge mode that ramps difficulty near your personal best
- Pixel-perfect rendering for sprites and explosions; crisp scaling
- ESP32 SoftAP with captive-portal endpoints and static file serving from LittleFS
- Highscores stored locally on the server or on-device, with safe, atomic writes on ESP32
- Up to 10 AP stations (ESP32 maximum) configurable in firmware

## Project structure

```
.
├─ platformio/
│  ├─ platformio.ini           # PlatformIO config (board: esp32dev)
│  ├─ src/
│  │  └─ main.cpp              # ESP32 firmware (WiFi AP, server, LittleFS, OLED)
│  ├─ data/                    # Web client (served both locally and on-device)
│  │  ├─ index.html
│  │  ├─ script.js             # Game logic (spawning, boss, collisions, UI)
│  │  ├─ style.css
│  │  ├─ js/
│  │  │  ├─ main.js            # Module entry: imports script.js
│  │  │  ├─ config.js          # Tunable game constants (lanes, speeds, scales, etc.)
│  │  │  ├─ sprites.js         # Sprite loading
│  │  │  └─ collision.js       # Bounds & pixel-perfect collision helpers
│  │  ├─ img/                  # Assets
│  │  └─ highscore.json        # Highscore storage (local dev or initial on-device)
│  └─ (LittleFS filesystem is built from this folder)
├─ server.py                   # Local Flask dev server + REST API
├─ STL/                        # 3D prints for case
├─ LICENSE
└─ README.md
```

## Gameplay (controls)

- Keyboard: Left/Right to change lanes, Space to start/shoot
- Touch: on‑screen left/right/shoot buttons
- Goal: Survive waves, dodge or shoot enemies, pass bosses via the free lane. Bullets are limited—earn one by dodging a number of enemies.

Boss safety note: To prevent impossible patterns, V‑formation minis won’t spawn too close vertically to the boss in the free lane, and any special minis that drift into an unsafe band around the boss are auto-cleared.

## Local development

Requirements: Python 3.10+ (tested with 3.12), pip

1) Create a venv and install server deps

```powershell
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r platformio/data/requirements.txt
```

2) Run the dev server

```powershell
python server.py
```

- Open http://127.0.0.1:5000
- The server prefers `platformio/data` for assets; otherwise it will fall back to `www/` (if present)

Highscores are served/saved via `/api/highscores` (see API below). The server writes to `platformio/data/highscore.json` by default.

## ESP32 firmware (PlatformIO)

Requirements: PlatformIO (CLI or the VS Code extension)

Build from repo root using the installed PlatformIO CLI in venv:

```powershell
# Build (from repo root)
. .venv/Scripts/Activate.ps1
.venv\Scripts\platformio.exe run -d platformio -e esp32dev
```

Upload firmware:

```powershell
.venv\Scripts\platformio.exe run -d platformio -e esp32dev -t upload
```

Upload LittleFS (web assets):

```powershell
.venv\Scripts\platformio.exe run -d platformio -e esp32dev -t uploadfs
```

Serial monitor (115200 baud):

```powershell
.venv\Scripts\platformio.exe device monitor -d platformio -b 115200
```

**Alternative: Using PlatformIO CLI or VS Code extension (simpler)**

If you have PlatformIO installed globally (via `pip install platformio` or the VS Code extension), navigate to the `platformio/` directory and run:

```powershell
cd platformio

# Build firmware
pio run -e esp32dev

# Upload firmware to connected ESP32
pio run -e esp32dev -t upload

# Upload web assets (LittleFS filesystem)
pio run -e esp32dev -t uploadfs

# Monitor serial output (115200 baud)
pio device monitor -b 115200
```

**Troubleshooting upload issues:**
- If `pio run -t upload` fails with "Could not open COMx" or auto-detects the wrong port:
  - Check Device Manager (Win+X → Device Manager) under "Ports (COM & LPT)" to find your ESP32's COM port
  - Manually specify the port in `platformio.ini` by adding `upload_port = COM5` (replace COM5 with your port)
  - Ensure you have the correct USB-to-UART driver installed:
    - **CP210x** (Silicon Labs): Download from [silabs.com](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)
    - **CH340/CH341** (WCH): Download from [wch.cn](https://www.wch.cn/downloads/CH341SER_ZIP.html)
  - Try a different USB cable (must support data, not just power)
  - Hold the BOOT button on the ESP32 while uploading if auto-reset fails

On boot you should see:
- LittleFS mounted
- AP SSID and IP (default SSID: `SpaceEvaders`)
- “AP Max Connections: 10” (we set the SoftAP limit to the ESP32 max)

### Firmware highlights

- SoftAP with captive-portal DNS; serves static files from LittleFS
- REST endpoints:
  - GET `/api/highscores` → `{ highscores: [...] }`
  - POST `/api/highscores` → accepts single score or `{ highscores: [...] }`
  - GET `/api/connections` → `{ activeConnections, maxConnections }`
- Highscore writes are safe and atomic:
  - Protected by a FreeRTOS mutex
  - Write to temp file then rename to final to avoid partial/corrupt saves
- OLED (optional) shows Wi‑Fi and top scores (can be disabled)

### Change Wi‑Fi/AP settings

Edit in `platformio/src/main.cpp`:
- `AP_SSID` and `AP_PASSWORD` (empty password = open AP)
- `MAX_AP_CONNECTIONS` (defaults to 10)

## Game configuration

Most tuning happens in `platformio/data/js/config.js`:
- Canvas and sprite scales
- Lanes and speeds
- Spawn rates and spacing
- Special V‑formation spacing and chance
- Boss size and speed
- Safety gap near the boss’s free lane:
  - `BOSS_FREE_LANE_SPECIAL_SAFE_GAP` controls vertical buffer to prevent unwinnable spawns

You can safely tweak values and reload your browser or re-upload `uploadfs` to test on-device.

## Screenshots

Keep screenshots and other project images in a dedicated folder (recommended: `assets/screenshots/`) and include them in the README using relative paths. This keeps the repository organized and ensures images render on GitHub and in forks.

Example single image:

![Gameplay screenshot](assets/screenshots/placeholder.svg)

Example gallery (small thumbnails):

<img src="assets/screenshots/shot1.svg" alt="Gameplay 1" width="300"> <img src="assets/screenshots/shot2.svg" alt="Gameplay 2" width="300"> <img src="assets/screenshots/shot3.svg" alt="Gameplay 3" width="300">

Tips:
- Use descriptive alt text for accessibility.
- Prefer PNG for screenshots with sharp UI elements, JPEG/WebP for photographic images to save space.
- Keep images under ~1–2 MB where possible so repository clones stay small.
- If you need to add many large images or high-resolution assets, consider using Git LFS.

Quick PowerShell commands to resize/optimize images (ImageMagick required):

```powershell
# Resize to 1200px wide and optimize quality
magick convert input.png -resize 1200x -strip -quality 85 output.png

# Convert many PNGs to optimized WebP
magick mogrify -format webp -quality 80 -path assets/screenshots/ assets/screenshots/*.png
```

Add new screenshots by saving files into `assets/screenshots/` and committing them. Example:

```powershell
git add assets/screenshots/my-shot.png
git commit -m "Add gameplay screenshot"
git push
```

## API

Base URL:
- Local dev: `http://127.0.0.1:5000`
- On-device: `http://spaceevaders` (captive DNS) or AP IP `http://192.168.4.1`

GET `/api/highscores`
- Response: `{ "highscores": [ { name, score, date, playerFingerprint }, ... ] }`

POST `/api/highscores`
- Accepts either a single entry or a bulk payload:

```json
{ "name":"Player", "score":12345, "date":"2025-01-01T00:00:00Z", "playerFingerprint":"abcd1234" }
```

```json
{ "highscores": [ { "name":"A", "score":1000 }, { "name":"B", "score":900 } ] }
```

GET `/api/connections`
- Response: `{ "activeConnections": n, "maxConnections": 10 }`

## HTTPS and captive portal notes

- Browsers won’t follow HTTPS → HTTP redirects before the TLS handshake. Without a valid certificate for the exact hostname, users will see a security warning.
- Options:
  - Use a real domain with a CA‑signed cert (best UX), or
  - Use a private CA/self‑signed cert and install trust on all client devices (works in controlled environments)
- For captive portal flow, keep HTTP on port 80 and ensure the OS endpoints (`/gen_204`, `/connecttest.txt`, etc.) return redirects so devices prompt the “Sign in to network” page.

## Troubleshooting

- PlatformIO not found:
  - Install the VS Code extension or install CLI to your venv and use `platformio.exe` as shown above
- Upload fails / press BOOT:
  - Hold BOOT (or IO0) while reset to enter flashing mode, then retry upload
- No captive portal popup:
  - Manually open `http://spaceevaders` or `http://192.168.4.1`
- Highscores not saving on device:
  - Ensure there’s free flash space; the firmware writes atomically with a mutex and temp‑file swap
- Browser caching:
  - Force refresh or append `?t=TIMESTAMP` to asset URLs when testing

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file.

---

Made with love for tiny arcades. If you build a cabinet or case, check out the `STL/` folder for printable parts.
