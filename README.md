# SpaceEvaders

A space-themed game project.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright [2025] [Okmi]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Development workflow

This repository contains both the web client (`www/`) and the ESP32 firmware under `platformio/`.

- `www/` is the single source of truth for the web game assets (HTML, JS, CSS, images, and `highscore.json`).
- Use the local Flask server for web development and testing.

Asset placement and workflows

You now have two valid workflows — pick the one you prefer:

1) Edit files in `www/` (recommended for development)
    - `www/` is the canonical source for the web assets.
    - Local server: run `python server.py` (it serves `platformio/data/` when present, otherwise `www/`).
    - To upload to the ESP32, run the upload script which copies `www/` into `platformio/data/` and performs the filesystem upload:

```powershell
cd platformio
python upload_data.py
```

2) Keep files in `platformio/data/` (recommended if you want PlatformIO to be the canonical source)
    - Place your web assets directly into `platformio/data/`.
    - The local server will prefer `platformio/data/` when it is present and non-empty, so running `python server.py` will serve those files.
    - Running `python upload_data.py` will use `platformio/data/` as-is and upload it to the device.

Choose whichever workflow fits your tooling. If you maintain `platformio/data/` as canonical, keep it tracked in git; otherwise keep `www/` and use the upload script to populate `platformio/data/` before uploading.
