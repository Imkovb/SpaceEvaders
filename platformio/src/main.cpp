#include <WiFi.h>
#include <WiFiAP.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <LittleFS.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// OLED Display Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SDA_PIN 21
#define SCL_PIN 22

/**
 * @brief Global boolean to enable or disable OLED display functionality
 * 
 * Set this to true if you have a 0.96 inch OLED screen connected via I2C
 * Set this to false if you don't have an OLED screen or want to disable it
 * 
 * When disabled, all OLED-related code will be skipped to prevent errors
 * 
 * Default: true
 * 
 * Wiring for OLED (when enabled):
 * - GND → ESP32 GND
 * - VCC → ESP32 3.3V  
 * - SCL → ESP32 GPIO 22
 * - SDA → ESP32 GPIO 21
 */
const bool OLED_ENABLED = true;

// Reset Button Configuration
#define RESET_BUTTON_PIN 19  // GPIO pin for the reset button

/**
 * @brief Physical reset button configuration for highscore reset functionality
 * 
 * The reset button allows users to clear all highscores by holding the button
 * for a 5-second countdown period. This prevents accidental resets.
 * 
 * Wiring for Reset Button:
 * - Button connected between GPIO 19 and GND
 * - Uses internal pullup resistor (no external resistor needed)
 * - Button press = LOW signal (pulls pin to ground)
 * - Button release = HIGH signal (internal pullup)
 * 
 * Reset Sequence:
 * 1. Press and hold the reset button
 * 2. OLED displays "Resetting highscore" and 5-second countdown
 * 3. Keep button pressed until countdown reaches 0
 * 4. If button is still pressed at 0, highscores are reset
 * 5. OLED displays "Highscore reset succesful" 
 * 6. If button is released early, reset is cancelled
 * 
 * Default: GPIO 19 (can be changed to any available GPIO pin)
 */

// Initialize OLED display (only if OLED_ENABLED is true)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// WiFi AP Configuration
const char* AP_SSID = "SpaceEvaders";
const char* AP_PASSWORD = "";  // Empty password for open AP

// Web server on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
DNSServer dnsServer;

// Connection tracking
int activeConnections = 0;

// Highscore file path
const char* HIGHSCORE_FILE = "/highscore.json";

// JSON document size
const size_t JSON_DOC_SIZE = 2048;

// Global variables for top 3 highscores
struct HighscorePosition {
    String name;
    int score;
    String date;
    String playerFingerprint;
};

HighscorePosition position1 = {"", 0, "", ""};
HighscorePosition position2 = {"", 0, "", ""};
HighscorePosition position3 = {"", 0, "", ""};

// Reset Button State Variables
enum ResetButtonState {
    RESET_IDLE,           // Button not pressed, normal operation
    RESET_PRESSED,        // Button initially pressed, starting countdown
    RESET_COUNTDOWN,      // Countdown in progress, button still held
    RESET_CONFIRMED,      // Reset completed successfully
    RESET_CANCELLED       // Reset cancelled (button released early)
};

ResetButtonState resetState = RESET_IDLE;
unsigned long resetStartTime = 0;
const unsigned long RESET_COUNTDOWN_DURATION = 5000; // 5 seconds
int resetCountdown = 5;

// Display state management
enum DisplayState {
    DISPLAY_BOOTLOGO,
    DISPLAY_WIFI_STATUS,
    DISPLAY_CONNECTIONS_HIGHSCORES
};

DisplayState currentDisplayState = DISPLAY_BOOTLOGO;
unsigned long displayStateStartTime = 0;
const unsigned long BOOTLOGO_DURATION = 4000;    // 4 seconds
const unsigned long WIFI_STATUS_DURATION = 3000; // 3 seconds

// Function prototypes
void updateGlobalHighscores();
void setupWiFiAP();
void setupWebServer();
bool loadHighscores(JsonArray& highscores);
bool saveHighscores(const JsonArray& highscores);
void handleGetHighscores(AsyncWebServerRequest* request);
void handleAddHighscore(AsyncWebServerRequest* request, uint8_t* data, size_t len, size_t index, size_t total);
void handleStaticFile(AsyncWebServerRequest* request);
void onWebSocketEvent(AsyncWebSocket* server, AsyncWebSocketClient* client, AwsEventType type, void* arg, uint8_t* data, size_t len);
void handleGetConnections(AsyncWebServerRequest* request);
void initOLEDDisplay();
void displayBootLogo();
void displayWiFiStatus();
void displayConnectionsAndHighscores();
void updateDisplay();
void displayResetCountdown();
void displayResetConfirmation();
void resetHighscores();

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("SpaceEvaders ESP32 Web Server Starting...");
    
    // Initialize OLED Display
    if (OLED_ENABLED) {
        initOLEDDisplay();
    }
    
    // Initialize Reset Button
    pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);
    Serial.println("Reset button initialized on GPIO " + String(RESET_BUTTON_PIN));
    
    // Initialize LittleFS
    if (!LittleFS.begin()) {
        Serial.println("Failed to mount LittleFS");
        Serial.println("Formatting filesystem...");
        if (!LittleFS.format()) {
            Serial.println("Failed to format LittleFS");
            return;
        }
        if (!LittleFS.begin()) {
            Serial.println("Failed to mount LittleFS after formatting");
            return;
        }
    }
    Serial.println("LittleFS mounted successfully");
    
    // Update global highscore variables
    updateGlobalHighscores();
    
    // Setup WiFi Access Point
    setupWiFiAP();
    
    // Setup Web Server
    setupWebServer();
    
    Serial.println("Setup complete!");
    Serial.print("Connect to WiFi AP: ");
    Serial.println(AP_SSID);
    Serial.print("Web server available at: http://space");

    
    // Initialize display state only if OLED is enabled
    if (OLED_ENABLED) {
        displayStateStartTime = millis();
        currentDisplayState = DISPLAY_BOOTLOGO;
        Serial.println("OLED display sequence started");
    } else {
        Serial.println("OLED display disabled - skipping display sequence");
    }
}

void loop() {
    // Process DNS requests
    dnsServer.processNextRequest();
    
    // Clean up disconnected WebSocket clients
    ws.cleanupClients();
    
    // Update OLED display
    if (OLED_ENABLED) {
        updateDisplay();
    }
    
    // Update active connections count based on connected WiFi stations
    activeConnections = WiFi.softAPgetStationNum();
    
    // Reset button handling
    int buttonState = digitalRead(RESET_BUTTON_PIN);
    
    // Handle reset display updates separately from normal display
    if (OLED_ENABLED && resetState != RESET_IDLE) {
        if (resetState == RESET_PRESSED || resetState == RESET_CONFIRMED) {
            if (resetState == RESET_PRESSED) {
                displayResetCountdown();
            } else if (resetState == RESET_CONFIRMED) {
                displayResetConfirmation();
            }
        }
    }
    
    switch (resetState) {
        case RESET_IDLE:
            if (buttonState == LOW) {
                // Button pressed, start countdown
                resetState = RESET_PRESSED;
                resetStartTime = millis();
                resetCountdown = 5;
                Serial.println("Reset button pressed - starting countdown");
                
                // Display initial countdown message
                if (OLED_ENABLED) {
                    displayResetCountdown();
                }
            }
            break;
            
        case RESET_PRESSED:
            if (buttonState == LOW) {
                // Button still pressed, update countdown
                unsigned long currentTime = millis();
                int elapsed = (currentTime - resetStartTime) / 1000;
                resetCountdown = 5 - elapsed;
                
                if (resetCountdown <= 0) {
                    // Countdown finished, perform reset
                    resetState = RESET_CONFIRMED;
                    Serial.println("Reset countdown finished - resetting highscores");
                    
                    // Reset highscores
                    resetHighscores();
                    
                    // Display reset confirmation
                    if (OLED_ENABLED) {
                        displayResetConfirmation();
                    }
                }
            } else {
                // Button released, cancel reset
                resetState = RESET_CANCELLED;
                Serial.println("Reset button released - cancelling reset");
            }
            break;
            
        case RESET_CONFIRMED:
            // Reset completed, stay in this state until button is released
            if (buttonState == HIGH) {
                resetState = RESET_IDLE;
                resetCountdown = 5;
                Serial.println("Reset button released - returning to normal operation");
            }
            break;
            
        case RESET_CANCELLED:
            // Reset cancelled, return to idle state
            resetState = RESET_IDLE;
            resetCountdown = 5;
            Serial.println("Returning to normal operation");
            break;
    }
}

void setupWiFiAP() {
    Serial.println("Setting up WiFi Access Point...");
    
    // Configure soft AP
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    
    Serial.println("WiFi AP started");
    Serial.print("AP SSID: ");
    Serial.println(AP_SSID);
    Serial.print("AP IP Address: ");
    Serial.println(WiFi.softAPIP());
    
    // Start DNS server with captive portal support
    dnsServer.start(53, "*", WiFi.softAPIP());
    Serial.println("DNS server started - all domains will resolve to this device");
    Serial.println("Captive Portal enabled - automatic redirection to SpaceEvaders");
}

void setupWebServer() {
    Serial.println("Setting up web server...");
    
    // Enable CORS for all routes
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");
    
    // Captive Portal Detection Endpoints
    server.on("/connecttest.txt", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: connecttest.txt");
        request->redirect("http://spaceevaders");
    });
    
    server.on("/generate_204", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: generate_204");
        request->redirect("http://spaceevaders");
    });
    
    server.on("/hotspot-detect.html", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: hotspot-detect.html");
        request->redirect("http://spaceevaders");
    });
    
    server.on("/library/test/success.html", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: library/test/success.html");
        request->redirect("http://spaceevaders");
    });
    
    server.on("/ncsi.txt", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: ncsi.txt");
        request->redirect("http://spaceevaders");
    });
    
    // Android captive portal detection
    server.on("/gen_204", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: gen_204 (Android)");
        request->redirect("http://spaceevaders");
    });
    
    // Windows captive portal detection
    server.on("/redirect", HTTP_GET, [](AsyncWebServerRequest* request) {
        Serial.println("Captive Portal: redirect (Windows)");
        request->redirect("http://spaceevaders");
    });
    
    // Handle OPTIONS requests for CORS
    server.onNotFound([](AsyncWebServerRequest* request) {
        if (request->method() == HTTP_OPTIONS) {
            request->send(200);
        } else {
            handleStaticFile(request);
        }
    });
    
    // API Routes
    server.on("/api/highscores", HTTP_GET, handleGetHighscores);
    server.on("/api/highscores", HTTP_POST, [](AsyncWebServerRequest* request) {}, NULL, handleAddHighscore);
    server.on("/api/connections", HTTP_GET, handleGetConnections);
    
    // Add middleware to track HTTP connections
    server.onNotFound([](AsyncWebServerRequest* request) {
        // Track HTTP connections (simplified approach)
        if (request->method() == HTTP_GET || request->method() == HTTP_POST) {
            // This is a rough estimate - increment on each request
            // Note: This will count requests, not persistent connections
            activeConnections = WiFi.softAPgetStationNum();
        }
        
        if (request->method() == HTTP_OPTIONS) {
            request->send(200);
        } else {
            handleStaticFile(request);
        }
    });
    
    // WebSocket endpoint
    ws.onEvent(onWebSocketEvent);
    server.addHandler(&ws);
    
    // Start server
    server.begin();
    Serial.println("HTTP server started");
}

bool loadHighscores(JsonArray& highscores) {
    File file = LittleFS.open(HIGHSCORE_FILE, "r");
    if (!file) {
        Serial.println("Failed to open highscore file for reading");
        return false;
    }
    
    DynamicJsonDocument doc(JSON_DOC_SIZE);
    DeserializationError error = deserializeJson(doc, file);
    file.close();
    
    if (error) {
        Serial.println("Failed to parse highscore JSON");
        return false;
    }
    
    if (doc.containsKey("highscores")) {
        JsonArray srcArray = doc["highscores"];
        for (JsonObject score : srcArray) {
            highscores.add(score);
        }
    }
    
    return true;
}

bool saveHighscores(const JsonArray& highscores) {
    File file = LittleFS.open(HIGHSCORE_FILE, "w");
    if (!file) {
        Serial.println("Failed to open highscore file for writing");
        return false;
    }
    
    DynamicJsonDocument doc(JSON_DOC_SIZE);
    JsonArray destArray = doc.createNestedArray("highscores");
    
    for (JsonObject score : highscores) {
        destArray.add(score);
    }
    
    if (serializeJson(doc, file) == 0) {
        Serial.println("Failed to write highscore JSON");
        file.close();
        return false;
    }
    
    file.close();
    
    // Update global highscore variables after successful save
    updateGlobalHighscores();
    
    return true;
}

void updateGlobalHighscores() {
    Serial.println("Updating global highscore variables...");
    
    // Reset global variables
    position1 = {"", 0, "", ""};
    position2 = {"", 0, "", ""};
    position3 = {"", 0, "", ""};
    
    // Load highscores from file
    DynamicJsonDocument doc(JSON_DOC_SIZE);
    JsonArray highscores = doc.createNestedArray("highscores");
    
    if (!loadHighscores(highscores)) {
        Serial.println("Failed to load highscores for global variables");
        return;
    }
    
    // Get top 3 highscores
    int count = 0;
    for (JsonObject score : highscores) {
        if (count >= 3) break;
        
        String name = score["name"].as<String>();
        int scoreValue = score["score"].as<int>();
        String date = score["date"].as<String>();
        String fingerprint = score["playerFingerprint"].as<String>();
        
        switch (count) {
            case 0:
                position1 = {name, scoreValue, date, fingerprint};
                break;
            case 1:
                position2 = {name, scoreValue, date, fingerprint};
                break;
            case 2:
                position3 = {name, scoreValue, date, fingerprint};
                break;
        }
        count++;
    }
    
    Serial.println("Global highscore variables updated:");
    Serial.print("Position 1: "); Serial.print(position1.name); Serial.print(" - "); Serial.println(position1.score);
    Serial.print("Position 2: "); Serial.print(position2.name); Serial.print(" - "); Serial.println(position2.score);
    Serial.print("Position 3: "); Serial.print(position3.name); Serial.print(" - "); Serial.println(position3.score);
}

void handleGetHighscores(AsyncWebServerRequest* request) {
    Serial.println("Handling GET /api/highscores");
    
    DynamicJsonDocument doc(JSON_DOC_SIZE);
    JsonArray highscores = doc.createNestedArray("highscores");
    
    if (loadHighscores(highscores)) {
        String response;
        serializeJson(doc, response);
        request->send(200, "application/json", response);
    } else {
        // Return empty array if file doesn't exist or can't be read
        request->send(200, "application/json", "{\"highscores\":[]}");
    }
}

void handleAddHighscore(AsyncWebServerRequest* request, uint8_t* data, size_t len, size_t index, size_t total) {
    Serial.println("Handling POST /api/highscores");
    
    if (index + len != total) {
        return;  // Wait for complete data
    }
    
    // Parse JSON data
    DynamicJsonDocument doc(JSON_DOC_SIZE);
    DeserializationError error = deserializeJson(doc, (const char*)data);
    
    if (error) {
        Serial.println("Failed to parse request JSON");
        request->send(400, "application/json", "{\"success\":false,\"error\":\"Invalid JSON\"}");
        return;
    }
    
    // Load existing highscores
    DynamicJsonDocument existingDoc(JSON_DOC_SIZE);
    JsonArray existingHighscores = existingDoc.createNestedArray("highscores");
    loadHighscores(existingHighscores);
    
    if (doc.containsKey("highscores")) {
        // Bulk update (saveHighscores function)
        JsonArray newHighscores = doc["highscores"];
        existingHighscores.clear();
        for (JsonObject score : newHighscores) {
            existingHighscores.add(score);
        }
    } else {
        // Single highscore submission (addHighscore function)
        JsonObject newScore = existingHighscores.createNestedObject();
        
        // Use conditional operator instead of | operator for default values
        if (doc.containsKey("name") && !doc["name"].isNull()) {
            newScore["name"] = doc["name"].as<String>();
        } else {
            newScore["name"] = "Anonymous";
        }
        
        if (doc.containsKey("score") && !doc["score"].isNull()) {
            newScore["score"] = doc["score"].as<int>();
        } else {
            newScore["score"] = 0;
        }
        
        if (doc.containsKey("date") && !doc["date"].isNull()) {
            newScore["date"] = doc["date"].as<String>();
        } else {
            newScore["date"] = "";
        }
        
        if (doc.containsKey("playerFingerprint") && !doc["playerFingerprint"].isNull()) {
            newScore["playerFingerprint"] = doc["playerFingerprint"].as<String>();
        } else {
            newScore["playerFingerprint"] = "unknown";
        }
        
        // Manual sorting by score in descending order
        // Since JsonArray doesn't have sort method, we'll create a temporary array
        const size_t numScores = existingHighscores.size();
        if (numScores > 1) {
            // Create temporary array to hold scores for sorting
            struct ScoreInfo {
                String name;
                int score;
                String date;
                String fingerprint;
            };
            
            ScoreInfo* tempScores = new ScoreInfo[numScores];
            
            // Copy scores to temporary array
            for (size_t i = 0; i < numScores; i++) {
                JsonObject score = existingHighscores[i];
                tempScores[i].name = score["name"].as<String>();
                tempScores[i].score = score["score"].as<int>();
                tempScores[i].date = score["date"].as<String>();
                tempScores[i].fingerprint = score["playerFingerprint"].as<String>();
            }
            
            // Sort temporary array by score (descending)
            for (size_t i = 0; i < numScores - 1; i++) {
                for (size_t j = 0; j < numScores - i - 1; j++) {
                    if (tempScores[j].score < tempScores[j + 1].score) {
                        // Swap
                        ScoreInfo temp = tempScores[j];
                        tempScores[j] = tempScores[j + 1];
                        tempScores[j + 1] = temp;
                    }
                }
            }
            
            // Clear and repopulate the JSON array
            existingHighscores.clear();
            for (size_t i = 0; i < numScores; i++) {
                JsonObject score = existingHighscores.createNestedObject();
                score["name"] = tempScores[i].name;
                score["score"] = tempScores[i].score;
                score["date"] = tempScores[i].date;
                score["playerFingerprint"] = tempScores[i].fingerprint;
            }
            
            delete[] tempScores;
        }
    }
    
    // Save updated highscores
    if (saveHighscores(existingHighscores)) {
        request->send(200, "application/json", "{\"success\":true,\"message\":\"Highscores saved successfully\"}");
    } else {
        request->send(500, "application/json", "{\"success\":false,\"error\":\"Failed to save highscores\"}");
    }
}

void handleStaticFile(AsyncWebServerRequest* request) {
    String path = request->url();
    
    // Default to index.html for root path
    if (path == "/") {
        path = "/index.html";
    }
    
    // Ensure path starts with / for LittleFS
    if (!path.startsWith("/")) {
        path = "/" + path;
    }
    
    Serial.print("Serving static file: ");
    Serial.println(path);
    
    // Try to serve from LittleFS
    if (LittleFS.exists(path)) {
        request->send(LittleFS, path, String(), false);
        return;
    }
    
    // File not found
    request->send(404, "text/plain", "File not found");
}

void onWebSocketEvent(AsyncWebSocket* server, AsyncWebSocketClient* client, AwsEventType type, void* arg, uint8_t* data, size_t len) {
    switch (type) {
        case WS_EVT_CONNECT:
            activeConnections++;
            Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
            Serial.printf("Active connections: %d\n", activeConnections);
            break;
        case WS_EVT_DISCONNECT:
            activeConnections--;
            Serial.printf("WebSocket client #%u disconnected\n", client->id());
            Serial.printf("Active connections: %d\n", activeConnections);
            break;
        case WS_EVT_DATA:
            // Handle WebSocket data if needed
            break;
        case WS_EVT_PONG:
        case WS_EVT_ERROR:
            break;
    }
}

void handleGetConnections(AsyncWebServerRequest* request) {
    Serial.println("Handling GET /api/connections");
    
    DynamicJsonDocument doc(256);
    doc["activeConnections"] = activeConnections;
    doc["maxConnections"] = WiFi.softAPgetStationNum();
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
}

void initOLEDDisplay() {
    // Only initialize OLED if enabled
    if (!OLED_ENABLED) {
        Serial.println("OLED display disabled - skipping initialization");
        return;
    }
    
    // Initialize I2C with custom pins
    Wire.begin(SDA_PIN, SCL_PIN);
    
    // Initialize OLED display
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;);
    }
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.display();
    
    Serial.println("OLED display initialized successfully");
}

void displayBootLogo() {
    // Only display if OLED is enabled
    if (!OLED_ENABLED) {
        return;
    }
    
    display.clearDisplay();
    
    // Try to load and display logo from file
    File logoFile = LittleFS.open("/img/logo.png", "r");
    if (logoFile) {
        // For now, display text logo since we need a PNG decoder
        display.setCursor(10, 20);
        display.setTextSize(2);
        display.print(F("SPACE"));
        display.setCursor(25, 40);
        display.print(F("EVADERS"));
        display.setTextSize(1);
        logoFile.close();
    } else {
        // Fallback to text logo
        display.setCursor(10, 20);
        display.setTextSize(2);
        display.print(F("SPACE"));
        display.setCursor(25, 40);
        display.print(F("EVADERS"));
        display.setTextSize(1);
    }
    
    display.display();
}

void displayWiFiStatus() {
    // Only display if OLED is enabled
    if (!OLED_ENABLED) {
        return;
    }
    
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print(F("WiFi Status:"));
    display.setCursor(0, 12);
    display.print(F("SSID: "));
    display.print(AP_SSID);
    display.setCursor(0, 24);
    display.print(F("URL: http://space"));
    display.setCursor(0, 36);
    display.print(F("Status: Ready"));
    display.setCursor(0, 48);
    display.print(F("Connections: "));
    display.print(activeConnections);
    display.display();
}

void displayConnectionsAndHighscores() {
    // Only display if OLED is enabled
    if (!OLED_ENABLED) {
        return;
    }
    
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print(F("Connections: "));
    display.print(activeConnections);
    
    display.setCursor(0, 12);
    display.print(F("TOP 3 SCORES:"));
    
    // Display top 3 highscores
    display.setCursor(0, 24);
    display.print(F("1. "));
    if (position1.name.length() > 8) {
        display.print(position1.name.substring(0, 8));
    } else {
        display.print(position1.name);
    }
    display.print(F(":"));
    display.print(position1.score);
    
    display.setCursor(0, 36);
    display.print(F("2. "));
    if (position2.name.length() > 8) {
        display.print(position2.name.substring(0, 8));
    } else {
        display.print(position2.name);
    }
    display.print(F(":"));
    display.print(position2.score);
    
    display.setCursor(0, 48);
    display.print(F("3. "));
    if (position3.name.length() > 8) {
        display.print(position3.name.substring(0, 8));
    } else {
        display.print(position3.name);
    }
    display.print(F(":"));
    display.print(position3.score);
    
    display.display();
}

void updateDisplay() {
    // Only update display if OLED is enabled
    if (!OLED_ENABLED) {
        return;
    }
    
    // Skip normal display updates during reset sequence
    if (resetState != RESET_IDLE) {
        return;
    }
    
    unsigned long currentTime = millis();
    
    switch (currentDisplayState) {
        case DISPLAY_BOOTLOGO:
            // Show boot logo for 4 seconds
            if (currentTime - displayStateStartTime < BOOTLOGO_DURATION) {
                displayBootLogo();
            } else {
                currentDisplayState = DISPLAY_WIFI_STATUS;
                displayStateStartTime = currentTime;
            }
            break;
            
        case DISPLAY_WIFI_STATUS:
            // Show WiFi status for 3 seconds
            if (currentTime - displayStateStartTime < WIFI_STATUS_DURATION) {
                displayWiFiStatus();
            } else {
                currentDisplayState = DISPLAY_CONNECTIONS_HIGHSCORES;
                displayStateStartTime = currentTime;
            }
            break;
            
        case DISPLAY_CONNECTIONS_HIGHSCORES:
            // Show connections and highscores, update every 2 seconds
            displayConnectionsAndHighscores();
            if (currentTime - displayStateStartTime >= 10000) { // 10 seconds, then cycle back
                currentDisplayState = DISPLAY_WIFI_STATUS;
                displayStateStartTime = currentTime;
            }
            break;
    }
}

void displayResetCountdown() {
    // Only display if OLED is enabled
    if (!OLED_ENABLED) {
        return;
    }
    
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print(F("Resetting highscore"));
    display.setCursor(0, 12);
    display.print(F("Keep pressing..."));
    display.setCursor(0, 24);
    display.print(F("Countdown: "));
    display.print(resetCountdown);
    display.setCursor(0, 36);
    display.print(F("Release to cancel"));
    display.display();
}

void displayResetConfirmation() {
    // Only display if OLED is enabled
    if (!OLED_ENABLED) {
        return;
    }
    
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print(F("Highscore reset"));
    display.setCursor(0, 12);
    display.print(F("succesvol"));
    display.setCursor(0, 24);
    display.print(F("All scores cleared!"));
    display.setCursor(0, 36);
    display.print(F("Release button"));
    display.display();
}

void resetHighscores() {
    // Reset highscores
    DynamicJsonDocument doc(JSON_DOC_SIZE);
    JsonArray highscores = doc.createNestedArray("highscores");
    saveHighscores(highscores);
    
    // Update global highscore variables
    updateGlobalHighscores();
}
