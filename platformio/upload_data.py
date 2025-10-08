#!/usr/bin/env python3
"""
Script to upload www folder contents to ESP32 LittleFS filesystem
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def copy_www_to_data():
    """Copy www folder contents to platformio/data directory"""
    
    # Get paths
    project_root = Path(__file__).parent.parent
    www_folder = project_root / "www"
    data_folder = project_root / "platformio" / "data"

    # If data_folder already contains files, assume it's the source of truth for upload.
    # Otherwise, copy from www_folder into data_folder.
    
    print(f"Project root: {project_root}")
    print(f"WWW folder: {www_folder}")
    print(f"Data folder: {data_folder}")
    
    # If data_folder already exists and is not empty, we assume developer wants to use it
    # as the source-of-truth for the ESP upload. Otherwise, copy from www_folder.
    if data_folder.exists() and any(data_folder.iterdir()):
        print(f"Using existing data folder as source: {data_folder}")
        return True

    # Otherwise, copy from www_folder into data_folder
    if not www_folder.exists():
        print(f"Error: WWW folder not found at {www_folder}")
        return False

    # Create data folder
    data_folder.mkdir(parents=True, exist_ok=True)

    # Clear existing data folder contents (defensive)
    for item in data_folder.iterdir():
        if item.is_file():
            item.unlink()
        elif item.is_dir():
            shutil.rmtree(item)

    # Copy all contents from www to data
    try:
        shutil.copytree(www_folder, data_folder, dirs_exist_ok=True)
        print(f"Successfully copied contents from {www_folder} to {data_folder}")
        return True
    except Exception as e:
        print(f"Error copying files: {e}")
        return False

def upload_filesystem():
    """Upload filesystem to ESP32 using PlatformIO"""
    
    # Change to platformio directory
    platformio_dir = Path(__file__).parent
    os.chdir(platformio_dir)
    
    try:
        # Run PlatformIO filesystem upload command
        result = subprocess.run(
            ["pio", "run", "-t", "uploadfs"],
            check=True,
            capture_output=True,
            text=True
        )
        print("Filesystem upload successful!")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print("Filesystem upload failed!")
        print("Error:", e.stderr)
        return False
    except FileNotFoundError:
        print("Error: PlatformIO CLI not found. Please install PlatformIO or ensure it's in PATH.")
        return False

def main():
    print("SpaceEvaders ESP32 Filesystem Upload Script")
    print("=" * 50)
    
    # Step 1: Copy www folder to data directory
    print("\nStep 1: Copying www folder to data directory...")
    if not copy_www_to_data():
        print("Failed to copy www folder contents.")
        sys.exit(1)
    
    # Step 2: Upload filesystem to ESP32
    print("\nStep 2: Uploading filesystem to ESP32...")
    if not upload_filesystem():
        print("Failed to upload filesystem.")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("Filesystem upload completed successfully!")
    print("The ESP32 now has all the web files and can serve the SpaceEvaders game.")

if __name__ == "__main__":
    main()