# SpaceEvaders

SpaceEvaders is a compact web-based arcade game with an ESP32 firmware that can serve the same web client from device filesystem.

This repository contains two main parts:

- `platformio/` — ESP32 firmware (PlatformIO) and the `platformio/data/` folder containing the web assets that will be uploaded to the device filesystem.
- `server.py` — a small Flask-based local dev server that serves the web client and provides the `/api/highscores` endpoints for local development and testing.

License
-------

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

Quickstart
----------

1. Local development (recommended)

   - Start the local dev server (it serves files from `platformio/data/` when present, otherwise it will serve `www/` if you kept it):

   ```powershell
   python server.py
   ```

   - Open http://127.0.0.1:5000 in your browser to play and test.

2. Upload web assets to the ESP32

   - If your web assets are in `www/`, the upload script will copy them into `platformio/data/` and upload the filesystem. If you maintain `platformio/data/` directly, the script will use it as-is.

   ```powershell
   cd platformio
   python upload_data.py
   ```

3. Build & upload firmware

   ```powershell
   cd platformio
   pio run -t upload
   ```

Project structure
-----------------

```
platformio/
├── platformio.ini          # PlatformIO configuration
├── src/
│   └── main.cpp            # Main firmware
├── data/                   # Web assets that will be uploaded to ESP32 filesystem (now canonical)
│   ├── index.html          # Main game page
│   ├── script.js           # Game JavaScript
│   ├── style.css           # Game styles
│   ├── highscore.json      # Highscore data
│   └── img/                # Game images
├── upload_data.py          # Filesystem upload script (copies from www/ if needed)
└── README.md               # (removed -- top-level README is canonical)

server.py                   # Local Flask dev server
README.md                   # This file (you are reading it)
LICENSE
```

ESP32 features
--------------

- Creates a WiFi access point named "SpaceEvader" and serves the game at `http://192.168.4.1`.
- Serves static files from the device filesystem (LittleFS) and provides the same `/api/highscores` endpoints as the local server.

API
---

GET /api/highscores
: Returns highscores in JSON: `{ "highscores": [...] }`

POST /api/highscores
: Accepts a single highscore or a bulk `{"highscores": [...]}` payload, and saves it to `platformio/data/highscore.json`.

Development notes
-----------------

- Prefer editing `platformio/data/` if you want PlatformIO to be the canonical source. Otherwise keep editing `www/` and use `upload_data.py` to copy.
- When accepting large Copilot suggestions or new dependencies, add a note in your commit message with the prompt used (see `.github/COPILOT.md`).

Troubleshooting
---------------

- Filesystem upload issues: ensure PlatformIO is installed and the ESP32 is connected. Press BOOT if needed during upload.
- WiFi issues: device AP should be `192.168.4.1`.

***

I removed `platformio/README.md` and merged its useful sections into this top-level README so there's a single source of documentation.

***
