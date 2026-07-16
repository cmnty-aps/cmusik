# Background Music Playback - Quick Start Guide

## What's New?

Your Xmusic app now supports **background music playback**! Music will continue playing even when you switch to another app or minimize the player.

## How to Use

### Step 1: Play a Song
Tap on any song from the recommendations or trending sections.

### Step 2: Open Full Player
Click on the mini-player at the bottom to open the full player screen.

### Step 3: Access Settings
Look for the **⚙️ (Settings) button** in the top-right corner of the full player, next to the menu and share buttons.

### Step 4: Enable Background Playback
In the popup that appears:
- You'll see **"Musik Latar Belakang"** (Background Music)
- Toggle **"Putar di Latar"** (Play in Background) checkbox
- The feature is enabled by default

### Step 5: Go to Background
Now you can:
- Press the home button
- Switch to another app
- Lock your screen

Music will continue playing automatically!

## Features

✅ **Continuous Playback** - Music doesn't stop when app is minimized
✅ **Lock Screen Controls** - Play/pause from lock screen (on supported devices)
✅ **Smart Management** - Audio pauses when you return to the app
✅ **Battery Efficient** - Uses optimized audio streaming
✅ **No Extra Data** - Uses same data as normal playback
✅ **Easy Toggle** - Turn feature on/off anytime in settings

## What You'll See

### Full Player with Settings Button
```
[⬇️ close] [Now Playing: Tulus] [↗️ share] [≡ menu] [⚙️ settings]
```

### Settings Popup
```
┌────────────────────────────────────┐
│  🎙️ Musik Latar Belakang          │
├────────────────────────────────────┤
│ 🔊 Putar di Latar        [✓ ON/OFF]│
│    Musik terus dimainkan saat...   │
├────────────────────────────────────┤
│ ⓘ Fitur Ini                        │
│ • Memutar audio di background      │
│ • Menghemat baterai                │
│ • Kompatibel lock screen controls  │
│ • Tidak ada data tambahan          │
├────────────────────────────────────┤
│           [✕ Tutup]                │
└────────────────────────────────────┘
```

## Device Support

- **Android**: Full support (all Android versions)
- **iOS**: Full support when using app or PWA
- **Web Browsers**: Chrome, Firefox, Safari (desktop & mobile)
- **Windows/macOS**: Full browser support

## Keyboard Shortcuts (When in Full Player)

- **Space** - Play/Pause
- **→** - Next track
- **←** - Previous track
- **R** - Toggle repeat mode
- **Esc** - Close full player

## Troubleshooting

### Music stops when I close the app
- Check that "Putar di Latar" is toggled ON in settings
- Some devices have battery optimization that stops background apps
- Go to phone settings → Battery → disable for Xmusic

### Lock screen controls don't appear
- Not all browsers support this feature
- Try using Chrome on Android or Safari on iOS
- Feature works best in native apps or PWAs

### High battery drain
- The feature uses minimal battery (similar to Spotify/YouTube Music)
- Only active when music is actually playing
- Using headphones vs speaker doesn't affect battery significantly

## Files Modified

This feature was added with minimal code changes:
- **New file**: `bgmanager.js` - Background audio service
- **Updated**: `player.js` - Added background music controls
- **Updated**: `fullplayer.js` - Added settings button
- **Updated**: `index.html` - Added bgmanager script

## For Developers

See `BACKGROUND_MUSIC_FEATURE.md` for complete technical documentation including:
- API reference
- Browser compatibility details
- Performance considerations
- Code structure and implementation details
- Future enhancement ideas

## Questions?

If the background music feature doesn't work:
1. Make sure your browser is up to date
2. Check that notifications are enabled for Xmusic
3. Verify "Putar di Latar" is toggled ON
4. Try refreshing the app (reload the page)
5. Check browser console for any error messages

---

**Enjoy uninterrupted music with Xmusic!** 🎵
