# SpaceEvaders ESP32 Web Server

This project implements a SpaceEvaders game web server on ESP32, replicating the functionality of the original Flask server.

## Features

- **WiFi Access Point**: Creates an open WiFi network named "SpaceEvader"
- **Web Server**: Serves the SpaceEvaders game and handles API requests
- **Highscore Management**: Stores and retrieves highscores using JSON files
- **Static File Serving**: Serves HTML, CSS, JavaScript, and image files
- **CORS Support**: Allows cross-origin requests for the web game

## Hardware Requirements

- ESP32 development board
- USB cable for programming and power

## Software Requirements

- PlatformIO IDE or CLI
- Python 3.x

## Setup Instructions

### 1. Install PlatformIO

If you haven't already, install PlatformIO:
- **VS Code**: Install the PlatformIO IDE extension
- **CLI**: Install using `pip install platformio`

### 2. Upload Filesystem

Before flashing the ESP32, you need to upload the web files to the filesystem:

```bash
cd platformio
python upload_data.py
```

This script will:
- Copy all files from the `www` folder to the `platformio/data` directory
- Upload the filesystem to the ESP32 using PlatformIO

### 3. Build and Upload

Build and upload the firmware to the ESP32:

```bash
cd platformio
pio run -t upload
```

### 4. Monitor Serial Output (Optional)

To view debug output:

```bash
pio device monitor
```

## Usage

1. Power on the ESP32
2. Connect to the WiFi access point named "SpaceEvader" (no password required)
3. Open a web browser and navigate to `http://192.168.4.1`
4. Play the SpaceEvaders game!

## API Endpoints

The ESP32 web server provides the same API endpoints as the original Flask server:

### GET /api/highscores
Returns all highscores in JSON format.

**Response:**
```json
{
  "highscores": [
    {
      "name": "Player1",
      "score": 1000,
      "date": "2025-09-29T12:00:00.000Z",
      "playerFingerprint": "abc123"
    }
  ]
}
```

### POST /api/highscores
Adds a new highscore or updates multiple highscores.

**Request Body (Single Highscore):**
```json
{
  "name": "Player1",
  "score": 1000,
  "date": "2025-09-29T12:00:00.000Z",
  "playerFingerprint": "abc123"
}
```

**Request Body (Multiple Highscores):**
```json
{
  "highscores": [
    {
      "name": "Player1",
      "score": 1000,
      "date": "2025-09-29T12:00:00.000Z",
      "playerFingerprint": "abc123"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Highscores saved successfully"
}
```

## File Structure

```
platformio/
├── platformio.ini          # PlatformIO configuration
├── src/
│   └── main.cpp            # Main firmware
├── data/                   # Files to be uploaded to ESP32 filesystem
│   ├── index.html          # Main game page
│   ├── script.js           # Game JavaScript
│   ├── style.css           # Game styles
│   ├── highscore.json      # Highscore data
│   └── img/                # Game images
├── upload_data.py          # Filesystem upload script
└── README.md               # This file
```

## Troubleshooting

### Filesystem Upload Issues
- Make sure the ESP32 is connected and recognized by your computer
- Try pressing the BOOT button while uploading
- Check that PlatformIO is properly installed

### WiFi Connection Issues
- The ESP32 creates an open access point - no password is needed
- The IP address should be 192.168.4.1
- If you can't connect, try resetting the ESP32

### Game Not Loading
- Check that all files were properly uploaded to the filesystem
- Verify the serial monitor for any error messages
- Try accessing http://192.168.4.1/index.html directly

## Technical Details

- **Platform**: ESP32
- **Framework**: Arduino
- **Web Server**: AsyncWebServer (non-blocking)
- **Filesystem**: LittleFS
- **WiFi Mode**: Access Point (AP)
- **IP Address**: 192.168.4.1
- **Port**: 80

The implementation uses asynchronous web server libraries to ensure smooth performance while handling multiple client connections simultaneously.