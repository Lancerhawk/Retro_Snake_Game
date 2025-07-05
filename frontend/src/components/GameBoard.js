import React from 'react';
import './GameBoard.css';

const GameBoard = ({ 
  snake, 
  food, 
  obstacles, 
  powerUps, 
  activePowerUp, 
  boardSize, 
  cellSize, 
  isPaused 
}) => {
  const renderCell = (x, y) => {
    const isSnakeHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;
    const isObstacle = obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
    const powerUp = powerUps.find(powerUp => powerUp.x === x && powerUp.y === y);
    
    let cellClass = 'game-cell';
    let cellContent = '';
    let cellStyle = {};
    
    if (isSnakeHead) {
      cellClass += ' snake-head';
      if (activePowerUp?.type === 'invincibility') {
        cellClass += ' invincible';
      }
      cellContent = '🐍';
    } else if (isSnakeBody) {
      cellClass += ' snake-body';
      if (activePowerUp?.type === 'invincibility') {
        cellClass += ' invincible';
      }
    } else if (isFood) {
      cellClass += ' food';
      cellStyle.backgroundColor = food.color;
      switch (food.type) {
        case 'apple':
          cellContent = '🍎';
          break;
        case 'cherry':
          cellContent = '🍒';
          break;
        case 'banana':
          cellContent = '🍌';
          break;
        case 'grape':
          cellContent = '🍇';
          break;
        default:
          cellContent = '🍎';
      }
    } else if (isObstacle) {
      cellClass += ' obstacle';
      cellContent = '⬛';
    } else if (powerUp) {
      cellClass += ' power-up';
      cellStyle.backgroundColor = powerUp.color;
      switch (powerUp.type) {
        case 'invincibility':
          cellContent = '🛡️';
          break;
        case 'slow_motion':
          cellContent = '⏳';
          break;
        case 'double_points':
          cellContent = '💎';
          break;
        default:
          cellContent = '⚡';
      }
    }
    
    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        style={{
          ...cellStyle,
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          left: `${x * cellSize}px`,
          top: `${y * cellSize}px`,
        }}
      >
        {cellContent}
      </div>
    );
  };

  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        cells.push(renderCell(x, y));
      }
    }
    return cells;
  };

  return (
    <div className="game-board-container">
      <div 
        className={`game-board ${isPaused ? 'paused' : ''}`}
        style={{
          width: `${boardSize * cellSize}px`,
          height: `${boardSize * cellSize}px`,
        }}
      >
        {renderBoard()}
        
        {isPaused && (
          <div className="pause-overlay">
            <div className="pause-message">
              <h2>⏸️ PAUSED</h2>
              <p>Press SPACE to resume</p>
            </div>
          </div>
        )}
        
        {!isPaused && snake.length === 1 && (
          <div className="start-overlay">
            <div className="start-message">
              <h2>🎮 READY TO PLAY</h2>
              <p>Use Arrow Keys or WASD to start</p>
              <p className="mobile-hint">👆 Swipe to move on mobile</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;