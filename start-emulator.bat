@echo off
echo === Starting Pixel 8 Emulator + ShiftRest ===

echo [0/4] Starting ADB server...
set ANDROID_HOME=C:\Users\8523~1\AppData\Local\Android\Sdk
set ANDROID_SDK_HOME=C:\Users\8523~1
set ANDROID_AVD_HOME=C:\Users\8523~1\.android\avd
"C:\Users\8523~1\AppData\Local\Android\Sdk\platform-tools\adb.exe" start-server
timeout /t 2 /nobreak >nul

echo [1/4] Launching emulator...
start "" "C:\Users\8523~1\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Pixel_8 -no-snapshot-load -gpu host

echo [2/4] Waiting for emulator to boot (60-90 sec)...
:wait_loop
timeout /t 5 /nobreak >nul
"C:\Users\8523~1\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices | find "emulator-5554	device" >nul
if errorlevel 1 goto wait_loop

echo [3/4] Enabling WiFi...
"C:\Users\8523~1\AppData\Local\Android\Sdk\platform-tools\adb.exe" -s emulator-5554 shell svc wifi enable
timeout /t 6 /nobreak >nul

echo [4/4] Starting Metro bundler...
cd /d "C:\Users\8523~1\Desktop\ff\NeverLandST\shiftrest"
set EXPO_NO_INTERACTIVE=1
set REACT_NATIVE_PACKAGER_HOSTNAME=localhost
start "Metro" cmd /k "npx expo start --android"

echo === Done! ShiftRest should open in Expo Go ===
pause
