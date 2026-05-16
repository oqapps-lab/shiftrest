# App Store Screenshots

## Pack A — Before / After (recommended for v1.0 launch)

Source spec: `aso/screenshots/pack-A-before-after/frames.md`.

6 frames at 1290×2796 (iPhone 6.7" — Apple's required minimum size). Apple's
algorithm down-samples for 6.5" / 5.5" automatically.

### Files

| Frame | Headline | Caption | Phase |
|---|---|---|---|
| `frame-1.png` | Red score. Again. | Sleep at 10am isn't broken. | punishment |
| `frame-2.png` | Day 1 of 3 nights. | 12-hour shift. No plan. | punishment |
| `frame-3.png` | Your plan is ready. | Sleep window 09:30 – 14:30. | intervention (HERO) |
| `frame-4.png` | Backed by AASM science. | Circadian PRC algorithm. | intervention (trust) |
| `frame-5.png` | Tuned to your shift. | Melatonin by chronotype. | intervention (personal) |
| `frame-6.png` | Rest catches up. | Day 7 transition complete. | outcome |

### Status: placeholder pack v1

These frames were generated programmatically with Python PIL (no Midjourney /
SDXL access on the VPS). They:

- ✅ Lock the layout (gradient phases, headline/caption position, phone-frame
  outline, in-phone content blocks)
- ✅ Lock the copy (headlines + captions verbatim from
  `aso/screenshots/pack-A-before-after/frames.md`)
- ✅ Use the brand fonts shipped with the app
  (Plus Jakarta Sans ExtraLight 200 for headlines, Manrope Light 300 for
  captions)
- ✅ Honour the brand palette (sage, cream, mint, amber, plum)
- ⚠️ Are not pixel-perfect Figma quality — designer rebuilds in Figma using
  these as the layout / content reference

### Why pack A (not B or C)

`screenshot-variants-playbook §2` Pattern Dominance table for **Sleep / Recovery**
explicitly lists Pattern E (Before / After) as the top pick. ShiftRest is
fundamentally a transformation arc — the punishment frame (red score on a
competitor) → the intervention (a sleep plan tuned to the rotation) → the
outcome (a steady week of completed sleep events) is exactly the canonical
shape this pattern was designed for.

Pack B (testimonial) and Pack C (big-claim) are kept on disk in
`aso/screenshots/pack-B-testimonial/` and `aso/screenshots/pack-C-big-claim/`
as PPO test alternatives — run them as treatments after launch, with Pack A
as the control. Apple PPO allows 1 control + up to 3 treatments.

### TODO before submission

- [ ] Designer rebuilds frames in Figma (~ 2-3 days of work)
- [ ] Hand-tune typography (kerning, optical sizing) — Plus Jakarta Sans 88pt
      will need micro-adjustments at 1290 width
- [ ] Inject real app screenshots for frames 3-6 (currently in-screen content
      is a faithful mockup but not a live capture). When the app is at the
      state we want to show, take a sim screenshot and composite into the
      phone-frame mockup.
- [ ] Add 6.5" (1242×2688) renders alongside the 6.7" pack — Apple lets you
      upload one pack and the App Store renders both, but cleaner submissions
      ship both sizes
- [ ] PPO setup: configure Apple PPO test in ASC with pack A as control,
      pack B + pack C as treatments

### How to regenerate

```bash
# Re-runs the placeholder generator. Edits in /tmp/render_screenshots.py.
python3 /tmp/render_screenshots.py
```

The generator reads the frame spec inline (not from `frames.md` — keeps it
self-contained). Update copy or layout there, re-run, commit.
