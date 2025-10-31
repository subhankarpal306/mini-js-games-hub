// Nebula Navigator Game Script
// Pilot your ship through space, avoiding asteroids and collecting fuel.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const fuelElement = document.getElementById('fuel');
const scoreElement = document.getElementById('score');

// Game variables
let ship = { x: 400, y: 300, angle: 0, speed: 0 };
let asteroids = [];
let fuels = [];
let stations = [];
let fuelLevel = 100;
let score = 0;
let gameRunning = true;
let keys = {};

// Constants
const shipSize = 15;
const asteroidSpeed = 1;
const fuelSpeed = 0.5;
const stationSpeed = 0.3;
const fuelDrain = 0.1;

// Initialize game
function init() {
    // Create initial elements
    for (let i = 0; i < 5; i++) {
        createAsteroid();
        createFuel();
    }
    createStation();

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Handle input
    if (keys.ArrowUp) ship.speed = Math.min(ship.speed + 0.1, 3);
    if (keys.ArrowDown) ship.speed = Math.max(ship.speed - 0.1, 0);
    if (keys.ArrowLeft) ship.angle -= 0.1;
    if (keys.ArrowRight) ship.angle += 0.1;

    // Move ship
    ship.x += Math.cos(ship.angle) * ship.speed;
    ship.y += Math.sin(ship.angle) * ship.speed;

    // Keep ship in bounds
    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;

    // Move asteroids
    asteroids.forEach(ast => {
        ast.x += ast.dx;
        ast.y += ast.dy;
        if (ast.x < -50) ast.x = canvas.width + 50;
        if (ast.x > canvas.width + 50) ast.x = -50;
        if (ast.y < -50) ast.y = canvas.height + 50;
        if (ast.y > canvas.height + 50) ast.y = -50;
    });

    // Move fuels
    fuels.forEach(f => {
        f.x += f.dx;
        f.y += f.dy;
        if (f.x < -20) f.x = canvas.width + 20;
        if (f.x > canvas.width + 20) f.x = -20;
        if (f.y < -20) f.y = canvas.height + 20;
        if (f.y > canvas.height + 20) f.y = -20;
    });

    // Move stations
    stations.forEach(s => {
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < -30) s.x = canvas.width + 30;
        if (s.x > canvas.width + 30) s.x = -30;
        if (s.y < -30) s.y = canvas.height + 30;
        if (s.y > canvas.height + 30) s.y = -30;
    });

    // Drain fuel
    fuelLevel -= fuelDrain;
    if (fuelLevel <= 0) {
        gameRunning = false;
        alert('Out of fuel! Game Over. Score: ' + score);
    }

    // Check collisions
    checkCollisions();
}

// Draw everything
function draw() {
    // Clear canvas with nebula effect
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(shipSize, 0);
    ctx.lineTo(-shipSize/2, -shipSize/2);
    ctx.lineTo(-shipSize/2, shipSize/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw asteroids
    ctx.fillStyle = '#666666';
    asteroids.forEach(ast => {
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw fuels
    ctx.fillStyle = '#ffff00';
    fuels.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw stations
    ctx.fillStyle = '#0000ff';
    stations.forEach(s => ctx.fillRect(s.x - 15, s.y - 15, 30, 30));

    // Update displays
    fuelElement.textContent = 'Fuel: ' + Math.floor(fuelLevel);
    scoreElement.textContent = 'Score: ' + score;
}

// Handle input
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// Create asteroid
function createAsteroid() {
    asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 20 + 10,
        dx: (Math.random() - 0.5) * asteroidSpeed,
        dy: (Math.random() - 0.5) * asteroidSpeed
    });
}

// Create fuel
function createFuel() {
    fuels.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * fuelSpeed,
        dy: (Math.random() - 0.5) * fuelSpeed
    });
}

// Create station
function createStation() {
    stations.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * stationSpeed,
        dy: (Math.random() - 0.5) * stationSpeed
    });
}

// Check collisions
function checkCollisions() {
    // Ship with asteroids
    asteroids.forEach(ast => {
        const dist = Math.sqrt((ship.x - ast.x)**2 + (ship.y - ast.y)**2);
        if (dist < ast.radius + shipSize/2) {
            gameRunning = false;
            alert('Collision! Game Over. Score: ' + score);
        }
    });

    // Ship with fuels
    fuels.forEach((f, i) => {
        const dist = Math.sqrt((ship.x - f.x)**2 + (ship.y - f.y)**2);
        if (dist < 10) {
            fuels.splice(i, 1);
            fuelLevel = Math.min(fuelLevel + 20, 100);
            score += 10;
            createFuel(); // Spawn new fuel
        }
    });

    // Ship with stations
    stations.forEach(s => {
        if (Math.abs(ship.x - s.x) < 25 && Math.abs(ship.y - s.y) < 25) {
            fuelLevel = 100;
            score += 50;
        }
    });
}

// Start the game
init();