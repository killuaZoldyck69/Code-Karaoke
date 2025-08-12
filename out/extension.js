"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// ===== FILE: src/extension.ts =====
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
let playingProcess = null;
let currentErrorCount = 0;
let previousErrorCount = 0; // Track previous error count
let audioPanel = null;
let useWebAudio = false;
let currentSoundPath = "";
let isPlayingSuccessSound = false; // Flag to prevent interruption during success sound
const SOUND_CONFIG = [
    {
        minErrors: 1,
        maxErrors: 2,
        soundFile: "cid-acp-mc.wav",
        description: "Light Error",
    },
    {
        minErrors: 3,
        maxErrors: 5,
        soundFile: "yamete-kudasai_gxXaCWn.wav",
        description: "Medium Error",
    },
    {
        minErrors: 6,
        maxErrors: 10,
        soundFile: "linus-torrvalds.wav",
        description: "Heavy Error",
    },
    {
        minErrors: 11,
        soundFile: "bengali-gaali.wav",
        description: "Critical Error",
    },
];
// Success sound configuration
const SUCCESS_SOUND = {
    soundFile: "shabash-beta.wav",
    description: "Success - Errors Fixed!",
};
// Get appropriate sound based on error count
const getSoundForErrorCount = (errorCount, extensionPath) => {
    for (const config of SOUND_CONFIG) {
        if (errorCount >= config.minErrors &&
            (!config.maxErrors || errorCount <= config.maxErrors)) {
            const soundPath = path.join(extensionPath, "media", config.soundFile);
            // Check if specific sound file exists, fallback to default
            if (fs.existsSync(soundPath)) {
                return { path: soundPath, description: config.description };
            }
        }
    }
    // Fallback to default sound
    const defaultPath = path.join(extensionPath, "media", "error.wav");
    return { path: defaultPath, description: "Default Error" };
};
// Get success sound path
const getSuccessSound = (extensionPath) => {
    const successPath = path.join(extensionPath, "media", SUCCESS_SOUND.soundFile);
    if (fs.existsSync(successPath)) {
        return { path: successPath, description: SUCCESS_SOUND.description };
    }
    // Fallback to a generic success sound or create a simple beep
    const defaultSuccessPath = path.join(extensionPath, "media", "success-default.wav");
    return { path: defaultSuccessPath, description: "Default Success" };
};
// Play success sound once (non-looping)
const playSuccessSound = (soundPath, description) => {
    console.log("Playing success sound:", soundPath);
    isPlayingSuccessSound = true;
    if (useWebAudio) {
        playSuccessSoundWeb(soundPath, description);
    }
    else {
        playSuccessSoundNative(soundPath, description);
    }
};
// Native success sound player (plays once)
const playSuccessSoundNative = (soundPath, description) => {
    console.log("Starting to play native success sound:", soundPath);
    let audioProcess;
    try {
        if (process.platform === "win32") {
            try {
                audioProcess = (0, child_process_1.spawn)("cmd", ["/c", `start /min wmplayer.exe "${soundPath}"`], {
                    windowsHide: true,
                    shell: true,
                });
                console.log("Using Windows Media Player for success sound");
            }
            catch (e) {
                console.log("Windows Media Player failed, trying PowerShell method");
                audioProcess = (0, child_process_1.spawn)("powershell", [
                    "-WindowStyle",
                    "Hidden",
                    "-Command",
                    `$sound = New-Object System.Media.SoundPlayer("${soundPath}"); $sound.PlaySync()`,
                ], { windowsHide: true });
                console.log("Using PowerShell SoundPlayer for success sound");
            }
        }
        else if (process.platform === "darwin") {
            audioProcess = (0, child_process_1.spawn)("afplay", [soundPath]);
        }
        else {
            audioProcess = (0, child_process_1.spawn)("aplay", [soundPath]);
        }
        audioProcess.on("error", (err) => {
            console.error("Error playing native success sound:", err);
            isPlayingSuccessSound = false;
        });
        audioProcess.on("close", (code) => {
            console.log(`Success sound finished playing with code: ${code}`);
            isPlayingSuccessSound = false;
            // Show success notification
            vscode.window.showInformationMessage("🎉 Great job! All errors fixed!");
        });
        audioProcess.on("spawn", () => {
            console.log("Success audio process spawned successfully");
        });
    }
    catch (error) {
        console.error("Failed to start native success audio:", error);
        isPlayingSuccessSound = false;
    }
};
// Web success sound player
const playSuccessSoundWeb = (soundPath, description) => {
    if (!audioPanel) {
        const context = getCurrentContext();
        if (context) {
            createAudioWebview(context, soundPath, 0, description);
            setTimeout(() => {
                if (audioPanel) {
                    audioPanel.webview.postMessage({
                        command: "playSuccess",
                        soundUri: audioPanel.webview
                            .asWebviewUri(vscode.Uri.file(soundPath))
                            .toString(),
                        soundDescription: description,
                    });
                }
            }, 1000);
        }
    }
    else {
        // Update existing webview for success sound
        const soundUri = audioPanel.webview.asWebviewUri(vscode.Uri.file(soundPath));
        audioPanel.webview.postMessage({
            command: "playSuccess",
            soundUri: soundUri.toString(),
            soundDescription: description,
        });
    }
    // Auto-close after success sound
    setTimeout(() => {
        isPlayingSuccessSound = false;
        vscode.window.showInformationMessage("🎉 Great job! All errors fixed!");
    }, 4000);
};
// Native audio player function
const playNativeSound = (soundPath) => {
    console.log("Starting to play native sound:", soundPath);
    let audioProcess;
    try {
        if (process.platform === "win32") {
            // Windows: Try multiple methods
            try {
                audioProcess = (0, child_process_1.spawn)("cmd", ["/c", `start /min wmplayer.exe "${soundPath}"`], {
                    windowsHide: true,
                    shell: true,
                });
                console.log("Using Windows Media Player");
            }
            catch (e) {
                console.log("Windows Media Player failed, trying PowerShell method");
                audioProcess = (0, child_process_1.spawn)("powershell", [
                    "-WindowStyle",
                    "Hidden",
                    "-Command",
                    `$sound = New-Object System.Media.SoundPlayer("${soundPath}"); $sound.PlaySync()`,
                ], { windowsHide: true });
                console.log("Using PowerShell SoundPlayer");
            }
        }
        else if (process.platform === "darwin") {
            // macOS: Use afplay
            audioProcess = (0, child_process_1.spawn)("afplay", [soundPath]);
        }
        else {
            // Linux: Try aplay first, then paplay as fallback
            audioProcess = (0, child_process_1.spawn)("aplay", [soundPath]);
        }
        audioProcess.on("error", (err) => {
            console.error("Error playing native sound:", err);
            console.log("Falling back to web audio method");
            useWebAudio = true;
            if (currentErrorCount > 0) {
                playWebAudio(soundPath);
            }
        });
        audioProcess.on("close", (code) => {
            console.log(`Native sound finished playing with code: ${code}`);
            playingProcess = null;
            if (currentErrorCount > 0 && !useWebAudio && !isPlayingSuccessSound) {
                setTimeout(() => {
                    if (currentErrorCount > 0 && !isPlayingSuccessSound) {
                        playingProcess = playNativeSound(soundPath);
                    }
                }, 200);
            }
        });
        audioProcess.on("spawn", () => {
            console.log("Audio process spawned successfully");
        });
        return audioProcess;
    }
    catch (error) {
        console.error("Failed to start native audio:", error);
        console.log("Switching to web audio method");
        useWebAudio = true;
        if (currentErrorCount > 0) {
            playWebAudio(soundPath);
        }
        return null;
    }
};
// Web audio player function
const createAudioWebview = (context, soundPath, errorCount, soundDescription) => {
    if (audioPanel) {
        audioPanel.dispose();
    }
    audioPanel = vscode.window.createWebviewPanel("errorSoundPlayer", "Error Sound Player", { viewColumn: vscode.ViewColumn.Active, preserveFocus: true }, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.dirname(soundPath))],
        retainContextWhenHidden: true,
    });
    const soundUri = audioPanel.webview.asWebviewUri(vscode.Uri.file(soundPath));
    audioPanel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Sound Player</title>
        <style>
            body { 
                margin: 0;
                padding: 20px;
                background-color: #1e1e1e;
                color: #cccccc;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .success-body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .status {
                font-size: 18px;
                margin-bottom: 20px;
                text-align: center;
            }
            .error-info {
                background-color: #2d2d2d;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #f48771;
            }
            .success-info {
                background-color: #2d4a2d;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #4caf50;
                text-align: center;
            }
            .error-count {
                font-size: 24px;
                font-weight: bold;
                color: #f48771;
                margin-bottom: 5px;
            }
            .success-count {
                font-size: 32px;
                font-weight: bold;
                color: #4caf50;
                margin-bottom: 10px;
                animation: bounce 2s infinite;
            }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-20px);
                }
                60% {
                    transform: translateY(-10px);
                }
            }
            .sound-type {
                font-size: 16px;
                color: #569cd6;
            }
            .success-sound-type {
                font-size: 18px;
                color: #4caf50;
                font-weight: bold;
            }
            .controls {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            button {
                padding: 10px 20px;
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            button:hover {
                background-color: #005a9e;
            }
            button:disabled {
                background-color: #555;
                cursor: not-allowed;
            }
            .volume-control {
                margin: 20px 0;
            }
            input[type="range"] {
                width: 200px;
                margin: 0 10px;
            }
            .sound-config {
                background-color: #252526;
                padding: 10px;
                border-radius: 4px;
                margin-top: 20px;
                font-size: 12px;
                max-width: 400px;
            }
            .config-item {
                margin: 5px 0;
                padding: 3px 0;
                border-bottom: 1px solid #333;
            }
            .config-item:last-child {
                border-bottom: none;
            }
        </style>
    </head>
    <body>
        <div class="status" id="status">🔇 Ready to play error sound</div>
        
        <div class="error-info" id="errorInfo">
            <div class="error-count" id="errorCount">${errorCount} Error${errorCount !== 1 ? "s" : ""}</div>
            <div class="sound-type" id="soundType">${soundDescription}</div>
        </div>
        
        <audio id="errorSound" preload="auto" loop>
            <source src="${soundUri}" type="audio/wav">
            <source src="${soundUri}" type="audio/mpeg">
            <source src="${soundUri}" type="audio/ogg">
        </audio>
        
        <div class="volume-control">
            <label>Volume: </label>
            <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.7">
            <span id="volumeValue">70%</span>
        </div>
        
        <div class="controls">
            <button id="testButton">Test Sound</button>
            <button id="muteButton">Mute</button>
        </div>

        <div class="sound-config">
            <strong>Sound Configuration:</strong>
            <div class="config-item">1-2 errors: Light Error</div>
            <div class="config-item">3-5 errors: Medium Error</div>
            <div class="config-item">6-10 errors: Heavy Error</div>
            <div class="config-item">11+ errors: Critical Error</div>
            <div class="config-item">0 errors (from >0): Success Sound! 🎉</div>
        </div>

        <script>
            const audio = document.getElementById('errorSound');
            const status = document.getElementById('status');
            const testButton = document.getElementById('testButton');
            const muteButton = document.getElementById('muteButton');
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');
            const errorCount = document.getElementById('errorCount');
            const soundType = document.getElementById('soundType');
            const errorInfo = document.getElementById('errorInfo');
            
            let shouldPlay = false;
            let isMuted = false;
            let isSuccessMode = false;
            
            // Set initial volume
            audio.volume = 0.7;
            
            // Volume control
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                audio.volume = isMuted ? 0 : volume;
                volumeValue.textContent = Math.round(volume * 100) + '%';
            });
            
            // Test button
            testButton.addEventListener('click', async () => {
                if (!audioInitialized) {
                    await initializeAudio();
                }
                if (!isMuted) {
                    audio.currentTime = 0;
                    audio.play().catch(e => console.error('Test play failed:', e));
                }
            });
            
            // Mute button
            muteButton.addEventListener('click', () => {
                isMuted = !isMuted;
                audio.volume = isMuted ? 0 : parseFloat(volumeSlider.value);
                muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
                
                if (isMuted && shouldPlay) {
                    status.textContent = isSuccessMode ? '🔇 Success sound muted' : '🔇 Error detected but muted';
                } else if (shouldPlay) {
                    status.textContent = isSuccessMode ? '🎉 Playing success sound!' : '🔊 Playing error sound...';
                }
            });

            let audioInitialized = false;
            
            const initializeAudio = async () => {
                if (!audioInitialized) {
                    try {
                        audio.load();
                        audio.currentTime = 0;
                        
                        audio.volume = 0;
                        await audio.play();
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = isMuted ? 0 : parseFloat(volumeSlider.value);
                        
                        audioInitialized = true;
                        console.log('Audio initialized successfully');
                    } catch (e) {
                        console.log('Auto-initialization failed, will initialize on first user interaction:', e);
                    }
                }
            };

            window.addEventListener('load', initializeAudio);
            document.addEventListener('click', initializeAudio, { once: true });
            
            // Handle messages from extension
            window.addEventListener('message', async event => {
                const message = event.data;
                if (message.command === 'play') {
                    shouldPlay = true;
                    isSuccessMode = false;
                    status.textContent = isMuted ? '🔇 Error detected but muted' : '🔊 Playing error sound...';
                    
                    if (!isMuted) {
                        if (!audioInitialized) {
                            await initializeAudio();
                        }
                        
                        audio.loop = true;
                        audio.currentTime = 0;
                        audio.play().catch(e => {
                            console.error('Play failed:', e);
                            status.textContent = '❌ Failed to play sound';
                        });
                    }
                } else if (message.command === 'playSuccess') {
                    shouldPlay = true;
                    isSuccessMode = true;
                    
                    // Update UI for success mode
                    document.body.className = 'success-body';
                    errorInfo.className = 'success-info';
                    errorCount.className = 'success-count';
                    errorCount.textContent = '🎉 All Errors Fixed! 🎉';
                    soundType.className = 'success-sound-type';
                    soundType.textContent = message.soundDescription || 'Success!';
                    
                    status.textContent = isMuted ? '🔇 Success sound muted' : '🎉 Playing success sound!';
                    
                    if (!isMuted) {
                        if (!audioInitialized) {
                            await initializeAudio();
                        }
                        
                        // Update audio source for success sound
                        const { soundUri } = message;
                        audio.src = soundUri;
                        audio.load();
                        audio.loop = false; // Don't loop success sound
                        
                        setTimeout(() => {
                            audio.currentTime = 0;
                            audio.play().catch(e => {
                                console.error('Success play failed:', e);
                                status.textContent = '❌ Failed to play success sound';
                            });
                        }, 100);
                    }
                    
                } else if (message.command === 'stop') {
                    shouldPlay = false;
                    isSuccessMode = false;
                    status.textContent = '✅ No errors detected';
                    audio.pause();
                    audio.currentTime = 0;
                    audio.loop = true; // Reset to looping for error sounds
                    
                    // Reset UI back to error mode
                    document.body.className = '';
                    errorInfo.className = 'error-info';
                    errorCount.className = 'error-count';
                    soundType.className = 'sound-type';
                    
                } else if (message.command === 'updateSound') {
                    // Update the audio source and error info
                    const { soundUri: newSoundUri, errorCount: newErrorCount, soundDescription } = message;
                    isSuccessMode = false;
                    audio.src = newSoundUri;
                    audio.loop = true; // Error sounds should loop
                    
                    // Reset UI back to error mode
                    document.body.className = '';
                    errorInfo.className = 'error-info';
                    errorCount.className = 'error-count';
                    soundType.className = 'sound-type';
                    
                    errorCount.textContent = newErrorCount + ' Error' + (newErrorCount !== 1 ? 's' : '');
                    soundType.textContent = soundDescription;
                    
                    if (!audioInitialized) {
                        await initializeAudio();
                    }
                } else if (message.command === 'initialize') {
                    await initializeAudio();
                }
            });

            // Handle audio events
            audio.addEventListener('ended', () => {
                if (shouldPlay && !isMuted && !isSuccessMode) {
                    // Only loop if it's not a success sound
                    audio.currentTime = 0;
                    audio.play().catch(e => {
                        console.error('Replay failed:', e);
                        status.textContent = '❌ Failed to replay sound';
                    });
                } else if (isSuccessMode) {
                    // Success sound finished, show completion message
                    status.textContent = '🎉 Success sound completed!';
                    shouldPlay = false;
                    
                    // Auto-close success panel after a short delay
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                }
            });

            audio.addEventListener('canplay', () => {
                console.log('Audio can play');
                if (!isSuccessMode) {
                    status.textContent = '✅ Audio loaded successfully';
                }
            });

            audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                status.textContent = '❌ Audio load error';
            });
        </script>
    </body>
    </html>
  `;
    audioPanel.onDidDispose(() => {
        audioPanel = null;
        console.log("Audio webview disposed");
    });
    setTimeout(() => {
        if (audioPanel) {
            audioPanel.webview.postMessage({ command: "initialize" });
        }
    }, 1000);
    return audioPanel;
};
const playWebAudio = (soundPath) => {
    const context = getCurrentContext();
    if (!context)
        return;
    const soundInfo = getSoundForErrorCount(currentErrorCount, context.extensionPath);
    if (!audioPanel) {
        createAudioWebview(context, soundPath, currentErrorCount, soundInfo.description);
        setTimeout(() => {
            if (audioPanel && currentErrorCount > 0) {
                audioPanel.webview.postMessage({ command: "initialize" });
                setTimeout(() => {
                    if (audioPanel && currentErrorCount > 0) {
                        audioPanel.webview.postMessage({ command: "play" });
                    }
                }, 500);
            }
        }, 1000);
    }
    else {
        // Update existing webview with new sound info
        const soundUri = audioPanel.webview.asWebviewUri(vscode.Uri.file(soundPath));
        audioPanel.webview.postMessage({
            command: "updateSound",
            soundUri: soundUri.toString(),
            errorCount: currentErrorCount,
            soundDescription: soundInfo.description,
        });
        setTimeout(() => {
            if (audioPanel) {
                audioPanel.webview.postMessage({ command: "play" });
            }
        }, 100);
    }
};
const stopSound = () => {
    if (playingProcess && !useWebAudio) {
        console.log("Stopping native sound...");
        playingProcess.kill();
        playingProcess = null;
    }
    if (audioPanel && useWebAudio && !isPlayingSuccessSound) {
        console.log("Stopping web audio...");
        audioPanel.webview.postMessage({ command: "stop" });
    }
};
let currentContext = null;
const getCurrentContext = () => currentContext;
function activate(context) {
    currentContext = context;
    console.log("Extension activated");
    // Check for sound files and show missing ones
    const mediaPath = path.join(context.extensionPath, "media");
    const missingSounds = [];
    SOUND_CONFIG.forEach((config) => {
        const soundPath = path.join(mediaPath, config.soundFile);
        if (!fs.existsSync(soundPath)) {
            missingSounds.push(config.soundFile);
        }
    });
    // Check for default fallback sound
    const defaultSoundPath = path.join(mediaPath, "error.wav");
    if (!fs.existsSync(defaultSoundPath)) {
        missingSounds.push("error.wav");
    }
    // Check for success sound
    const successSoundPath = path.join(mediaPath, SUCCESS_SOUND.soundFile);
    if (!fs.existsSync(successSoundPath)) {
        missingSounds.push(SUCCESS_SOUND.soundFile);
    }
    if (missingSounds.length > 0) {
        vscode.window.showWarningMessage(`Missing sound files: ${missingSounds.join(", ")}. Please add them to the media folder.`);
    }
    // Force web audio for better reliability
    useWebAudio = true;
    console.log("Using Web Audio method for better reliability");
    // Register commands
    const toggleAudioCommand = vscode.commands.registerCommand("errorSound.toggleAudioMethod", () => {
        useWebAudio = !useWebAudio;
        const method = useWebAudio ? "Web Audio" : "Native Audio";
        vscode.window.showInformationMessage(`Switched to ${method} method`);
        stopSound();
        currentErrorCount = 0;
        setTimeout(() => {
            const diagnostics = vscode.languages.getDiagnostics();
            const errorCount = diagnostics.reduce((total, [_, diags]) => total +
                diags.filter((d) => d.severity === vscode.DiagnosticSeverity.Error)
                    .length, 0);
            if (errorCount > 0) {
                currentErrorCount = errorCount;
                const soundInfo = getSoundForErrorCount(errorCount, context.extensionPath);
                if (useWebAudio) {
                    playWebAudio(soundInfo.path);
                }
                else {
                    playingProcess = playNativeSound(soundInfo.path);
                }
            }
        }, 500);
    });
    const showAudioPanelCommand = vscode.commands.registerCommand("errorSound.showAudioPanel", () => {
        const soundInfo = getSoundForErrorCount(currentErrorCount || 1, context.extensionPath);
        if (!audioPanel) {
            createAudioWebview(context, soundInfo.path, currentErrorCount, soundInfo.description);
        }
        else {
            audioPanel.reveal();
        }
    });
    const testAudioCommand = vscode.commands.registerCommand("errorSound.testAudio", () => {
        vscode.window.showInformationMessage("Testing audio with current error count...");
        const wasErrorCount = currentErrorCount;
        const testErrorCount = currentErrorCount || 1;
        currentErrorCount = testErrorCount;
        const soundInfo = getSoundForErrorCount(testErrorCount, context.extensionPath);
        if (useWebAudio) {
            playWebAudio(soundInfo.path);
        }
        else {
            playingProcess = playNativeSound(soundInfo.path);
        }
        setTimeout(() => {
            stopSound();
            currentErrorCount = wasErrorCount;
            vscode.window.showInformationMessage(`Audio test completed (${soundInfo.description})`);
        }, 3000);
    });
    // Add test success sound command
    const testSuccessCommand = vscode.commands.registerCommand("errorSound.testSuccess", () => {
        vscode.window.showInformationMessage("Testing success sound...");
        const successInfo = getSuccessSound(context.extensionPath);
        playSuccessSound(successInfo.path, successInfo.description);
    });
    context.subscriptions.push(toggleAudioCommand, showAudioPanelCommand, testAudioCommand, testSuccessCommand);
    // Monitor diagnostics changes
    const diagnosticsListener = vscode.languages.onDidChangeDiagnostics(() => {
        console.log("Diagnostics changed");
        const diagnostics = vscode.languages.getDiagnostics();
        const errorCount = diagnostics.reduce((total, [_, diags]) => total +
            diags.filter((d) => d.severity === vscode.DiagnosticSeverity.Error)
                .length, 0);
        console.log("Error count:", errorCount, "Previous:", previousErrorCount);
        // Check if errors were fixed (had errors before, now have none)
        if (previousErrorCount > 0 && errorCount === 0 && !isPlayingSuccessSound) {
            console.log("Errors fixed! Playing success sound...");
            stopSound(); // Stop error sound
            const successInfo = getSuccessSound(context.extensionPath);
            playSuccessSound(successInfo.path, successInfo.description);
            currentErrorCount = 0;
            previousErrorCount = 0;
            return;
        }
        if (errorCount > 0 &&
            (currentErrorCount === 0 || currentErrorCount !== errorCount)) {
            console.log("Starting error sound for", errorCount, "errors");
            // Update error counts
            previousErrorCount = currentErrorCount;
            currentErrorCount = errorCount;
            // Stop any currently playing sound
            stopSound();
            // Get appropriate sound for error count
            const soundInfo = getSoundForErrorCount(errorCount, context.extensionPath);
            currentSoundPath = soundInfo.path;
            // Play sound based on method
            if (useWebAudio) {
                playWebAudio(soundInfo.path);
            }
            else {
                playingProcess = playNativeSound(soundInfo.path);
            }
            // Show notification for significant error count changes
            if (previousErrorCount === 0 || errorCount > previousErrorCount + 2) {
                vscode.window.showWarningMessage(`${errorCount} error${errorCount !== 1 ? "s" : ""} detected - ${soundInfo.description}`);
            }
        }
        else if (errorCount === 0 &&
            currentErrorCount > 0 &&
            !isPlayingSuccessSound) {
            // Errors resolved
            console.log("All errors resolved");
            stopSound();
            currentErrorCount = 0;
            previousErrorCount = 0;
        }
        else if (errorCount < currentErrorCount && errorCount > 0) {
            // Error count decreased but still has errors
            console.log("Error count decreased from", currentErrorCount, "to", errorCount);
            previousErrorCount = currentErrorCount;
            currentErrorCount = errorCount;
            // Update to appropriate sound for new error count
            const soundInfo = getSoundForErrorCount(errorCount, context.extensionPath);
            currentSoundPath = soundInfo.path;
            if (useWebAudio) {
                playWebAudio(soundInfo.path);
            }
            else {
                stopSound();
                playingProcess = playNativeSound(soundInfo.path);
            }
        }
    });
    context.subscriptions.push(diagnosticsListener);
    // Initial check for existing errors
    setTimeout(() => {
        const diagnostics = vscode.languages.getDiagnostics();
        const errorCount = diagnostics.reduce((total, [_, diags]) => total +
            diags.filter((d) => d.severity === vscode.DiagnosticSeverity.Error)
                .length, 0);
        if (errorCount > 0) {
            console.log("Initial error check found", errorCount, "errors");
            currentErrorCount = errorCount;
            previousErrorCount = 0;
            const soundInfo = getSoundForErrorCount(errorCount, context.extensionPath);
            currentSoundPath = soundInfo.path;
            if (useWebAudio) {
                playWebAudio(soundInfo.path);
            }
            else {
                playingProcess = playNativeSound(soundInfo.path);
            }
        }
    }, 1000);
}
exports.activate = activate;
function deactivate() {
    console.log("Extension deactivated");
    // Stop any playing sounds
    stopSound();
    // Clean up processes
    if (playingProcess) {
        playingProcess.kill();
        playingProcess = null;
    }
    // Dispose audio panel
    if (audioPanel) {
        audioPanel.dispose();
        audioPanel = null;
    }
    // Reset state
    currentErrorCount = 0;
    previousErrorCount = 0;
    isPlayingSuccessSound = false;
    currentSoundPath = "";
    currentContext = null;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map