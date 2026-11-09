(function() {
  // ==========================================
  // Configurations & DOM Elements
  // ==========================================
  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  
  const $ = (id) => document.getElementById(id);

  // ==========================================
  // Game State Variables
  // ==========================================
  let snake = [];
  let currentDir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 0, y: 0 };
  let score = 0;
  let bestScore = 0;
  let gameTimer;
  let isRunning = false;

  try {
    bestScore = +localStorage.getItem('snake-best') || 0;
  } catch (e) {
    console.warn("Local storage not accessible");
  }
  $('b').textContent = bestScore;

  // ==========================================
  // Core Game Functions
  // ==========================================
  function getCssVar(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  }

  function spawnFood() {
    do {
      food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  }

  function startGame() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    currentDir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    
    $('s').textContent = 0;
    spawnFood();
    isRunning = true;
    $('ov').classList.add('hide');
    
    drawFrame();
    clearTimeout(gameTimer);
    gameTimer = setTimeout(gameTick, 150);
  }

  function gameOver() {
    isRunning = false;
    
    if (score > bestScore) {
      bestScore = score;
      $('b').textContent = bestScore;
      try {
        localStorage.setItem('snake-best', bestScore);
      } catch (e) {}
    }
    
    $('t').textContent = 'Game over';
    $('m').textContent = 'Score: ' + score + '. Dobara try karo!';
    $('go').textContent = 'Play again';
    $('ov').classList.remove('hide');
  }

  function gameTick() {
    if (!isRunning) return;
    
    currentDir = nextDir;
    const head = { 
      x: snake[0].x + currentDir.x, 
      y: snake[0].y + currentDir.y 
    };
    
    const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID_SIZE || head.y >= GRID_SIZE;
    const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
    
    if (hitWall || hitSelf) {
      drawFrame();
      return gameOver();
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
      score++;
      $('s').textContent = score;
      spawnFood();
    } else {
      snake.pop();
    }
    
    drawFrame();
    const speed = Math.max(65, 150 - score * 4);
    gameTimer = setTimeout(gameTick, speed);
  }

  function drawFrame() {
    ctx.clearRect(0, 0, 400, 400);
    
    ctx.fillStyle = getCssVar('--food');
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 3, 0, 7);
    ctx.fill();
    
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? getCssVar('--head') : getCssVar('--snake');
      ctx.beginPath();
      ctx.roundRect(
        segment.x * CELL_SIZE + 1, 
        segment.y * CELL_SIZE + 1, 
        CELL_SIZE - 2, 
        CELL_SIZE - 2, 
        isHead ? 9 : 6
      );
      ctx.fill();
    });
  }

  function setDirection(direction) {
    const moves = {
      u: { x: 0, y: -1 },
      d: { x: 0, y: 1 },
      l: { x: -1, y: 0 },
      r: { x: 1, y: 0 }
    };
    
    const move = moves[direction];
    if (move && !(move.x === -currentDir.x && move.y === -currentDir.y)) {
      nextDir = move;
    }
  }

  // ==========================================
  // Event Listeners
  // ==========================================
  document.addEventListener('keydown', (e) => {
    const keyMap = {
      ArrowUp: 'u', w: 'u',
      ArrowDown: 'd', s: 'd',
      ArrowLeft: 'l', a: 'l',
      ArrowRight: 'r', d: 'r'
    };
    
    const mappedKey = keyMap[e.key];
    
    if (mappedKey) {
      e.preventDefault();
      if (isRunning) setDirection(mappedKey);
    } else if ((e.key === ' ' || e.key === 'Enter') && !isRunning && document.activeElement !== $('go')) {
      startGame();
    }
  });

  document.querySelectorAll('.pad button').forEach(button => {
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (isRunning) setDirection(button.dataset.d);
    });
  });

  let startTouchX, startTouchY;
  
  document.body.addEventListener('touchstart', (e) => {
    startTouchX = e.touches[0].clientX;
    startTouchY = e.touches[0].clientY;
  }, { passive: true });
  
  document.body.addEventListener('touchmove', (e) => {
    if (startTouchX == null || !isRunning) return;
    
    const deltaX = e.touches[0].clientX - startTouchX;
    const deltaY = e.touches[0].clientY - startTouchY;
    
    if (Math.abs(deltaX) > 24 || Math.abs(deltaY) > 24) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection(deltaX > 0 ? 'r' : 'l');
      } else {
        setDirection(deltaY > 0 ? 'd' : 'u');
      }
      startTouchX = e.touches[0].clientX;
      startTouchY = e.touches[0].clientY;
    }
  }, { passive: true });

  $('go').addEventListener('click', startGame);

  // Initial Render
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  currentDir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food = { x: 14, y: 10 };
  drawFrame();
})();