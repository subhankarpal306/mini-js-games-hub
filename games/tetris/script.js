const PIECE_TYPES = {
    I: 1,
    O: 2,
    T: 3,
    S: 4,
    Z: 5,
    J: 6,
    L: 7
};

const pieces = [
    {
        shape: [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        type: PIECE_TYPES.I
    },
    {
        shape: [
            [1,1],
            [1,1]
        ],
        type: PIECE_TYPES.O
    },
    {
        shape: [
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ],
        type: PIECE_TYPES.T
    },
    {
        shape: [
            [0,1,1],
            [1,1,0],
            [0,0,0]
        ],
        type: PIECE_TYPES.S
    },
    {
        shape: [
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ],
        type: PIECE_TYPES.Z
    },
    {
        shape: [
            [1,0,0],
            [1,1,1],
            [0,0,0]
        ],
        type: PIECE_TYPES.J
    },
    {
        shape: [
            [0,0,1],
            [1,1,1],
            [0,0,0]
        ],
        type: PIECE_TYPES.L
    }
];

const colors = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];

const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const blockSize = 30;
const rows = 20;
const cols = 10;

let board = Array(rows).fill().map(() => Array(cols).fill(0));
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let level = 1;
let lines = 0;
let nextPieceIndex = Math.floor(Math.random() * pieces.length);
let heldPiece = null;
let canHold = true;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw board
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x]) {
                ctx.fillStyle = colors[board[y][x] - 1];
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
    // draw current piece
    if (currentPiece) {
        // draw ghost piece
        let ghostY = getGhostY(currentPiece.shape, currentX, currentY);
        ctx.globalAlpha = 0.3;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillStyle = colors[currentPiece.type - 1];
                    ctx.fillRect((currentX + x) * blockSize, (ghostY + y) * blockSize, blockSize, blockSize);
                    ctx.strokeRect((currentX + x) * blockSize, (ghostY + y) * blockSize, blockSize, blockSize);
                }
            }
        }
        ctx.globalAlpha = 1;
        // draw current piece
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillStyle = colors[currentPiece.type - 1];
                    ctx.fillRect((currentX + x) * blockSize, (currentY + y) * blockSize, blockSize, blockSize);
                    ctx.strokeRect((currentX + x) * blockSize, (currentY + y) * blockSize, blockSize, blockSize);
                }
            }
        }
    }
    drawNext();
    drawHold();
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    let piece = pieces[nextPieceIndex];
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                nextCtx.fillStyle = colors[piece.type - 1];
                nextCtx.fillRect(x * 20 + 20, y * 20 + 20, 20, 20);
                nextCtx.strokeRect(x * 20 + 20, y * 20 + 20, 20, 20);
            }
        }
    }
}

function drawHold() {
    const holdCanvas = document.getElementById('hold-canvas');
    const holdCtx = holdCanvas.getContext('2d');
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (heldPiece) {
        for (let y = 0; y < heldPiece.shape.length; y++) {
            for (let x = 0; x < heldPiece.shape[y].length; x++) {
                if (heldPiece.shape[y][x]) {
                    holdCtx.fillStyle = colors[heldPiece.type - 1];
                    holdCtx.fillRect(x * 20 + 20, y * 20 + 20, 20, 20);
                    holdCtx.strokeRect(x * 20 + 20, y * 20 + 20, 20, 20);
                }
            }
        }
    }
}

function collision(piece, x, y) {
    for (let py = 0; py < piece.length; py++) {
        for (let px = 0; px < piece[py].length; px++) {
            if (piece[py][px]) {
                let newX = x + px;
                let newY = y + py;
                if (newX < 0 || newX >= cols || newY >= rows || (newY >= 0 && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentY + y][currentX + x] = currentPiece.type;
            }
        }
    }
    canHold = true;
}

function clearLines() {
    let linesCleared = 0;
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        let basePoints = [0, 40, 100, 300, 1200];
        score += basePoints[linesCleared] * level;
    }
}

function getGhostY(piece, x, y) {
    let ghostY = y;
    while (!collision(piece, x, ghostY + 1)) {
        ghostY++;
    }
    return ghostY;
}

function newPiece() {
    currentPiece = pieces[nextPieceIndex];
    currentX = Math.floor(cols / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    nextPieceIndex = Math.floor(Math.random() * pieces.length);
    if (collision(currentPiece.shape, currentX, currentY)) {
        // game over
        alert('Game Over! Score: ' + score);
        board = Array(rows).fill().map(() => Array(cols).fill(0));
        score = 0;
        level = 1;
        lines = 0;
        heldPiece = null;
        canHold = true;
    }
}

function gameLoop() {
    if (collision(currentPiece.shape, currentX, currentY + 1)) {
        placePiece();
        clearLines();
        newPiece();
    } else {
        currentY++;
    }
    draw();
    updateUI();
    let baseSpeed = 500;
    let speed = Math.max(50, baseSpeed - (level - 1) * 50);
    setTimeout(gameLoop, speed);
}

function updateUI() {
    document.getElementById('score').textContent = 'Score: ' + score;
    document.getElementById('level').textContent = 'Level: ' + level;
    document.getElementById('lines').textContent = 'Lines: ' + lines;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && !collision(currentPiece.shape, currentX - 1, currentY)) {
        currentX--;
    } else if (e.key === 'ArrowRight' && !collision(currentPiece.shape, currentX + 1, currentY)) {
        currentX++;
    } else if (e.key === 'ArrowDown') {
        if (!collision(currentPiece.shape, currentX, currentY + 1)) {
            currentY++;
            score += 1;
        }
    } else if (e.key === 'ArrowUp') {
        let rotated = rotate(currentPiece.shape);
        if (!collision(rotated, currentX, currentY)) {
            currentPiece.shape = rotated;
        }
    } else if (e.key === ' ' && canHold) {
        if (heldPiece === null) {
            heldPiece = currentPiece;
            newPiece();
        } else {
            [currentPiece, heldPiece] = [heldPiece, currentPiece];
            currentX = Math.floor(cols / 2) - Math.floor(currentPiece.shape[0].length / 2);
            currentY = 0;
        }
        canHold = false;
    } else if (e.key === 'd' || e.key === 'D') {
        let dropY = getGhostY(currentPiece.shape, currentX, currentY);
        score += (dropY - currentY) * 2;
        currentY = dropY;
        placePiece();
        clearLines();
        newPiece();
        draw();
        return;
    }
    draw();
});

newPiece();
gameLoop();