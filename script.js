// ─── LOADING SCREEN ───────────────────────────────────────────
(function() {
    const loadingMessages = [
        "...",
        "I made this because...",
        "We didnt get the chance to build the puzzle together...",
        "So I created a little special surprise for you...",
        "I want you to feel how it feels to complete something...",
        "and feel how special and important you are to me...",
        "Almost there... just a few more steps...",
        "Sit back, relax, and enjoy the process!",
        "Almost ready... preparing your surprise! 💕"
    ];

    let currentMessageIndex = 0;
    let loadingProgress = 0;

    function updateLoadingScreen() {
        const loadingText = document.getElementById('loading-text');
        const loadingBar = document.getElementById('loading-bar');
        const loadingPercent = document.getElementById('loading-percent');
        
        console.log('Updating loading screen, message index:', currentMessageIndex);
        
        // Update message with fade effect
        if (loadingText && currentMessageIndex < loadingMessages.length) {
            loadingText.style.transition = 'opacity 0.3s ease';
            loadingText.style.opacity = '0';
            
            setTimeout(() => {
                loadingText.textContent = loadingMessages[currentMessageIndex];
                loadingText.style.opacity = '1';
            }, 300);
        }
        
        // Update progress
        loadingProgress = Math.min(100, ((currentMessageIndex + 1) / loadingMessages.length) * 100);
        if (loadingBar) {
            loadingBar.style.width = loadingProgress + '%';
            console.log('Progress:', loadingProgress + '%');
        }
        if (loadingPercent) {
            loadingPercent.textContent = Math.floor(loadingProgress);
        }
        
        currentMessageIndex++;
        
        // Continue until all messages shown
        if (currentMessageIndex < loadingMessages.length) {
            setTimeout(updateLoadingScreen, 2500);
        } else {
            // Wait a bit then hide loading screen
            setTimeout(hideLoadingScreen, 1500);
        }
    }

    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            console.log('Hiding loading screen');
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    // Start immediately when script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, starting loading screen');
            setTimeout(updateLoadingScreen, 500);
        });
    } else {
        // DOM already loaded
        console.log('DOM already loaded, starting loading screen');
        setTimeout(updateLoadingScreen, 500);
    }
})();

// ─── BACKGROUND MUSIC ─────────────────────────────────────────
const puzzleSongs = [
    document.getElementById("puzzle-music-1"),
    document.getElementById("puzzle-music-2"),
    document.getElementById("puzzle-music-3"),
    document.getElementById("puzzle-music-4")
];
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");

let currentPuzzleSongIndex = 0;
let currentMusic = null;
let musicUnlocked = false;
let isPlaying = false;
let isPuzzlePhase = true;

function playNextPuzzleSong() {
    if (!isPuzzlePhase || !musicUnlocked || !isPlaying) return;
    
    const nextSong = puzzleSongs[currentPuzzleSongIndex];
    
    if (currentMusic && currentMusic !== nextSong) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    
    currentMusic = nextSong;
    currentMusic.volume = 0.4;
    currentMusic.play().catch((err) => {
        console.log("Music play failed:", err);
    });
    
    // When this song ends, play the next one
    currentMusic.onended = () => {
        currentPuzzleSongIndex = (currentPuzzleSongIndex + 1) % puzzleSongs.length;
        playNextPuzzleSong();
    };
    
    console.log(`Playing puzzle song ${currentPuzzleSongIndex + 1} of ${puzzleSongs.length}`);
}

function switchToBgMusic() {
    isPuzzlePhase = false;
    
    // Stop puzzle music
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
        currentMusic.onended = null;
    }
    
    // Start bg music with fade in
    if (musicUnlocked && isPlaying) {
        bgMusic.volume = 0;
        bgMusic.currentTime = 0;
        bgMusic.play().then(() => {
            const fadeIn = setInterval(() => {
                if (bgMusic.volume < 0.4) {
                    bgMusic.volume += 0.05;
                } else {
                    bgMusic.volume = 0.4;
                    clearInterval(fadeIn);
                }
            }, 100);
        }).catch((err) => {
            console.log("BG Music play failed:", err);
        });
    }
    
    currentMusic = bgMusic;
    console.log("Switched to background music");
}

function unlockMusic() {
    if (musicUnlocked) return;

    musicUnlocked = true;
    isPlaying = true;
    
    if (isPuzzlePhase) {
        playNextPuzzleSong();
    } else {
        switchToBgMusic();
    }
    
    musicToggle.textContent = "🔊";
    updateMusicText();
    console.log("Music unlocked & playing");
}

function updateMusicText() {
    const musicText = document.getElementById('music-text');
    if (!musicText) return;
    
    if (isPlaying) {
        musicText.textContent = "Music playing ♪";
        musicText.classList.add('playing');
    } else {
        musicText.textContent = "Turn on music >>";
        musicText.classList.remove('playing');
    }
}

// Unlock on ANY interaction
['click', 'keydown', 'touchstart', 'mousemove'].forEach(event => {
    document.addEventListener(event, unlockMusic, { once: true });
});

// Toggle button
musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!musicUnlocked) {
        unlockMusic();
        return;
    }

    if (isPlaying) {
        if (currentMusic) currentMusic.pause();
        musicToggle.textContent = "🔇";
    } else {
        if (currentMusic) currentMusic.play();
        musicToggle.textContent = "🔊";
    }

    isPlaying = !isPlaying;
    updateMusicText();
});

// Game Configuration
const GRID_SIZE = 10;
const PIECE_SIZE = 60;
const CANVAS_SIZE = GRID_SIZE * PIECE_SIZE;

// Game State
let pieces = [];
let draggedPiece = null;
let selectedPiece = null; // For click-to-place
let completed = false;
let imageLoaded = false;
let cachedImageDataURL = null; // Cached once — no more repeated toDataURL() calls

// Undo/Redo History
let moveHistory = [];
let historyIndex = -1;

// Hint System
let correctPiecesPlaced = 0;
let hintsAvailable = 0;
let wrongPlacements = 0;

// Hangman Game State
const HANGMAN_PHRASE = "WILL YOU BE MY VALENTINE?";
const DISPLAY_PHRASE = "WILL YOU BE MY VALENTINE?"; // M and Y together
let guessedLetters = [];
let wrongGuesses = 0;
const MAX_WRONG = 3;
let noButtonClicks = 0;
let hoverTimeout = null;
let isHovering = false;

// DOM Elements
const gameScreen = document.getElementById('game-screen');
const celebrationScreen = document.getElementById('celebration-screen');
const finalScreen = document.getElementById('final-screen');
const mainCanvas = document.getElementById('main-canvas');
const hintCanvas = document.getElementById('hint-canvas');
const puzzleBoard = document.getElementById('puzzle-board');
const piecesPile = document.getElementById('pieces-pile');
const remainingCount = document.getElementById('remaining-count');
const hintPreview = document.getElementById('hint-preview');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const hintBtn = document.getElementById('hint-btn');
const useHintBtn = document.getElementById('use-hint-btn');
const testSkipBtn = document.getElementById('test-skip-btn');
const autoSolveBtn = document.getElementById('auto-solve-btn');

// Hangman DOM Elements
const wordDisplay = document.getElementById('word-display');
const letterButtons = document.getElementById('letter-buttons');
const wrongCount = document.getElementById('wrong-count');
const yesBtn = document.getElementById('yes-btn');
const maybeBtn = document.getElementById('maybe-btn');

// Initialize
window.addEventListener('load', init);

function init() {
    loadImage();
    setupEventListeners();
}

function setupEventListeners() {
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);
    hintBtn.addEventListener('click', toggleHint);
    useHintBtn.addEventListener('click', useHint);
    yesBtn.addEventListener('click', handleYes);
    maybeBtn.addEventListener('click', handleMaybe);
    
    // Make NO button run away on hover after it's been clicked once (but before 5 clicks)
    maybeBtn.addEventListener('mouseenter', () => {
        if (noButtonClicks >= 1 && noButtonClicks < 5) {
            const randomX = Math.random() * (window.innerWidth - 200);
            const randomY = Math.random() * (window.innerHeight - 100);
            maybeBtn.style.position = 'fixed';
            maybeBtn.style.left = randomX + 'px';
            maybeBtn.style.top = randomY + 'px';
            maybeBtn.style.transition = 'all 0.2s ease';
        }
    });
    
    if (testSkipBtn) testSkipBtn.addEventListener('click', testSkipToHangman);
    autoSolveBtn.addEventListener('click', autoSolvePuzzle);
    
    console.log('Event listeners set up, autoSolveBtn:', autoSolveBtn);
}

function loadImage() {
    const img = new Image();
    img.onload = function() {
        drawImageToCanvas(img);
        imageLoaded = true;
        initializePuzzle(); // start immediately
    };
    img.onerror = function() {
        alert('Failed to load puzzle image. Make sure the image file exists.');
        console.error('Image failed to load:', img.src);
    };
    img.src = './d39a9582-c601-423e-be88-766cc78872c4.jpg';
}

function drawImageToCanvas(img) {
    console.log('Drawing image to canvas...');
    const ctx = mainCanvas.getContext('2d');
    mainCanvas.width = CANVAS_SIZE;
    mainCanvas.height = CANVAS_SIZE;
    
    // Draw image to fit canvas
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    console.log('Main canvas updated');
    
    // Also draw to hint canvas
    const hintCtx = hintCanvas.getContext('2d');
    hintCanvas.width = CANVAS_SIZE;
    hintCanvas.height = CANVAS_SIZE;
    hintCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    console.log('All canvases ready');
    
    // Cache the data URL once — used everywhere instead of repeated toDataURL() calls
    cachedImageDataURL = mainCanvas.toDataURL();
    console.log('Image data URL cached');
}

function initializePuzzle() {
    pieces = [];
    
    // Calculate middle piece position
    const middleRow = Math.floor(GRID_SIZE / 2);
    const middleCol = Math.floor(GRID_SIZE / 2);
    const middlePieceId = middleRow * GRID_SIZE + middleCol;
    
    // Create pieces
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const pieceId = row * GRID_SIZE + col;
            const isMiddlePiece = pieceId === middlePieceId;
            
            pieces.push({
                id: pieceId,
                correctRow: row,
                correctCol: col,
                currentRow: isMiddlePiece ? row : null,
                currentCol: isMiddlePiece ? col : null,
                isPlaced: isMiddlePiece
            });
        }
    }
    
    // Shuffle pieces
    pieces = shuffleArray(pieces);
    
    // Create board
    createBoard();
    
    // Place the middle piece on the board
    placeStarterPiece(middlePieceId);
    
    // Create pieces pile
    createPiecesPile();
    
    // Update UI
    updateProgress();
}

function placeStarterPiece(pieceId) {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || !piece.isPlaced) return;
    
    const row = piece.correctRow;
    const col = piece.correctCol;
    const cellIndex = row * GRID_SIZE + col;
    const cell = puzzleBoard.children[cellIndex];
    
    const placedPieceElement = document.createElement('div');
    placedPieceElement.className = 'placed-piece starter-piece';
    
    const x = piece.correctCol * PIECE_SIZE;
    const y = piece.correctRow * PIECE_SIZE;
    
    placedPieceElement.style.backgroundImage = `url(${cachedImageDataURL})`;
    placedPieceElement.style.backgroundPosition = `-${x}px -${y}px`;
    placedPieceElement.dataset.id = piece.id;
    
    // Add a special glow effect for the starter piece
    placedPieceElement.style.animation = 'starterGlow 2s ease-in-out infinite';
    
    // Don't allow removing the starter piece
    placedPieceElement.style.cursor = 'default';
    
    cell.appendChild(placedPieceElement);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createBoard() {
    puzzleBoard.innerHTML = '';
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.index = i;
        
        // Add drop event listeners (for drag and drop)
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('drop', handleDrop);
        
        // Add click listener (for click-to-place)
        cell.addEventListener('click', handleCellClick);
        
        // Add hover effect for selected piece
        cell.addEventListener('mouseenter', () => {
            if (selectedPiece && !cell.hasChildNodes()) {
                cell.classList.add('cell-hover');
            }
        });
        
        cell.addEventListener('mouseleave', () => {
            cell.classList.remove('cell-hover');
        });
        
        puzzleBoard.appendChild(cell);
    }
}

function handleCellClick(e) {
    if (!selectedPiece) return;
    
    const cellIndex = parseInt(e.currentTarget.dataset.index);
    const row = Math.floor(cellIndex / GRID_SIZE);
    const col = cellIndex % GRID_SIZE;
    
    // Check if spot is occupied in the pieces array
    const occupied = pieces.find(p => 
        p.currentRow === row && 
        p.currentCol === col && 
        p.isPlaced
    );
    
    // DEFENSIVE CHECK: Also verify the cell is actually empty in the DOM
    const cell = e.currentTarget;
    const existingPiece = cell.querySelector('.placed-piece');
    
    if (occupied || existingPiece) {
        console.log('Cell is occupied, cannot place piece here');
        return;
    }
    
    // Place the selected piece
    placePiece(selectedPiece, row, col);
    
    // Clear selection
    selectedPiece = null;
    document.querySelectorAll('.puzzle-piece').forEach(el => {
        el.classList.remove('selected');
        el.style.transform = '';
    });
}

function createPiecesPile() {
    piecesPile.innerHTML = '';
    
    const unplacedPieces = pieces.filter(p => !p.isPlaced);
    
    console.log('Creating pieces pile with', unplacedPieces.length, 'pieces');
    
    if (unplacedPieces.length === 0) {
        piecesPile.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">All pieces placed! 🎉</p>';
    } else {
        unplacedPieces.forEach(piece => {
            const pieceElement = createPieceElement(piece);
            piecesPile.appendChild(pieceElement);
        });
    }
    
    console.log('Pieces pile created with', piecesPile.children.length, 'elements');
    
    // Update remaining count
    updateRemainingCount();
}

function createPieceElement(piece) {
    const div = document.createElement('div');
    div.className = 'puzzle-piece';
    div.draggable = true;
    div.dataset.id = piece.id;
    
    // Set background image position
    const x = piece.correctCol * PIECE_SIZE;
    const y = piece.correctRow * PIECE_SIZE;
    
    div.style.backgroundImage = `url(${cachedImageDataURL})`;
    div.style.backgroundPosition = `-${x}px -${y}px`;
    
    console.log(`Created piece ${piece.id} at position (${x}, ${y})`);
    
    // Add drag event listeners
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);
    
    // Add click to select piece (alternative to dragging)
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        selectPiece(piece, div);
    });
    
    return div;
}

function selectPiece(piece, element) {
    // Clear previous selection
    document.querySelectorAll('.puzzle-piece').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select this piece
    selectedPiece = piece;
    element.classList.add('selected');
    
    // Visual feedback
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        if (element.classList.contains('selected')) {
            element.style.transform = 'scale(1.05)';
        }
    }, 200);
}

function handleDragStart(e) {
    const pieceId = parseInt(e.target.dataset.id);
    draggedPiece = pieces.find(p => p.id === pieceId);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a custom drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    e.dataTransfer.setDragImage(dragImage, 30, 30);
    setTimeout(() => dragImage.remove(), 0);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    draggedPiece = null;
    
    // Clear any hover effects
    document.querySelectorAll('.board-cell').forEach(cell => {
        cell.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    const cell = e.currentTarget;
    if (!cell.hasChildNodes()) {
        cell.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    // Remove drag-over effect
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedPiece) return;
    
    const cellIndex = parseInt(e.currentTarget.dataset.index);
    const row = Math.floor(cellIndex / GRID_SIZE);
    const col = cellIndex % GRID_SIZE;
    
    // Check if spot is occupied in the pieces array
    const occupied = pieces.find(p => 
        p.currentRow === row && 
        p.currentCol === col && 
        p.isPlaced
    );
    
    // DEFENSIVE CHECK: Also verify the cell is actually empty in the DOM
    const cell = e.currentTarget;
    const existingPiece = cell.querySelector('.placed-piece');
    
    if (occupied || existingPiece) {
        console.log('Cell is occupied, cannot place piece here');
        return;
    }
    
    // Place the piece with a pop animation
    placePiece(draggedPiece, row, col);
}

function placePiece(piece, row, col) {
    // Record move in history
    const move = {
        type: 'place',
        pieceId: piece.id,
        row: row,
        col: col
    };
    
    // Clear redo history when new move is made
    moveHistory = moveHistory.slice(0, historyIndex + 1);
    moveHistory.push(move);
    historyIndex++;
    
    // Update piece data
    piece.currentRow = row;
    piece.currentCol = col;
    piece.isPlaced = true;
    
    // Update board cell
    const cellIndex = row * GRID_SIZE + col;
    const cell = puzzleBoard.children[cellIndex];
    
    // CRITICAL FIX: Check if there's already a piece element in this cell
    // This prevents the double-piece bug
    const existingPieces = cell.querySelectorAll('.placed-piece');
    if (existingPieces.length > 0) {
        console.warn(`Found ${existingPieces.length} existing pieces in cell [${row},${col}]. Cleaning up...`);
        // Remove all existing pieces from DOM
        existingPieces.forEach(el => el.remove());
        
        // Also update the state of any pieces that thought they were here
        pieces.forEach(p => {
            if (p.isPlaced && p.currentRow === row && p.currentCol === col && p.id !== piece.id) {
                console.warn(`Piece ${p.id} thought it was at [${row},${col}] but isn't anymore. Resetting.`);
                p.isPlaced = false;
                p.currentRow = null;
                p.currentCol = null;
                // Return it to the pile
                renderPiece(p);
            }
        });
    }
    
    // Create placed piece element
    const placedPieceElement = document.createElement('div');
    placedPieceElement.className = 'placed-piece';
    
    const x = piece.correctCol * PIECE_SIZE;
    const y = piece.correctRow * PIECE_SIZE;
    
    placedPieceElement.style.backgroundImage = `url(${cachedImageDataURL})`;
    placedPieceElement.style.backgroundPosition = `-${x}px -${y}px`;
    placedPieceElement.dataset.id = piece.id;
    
    // Add click to remove
    placedPieceElement.addEventListener('click', () => removePieceWithHistory(piece));
    
    // Add pop animation
    placedPieceElement.style.animation = 'popIn 0.3s ease';
    
    cell.appendChild(placedPieceElement);
    
    // Remove just this piece from the pile instead of rebuilding the whole thing
    const pieceEl = piecesPile.querySelector(`[data-id="${piece.id}"]`);
    if (pieceEl) pieceEl.remove();
    
    // Update remaining count
    updateRemainingCount();
    
    // Track correct placements for hints
    if (row === piece.correctRow && col === piece.correctCol) {
        correctPiecesPlaced++;
        if (correctPiecesPlaced % 10 === 0) {
            hintsAvailable++;
            updateHintButton();
            showHintNotification();
        }
    } else {
        // Track wrong placements
        wrongPlacements++;
        
        // Show auto-solve button after 25 wrong placements
        if (wrongPlacements === 25) {
            showAutoSolveOffer();
        }
    }
    
    // Update undo/redo buttons
    updateUndoRedoButtons();
    
    // Check completion
    checkCompletion();
}

function removePiece(piece) {
    if (completed) return;
    
    // Update piece data
    const row = piece.currentRow;
    const col = piece.currentCol;
    
    // Track if this was a correctly placed piece
    const wasCorrect = (row === piece.correctRow && col === piece.correctCol);
    
    piece.currentRow = null;
    piece.currentCol = null;
    piece.isPlaced = false;
    
    // Get the cell and THIS specific piece's element
    const cellIndex = row * GRID_SIZE + col;
    const cell = puzzleBoard.children[cellIndex];
    const placedPieceElement = cell.querySelector(`[data-id="${piece.id}"]`);
    
    // Add animation to the piece before removing it
    if (placedPieceElement) {
        placedPieceElement.style.transition = 'all 0.3s ease';
        placedPieceElement.style.transform = 'scale(0.8)';
        placedPieceElement.style.opacity = '0';
        
        setTimeout(() => {
            // CRITICAL FIX: Remove only THIS piece's element, not the entire cell
            placedPieceElement.remove();
        }, 300);
    }
    
    // Adjust hint tracking if a correct piece was removed
    if (wasCorrect && correctPiecesPlaced > 0) {
        correctPiecesPlaced--;
        // Recalculate hints based on current correct pieces
        const newHints = Math.floor(correctPiecesPlaced / 10);
        if (newHints < hintsAvailable) {
            hintsAvailable = newHints;
            updateHintButton();
        }
    }
    
    // Add piece back into the pile with animation
    setTimeout(() => {
        const pieceElement = createPieceElement(piece);
        
        // Start with scale 0 and fade in
        pieceElement.style.transform = 'scale(0.5)';
        pieceElement.style.opacity = '0';
        
        piecesPile.appendChild(pieceElement);
        
        // Animate in
        setTimeout(() => {
            pieceElement.style.transition = 'all 0.3s ease';
            pieceElement.style.transform = 'scale(1)';
            pieceElement.style.opacity = '1';
        }, 10);
        
        updateRemainingCount();
    }, 300);
}

function removePieceWithHistory(piece) {
    if (completed) return;
    
    // Record move in history
    const move = {
        type: 'remove',
        pieceId: piece.id,
        row: piece.currentRow,
        col: piece.currentCol
    };
    
    // Clear redo history when new move is made
    moveHistory = moveHistory.slice(0, historyIndex + 1);
    moveHistory.push(move);
    historyIndex++;
    
    // Remove the piece
    removePiece(piece);
    
    // Update undo/redo buttons
    updateUndoRedoButtons();
}

function updateRemainingCount() {
    const placedCount = pieces.filter(p => p.isPlaced).length;
    const totalPieces = GRID_SIZE * GRID_SIZE;
    const remainingPieces = totalPieces - placedCount;
    remainingCount.textContent = remainingPieces;
}

function checkCompletion() {
    const allPlaced = pieces.every(p => p.isPlaced);
    const allCorrect = pieces.every(p => 
        p.currentRow === p.correctRow && 
        p.currentCol === p.correctCol
    );
    
    if (allPlaced && allCorrect) {
        completed = true;
        
        // Highlight correct cells
        pieces.forEach(piece => {
            const cellIndex = piece.currentRow * GRID_SIZE + piece.currentCol;
            const cell = puzzleBoard.children[cellIndex];
            cell.classList.add('correct');
        });
        
        // Show celebration after a delay
        setTimeout(() => {
            showCelebration();
        }, 500);
    }
}

function showCelebration() {
    gameScreen.classList.add('hidden');
    celebrationScreen.classList.remove('hidden');
    
    // Switch to background music (hangman phase)
    switchToBgMusic();
    
    initHangmanGame();
}

// Hangman Game Functions
function initHangmanGame() {
    guessedLetters = [];
    wrongGuesses = 0;
    updateWordDisplay();
    createLetterButtons();
    updateWrongCount();
}

function createLetterButtons() {
    letterButtons.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let letter of alphabet) {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.addEventListener('click', () => handleLetterGuess(letter, btn));
        letterButtons.appendChild(btn);
    }
}

function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    
    // Split into words to control spacing
    const words = HANGMAN_PHRASE.split(' ');
    
    words.forEach((word, wordIndex) => {
        // Create a container for each word
        const wordContainer = document.createElement('div');
        wordContainer.style.display = 'flex';
        wordContainer.style.gap = '0.5rem';
        
        for (let char of word) {
            const box = document.createElement('div');
            box.className = 'letter-box';
            
            if (char === '?' || char === '!' || char === '.' || char === ',') {
                // Show punctuation immediately
                box.textContent = char;
                box.style.color = '#000000';
                box.style.opacity = '1';
                box.classList.add('revealed');
                console.log('Added punctuation:', char);
            } else if (guessedLetters.includes(char)) {
                box.textContent = char;
                box.style.color = '#000000';
                box.style.opacity = '1';
                box.classList.add('revealed');
                console.log('Revealed letter:', char, 'textContent:', box.textContent);
            } else {
                console.log('Letter not guessed yet:', char);
            }
            
            wordContainer.appendChild(box);
        }
        
        wordDisplay.appendChild(wordContainer);
        
        // Add space between words (but not after last word)
        if (wordIndex < words.length - 1) {
            const space = document.createElement('div');
            space.className = 'word-space';
            space.style.width = '1rem';
            wordDisplay.appendChild(space);
        }
    });
}

function handleLetterGuess(letter, btn) {
    if (guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    btn.disabled = true;
    
    if (HANGMAN_PHRASE.includes(letter)) {
        btn.classList.add('correct');
        updateWordDisplay();
        checkHangmanWin();
    } else {
        btn.classList.add('wrong');
        wrongGuesses++;
        updateWrongCount();
        checkHangmanLose();
    }
}

function updateWrongCount() {
    wrongCount.textContent = wrongGuesses;
}

function checkHangmanWin() {
    // Only check letters, not spaces or punctuation
    const allLetters = HANGMAN_PHRASE.replace(/[^A-Z]/g, '').split('');
    const allGuessed = allLetters.every(letter => guessedLetters.includes(letter));
    
    if (allGuessed) {
        setTimeout(() => {
            showFinalMessage();
        }, 500);
    }
}

function checkHangmanLose() {
    if (wrongGuesses >= MAX_WRONG) {
        setTimeout(() => {
            // Create custom modal instead of alert
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #fce7f3, #fee2e2);
                    padding: 2.5rem;
                    border-radius: 1.5rem;
                    text-align: center;
                    max-width: 450px;
                    animation: scaleIn 0.3s ease;
                    border: 3px solid #ec4899;
                    box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);
                ">
                    <p style="font-size: 3rem; margin-bottom: 1rem;">😘💋</p>
                    <h3 style="font-size: 1.8rem; color: #374151; font-weight: bold; margin-bottom: 1rem;">
                        Aww, you got ${MAX_WRONG} wrong! 💕
                    </h3>
                    <p style="font-size: 1.3rem; color: #ec4899; font-weight: 600; margin-bottom: 0.5rem;">
                        You owe me a LOT of kisses! 😚
                    </p>
                    <p style="font-size: 1.1rem; color: #6b7280;">
                        Let's try again, bebi! 💖
                    </p>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close and restart after delay
            setTimeout(() => {
                modal.remove();
                initHangmanGame();
            }, 3000);
        }, 300);
    }
}

function showFinalMessage() {
    celebrationScreen.classList.add('hidden');
    finalScreen.classList.remove('hidden');
    
    // Keep playing background music (no change needed)
}

function toggleHint() {
    hintPreview.classList.toggle('hidden');
    hintBtn.textContent = hintPreview.classList.contains('hidden') 
        ? '💡 Show Preview' 
        : '💡 Hide Preview';
}

function updateHintButton() {
    const hintText = document.getElementById('hint-text');
    if (hintText) {
        hintText.textContent = `Use Hint (${hintsAvailable})`;
    }
    if (useHintBtn) {
        useHintBtn.disabled = hintsAvailable === 0;
    }
}

function showHintNotification() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'hint-notification';
    notification.innerHTML = '✨ New hint available! ✨';
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function useHint() {
    if (hintsAvailable === 0 || completed) return;
    
    // Find a random unplaced piece
    const unplacedPieces = pieces.filter(p => !p.isPlaced);
    if (unplacedPieces.length === 0) return;
    
    // Pick a random piece to place correctly
    const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
    
    // Place it in the correct spot
    placePiece(randomPiece, randomPiece.correctRow, randomPiece.correctCol);
    
    // Decrement hints
    hintsAvailable--;
    updateHintButton();
    
    // Show feedback
    const feedbackNotification = document.createElement('div');
    feedbackNotification.className = 'hint-notification hint-used';
    feedbackNotification.innerHTML = '🎯 Hint used! Piece placed correctly!';
    document.body.appendChild(feedbackNotification);
    
    setTimeout(() => {
        feedbackNotification.remove();
    }, 2000);
}

function reset() {
    completed = false;
    celebrationScreen.classList.add('hidden');
    finalScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    hintPreview.classList.add('hidden');
    hintBtn.textContent = '💡 Show Preview';
    
    // Clear undo/redo history
    moveHistory = [];
    historyIndex = -1;
    
    // Reset hint system
    correctPiecesPlaced = 0;
    hintsAvailable = 0;
    updateHintButton();
    
    initializePuzzle();
}

function fullRestart() {
    guessedLetters = [];
    wrongGuesses = 0;
    noButtonClicks = 0;
    reset();
}

function handleYes() {
    // Create custom celebration modal instead of alert
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 3rem;
            border-radius: 2rem;
            text-align: center;
            max-width: 500px;
            animation: scaleIn 0.3s ease;
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 1s infinite;">
                💖💕✨💝💗💓
            </div>
            <h2 style="
                font-size: 2.5rem;
                background: linear-gradient(to right, #ec4899, #dc2626);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 1rem;
                font-weight: bold;
            ">
                YEHEYYY!
            </h2>
            <p style="font-size: 1.5rem; color: #374151; margin-bottom: 2rem;">
                You just made me the happiest person ever! mwehehe
            </p>
            <p style="font-size: 1.2rem; color: #6b7280;">
                I can't wait to spend Valentine's Day with you bebi!
            </p>
            <p style="font-size: 1.2rem; color: #6b7280;">
                Send your answer sa chat ha? hehe <strong>YES</strong> lang! :)
            </p>
            <div style="font-size: 4rem; margin-top: 1rem;">
                💖💕✨💝💗💓
            </div>
        </div>
    `;

    
    document.body.appendChild(modal);
}

function showAutoSolveOffer() {
    const autoSolveBtn = document.getElementById('auto-solve-btn');
    
    // Make button visible with animation
    autoSolveBtn.style.display = 'inline-flex';
    autoSolveBtn.style.opacity = '0';
    autoSolveBtn.style.transform = 'scale(0.8)';
    
    // Animate in
    setTimeout(() => {
        autoSolveBtn.style.transition = 'all 0.5s ease';
        autoSolveBtn.style.opacity = '1';
        autoSolveBtn.style.transform = 'scale(1)';
    }, 10);
    
    // Show notification
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            padding: 2.5rem;
            border-radius: 2rem;
            text-align: center;
            max-width: 450px;
            animation: shakeModal 0.5s ease;
            border: 3px solid #f59e0b;
            box-shadow: 0 20px 40px rgba(245, 158, 11, 0.4);
        ">
            <p style="font-size: 2.5rem; margin-bottom: 1rem;">🤖✨</p>
            <p style="font-size: 1.5rem; color: #92400e; font-weight: bold; margin-bottom: 1rem;">
                Need some help, mahal?
            </p>
            <p style="font-size: 1.1rem; color: #78350f; margin-bottom: 0.5rem;">
                I noticed you're having a bit of trouble! No worries, I've got your back.
            </p>
            <p style="font-size: 1.1rem; color: #78350f;">
                The Auto-Solve button is now available if you need it! 💖
            </p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on click
    setTimeout(() => {
        modal.addEventListener('click', () => {
            modal.remove();
        });
    }, 100);
    
    // Auto close after 4 seconds
    setTimeout(() => {
        modal.remove();
    }, 4000);
}

function handleMaybe() {
    // Don't do anything if button is in hover mode
    if (isHovering) {
        return;
    }
    
    noButtonClicks++;
    
    const messages = [
        "Sure na ikaw? Okay."
    ];
    
    const message = messages[Math.min(noButtonClicks - 1, messages.length - 1)];
    
    // Create custom modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Regular messages for clicks 1-4
    if (noButtonClicks < 5) {
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 1.5rem;
                text-align: center;
                max-width: 400px;
                animation: shakeModal 0.5s ease;
            ">
                <p style="font-size: 1.8rem; margin-bottom: 1rem;">😅</p>
                <p style="font-size: 1.3rem; color: #374151; font-weight: 600;">
                    ${message}
                </p>
            </div>
        `;
    } 
    // Special message for 5th click - start hovering behavior
    else if (noButtonClicks === 5) {
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #fce7f3, #fee2e2);
                padding: 3rem;
                border-radius: 2rem;
                text-align: center;
                max-width: 500px;
                animation: shakeModal 0.5s ease;
                border: 3px solid #ec4899;
                box-shadow: 0 20px 40px rgba(236, 72, 153, 0.4);
            ">
                <p style="font-size: 3rem; margin-bottom: 1rem;">😤💕</p>
                <p style="font-size: 1.6rem; color: #ec4899; font-weight: bold; margin-bottom: 1rem;">
                    ${message}
                </p>
                <p style="font-size: 1.2rem; color: #374151; font-weight: 500; margin-top: 1rem;">
                    Try clicking me now... 😏
                </p>
            </div>
        `;
        
        // After modal closes, enable hover behavior
        setTimeout(() => {
            enableHoverBehavior();
        }, 3000);
    }
    
    document.body.appendChild(modal);
    
    // Close on click
    setTimeout(() => {
        modal.addEventListener('click', () => {
            modal.remove();
        });
    }, 100);
    
    // Auto close after 2 seconds (3 seconds for final message)
    const closeDelay = noButtonClicks === 5 ? 3000 : 2000;
    setTimeout(() => {
        modal.remove();
    }, closeDelay);
    
    // Make YES button bigger with each NO click
    const yesButton = document.getElementById('yes-btn');
    const currentSize = 1 + (noButtonClicks * 0.3);
    yesButton.style.transform = `scale(${currentSize})`;
    yesButton.style.transition = 'transform 0.3s ease';
    yesButton.style.zIndex = '100';
}

function enableHoverBehavior() {
    const maybeButton = document.getElementById('maybe-btn');
    isHovering = true;
    
    // Function to move button on hover/mousemove
    function moveButton() {
        const randomX = Math.random() * (window.innerWidth - 200);
        const randomY = Math.random() * (window.innerHeight - 100);
        maybeButton.style.position = 'fixed';
        maybeButton.style.left = randomX + 'px';
        maybeButton.style.top = randomY + 'px';
        maybeButton.style.transition = 'all 0.3s ease';
    }
    
    // Add hover and mousemove listeners
    maybeButton.addEventListener('mouseenter', moveButton);
    maybeButton.addEventListener('mousemove', moveButton);
    
    // After 10 seconds, remove button and show final message
    hoverTimeout = setTimeout(() => {
        removeNoButton();
    }, 10000);
}

function removeNoButton() {
    const maybeButton = document.getElementById('maybe-btn');
    
    // Fade out and disable the button
    maybeButton.style.opacity = '0';
    maybeButton.style.transform = 'scale(0)';
    maybeButton.style.pointerEvents = 'none';
    maybeButton.disabled = true;
    
    // Show final message
    setTimeout(() => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #fce7f3, #fee2e2);
                padding: 3rem;
                border-radius: 2rem;
                text-align: center;
                max-width: 500px;
                animation: shakeModal 0.5s ease;
                border: 3px solid #ec4899;
                box-shadow: 0 20px 40px rgba(236, 72, 153, 0.4);
            ">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🙅‍♀️💕</p>
                <p style="font-size: 1.8rem; color: #ec4899; font-weight: bold; margin-bottom: 1rem;">
                    No "NO" button for you now! 
                </p>
                <p style="font-size: 1.3rem; color: #374151; font-weight: 600;">
                    The only choice left is YES! 💖
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on click
        setTimeout(() => {
            modal.addEventListener('click', () => {
                modal.remove();
            });
        }, 100);
        
        // Auto close after 3 seconds
        setTimeout(() => {
            modal.remove();
        }, 3000);
    }, 300);
}

// Undo/Redo Functions
function undo() {
    if (historyIndex < 0) return;
    
    const move = moveHistory[historyIndex];
    const piece = pieces.find(p => p.id === move.pieceId);
    
    if (move.type === 'place') {
        // Undo a placement - remove the piece
        removePiece(piece);
    } else if (move.type === 'remove') {
        // Undo a removal - place the piece back
        placePieceDirectly(piece, move.row, move.col);
    }
    
    historyIndex--;
    updateUndoRedoButtons();
}

function redo() {
    if (historyIndex >= moveHistory.length - 1) return;
    
    historyIndex++;
    const move = moveHistory[historyIndex];
    const piece = pieces.find(p => p.id === move.pieceId);
    
    if (move.type === 'place') {
        // Redo a placement
        placePieceDirectly(piece, move.row, move.col);
    } else if (move.type === 'remove') {
        // Redo a removal
        removePiece(piece);
    }
    
    updateUndoRedoButtons();
}

function placePieceDirectly(piece, row, col) {
    // Place piece without recording in history (for undo/redo)
    piece.currentRow = row;
    piece.currentCol = col;
    piece.isPlaced = true;
    
    const cellIndex = row * GRID_SIZE + col;
    const cell = puzzleBoard.children[cellIndex];
    
    const placedPieceElement = document.createElement('div');
    placedPieceElement.className = 'placed-piece';
    
    const x = piece.correctCol * PIECE_SIZE;
    const y = piece.correctRow * PIECE_SIZE;
    
    placedPieceElement.style.backgroundImage = `url(${cachedImageDataURL})`;
    placedPieceElement.style.backgroundPosition = `-${x}px -${y}px`;
    placedPieceElement.dataset.id = piece.id;
    
    placedPieceElement.addEventListener('click', () => removePieceWithHistory(piece));
    
    // Add pop animation
    placedPieceElement.style.animation = 'popIn 0.3s ease';
    
    cell.appendChild(placedPieceElement);
    
    // Remove just this piece from the pile
    const pieceEl = piecesPile.querySelector(`[data-id="${piece.id}"]`);
    if (pieceEl) pieceEl.remove();
    updateRemainingCount();
    
    checkCompletion();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex < 0;
    redoBtn.disabled = historyIndex >= moveHistory.length - 1;
}

// Test Function - Skip to Hangman
function testSkipToHangman() {
    console.log('TEST MODE: Skipping to hangman game');
    showCelebration();
}

// Test Function - Place every piece in its correct spot instantly
// Auto-solve with animation
let autoSolveInProgress = false;

function autoSolvePuzzle() {
    console.log('=== AUTO-SOLVE CLICKED ===');
    console.log('autoSolveInProgress:', autoSolveInProgress);
    console.log('pieces array:', pieces);
    console.log('pieces length:', pieces ? pieces.length : 'undefined');
    
    if (autoSolveInProgress) {
        console.log('Auto-solve already in progress, exiting');
        return;
    }
    
    console.log('Starting auto-solve with animation...');
    autoSolveInProgress = true;
    
    // Disable the auto-solve button
    const autoSolveBtn = document.getElementById('auto-solve-btn');
    if (autoSolveBtn) {
        autoSolveBtn.disabled = true;
        autoSolveBtn.textContent = '⚡ Solving...';
        console.log('Button disabled');
    } else {
        console.log('ERROR: autoSolveBtn not found!');
    }
    
    // STEP 1: Remove all incorrectly placed pieces from the board
    const incorrectlyPlaced = pieces.filter(piece => 
        piece.isPlaced && (piece.currentRow !== piece.correctRow || piece.currentCol !== piece.correctCol)
    );
    
    console.log(`Found ${incorrectlyPlaced.length} incorrectly placed pieces to remove`);
    
    // Remove incorrectly placed pieces with animation
    incorrectlyPlaced.forEach((piece, index) => {
        setTimeout(() => {
            // Remove from board
            const cellIndex = piece.currentRow * GRID_SIZE + piece.currentCol;
            const cell = puzzleBoard.children[cellIndex];
            const placedPieceElement = cell.querySelector(`[data-id="${piece.id}"]`);
            if (placedPieceElement) {
                placedPieceElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                placedPieceElement.style.opacity = '0';
                placedPieceElement.style.transform = 'scale(0.8)';
                setTimeout(() => placedPieceElement.remove(), 200);
            }
            
            // Update piece state
            piece.isPlaced = false;
            piece.currentRow = null;
            piece.currentCol = null;
            
            // Return to pile with slight delay for animation
            setTimeout(() => {
                renderPiece(piece);
                updateRemainingCount();
            }, 250);
        }, index * 100); // Stagger the removal
    });
    
    // STEP 2: Wait for all removals to complete, then start placing pieces
    const removalDelay = incorrectlyPlaced.length > 0 ? (incorrectlyPlaced.length * 100) + 500 : 100;
    
    setTimeout(() => {
        console.log(`Removed ${incorrectlyPlaced.length} incorrectly placed pieces`);
        
        // Get all unplaced pieces (this will now include the returned pieces)
        const unplacedPieces = pieces.filter(p => !p.isPlaced);
        console.log('Unplaced pieces:', unplacedPieces.length);
        
        if (unplacedPieces.length === 0) {
            console.log('Puzzle already complete!');
            autoSolveInProgress = false;
            if (autoSolveBtn) {
                autoSolveBtn.disabled = false;
                autoSolveBtn.innerHTML = '<span class="btn-icon">⚡</span>Auto-Solve';
            }
            return;
        }
        
        // Place pieces one by one with delay
        let currentIndex = 0;
        
        function placeNextPiece() {
            if (currentIndex >= unplacedPieces.length) {
                // All pieces placed
                console.log('Auto-solve complete!');
                autoSolveInProgress = false;
                
                if (autoSolveBtn) {
                    autoSolveBtn.disabled = false;
                    autoSolveBtn.innerHTML = '<span class="btn-icon">⚡</span>Auto-Solve';
                }
                
                // Trigger completion check
                checkCompletion();
                return;
            }
            
            const piece = unplacedPieces[currentIndex];
            const row = piece.correctRow;
            const col = piece.correctCol;
            
            // Update piece state
            piece.currentRow = row;
            piece.currentCol = col;
            piece.isPlaced = true;
            
            // Build the placed element
            const cellIndex = row * GRID_SIZE + col;
            const cell = puzzleBoard.children[cellIndex];
            
            const placedPieceElement = document.createElement('div');
            placedPieceElement.className = 'placed-piece';
            
            const x = piece.correctCol * PIECE_SIZE;
            const y = piece.correctRow * PIECE_SIZE;
            
            placedPieceElement.style.backgroundImage = `url(${cachedImageDataURL})`;
            placedPieceElement.style.backgroundPosition = `-${x}px -${y}px`;
            placedPieceElement.dataset.id = piece.id;
            placedPieceElement.addEventListener('click', () => removePieceWithHistory(piece));
            
            // Add pop animation
            placedPieceElement.style.animation = 'popIn 0.3s ease';
            
            cell.appendChild(placedPieceElement);
            
            // Remove piece from pile
            const pieceEl = piecesPile.querySelector(`[data-id="${piece.id}"]`);
            if (pieceEl) {
                pieceEl.style.transition = 'opacity 0.2s ease';
                pieceEl.style.opacity = '0';
                setTimeout(() => pieceEl.remove(), 200);
            }
            
            updateRemainingCount();
            
            // Move to next piece
            currentIndex++;
            
            // Adjust delay based on remaining pieces (faster as we progress)
            const delay = Math.max(50, 150 - (currentIndex * 0.5));
            setTimeout(placeNextPiece, delay);
        }
        
        // Start placing pieces
        placeNextPiece();
    }, removalDelay);
}
// ─── Audio & Particle System ───────────────────────────────────

(function() {

    // ──────────────────────────────────
    // Particle spawner
    // ──────────────────────────────────
    const particleRoot = document.getElementById('bg-particles');
    const EMOJIS = ['💖','💕','✨','💗','🌸','💝','⭐','🌷'];

    function spawnParticle() {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

        // random horizontal position
        p.style.left = Math.random() * 100 + 'vw';

        // random fall duration
        const duration = 6 + Math.random() * 6;
        p.style.animationDuration = duration + 's';

        // random size
        p.style.fontSize = (1 + Math.random() * 1.5) + 'rem';

        particleRoot.appendChild(p);

        p.addEventListener('animationend', () => {
            p.remove();
        });
    }

    // continuous flow
    setInterval(spawnParticle, 400);


    function spawnOne() {
        if (spawnedCount >= PARTICLE_COUNT) {
            clearInterval(spawnTimer);
            spawnTimer = null;
            // restart the cycle after all have fallen off-screen
            setTimeout(() => { spawnedCount = 0; startParticles(); }, 8000);
            return;
        }

        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

        // random horizontal position
        p.style.left = (Math.random() * 100) + 'vw';
        // random duration between 6-11 seconds
        const dur = 6 + Math.random() * 5;
        p.style.animationDuration = dur + 's';
        // slight random delay so they don't all appear at once
        p.style.animationDelay = (Math.random() * 1) + 's';
        // random size variance
        const sizeRem = 1 + Math.random() * 1.2;
        p.style.fontSize = sizeRem + 'rem';

        particleRoot.appendChild(p);
        spawnedCount++;

        // self-remove after animation finishes
        p.addEventListener('animationend', () => p.remove());
    }

    // kick off particles as soon as the game is visible
    // (hook into the existing loadImage success path)
    const origLoadImage = window.loadImage;   // undefined — that's fine, we use event
    document.addEventListener('DOMContentLoaded', () => {
        startParticles();
    });


    // ──────────────────────────────────
    // Track switcher
    // ──────────────────────────────────
    function switchTo(audioEl, toneMelody) {
        // pause everything first
        [audioPuzzle, audioHangman, audioFinal, audioVictory].forEach(a => { if(a) a.pause(); });
        stopToneMelody();

        if (!musicOn) return;

        // If the <audio> has a real src loaded, use it; otherwise fall back to tone
        if (audioEl && audioEl.src && audioEl.readyState >= 2) {
            audioEl.currentTime = 0;
            audioEl.play().catch(() => {});
            currentTrack = audioEl;
        } else {
            playToneMelody(toneMelody, 100);
            currentTrack = null;
        }
    }

    function playSfx(audioEl) {
        if (!musicOn) return;
        ensureAudioCtx();
        if (audioEl && audioEl.src && audioEl.readyState >= 2) {
            audioEl.currentTime = 0;
            audioEl.play().catch(() => {});
        } else {
            // quick celebratory arpegio
            ensureAudioCtx();
            const notes = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5];
            let t = audioCtx.currentTime + 0.05;
            notes.forEach(freq => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0.18, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                o.connect(g); g.connect(audioCtx.destination);
                o.start(t); o.stop(t + 0.4);
                t += 0.18;
            });
        }
    }

    // ──────────────────────────────────
    // Hook into existing screen transitions
    // ──────────────────────────────────

    // 1) Game screen appears (image loaded) — start puzzle music
    //    Patch the existing loadImage's onload by wrapping gameScreen reveal
    const _origShowGame = () => switchTo(audioPuzzle, MELODY_PUZZLE);
    // We observe gameScreen losing 'hidden' class
    new MutationObserver((muts) => {
        muts.forEach(m => {
            if (m.target.id === 'game-screen' && !m.target.classList.contains('hidden')) {
                _origShowGame();
            }
        });
    }).observe(document.getElementById('game-screen'), { attributes: true, attributeFilter: ['class'] });

    // 2) Celebration (hangman) screen appears
    new MutationObserver((muts) => {
        muts.forEach(m => {
            if (m.target.id === 'celebration-screen' && !m.target.classList.contains('hidden')) {
                switchTo(audioHangman, MELODY_HANGMAN);
            }
        });
    }).observe(document.getElementById('celebration-screen'), { attributes: true, attributeFilter: ['class'] });

    // 3) Final screen appears + play victory SFX
    new MutationObserver((muts) => {
        muts.forEach(m => {
            if (m.target.id === 'final-screen' && !m.target.classList.contains('hidden')) {
                playSfx(audioVictory);
                // short delay then switch to final ambient
                setTimeout(() => switchTo(audioFinal, MELODY_FINAL), 1500);
            }
        });
    }).observe(document.getElementById('final-screen'), { attributes: true, attributeFilter: ['class'] });

    // ──────────────────────────────────
    // Music toggle button
    // ──────────────────────────────────
    musicToggleBtn.addEventListener('click', () => {
        musicOn = !musicOn;
        musicToggleBtn.textContent = musicOn ? '🔊' : '🔇';

        if (!musicOn) {
            [audioPuzzle, audioHangman, audioFinal, audioVictory].forEach(a => { if(a) a.pause(); });
            stopToneMelody();
        } else {
            // resume whichever screen we're on
            if (!document.getElementById('game-screen').classList.contains('hidden'))      switchTo(audioPuzzle, MELODY_PUZZLE);
            else if (!document.getElementById('celebration-screen').classList.contains('hidden')) switchTo(audioHangman, MELODY_HANGMAN);
            else if (!document.getElementById('final-screen').classList.contains('hidden'))       switchTo(audioFinal, MELODY_FINAL);
        }
    });

})();