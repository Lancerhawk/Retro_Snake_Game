import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './GameBoard';
import GameMenu from './GameMenu';
import GameHUD from './GameHUD';
import GameOver from './GameOver';
import './SnakeGame.css';

const DIFFICULTY_SETTINGS = {
  easy: {
    speed: 150,
    obstacleFrequency: 0.002,
    powerUpFrequency: 0.003,
    label: 'Easy'
  },
  medium: {
    speed: 120,
    obstacleFrequency: 0.004,
    powerUpFrequency: 0.002,
    label: 'Medium'
  },
  hard: {
    speed: 90,
    obstacleFrequency: 0.006,
    powerUpFrequency: 0.001,
    label: 'Hard'
  }
};

const FRUITS = [
  { type: 'apple', points: 10, color: '#ff4444' },
  { type: 'cherry', points: 20, color: '#ff1493' },
  { type: 'banana', points: 15, color: '#ffff00' },
  { type: 'grape', points: 25, color: '#9400d3' }
];

const POWER_UPS = [
  { type: 'invincibility', duration: 5000, color: '#00ff00' },
  { type: 'slow_motion', duration: 3000, color: '#87ceeb' },
  { type: 'double_points', duration: 8000, color: '#ffd700' }
];

const BOARD_SIZE = 20;
const CELL_SIZE = 20;

const SnakeGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [difficulty, setDifficulty] = useState('easy');
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 15, ...FRUITS[0] });
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(DIFFICULTY_SETTINGS.easy.speed);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const gameLoopRef = useRef(null);
  const lastMoveTimeRef = useRef(0);
  const touchStartRef = useRef(null);
  const powerUpTimeoutRef = useRef(null);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Save high score to localStorage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [score, highScore]);

  // Generate random position that doesn't collide with snake or obstacles
  const generateRandomPosition = useCallback((currentSnake = snake, currentObstacles = obstacles) => {
    let newPos;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    do {
      newPos = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
      attempts++;
      
      if (attempts > maxAttempts) {
        // Fallback position if we can't find a free space
        newPos = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };
        break;
      }
    } while (
      currentSnake.some(segment => segment.x === newPos.x && segment.y === newPos.y) ||
      currentObstacles.some(obstacle => obstacle.x === newPos.x && obstacle.y === newPos.y)
    );
    return newPos;
  }, [snake, obstacles]);

  // Generate new food
  const generateFood = useCallback((currentSnake = snake, currentObstacles = obstacles) => {
    const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const position = generateRandomPosition(currentSnake, currentObstacles);
    setFood({ ...position, ...randomFruit });
  }, [generateRandomPosition, snake, obstacles]);

  // Generate obstacle
  const generateObstacle = useCallback((currentSnake = snake, currentObstacles = obstacles) => {
    const position = generateRandomPosition(currentSnake, currentObstacles);
    setObstacles(prev => [...prev, { ...position, id: Date.now() }]);
  }, [generateRandomPosition, snake, obstacles]);

  // Generate power-up
  const generatePowerUp = useCallback((currentSnake = snake, currentObstacles = obstacles) => {
    const randomPowerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
    const position = generateRandomPosition(currentSnake, currentObstacles);
    setPowerUps(prev => [...prev, { ...position, ...randomPowerUp, id: Date.now() }]);
  }, [generateRandomPosition, snake, obstacles]);

  // Play sound effect
  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'eat':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      case 'powerUp':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        break;
      case 'gameOver':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        break;
      default:
        return;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [soundEnabled]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;

      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        KeyW: { x: 0, y: -1 },
        KeyS: { x: 0, y: 1 },
        KeyA: { x: -1, y: 0 },
        KeyD: { x: 1, y: 0 }
      };

      const newDirection = keyMap[e.code];
      if (newDirection) {
        // Prevent reversing into itself
        if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
          setDirection(newDirection);
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, direction]);

  // Handle touch input for mobile
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current || gameState !== 'playing') return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        let newDirection;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newDirection = deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
          newDirection = deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }

        // Prevent reversing into itself
        if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
          setDirection(newDirection);
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, direction]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = (currentTime) => {
      const timeSinceLastMove = currentTime - lastMoveTimeRef.current;
      const currentSpeed = activePowerUp?.type === 'slow_motion' ? gameSpeed * 2 : gameSpeed;

      if (timeSinceLastMove >= currentSpeed) {
        // Only move if direction is set (not 0,0)
        if (direction.x !== 0 || direction.y !== 0) {
          setSnake(prevSnake => {
            const newSnake = [...prevSnake];
            const head = { ...newSnake[0] };
            
            head.x += direction.x;
            head.y += direction.y;

            // Check wall collision
            if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
              playSound('gameOver');
              setGameState('gameOver');
              return prevSnake;
            }

            // Check self collision
            if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
              if (activePowerUp?.type !== 'invincibility') {
                playSound('gameOver');
                setGameState('gameOver');
                return prevSnake;
              }
            }

            // Check obstacle collision
            if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
              if (activePowerUp?.type !== 'invincibility') {
                playSound('gameOver');
                setGameState('gameOver');
                return prevSnake;
              }
            }

            newSnake.unshift(head);

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
              const pointMultiplier = activePowerUp?.type === 'double_points' ? 2 : 1;
              setScore(prev => prev + food.points * pointMultiplier);
              playSound('eat');
              
              // Generate new food with current snake state
              const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
              const position = generateRandomPosition(newSnake, obstacles);
              setFood({ ...position, ...randomFruit });
              
              // Increase speed slightly
              setGameSpeed(prev => Math.max(prev - 2, 50));
            } else {
              newSnake.pop();
            }

            // Check power-up collision
            const powerUpIndex = powerUps.findIndex(powerUp => powerUp.x === head.x && powerUp.y === head.y);
            if (powerUpIndex !== -1) {
              const powerUp = powerUps[powerUpIndex];
              setPowerUps(prev => prev.filter((_, index) => index !== powerUpIndex));
              setActivePowerUp(powerUp);
              playSound('powerUp');

              // Clear existing timeout
              if (powerUpTimeoutRef.current) {
                clearTimeout(powerUpTimeoutRef.current);
              }

              // Set new timeout
              powerUpTimeoutRef.current = setTimeout(() => {
                setActivePowerUp(null);
              }, powerUp.duration);
            }

            return newSnake;
          });
        }

        lastMoveTimeRef.current = currentTime;
      }

      // Random obstacle generation (only if snake is moving)
      if ((direction.x !== 0 || direction.y !== 0) && Math.random() < DIFFICULTY_SETTINGS[difficulty].obstacleFrequency) {
        const position = generateRandomPosition(snake, obstacles);
        setObstacles(prev => [...prev, { ...position, id: Date.now() }]);
      }

      // Random power-up generation (only if snake is moving)
      if ((direction.x !== 0 || direction.y !== 0) && Math.random() < DIFFICULTY_SETTINGS[difficulty].powerUpFrequency) {
        const randomPowerUp = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
        const position = generateRandomPosition(snake, obstacles);
        setPowerUps(prev => [...prev, { ...position, ...randomPowerUp, id: Date.now() }]);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, direction, food, obstacles, powerUps, activePowerUp, gameSpeed, difficulty, generateFood, generateObstacle, generatePowerUp, playSound]);

  // Start new game
  const startNewGame = useCallback((selectedDifficulty) => {
    const newSnake = [{ x: 10, y: 10 }];
    const newObstacles = [];
    
    setDifficulty(selectedDifficulty);
    setSnake(newSnake);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setObstacles(newObstacles);
    setPowerUps([]);
    setActivePowerUp(null);
    setGameSpeed(DIFFICULTY_SETTINGS[selectedDifficulty].speed);
    
    // Generate food with the new snake position
    const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const position = generateRandomPosition(newSnake, newObstacles);
    setFood({ ...position, ...randomFruit });
    
    setGameState('playing');
    lastMoveTimeRef.current = 0;
    
    if (powerUpTimeoutRef.current) {
      clearTimeout(powerUpTimeoutRef.current);
    }
  }, [generateRandomPosition]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // Return to menu
  const goToMenu = useCallback(() => {
    setGameState('menu');
    if (powerUpTimeoutRef.current) {
      clearTimeout(powerUpTimeoutRef.current);
    }
  }, []);

  return (
    <div className="snake-game">
      {gameState === 'menu' && (
        <GameMenu
          onStartGame={startNewGame}
          onShowInstructions={() => setShowInstructions(true)}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          soundEnabled={soundEnabled}
          highScore={highScore}
          showInstructions={showInstructions}
          onHideInstructions={() => setShowInstructions(false)}
        />
      )}
      
      {gameState === 'playing' || gameState === 'paused' ? (
        <div className="game-container">
          <GameHUD
            score={score}
            highScore={highScore}
            difficulty={DIFFICULTY_SETTINGS[difficulty].label}
            activePowerUp={activePowerUp}
            isPaused={gameState === 'paused'}
            onPause={togglePause}
            onQuit={goToMenu}
          />
          <GameBoard
            snake={snake}
            food={food}
            obstacles={obstacles}
            powerUps={powerUps}
            activePowerUp={activePowerUp}
            boardSize={BOARD_SIZE}
            cellSize={CELL_SIZE}
            isPaused={gameState === 'paused'}
          />
        </div>
      ) : null}
      
      {gameState === 'gameOver' && (
        <GameOver
          score={score}
          highScore={highScore}
          isNewHighScore={score === highScore && score > 0}
          onRestart={() => startNewGame(difficulty)}
          onMenu={goToMenu}
        />
      )}
    </div>
  );
};

export default SnakeGame;