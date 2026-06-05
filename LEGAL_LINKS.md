# Legal & Marketing URLs — ShiftSleep

All legal documents are published on https://oqapps.pro and ready to use in App Store Connect / Google Play Console.

## URLs to use in store listings

| Field | URL |
|-------|-----|
| Privacy Policy URL | https://oqapps.pro/legal/shiftsleep/privacy |
| Terms of Use / EULA URL | https://oqapps.pro/legal/shiftsleep/terms |
| Support URL | https://oqapps.pro/legal/shiftsleep/support |
| Account Deletion URL | https://oqapps.pro/legal/shiftsleep/delete-account |
| Marketing URL | https://oqapps.pro/products |

## Contact info for App Store Connect

- App Review contact email: support@oqapps.pro
- Marketing contact: support@oqapps.pro
- Privacy contact: privacy@oqapps.pro
- Trade name (publisher): OQapps

## In-app requirement

App Store requires an **in-app account-deletion option** for any app with sign-up. Implementation:

- Add a button in `Settings → Account → Delete account` that calls the appropriate API endpoint.
- Show a confirmation dialog warning the user that deletion is permanent.
- After successful deletion, sign the user out and show a confirmation screen.

## App Privacy questionnaire — App Store Connect

When filling out the **App Privacy** section in App Store Connect, declare data collection based on what ShiftSleep actually collects. Reference: see the live Privacy Policy at the URL above.

## History

- May 08, 2026 — Documents v1.0 generated and published.
- May 23, 2026 — Restored after 2026-05-21 sync-back incident (deleted by `git checkout .` via `sync-projects-to-mac.sh`).
