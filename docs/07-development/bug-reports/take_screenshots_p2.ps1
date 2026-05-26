param([string]$Dir, [string]$Dev = "emulator-5554")

$adb = "C:\Users\8523~1\AppData\Local\Android\Sdk\platform-tools\adb.exe"

function SS([string]$name) {
    & $adb -s $Dev shell screencap -p /sdcard/_ss.png | Out-Null
    Start-Sleep -Milliseconds 700
    & $adb -s $Dev pull /sdcard/_ss.png "$Dir\$name" | Out-Null
    Write-Host "  $name $(if ((Get-Item "$Dir\$name" -EA SilentlyContinue).Length -gt 0) { 'OK' } else { 'EMPTY' })"
}
function Tap([int]$x, [int]$y) { & $adb -s $Dev shell input tap $x $y; Start-Sleep -Milliseconds 900 }
function Swipe([int]$x1,[int]$y1,[int]$x2,[int]$y2,[int]$ms=400) { & $adb -s $Dev shell input swipe $x1 $y1 $x2 $y2 $ms; Start-Sleep -Milliseconds 600 }

Write-Host "=== SMOKE TEST PASS 2 ==="

# App already loaded — scroll back to Today tab top
Start-Sleep -Seconds 2

# --- TODAY TAB ---
Write-Host "-- TODAY --"
# Scroll to top
Swipe 540 700 540 1900 300; Swipe 540 700 540 1900 300
Start-Sleep -Milliseconds 500
SS "01-today-top.png"
Swipe 540 1500 540 700 400; SS "02-today-cards.png"
Swipe 540 1500 540 700 400; SS "03-today-transition.png"

# Tap TRANSITION IN PROGRESS banner (visible at bottom after 2 scrolls)
Tap 540 1850; Start-Sleep -Milliseconds 1500
SS "04-transition-modal-open.png"
Swipe 540 1400 540 700 400; SS "05-transition-modal-scroll.png"
# Close via X button (top-left or top area of modal)
Tap 80 200; Start-Sleep -Milliseconds 1000; SS "06-transition-modal-closed.png"

# Back to top
Swipe 540 700 540 1900 300; Swipe 540 700 540 1900 300
Start-Sleep -Milliseconds 500

# --- SCHEDULE TAB ---
Write-Host "-- SCHEDULE --"
Tap 425 2243; Start-Sleep -Milliseconds 1500; SS "07-schedule.png"
Swipe 540 1400 540 700 400; SS "08-schedule-scroll.png"
# Tap ADD SHIFT button (floating at bottom)
Tap 540 2020; Start-Sleep -Milliseconds 1500; SS "09-add-shift-modal.png"
# Close via X or Back button in modal (top-left X)
Tap 80 200; Start-Sleep -Milliseconds 800
SS "10-schedule-after-close.png"

# --- SLEEP PLAN TAB ---
Write-Host "-- SLEEP PLAN --"
Tap 653 2243; Start-Sleep -Milliseconds 1500; SS "11-sleep-plan.png"
Swipe 540 1400 540 700 400; SS "12-sleep-plan-scroll.png"
Swipe 540 1400 540 700 400; SS "13-sleep-plan-scroll2.png"

# --- PROFILE TAB ---
Write-Host "-- PROFILE --"
Tap 882 2243; Start-Sleep -Milliseconds 1500; SS "14-profile.png"
Swipe 540 1400 540 700 400; SS "15-profile-scroll.png"
# Scroll back up to see the items
Swipe 540 700 540 1500 400; Start-Sleep -Milliseconds 500

# Sleep Preferences (first item in list - roughly middle of screen)
Tap 540 1100; Start-Sleep -Milliseconds 1500; SS "16-sleep-prefs.png"
Swipe 540 1400 540 700 400; SS "17-sleep-prefs-scroll1.png"
Swipe 540 1400 540 700 400; SS "18-sleep-prefs-scroll2.png"
# Navigate back via back arrow (top-left ~x=60 y=130)
Tap 60 130; Start-Sleep -Milliseconds 1000; SS "19-back-to-profile.png"

# Notification Settings
Tap 540 1300; Start-Sleep -Milliseconds 1500; SS "20-notif-settings.png"
Swipe 540 1400 540 700 400; SS "21-notif-settings-scroll.png"
Tap 60 130; Start-Sleep -Milliseconds 1000

# Subscription
Tap 540 1500; Start-Sleep -Milliseconds 1500; SS "22-subscription.png"
Tap 60 130; Start-Sleep -Milliseconds 1000

# About
Tap 540 1700; Start-Sleep -Milliseconds 1500; SS "23-about.png"
Tap 60 130; Start-Sleep -Milliseconds 1000

# --- PAYWALL via 14 DAYS badge ---
Write-Host "-- PAYWALL --"
Tap 197 2243; Start-Sleep -Milliseconds 1000
# Scroll to top
Swipe 540 700 540 1900 300; Swipe 540 700 540 1900 300
Start-Sleep -Milliseconds 500
# Tap 14 DAYS badge (top right ~x=870, y=110)
Tap 870 110; Start-Sleep -Milliseconds 2000; SS "24-paywall.png"
Swipe 540 1400 540 700 400; SS "25-paywall-scroll1.png"
Swipe 540 1400 540 700 400; SS "26-paywall-scroll2.png"
# Tap X to close paywall (top left or the X button)
Tap 80 200; Start-Sleep -Milliseconds 1000; SS "27-paywall-closed.png"

Write-Host "=== DONE PASS 2 ==="
