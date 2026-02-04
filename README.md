# Valentine's Day Puzzle Game 💕

## ⚠️ IMPORTANT: Must Use Local Server!

Due to browser security (CORS), you **CANNOT** just double-click index.html. You **MUST** run a local web server.

## Quick Start (EASIEST METHOD)

### Windows Users:
1. **Download all files** to the same folder
2. **Double-click `START_SERVER.bat`**
3. Your browser will open automatically at `http://localhost:8000`
4. Enjoy the game! 💕

### Mac/Linux Users:
1. **Download all files** to the same folder
2. **Double-click `START_SERVER.sh`** (or run it from terminal)
3. Open browser and go to `http://localhost:8000`
4. Enjoy the game! 💕

## Files You Need

Make sure all these files are in the SAME folder:
```
your-folder/
├── index.html
├── style.css
├── script.js
├── d39a9582-c601-423e-be88-766cc78872c4.jpg
├── START_SERVER.bat (Windows)
└── START_SERVER.sh (Mac/Linux)
```

## Manual Setup (If the scripts don't work)

### Method 1: Python (Easiest - Works on all systems)
### Method 1: Python (Easiest - Works on all systems)

**Windows:**
1. Open Command Prompt in your game folder
2. Run: `python -m http.server 8000`
3. Open browser: `http://localhost:8000`

**Mac/Linux:**
1. Open Terminal in your game folder
2. Run: `python3 -m http.server 8000`
3. Open browser: `http://localhost:8000`

### Method 2: Node.js (If you have Node installed)
```bash
npx http-server -p 8000
```
Then open: `http://localhost:8000`

### Method 3: VS Code Live Server
1. Open folder in VS Code
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

### Method 4: PHP (If you have PHP installed)
```bash
php -S localhost:8000
```
Then open: `http://localhost:8000`

## Why Do I Need a Server?

The browser blocks loading images into canvas from local files for security reasons (CORS policy). Running a local server solves this!

## Troubleshooting

### "Python is not recognized" error?
- Install Python from: https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### Port 8000 already in use?
Change the port number:
```bash
python -m http.server 8080
```
Then use: `http://localhost:8080`

### Still having issues?
1. Make sure ALL files are in the same folder
2. Check that the image filename is exactly: `d39a9582-c601-423e-be88-766cc78872c4.jpg`
3. Try a different browser (Chrome recommended)

## Game Instructions

1. **Drag pieces** from the right panel to the puzzle board on the left
2. **Click placed pieces** to remove them if you want to try a different spot
3. **Use "Show Preview"** button if you need a hint
4. **Complete all 100 pieces** in the correct positions to reveal the Valentine's message!

## Features

- 10x10 puzzle grid (100 pieces)
- Progress tracker
- Preview hint button
- Reset button
- Special celebration when completed
- Mobile-friendly design

## Tips

- Start with corner and edge pieces
- Use the preview feature if you get stuck
- The pieces must be in the EXACT correct position to complete
- Have fun! 💖

---

Made with ❤️ for a special Valentine's Day proposal
