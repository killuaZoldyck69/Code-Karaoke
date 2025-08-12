# Code Karaoke - Error Sound Extension 🎵

A VS Code extension that plays different sounds based on your coding error count and celebrates when you fix them all! Turn your debugging experience into a musical journey.

## 🎯 Features

- **Dynamic Error Sounds**: Different audio alerts based on error severity
  - 1-2 errors: Light Error sound
  - 3-5 errors: Medium Error sound
  - 6-10 errors: Heavy Error sound
  - 11+ errors: Critical Error sound
- **Success Celebration**: Special sound when all errors are fixed! 🎉
- **Dual Audio Support**: Native system audio and web-based audio player
- **Visual Interface**: Interactive webview panel with volume controls
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Real-time Monitoring**: Automatic detection of error changes

## 🚀 Installation

### Method 1: Install from VSIX (Recommended)

1. **Download** the latest `.vsix` file from [Releases](https://github.com/killuaZoldyck69/Code-Karaoke/releases)

2. **Install via VS Code UI**:

   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click the "..." menu → "Install from VSIX..."
   - Select the downloaded `.vsix` file
   - Restart VS Code

3. **Install via Command Line**:
   ```bash
   code --install-extension code-karaoke-1.0.0.vsix
   ```

### Method 2: Manual Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/killuaZoldyck69/Code-Karaoke.git
   cd Code-Karaoke
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile TypeScript:

   ```bash
   npm run compile
   ```

4. Package the extension:

   ```bash
   npm install -g vsce
   vsce package
   ```

5. Install the generated `.vsix` file

## 📁 Required Files Structure

Ensure your extension has the following structure:

```
Code-Karaoke/
├── src/
│   └── extension.ts
├── media/                    # 🔊 Sound files directory
│   ├── error.wav            # Default error sound
│   ├── success.wav          # Success celebration sound
│   ├── cid-acp-mc.wav       # Light error sound (1-2 errors)
│   ├── yamete-kudasai_gxXaCWn.wav  # Medium error sound (3-5 errors)
│   ├── linus-torrvalds.wav  # Heavy error sound (6-10 errors)
│   └── bengali-gaali.wav    # Critical error sound (11+ errors)
├── out/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## 🎵 Sound Files Setup

### Required Sound Files

Place these audio files in the `media/` folder:

| File Name                    | Purpose                | Error Count             |
| ---------------------------- | ---------------------- | ----------------------- |
| `error.wav`                  | Default fallback sound | Any                     |
| `success.wav`                | Success celebration    | 0 (after having errors) |
| `cid-acp-mc.wav`             | Light error alert      | 1-2 errors              |
| `yamete-kudasai_gxXaCWn.wav` | Medium error alert     | 3-5 errors              |
| `linus-torrvalds.wav`        | Heavy error alert      | 6-10 errors             |
| `bengali-gaali.wav`          | Critical error alert   | 11+ errors              |

### Supported Audio Formats

- `.wav` (Recommended)
- `.mp3`
- `.ogg`

### Adding Custom Sounds

1. Replace any sound file in the `media/` folder with your custom audio
2. Keep the same filename for automatic recognition
3. Restart VS Code to apply changes

## 🎮 Usage

### Automatic Operation

The extension automatically:

- Monitors your code for errors
- Plays appropriate sounds based on error count
- Celebrates when you fix all errors

### Manual Commands

Access these commands via Command Palette (Ctrl+Shift+P):

| Command                            | Description                         |
| ---------------------------------- | ----------------------------------- |
| `Error Sound: Toggle Audio Method` | Switch between native and web audio |
| `Error Sound: Show Audio Panel`    | Open the visual audio control panel |
| `Error Sound: Test Audio`          | Test current error sound            |
| `Error Sound: Test Success`        | Test success celebration sound      |

### Audio Control Panel

The interactive webview panel provides:

- 🔊 Volume control slider
- 🔇 Mute/unmute toggle
- 🎵 Test sound button
- 📊 Real-time error count display
- ⚙️ Sound configuration overview

## ⚙️ Configuration

### Audio Methods

**Native Audio (Default)**:

- Plays immediately without user interaction
- Uses system audio players
- Better for automatic error alerts

**Web Audio**:

- Browser-based audio player
- Requires initial user interaction
- Visual interface with controls
- Fallback option if native fails

### Platform-Specific Audio Players

| Platform | Primary Method         | Fallback             |
| -------- | ---------------------- | -------------------- |
| Windows  | PowerShell SoundPlayer | Windows Media Player |
| macOS    | afplay                 | Web Audio            |
| Linux    | aplay                  | Web Audio            |

## 🔧 Troubleshooting

### No Sound Playing

1. **Check sound files**: Ensure all required audio files are in `media/` folder
2. **Try different audio method**: Use `Toggle Audio Method` command
3. **Check system volume**: Ensure system audio is not muted
4. **Restart VS Code**: Reload the extension
5. **Test manually**: Use `Test Audio` command

### Windows-Specific Issues

If Windows Media Player opens but doesn't play:

- The extension automatically uses PowerShell SoundPlayer
- Ensure audio files are not corrupted
- Check Windows audio permissions

### Extension Not Activating

1. **Check installation**: Go to Extensions tab, search for "Error Sound"
2. **Reload window**: Ctrl+Shift+P → "Developer: Reload Window"
3. **Check for errors**: View → Output → Select "Error Sound Extension"

### Missing Sound Files Warning

If you see "Missing sound files" warning:

1. Download the complete extension package
2. Ensure all sound files are in the `media/` folder
3. Restart VS Code

## 🛠️ Development

### Prerequisites

- Node.js (v14+)
- VS Code
- TypeScript

### Setup Development Environment

1. Clone and install:

   ```bash
   git clone https://github.com/killuaZoldyck69/Code-Karaoke.git
   cd Code-Karaoke
   npm install
   ```

2. Compile in watch mode:

   ```bash
   npm run watch
   ```

3. Test in VS Code:
   - Press F5 to launch Extension Development Host
   - Test your changes in the new window

### Building for Distribution

```bash
# Compile TypeScript
npm run compile

# Package extension
vsce package

# Publish to marketplace (optional)
vsce publish
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/killuaZoldyck69/Code-Karaoke/issues).

## 📞 Support

- 📧 Create an issue on GitHub
- 🌟 Star the repository if you find it useful
- 🔄 Share with fellow developers

## 🎉 Changelog

### v1.0.0

- Initial release
- Dynamic error sound system
- Success celebration sounds
- Cross-platform audio support
- Interactive webview panel
- Native and web audio methods

---

**Happy Coding! 🎵** Turn your debugging sessions into a musical experience!
