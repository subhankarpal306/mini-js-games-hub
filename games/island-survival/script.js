// --- Game State and Constants ---
let player = {};
const STAT_LIMIT = 100;
const HEALTH_DECAY_RATE = 5;
const HUNGER_DECAY_RATE = 5;

// --- DOM References ---
const healthDisplay = document.getElementById('health-display');
const hungerDisplay = document.getElementById('hunger-display');
const woodDisplay = document.getElementById('wood-display');
const dayDisplay = document.getElementById('day-display');
const logArea = document.getElementById('log-area');

const actionButtons = [
    document.getElementById('gather-wood-btn'),
    document.getElementById('search-food-btn'),
    document.getElementById('rest-btn')
];
const restartBtn = document.getElementById('restart-btn');

// --- Initialization ---
function initializeGame() {
    player = {
        health: STAT_LIMIT,
        hunger: 50,
        wood: 0,
        day: 1,
        log: []
    };
    
    // Enable buttons
    actionButtons.forEach(btn => btn.disabled = false);
    restartBtn.style.display = 'none';

    player.log.push("Welcome! You awaken on Day 1. Find food and wood to survive.");
    renderUI();
}

// --- Core UI Update ---
function renderUI() {
    healthDisplay.textContent = player.health;
    hungerDisplay.textContent = player.hunger;
    woodDisplay.textContent = player.wood;
    dayDisplay.textContent = player.day;

    // Visual feedback for stats
    healthDisplay.className = player.health < 25 ? 'stat-danger' : player.health < 50 ? 'stat-warning' : 'stat-good';
    hungerDisplay.className = player.hunger < 25 ? 'stat-danger' : player.hunger < 50 ? 'stat-warning' : 'stat-good';

    // Update log display (show last 5 messages, reversed for latest first)
    logArea.innerHTML = player.log.slice(-5).reverse().join('<br>');

    // Wood specific check for resting
    const restBtn = document.getElementById('rest-btn');
    restBtn.disabled = player.wood < 5 && player.health < 100;
}

// --- Game Loop (Turn Advance) ---
function nextDay(message) {
    if (player.health <= 0) return; // Prevent action if already dead
    
    player.day++;
    player.log.push(message);

    // 1. Passive Decay
    player.hunger -= HUNGER_DECAY_RATE;
    
    // 2. Hunger Penalty
    if (player.hunger <= 0) {
        player.health -= HEALTH_DECAY_RATE;
        player.log.push("⚠️ Starving! Health decreased.");
    }

    // 3. Clamp Stats (Keep them in bounds)
    player.health = Math.min(Math.max(0, player.health), STAT_LIMIT);
    player.hunger = Math.min(Math.max(0, player.hunger), STAT_LIMIT);

    // 4. Check Game Over
    if (player.health <= 0) {
        player.log.push(`💀 GAME OVER: You survived ${player.day} days.`);
        disableActions();
    }

    renderUI();
}

function disableActions() {
    actionButtons.forEach(btn => btn.disabled = true);
    restartBtn.style.display = 'block';
}

// --- Action Handlers ---

function gatherWood() {
    const woodFound = Math.floor(Math.random() * 3) + 1; // Finds 1 to 3 wood
    const hungerCost = 8; 

    player.wood += woodFound;
    player.hunger -= hungerCost;
    
    nextDay(`✅ You spent the day gathering wood and found ${woodFound} logs.`);
}

function searchFood() {
    const foodFound = Math.random();
    const hungerCost = 12;
    let message;

    if (foodFound < 0.3) { // 30% failure
        message = "❌ You searched all day but only found a few rotten berries. No food gain.";
    } else {
        const hungerHealed = Math.floor(Math.random() * 20) + 10; // Heals 10 to 30 hunger
        player.hunger += hungerHealed;
        message = `🍖 Success! You found enough food to restore ${hungerHealed} hunger.`;
    }

    player.hunger -= hungerCost; // Cost applies regardless of success
    nextDay(message);
}

function rest() {
    const healthGained = 10;
    const woodCost = 5;

    if (player.wood < woodCost) {
        player.log.push("⛔ You need at least 5 wood to build a proper shelter and rest.");
        renderUI(); // Render without advancing day
        return; 
    }

    player.health += healthGained;
    player.wood -= woodCost;
    
    nextDay(`🛌 You built a safe shelter and rested. Health restored by ${healthGained}.`);
}


// --- Event Listeners and Setup ---
gatherWoodBtn.addEventListener('click', gatherWood);
searchFoodBtn.addEventListener('click', searchFood);
restBtn.addEventListener('click', rest);
restartBtn.addEventListener('click', initializeGame);

// Start the game when the script loads
initializeGame();