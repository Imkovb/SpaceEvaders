# SpaceEvaders Wiring Guide

This guide covers the hardware needed to run the SpaceEvaders firmware (`platformio/src/main.cpp`) on an ESP32 D1 Mini footprint board (e.g. LOLIN D32 Mini) and explains how to connect optional peripherals. Follow the steps below before uploading the firmware or the LittleFS assets.

## Bill of materials
- ESP32 D1 Mini style board (LOLIN D32 Mini or compatible `esp32dev` target)
- Micro-USB cable for power/programming
- 0.96" I2C OLED display (SSD1306, 128x64, 4-pin header)
- Momentary push button (normally open) for highscore reset
- Hook-up wire or pre-crimped Dupont leads (female-to-female recommended)
- Optional: breadboard or JST connectors for strain relief, 3D printed enclosure from `STL/`

## Core connections

| Subsystem | Board silkscreen | GPIO | Peripheral lead | Notes |
|-----------|------------------|------|-----------------|-------|
| Power     | 5V (USB)         | —    | USB cable        | Powers the board via micro-USB; avoid injecting VIN while USB is attached |
| Ground    | GND              | —    | OLED GND, button leg | Common ground for every module |
| OLED VCC  | 3V3              | 3V3  | OLED VCC         | SSD1306 module accepts 3.3 V; do not feed 5 V |
| OLED SDA  | SDA (21)         | 21   | OLED SDA         | I2C data; defined as `SDA_PIN` in firmware |
| OLED SCL  | SCL (22)         | 22   | OLED SCL         | I2C clock; defined as `SCL_PIN` |
| Reset BTN | D19              | 19   | Button leg       | Uses internal pull-up; second leg goes to GND |

### Button wiring detail
- Solder or plug one leg of the momentary button to ESP32 GPIO 19.
- Connect the other leg to GND. No external resistor is required because the firmware enables `INPUT_PULLUP`.
- Pressing the button pulls the pin low; holding for 5 s triggers the highscore reset sequence on the OLED.

### OLED wiring detail
Most 0.96" SSD1306 breakout boards expose pins (left→right) `GND, VCC, SCL, SDA`. Double-check silkscreen before powering up. If your module labels `VDD` instead of `VCC`, tie it to 3.3 V.

```
ESP32 3V3  ──────┐
                │
OLED VCC    ─────┘
OLED GND    ─────┐
                │
ESP32 GND  ──────┘
ESP32 GPIO22 ─── OLED SCL
ESP32 GPIO21 ─── OLED SDA
```

## Assembly steps
1. **Prep the ESP32:** Place the D1 Mini board on a breadboard or mount it inside the printed enclosure. Power it from USB only after wiring is complete.
2. **Wire the OLED:** Connect 3V3, GND, GPIO 21 (SDA), and GPIO 22 (SCL) as shown above. Keep the twisted pair for SDA/SCL short to limit noise.
3. **Install the reset button:** Route one lead to GPIO 19 (pin labelled `D19` on the LOLIN board edge) and the other to GND. If mounting in the case, secure the switch before soldering.
4. **Check continuity:** Use a multimeter to confirm there are no shorts between 3V3 and GND, and that SDA/SCL are not swapped.
5. **Apply strain relief:** Use heat-shrink or zip ties where wires might flex, especially if the device will be handled frequently.
6. **Power on:** Connect USB to the ESP32. The OLED should show the boot logo after flashing the firmware with `OLED_ENABLED` set to `true`.

## Configuration notes
- Pin assignments live near the top of `platformio/src/main.cpp`. If you repurpose pins, update `SDA_PIN`, `SCL_PIN`, or `RESET_BUTTON_PIN` accordingly.
- To disable the OLED entirely, set `OLED_ENABLED` to `false` and omit the screen wiring; the firmware skips all display code in that case.
- The SSD1306 address is hard-coded to `0x3C`. Use an I2C scanner if your module uses `0x3D` and adjust during initialization if needed.

## Power considerations
- The D1 Mini’s onboard regulator can source the OLED and button without issue as long as you power the board via USB.
- If running from a Li-Ion battery pack or 5 V barrel input, feed the module through the `5V` (VIN) pin; never back-power the USB port.
- Avoid powering the OLED from 5 V unless the breakout explicitly supports it.

## Post-wiring checks
- Upload the firmware: `pio run -e esp32dev -t upload`
- Upload the web assets (LittleFS): `pio run -e esp32dev -t uploadfs`
- Open a serial monitor at 115200 baud; you should see the AP name, IP, and OLED status messages.
- Press and hold the reset button to verify the countdown and highscore reset behaviour on the OLED.

With these connections in place, the SpaceEvaders SoftAP and game client will run entirely on the ESP32 hardware.
