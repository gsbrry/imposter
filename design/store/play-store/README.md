# Play Store listing images: Impostr

Upload these in Google Play Console > Grow users > Store presence > Main store listing.

| Folder | Play Console field | Files | Size |
|---|---|---|---|
| `0-app-icon` | App icon | `app-icon-512.png` | 512 x 512, 32-bit PNG |
| `0-feature-graphic` | Feature graphic | `feature-graphic-1024x500.png` | 1024 x 500, no transparency |
| `1-phone` | Phone screenshots | `phone-1.png` to `phone-6.png` | 1080 x 1920 (9:16) |
| `2-tablet-7-inch` | 7-inch tablet screenshots | `tablet-7-inch-1.png` to `-6.png` | 1260 x 2240 (9:16) |
| `3-tablet-10-inch` | 10-inch tablet screenshots | `tablet-10-inch-1.png` to `-6.png` | 1440 x 2560 (9:16) |

Upload the screenshots in number order. The captions are:

1. One word. One liar.
2. 9 word packs
3. Pass the phone
4. Give one-word clues
5. Vote out the imposter
6. No internet needed

## Re-rendering

Source: `design/store/store.html`. Render with Playwright and save as PNG
without transparency:

| Elements | deviceScaleFactor |
|---|---|
| `#shot-1` to `#shot-6` | 3 |
| `#tab7-1` to `#tab7-6` | 3.5 |
| `#tab10-1` to `#tab10-6` | 4 |
| `#feature` | 1 |

## Notes

- All screenshots are PNG without transparency, under 8 MB each, and every side is between 320 and 3840 px.
- The screens show the new Honey and Cream design. After the app is rebuilt, replace them with real captures at the same sizes so the listing matches the app.
- On tablets, the app should show a centred column (about 460 to 520 dp wide) on the cream background, as in the tablet screenshots.
- Check the latest Play Console requirements before upload, as Google can change them.
