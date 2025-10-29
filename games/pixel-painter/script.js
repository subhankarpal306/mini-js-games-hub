// Pixel Painter Game
const refCanvas = document.getElementById('refCanvas');
const playerCanvas = document.getElementById('playerCanvas');
const refCtx = refCanvas.getContext('2d');
const playerCtx = playerCanvas.getContext('2d');

const gridSize = 16;
const pixelSize = 10;
let zoom = 1;
let currentTool = 'brush';
let currentColor = '#000000';
let moves = 0;
let undoStack = [];

const refGrid = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Create a heart pattern
for (let i = 4; i < 12; i++) {
  for (let j = 4; j < 12; j++) {
    if ((i === 4 && j >= 6 && j <= 9) ||
        (i === 5 && j >= 5 && j <= 10) ||
        (i >= 6 && i <= 9 && j >= 4 && j <= 11) ||
        (i === 10 && j >= 6 && j <= 9) ||
        (i === 11 && j === 7 || j === 8)) {
      refGrid[i][j] = 1;
    }
  }
}

let playerGrid = Array.from({length: gridSize}, () => Array(gridSize).fill(0));

function drawGrid(ctx, grid, colors) {
  ctx.clearRect(0, 0, 160, 160);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const color = colors ? colors[grid[i][j]] : (grid[i][j] ? '#000' : '#fff');
      ctx.fillStyle = color;
      ctx.fillRect(j * pixelSize * zoom, i * pixelSize * zoom, pixelSize * zoom, pixelSize * zoom);
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(j * pixelSize * zoom, i * pixelSize * zoom, pixelSize * zoom, pixelSize * zoom);
    }
  }
}

function initGame() {
  drawGrid(refCtx, refGrid, {0: '#fff', 1: '#f00'});
  drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
  updateUI();
}

function getGridPos(x, y) {
  const rect = playerCanvas.getBoundingClientRect();
  const scaleX = 160 / rect.width;
  const scaleY = 160 / rect.height;
  const canvasX = (x - rect.left) * scaleX;
  const canvasY = (y - rect.top) * scaleY;
  const gridX = Math.floor(canvasX / (pixelSize * zoom));
  const gridY = Math.floor(canvasY / (pixelSize * zoom));
  return {x: gridX, y: gridY};
}

function paintPixel(x, y) {
  if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
    saveState();
    playerGrid[y][x] = currentColor === '#000000' ? 1 : 0; // Simplify to black/white
    moves++;
    drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
    updateUI();
  }
}

function floodFill(x, y, targetColor, replacementColor) {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return;
  if (playerGrid[y][x] !== targetColor) return;
  playerGrid[y][x] = replacementColor;
  floodFill(x + 1, y, targetColor, replacementColor);
  floodFill(x - 1, y, targetColor, replacementColor);
  floodFill(x, y + 1, targetColor, replacementColor);
  floodFill(x, y - 1, targetColor, replacementColor);
}

function bucketFill(x, y) {
  const target = playerGrid[y][x];
  const replacement = currentColor === '#000000' ? 1 : 0;
  if (target === replacement) return;
  saveState();
  floodFill(x, y, target, replacement);
  moves++;
  drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
  updateUI();
}

function saveState() {
  undoStack.push(JSON.parse(JSON.stringify(playerGrid)));
  if (undoStack.length > 10) undoStack.shift();
}

function undo() {
  if (undoStack.length > 0) {
    playerGrid = undoStack.pop();
    moves = Math.max(0, moves - 1);
    drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
    updateUI();
  }
}

function calculateAccuracy() {
  let correct = 0;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (playerGrid[i][j] === refGrid[i][j]) correct++;
    }
  }
  return Math.round((correct / (gridSize * gridSize)) * 100);
}

function calculateScore() {
  const accuracy = calculateAccuracy();
  return moves > 0 ? Math.round((accuracy * 100) / moves) : 0;
}

function updateUI() {
  document.getElementById('moves').textContent = 'Moves: ' + moves;
  document.getElementById('accuracy').textContent = 'Accuracy: ' + calculateAccuracy() + '%';
  document.getElementById('score').textContent = 'Score: ' + calculateScore();
}

// Event listeners
playerCanvas.addEventListener('click', e => {
  const pos = getGridPos(e.clientX, e.clientY);
  if (currentTool === 'brush') {
    paintPixel(pos.x, pos.y);
  } else if (currentTool === 'bucket') {
    bucketFill(pos.x, pos.y);
  }
});

document.querySelectorAll('.tool').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
  });
});

document.querySelectorAll('.color').forEach(c => {
  c.addEventListener('click', () => {
    document.querySelectorAll('.color').forEach(col => col.classList.remove('selected'));
    c.classList.add('selected');
    currentColor = c.dataset.color;
  });
});

document.getElementById('zoomIn').addEventListener('click', () => {
  zoom = Math.min(2, zoom + 0.5);
  drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
});

document.getElementById('zoomOut').addEventListener('click', () => {
  zoom = Math.max(0.5, zoom - 0.5);
  drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
});

document.getElementById('undo').addEventListener('click', undo);

document.getElementById('reset').addEventListener('click', () => {
  playerGrid = Array.from({length: gridSize}, () => Array(gridSize).fill(0));
  moves = 0;
  undoStack = [];
  drawGrid(playerCtx, playerGrid, {0: '#fff', 1: '#000'});
  updateUI();
});

document.addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '6') {
    const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    currentColor = colors[parseInt(e.key) - 1];
    document.querySelectorAll('.color').forEach((c, i) => {
      c.classList.toggle('selected', i === parseInt(e.key) - 1);
    });
  } else if (e.key === 'b') {
    currentTool = 'brush';
    document.querySelectorAll('.tool').forEach(b => b.classList.toggle('active', b.dataset.tool === 'brush'));
  } else if (e.key === 'f') {
    currentTool = 'bucket';
    document.querySelectorAll('.tool').forEach(b => b.classList.toggle('active', b.dataset.tool === 'bucket'));
  } else if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    undo();
  }
});

initGame();