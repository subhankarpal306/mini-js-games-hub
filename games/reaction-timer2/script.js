// --- Game State Constants ---
const STATE_INITIAL = 'state-initial';
const STATE_WAIT = 'state-wait';
const STATE_READY = 'state-ready';
const STATE_RESULT = 'state-result';

// --- Timing Variables ---
let timeoutId = null; // Stores the ID for the setTimeout that triggers the 'ready' state
let startTime = 0;    // Stores the high-precision timestamp when the screen turns green
let highScore = localStorage.getItem('reactionHighScore') ? parseFloat(localStorage.getItem('reactionHighScore')) : Infinity;

// --- DOM Elements ---
const gameScreen = document.getElementById('game-screen');
const mainText = document.getElementById('main-text');
const subText = document.getElementById('sub-text');
const highScoreDisplay = document.getElementById('high-score-display');

// --- Initialization and High Score Display ---
document.addEventListener('DOMContentLoaded', () => {
    gameScreen.addEventListener('click', handleClick);
    updateHighScoreDisplay();
});

/**
 * Updates the high score text shown at the bottom of the screen.
 */
function updateHighScoreDisplay() {
    if (highScore !== Infinity) {
        highScoreDisplay.textContent = `Best Time: ${highScore.toFixed(3)} ms`;
    } else {
        highScoreDisplay.textContent = `Best Time: N/A`;
    }
}

// --- State Management ---

/**
 * Sets the screen state and updates text.
 * @param {string} newState - One of the STATE_ constants.
 */
function setGameState(newState) {
    // 1. Clear previous state classes
    gameScreen.classList.remove(STATE_INITIAL, STATE_WAIT, STATE_READY, STATE_RESULT);
    
    // 2. Add new state class
    gameScreen.classList.add(newState);

    // 3. Update Text Content based on the state
    switch (newState) {
        case STATE_INITIAL:
            mainText.textContent = "Click anywhere to begin!";
            subText.textContent = "Wait for the screen to turn green, then click as fast as you can.";
            break;
        case STATE_WAIT:
            mainText.textContent = "WAIT...";
            subText.textContent = "Get Ready. Click *after* it turns green.";
            break;
        case STATE_READY:
            mainText.textContent = "CLICK NOW!";
            subText.textContent = "Tap!";
            break;
        case STATE_RESULT:
            // This state's text is handled dynamically in handleReadyClick
            subText.textContent = "Click again to try another round.";
            break;
    }
}

// --- Game Flow Functions ---

/**
 * Starts the waiting phase.
 */
function startWaitState() {
    // Clear any previous timeouts just in case
    clearTimeout(timeoutId);
    
    setGameState(STATE_WAIT);
    
    // Generate a random delay between 2 and 5 seconds (2000ms to 5000ms)
    const delay = Math.random() * 3000 + 2000;
    
    // Set the timeout to transition to the READY state
    timeoutId = setTimeout(startReadyState, delay);
}

/**
 * Starts the ready phase.
 */
function startReadyState() {
    // Record the precise time the screen turns green
    startTime = performance.now();
    setGameState(STATE_READY);
}

/**
 * Ends the game and displays the result.
 * @param {number} time - The measured reaction time in milliseconds.
 */
function showResult(time) {
    clearTimeout(timeoutId);
    setGameState(STATE_RESULT);
    
    // Check and update high score
    if (time < highScore) {
        highScore = time;
        localStorage.setItem('reactionHighScore', highScore);
        updateHighScoreDisplay();
        mainText.textContent = `New Record! ${time.toFixed(3)} ms`;
    } else {
        mainText.textContent = `Your Time: ${time.toFixed(3)} ms`;
    }
}

/**
 * Handles all click events based on the current state.
 */
function handleClick() {
    const currentState = gameScreen.classList[0]; // Get the first class, which is the state

    switch (currentState) {
        case STATE_INITIAL:
        case STATE_RESULT:
            // Start the game or restart after a result
            startWaitState();
            break;

        case STATE_WAIT:
            // Penalty for clicking before the green light
            handleEarlyClick();
            break;

        case STATE_READY:
            // Successful click
            handleReadyClick();
            break;
    }
}

/**
 * Handles a click during the READY state (successful reaction).
 */
function handleReadyClick() {
    const endTime = performance.now();
    const reactionTime = endTime - startTime;
    showResult(reactionTime);
}

/**
 * Handles a click during the WAIT state (early click penalty).
 */
function handleEarlyClick() {
    clearTimeout(timeoutId); // Stop the green light from ever appearing
    setGameState(STATE_RESULT);
    
    mainText.textContent = "TOO SOON!";
    subText.textContent = "You must wait for the screen to turn green. Click to try again.";
}
