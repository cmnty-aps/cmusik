# Background Music Playback Feature

## Overview

Xmusic now supports **continuous background music playback**, allowing users to listen to music even when the app is minimized or in the background. This feature intelligently manages audio playback and provides users with control over background functionality.

## Features

### 1. Continuous Playback
- Music continues playing when the app is sent to the background
- Audio automatically pauses when returning to the app foreground
- Seamless transition between foreground and background playback

### 2. Background Audio Manager (`bgmanager.js`)
A new service (`BackgroundAudioService`) handles:
- **Wake Lock Management**: Requests screen wake lock when playing in background
- **Media Session Integration**: Provides lock screen controls for play/pause/next/previous
- **Audio State Preservation**: Saves playback state for recovery
- **Configuration Persistence**: Stores user preferences in localStorage

### 3. Settings Control
Users can toggle background music playback via:
1. **Open Full Player** (click on mini-player or song)
2. **Tap Settings Button** (⚙️ gear icon in top-right)
3. **Toggle "Putar di Latar"** (Play in Background)

### 4. Smart Audio Handling
- **Fallback System**: Uses silent audio element to keep app audio context active
- **Visibility Detection**: Monitors when app goes to background/foreground
- **Media Session API**: Integrates with system controls (Android/iOS)
- **Battery Optimization**: Uses efficient audio streaming

## Technical Implementation

### Files Modified/Created

#### 1. **bgmanager.js** (NEW)
Complete background audio service with:
```javascript
BackgroundAudioService
├── init() - Initialize event listeners
├── setupWakeLock() - Check for Wake Lock API support
├── onAppBackground() - Handle background mode
├── onAppForeground() - Handle foreground restoration
├── updateMediaSession() - Update lock screen controls
├── getConfig() / setConfig() - Manage preferences
└── Helper methods for state preservation
```

#### 2. **player.js** (MODIFIED)
- Added `BGMusicManager` object with `init()`, `playBG()`, `pauseBG()`, `setBGEnabled()`
- Added `showBGSettings()` function for settings UI
- Added `BGSettingsUpdater()` for dynamic UI updates
- Updated visibility change handler for smarter background control
- Updated `UB()` (UI update function) to manage BG audio

#### 3. **fullplayer.js** (MODIFIED)
- Added new Settings button with gear icon
- Integrated `showBGSettings()` onclick handler
- Added tooltip: "Pengaturan BG" (Background Settings)

#### 4. **index.html** (MODIFIED)
- Added `<script src="/xymusic.vercel.app/bgmanager.js"></script>` before other scripts
- Ensures background service initializes early

### State Management

#### Global State (`S` object)
```javascript
S.bgMusicEnabled = true  // Toggle for feature
S.bgAudioElement = null  // Reference to silent audio element
```

#### Configuration Storage
```javascript
BgAudioConfig {
  bgEnabled: true,           // Feature toggle
  screenOffPlayback: true,   // Wake lock for screen off
  qualityMode: 'balanced',   // For future use
  dataUsageMode: 'normal'    // For future use
}
```

### Browser APIs Used

1. **Page Visibility API**
   - `document.addEventListener('visibilitychange', ...)`
   - Detects when app goes to background

2. **Screen Wake Lock API**
   - `navigator.wakeLock.request('screen')`
   - Prevents screen from sleeping during playback

3. **Media Session API**
   - `navigator.mediaSession.metadata`
   - `navigator.mediaSession.setActionHandler()`
   - Provides lock screen controls

4. **localStorage / sessionStorage**
   - Persist settings and playback state
   - Recovery on app restart

## User Experience

### How to Use

1. **Open a Song**
   - Tap on any song in recommendations or trending
   - Mini-player appears at bottom

2. **Open Full Player**
   - Tap on mini-player or song cover
   - Full player screen opens with controls

3. **Access Settings**
   - Look for ⚙️ (Settings) button in top-right
   - Tap to open "Musik Latar Belakang" popup

4. **Enable/Disable Background Playback**
   - Checkbox next to "Putar di Latar"
   - Changes take effect immediately

5. **Go to Background**
   - Press home button or open another app
   - Music continues playing automatically
   - Audio button shows in status bar on compatible devices

### Lock Screen Controls (When Supported)

When playing in background on supported devices:
- **Tap song notification** to resume full player
- **Play/Pause button** in lock screen
- **Next/Previous track** buttons
- **Song metadata** displayed with cover art

## Technical Details

### Audio Flow

```
YouTube Player (S.yp)
    ↓
    ├─→ Playing foreground? → UI updates normally
    ↓
    App goes to background
    ↓
    BGMusicManager.playBG()
    ├─→ Play silent audio (keeps audio context)
    ├─→ Request wake lock (if enabled)
    └─→ Update Media Session (lock screen controls)
    ↓
    App returns to foreground
    ↓
    BGMusicManager.pauseBG()
    ├─→ Pause silent audio
    ├─→ Release wake lock
    └─→ YouTube player continues normally
```

### Settings Persistence

User preferences stored in `localStorage['xmusic_bg_config']`:
```json
{
  "bgEnabled": true,
  "screenOffPlayback": true,
  "qualityMode": "balanced",
  "dataUsageMode": "normal"
}
```

Loaded automatically on app startup.

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | iOS Safari |
|---------|--------|---------|--------|-----------|
| Visibility API | ✅ | ✅ | ✅ | ✅ |
| Media Session | ✅ (v73+) | ❌ | ❌ | ✅ (iOS 15+) |
| Wake Lock | ✅ (v84+) | ❌ | ❌ | ✅ (PWA) |
| Background Playback | ✅ | ✅ | ✅ | ✅* |

*iOS requires PWA or app context to play audio in background

## Performance Considerations

- **Battery Impact**: Minimal - only requests wake lock when enabled
- **Data Usage**: No increase - uses same streaming as foreground playback
- **Memory**: Minimal - small configuration object cached
- **CPU**: Negligible - event-driven, no polling

## Debugging

Enable console logging by setting in browser console:
```javascript
// Already included - watch for logs like:
// [v0] App hidden - background mode active
// [v0] Wake lock acquired
// [v0] BackgroundAudioService initialized
```

## Future Enhancements

Potential improvements for future versions:
1. **Quality Selector** - Adjust audio quality for data/battery savings
2. **Sleep Timer** - Auto-pause after set duration
3. **Smart Resume** - Remember playback state across app restarts
4. **Playlist Queue** - Background playback of full playlists
5. **Notification Controls** - Skip, like, add to playlist from notification

## Troubleshooting

### Background Music Not Playing

1. **Check Settings**
   - Tap ⚙️ button → "Putar di Latar" should be checked

2. **Device Restrictions**
   - Some devices require app-specific battery settings
   - Check Android battery optimization settings

3. **Audio Permissions**
   - Ensure app has audio playback permission
   - Check browser audio context policy

### Lock Screen Controls Not Appearing

1. **Browser Support**
   - Media Session API not available in all browsers
   - Try Chrome on Android or Safari on iOS

2. **Notification Settings**
   - Enable notifications for Xmusic
   - Check notification priority settings

## Code Structure

```
xymusic.vercel.app/
├── bgmanager.js              ← NEW: Background audio service
├── player.js                 ← MODIFIED: Added BGMusicManager
├── fullplayer.js            ← MODIFIED: Added settings button
├── app.js
├── home.js
├── search.js
├── miniplayer.js
└── artist.js

index.html                    ← MODIFIED: Added bgmanager script
```

## API Reference

### BGMusicManager (in player.js)

```javascript
// Initialize background audio service
BGMusicManager.init()

// Start background audio playback
BGMusicManager.playBG()

// Stop background audio playback
BGMusicManager.pauseBG()

// Enable/disable feature
BGMusicManager.setBGEnabled(true|false)
```

### BackgroundAudioService (in bgmanager.js)

```javascript
// Initialize service
BackgroundAudioService.init()

// Get current configuration
BackgroundAudioService.getConfig()

// Update configuration
BackgroundAudioService.setConfig({
  bgEnabled: true,
  screenOffPlayback: true
})

// Request device wake lock
await BackgroundAudioService.requestWakeLock()

// Update media session metadata
BackgroundAudioService.updateMediaSession()
```

## Summary

The background music feature provides seamless audio playback when the Xmusic app is minimized or in the background. It intelligently manages system resources, integrates with device lock screen controls, and gives users full control through an intuitive settings interface. The implementation uses modern web APIs while maintaining compatibility with older browsers through graceful degradation.
