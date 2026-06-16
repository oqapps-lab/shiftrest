param([string]$Dir, [string]$Dev = "emulator-5554")

$adb = "C:\Users\8523~1\AppData\Local\Android\Sdk\platform-tools\adb.exe"

function SS([string]$name) {
    & $adb -s $Dev shell screencap -p /sdcard/_ss.png | Out-Null
    Start-Sleep -Milliseconds 600
    & $adb -s $Dev pull /sdcard/_ss.png "$Dir\$name" | Out-Null
    Write-Host "  $name $(if ((Get-Item "$Dir\$name" -EA SilentlyContinue).Length -gt 0) { 'OK' } else { 'EMPTY' })"
}
function Tap([int]$x, [int]$y) { & $adb -s $Dev shell input tap $x $y; Start-Sleep -Milliseconds 700 }
function Swipe([int]$x1,[int]$y1,[int]$x2,[int]$y2,[int]$ms=400) { & $adb -s $Dev shell input swipe $x1 $y1 $x2 $y2 $ms; Start-Sleep -Milliseconds 500 }
function Back { & $adb -s $Dev shell input keyevent KEYCODE_BACK; Start-Sleep -Milliseconds 700 }

Write-Host "=== SMOKE TEST PASS 1 ==="

# Scroll Today back to top first
Swipe 540 800 540 1800 300; Swipe 540 800 540 1800 300
Start-Sleep -Milliseconds 500

# --- TODAY TAB ---
SS "01-today-top.png"
Swipe 540 1400 540 800 400; SS "02-today-mid.png"
Swipe 540 1400 540 800 400; SS "03-today-bottom.png"

# Scroll back up
Swipe 540 800 540 1600 400

# Tap TRANSITION IN PROGRESS card (y~1950 approx after scroll up)
Swipe 540 800 540 1600 400; Start-Sleep -Milliseconds 300
Swipe 540 800 540 1600 400
SS "04-today-scrolled-up.png"

# Tap gear icon (settings button top-right area ~y=200, x=950)
Tap 950 200; SS "05-today-settings-or-gear.png"
Back

# --- SCHEDULE TAB ---
Tap 425 2243; Start-Sleep -Milliseconds 1000; SS "06-schedule.png"
Swipe 540 1400 540 800 400; SS "07-schedule-scroll.png"
# Try Add shift button area
Tap 540 2000; Start-Sleep -Milliseconds 800; SS "08-schedule-addshift-or-tap.png"
Back

# --- SLEEP PLAN TAB ---
Tap 653 2243; Start-Sleep -Milliseconds 1000; SS "09-sleep-plan.png"
Swipe 540 1400 540 800 400; SS "10-sleep-plan-scroll.png"
Swipe 540 1400 540 800 400; SS "11-sleep-plan-scroll2.png"

# --- PROFILE TAB ---
Tap 882 2243; Start-Sleep -Milliseconds 1000; SS "12-profile.png"
Swipe 540 1400 540 800 400; SS "13-profile-scroll.png"

# Sleep Preferences
Tap 540 900; Start-Sleep -Milliseconds 1000; SS "14-sleep-prefs.png"
Swipe 540 1400 540 800 400; SS "15-sleep-prefs-scroll.png"
Swipe 540 1400 540 800 400; SS "16-sleep-prefs-scroll2.png"
Back; Start-Sleep -Milliseconds 500

# Notification Settings
Tap 540 1100; Start-Sleep -Milliseconds 1000; SS "17-notif-settings.png"
Swipe 540 1400 540 800 400; SS "18-notif-settings-scroll.png"
Back; Start-Sleep -Milliseconds 500

# Subscription / Manage
Tap 540 1300; Start-Sleep -Milliseconds 1000; SS "19-subscription.png"
Back; Start-Sleep -Milliseconds 500

# About
Tap 540 1500; Start-Sleep -Milliseconds 1000; SS "20-about.png"
Back; Start-Sleep -Milliseconds 500

# --- BACK TO TODAY, test TRANSITION banner ---
Tap 197 2243; Start-Sleep -Milliseconds 800
# Scroll to transition banner
Swipe 540 1400 540 800 400; Swipe 540 1400 540 800 400
SS "21-today-transition-visible.png"
# Tap transition banner
Tap 540 1950; Start-Sleep -Milliseconds 1200; SS "22-transition-modal.png"
Swipe 540 1400 540 800 400; SS "23-transition-modal-scroll.png"
# Close modal
Tap 540 200; Start-Sleep -Milliseconds 800; SS "24-after-close-modal.png"

# --- PAYWALL ---
# Navigate to paywall via "14 DAYS" badge (top right)
Swipe 540 800 540 1600 400; Swipe 540 800 540 1600 400
Tap 197 2243; Start-Sleep -Milliseconds 500
Tap 870 120; Start-Sleep -Milliseconds 1200; SS "25-paywall.png"
Swipe 540 1400 540 800 400; SS "26-paywall-scroll.png"
Swipe 540 1400 540 800 400; SS "27-paywall-scroll2.png"
# Close paywall
Tap 540 200; Start-Sleep -Milliseconds 800; SS "28-after-paywall-close.png"

Write-Host "=== DONE PASS 1 ==="
