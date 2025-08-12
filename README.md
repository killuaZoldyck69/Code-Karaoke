# Error Sound Extension

A VS Code extension that plays an audio sound continuously when there are errors in your code, and stops when all errors are resolved.

## Features

- 🔊 Plays sound when code errors are detected
- 🔄 Loops continuously until errors are fixed
- ⏹️ Stops immediately when all errors are resolved
- 🎵 Supports both native system audio and web audio
- 🎛️ Audio control panel with volume control and mute
- 🔧 Configurable settings

## Installation

1. Copy this extension to your VS Code extensions folder
2. Add an `error.wav` file to the `media` folder
3. Reload VS Code
4. The extension will activate automatically

## Usage

The extension works automatically:

- When VS Code detects errors in your code, the sound starts playing
- The sound loops continuously until you fix all errors
- Once all errors are resolved, the sound stops immediately

## Commands

- `Error Sound: Toggle Audio Method` - Switch between native and web audio
- `Error Sound: Show Audio Panel` - Open the audio control panel

## Configuration

You can configure the extension in VS Code settings:

- `errorSound.enabled` - Enable/disable the extension
- `errorSound.volume` - Set audio volume (0.0 to 1.0)
- `errorSound.useWebAudio` - Use web audio instead of native audio

## Audio Methods

### Native Audio (Default)

- Uses system audio players (PowerShell on Windows, afplay on macOS, aplay on Linux)
- More efficient and lightweight
- May require additional audio packages on some Linux distributions

### Web Audio (Fallback)

- Uses VS Code's webview with HTML5 audio
- More reliable across different systems
- Includes visual audio control panel
- Works even if system audio players are not available

## Troubleshooting

If you encounter audio issues:

1. Make sure your `error.wav` file exists in the `media` folder
2. Try toggling the audio method using the command palette
3. Check the VS Code developer console for error messages
4. On Linux, you may need to install audio packages:
   ```bash
   sudo apt-get install alsa-utils
   # or
   sudo apt-get install pulseaudio-utils
   ```

## File Structure

```
your-extension/
├── src/
│   └── extension.ts
├── media/
│   └── error.wav          # Add your audio file here
├── package.json
├── tsconfig.json
├── .vscode/
│   ├── launch.json
│   └── tasks.json
└── README.md
```

## Development

1. Clone/download the extension files
2. Run `npm install` to install dependencies
3. Add your `error.wav` file to the `media` folder
4. Press `F5` to run the extension in a new Extension Development Host window
5. Create a file with syntax errors to test the functionality

## License

MIT License
