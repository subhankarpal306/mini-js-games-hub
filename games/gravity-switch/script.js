document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const gameMessage = document.getElementById('game-message');

    const GAME_WIDTH = canvas.width;
    const GAME_HEIGHT = canvas.height;

    // --- Game State ---
    let score = 0;
    let gameSpeed = 3;
    let isGravityNormal = true; // true: down, false: up
    let gameRunning = false;
    let animationFrameId;
    let obstacleTimer = 0;

    // --- Player Properties ---
    const PLAYER_SIZE = 20;
    let playerY = GAME_HEIGHT - PLAYER_SIZE;
    const GRAVITY = 0.5;
    let velocityY = 0;

    // --- Obstacle Properties ---
    const OBSTACLE_WIDTH = 40;
    const OBSTACLE_GAP = 100;
    let obstacles = [];

    // --- Core Functions ---

    function resetGame() {
        score = 0;
        playerY = GAME_HEIGHT - PLAYER_SIZE;
        velocityY = 0;
        isGravityNormal = true;
        gameRunning = true;
        obstacles = [];
        gameSpeed = 3;
        obstacleTimer = 0;
        gameMessage.textContent = '';
        scoreDisplay.textContent = score;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        gameLoop();
    }

    function drawPlayer() {
        ctx.fillStyle = isGravityNormal ? '#4CAF50' : '#FF5733'; // Green/Red based on gravity
        ctx.fillRect(50, playerY, PLAYER_SIZE, PLAYER_SIZE);
    }

    function drawObstacles() {
        ctx.fillStyle = '#FFC300'; // Yellow obstacles
        obstacles.forEach(obs => {
            // Draw floor obstacle
            ctx.fillRect(obs.x, GAME_HEIGHT - obs.height, OBSTACLE_WIDTH, obs.height);
            // Draw ceiling obstacle
            ctx.fillRect(obs.x, 0, OBSTACLE_WIDTH, GAME_HEIGHT - obs.height - OBSTACLE_GAP);
        });
    }

    function moveObstacles() {
        obstacles = obstacles.map(obs => ({
            ...obs,
            x: obs.x - gameSpeed
        })).filter(obs => obs.x > -OBSTACLE_WIDTH); // Remove off-screen obstacles

        // Increase score for passing obstacles
        obstacles.forEach(obs => {
            if (!obs.passed && obs.x + OBSTACLE_WIDTH < 50) {
                score++;
                obs.passed = true;
                scoreDisplay.textContent = score;
                if (score % 10 === 0) { // Speed up every 10 points
                    gameSpeed += 0.5;
                }
            }
        });
    }

    function generateObstacle() {
        // Random height for the floor obstacle part (min 50, max GAME_HEIGHT - OBSTACLE_GAP - 50)
        const minHeight = 50;
        const maxHeight = GAME_HEIGHT - OBSTACLE_GAP - minHeight;
        const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        obstacles.push({
            x: GAME_WIDTH,
            height: randomHeight,
            passed: false
        });
    }

    function checkCollision() {
        const playerX = 50;
        const playerBottom = playerY + PLAYER_SIZE;
        const playerRight = playerX + PLAYER_SIZE;

        // 1. Check Floor/Ceiling collision (Game Over condition)
        if (playerY < 0 || playerBottom > GAME_HEIGHT) {
            gameOver();
            return true;
        }

        // 2. Check Obstacle collision
        for (const obs of obstacles) {
            // Check if player is horizontally aligned with the obstacle
            if (playerRight > obs.x && playerX < obs.x + OBSTACLE_WIDTH) {
                // Check collision with floor obstacle part
                if (playerBottom > GAME_HEIGHT - obs.height) {
                    gameOver();
                    return true;
                }
                // Check collision with ceiling obstacle part
                if (playerY < GAME_HEIGHT - obs.height - OBSTACLE_GAP) {
                    gameOver();
                    return true;
                }
            }
        }
        return false;
    }

    function updatePlayer() {
        // Apply gravity based on direction
        velocityY += isGravityNormal ? GRAVITY : -GRAVITY;
        playerY += velocityY;

        // Clamp player position
        playerY = Math.max(0, Math.min(playerY, GAME_HEIGHT - PLAYER_SIZE));
    }

    function switchGravity() {
        isGravityNormal = !isGravityNormal;
        velocityY = 0; // Reset velocity on switch
    }

    // --- Game Loop ---
    function gameLoop() {
        if (!gameRunning) return;

        // 1. Clear Canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // 2. Game Logic Updates
        updatePlayer();
        moveObstacles();
        
        // 3. Generate New Obstacles
        obstacleTimer++;
        if (obstacleTimer >= 100) { // Generate new obstacle every 100 frames
            generateObstacle();
            obstacleTimer = 0;
        }

        // 4. Draw Elements
        drawObstacles();
        drawPlayer();

        // 5. Check for Failure
        if (checkCollision()) {
            return;
        }

        // 6. Loop
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationFrameId);
        gameMessage.textContent = `GAME OVER! Score: ${score}. Press Space to Restart.`;
    }

    // --- Event Listeners ---
    function handleKeyDown(e) {
        if (!gameRunning && e.code === 'Space') {
            resetGame();
        } else if (gameRunning && e.code === 'Space') {
            switchGravity();
        }
    }
    
    document.addEventListener('keydown', handleKeyDown);

    // Initial message
    gameMessage.textContent = 'Press SPACE to Start!';
});