#!/usr/bin/env python3
"""
Test script to verify ESP32 web server functionality
"""

import requests
import json
import time
import sys

def test_server():
    """Test the ESP32 web server endpoints"""
    
    base_url = "http://192.168.4.1"
    
    print("Testing SpaceEvaders ESP32 Web Server")
    print("=" * 40)
    
    # Test 1: Check if server is reachable
    print("\n1. Testing server connectivity...")
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✓ Server is reachable")
        else:
            print(f"✗ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Cannot connect to server: {e}")
        print("Make sure:")
        print("- ESP32 is powered on and running")
        print("- You are connected to the 'SpaceEvader' WiFi network")
        print("- The server IP is 192.168.4.1")
        return False
    
    # Test 2: Test static file serving
    print("\n2. Testing static file serving...")
    try:
        response = requests.get(f"{base_url}/index.html", timeout=5)
        if response.status_code == 200 and "html" in response.text.lower():
            print("✓ index.html served successfully")
        else:
            print(f"✗ Failed to serve index.html: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Error serving index.html: {e}")
        return False
    
    # Test 3: Test GET highscores endpoint
    print("\n3. Testing GET /api/highscores...")
    try:
        response = requests.get(f"{base_url}/api/highscores", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "highscores" in data:
                print("✓ GET /api/highscores working")
                print(f"  - Found {len(data['highscores'])} highscores")
            else:
                print("✗ Invalid response format")
                return False
        else:
            print(f"✗ GET /api/highscores failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Error testing GET /api/highscores: {e}")
        return False
    
    # Test 4: Test POST highscores endpoint
    print("\n4. Testing POST /api/highscores...")
    test_score = {
        "name": "TestPlayer",
        "score": 100,
        "date": "2025-09-29T12:00:00.000Z",
        "playerFingerprint": "test123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/highscores",
            json=test_score,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✓ POST /api/highscores working")
            else:
                print(f"✗ POST failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"✗ POST /api/highscores failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Error testing POST /api/highscores: {e}")
        return False
    
    # Test 5: Verify highscore was saved
    print("\n5. Verifying highscore was saved...")
    try:
        response = requests.get(f"{base_url}/api/highscores", timeout=5)
        if response.status_code == 200:
            data = response.json()
            highscores = data.get("highscores", [])
            test_found = any(
                score.get("name") == "TestPlayer" and score.get("score") == 100
                for score in highscores
            )
            if test_found:
                print("✓ Test highscore saved successfully")
            else:
                print("✗ Test highscore not found in saved data")
                return False
        else:
            print(f"✗ Failed to verify saved highscore: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Error verifying saved highscore: {e}")
        return False
    
    print("\n" + "=" * 40)
    print("All tests passed! 🎉")
    print("The ESP32 web server is working correctly.")
    return True

def main():
    """Main function"""
    print("Make sure you are connected to the 'SpaceEvader' WiFi network before running this test.")
    print("Press Enter to continue or Ctrl+C to cancel...")
    
    try:
        input()
    except KeyboardInterrupt:
        print("\nTest cancelled.")
        sys.exit(0)
    
    success = test_server()
    
    if not success:
        print("\nSome tests failed. Check the ESP32 serial monitor for error messages.")
        sys.exit(1)

if __name__ == "__main__":
    main()