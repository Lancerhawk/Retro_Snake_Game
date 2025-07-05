import React from 'react';
import './GameHUD.css';

const GameHUD = ({ 
  score, 
  highScore, 
  difficulty, 
  activePowerUp, 
  isPaused, 
  onPause, 
  onQuit 
}) => {
  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getPowerUpIcon = (type) => {
    switch (type) {
      case 'invincibility':
        return '🛡️';
      case 'slow_motion':
        return '⏳';
      case 'double_points':
        return '💎';
      default:
        return '⚡';
    }
  };

  const getPowerUpName = (type) => {
    switch (type) {
      case 'invincibility':
        return 'Invincibility';
      case 'slow_motion':
        return 'Slow Motion';
      case 'double_points':
        return 'Double Points';
      default:
        return 'Power-up';
    }
  };

  return (
    <div className="game-hud">
      <div className="hud-left">
        <div className="score-display">
          <span className="score-label">Score:</span>
          <span className="score-value">{score.toLocaleString()}</span>
        </div>
        
        <div className="high-score-display">
          <span className="high-score-label">Best:</span>
          <span className="high-score-value">{highScore.toLocaleString()}</span>
        </div>
        
        <div className="difficulty-display">
          <span className="difficulty-label">Mode:</span>
          <span className="difficulty-value">{difficulty}</span>
        </div>
      </div>
      
      <div className="hud-center">
        {activePowerUp && (
          <div className="power-up-display">
            <div className="power-up-icon">
              {getPowerUpIcon(activePowerUp.type)}
            </div>
            <div className="power-up-info">
              <span className="power-up-name">
                {getPowerUpName(activePowerUp.type)}
              </span>
              <div className="power-up-timer">
                <div 
                  className="timer-bar"
                  style={{
                    animationDuration: `${activePowerUp.duration}ms`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="hud-right">
        <button className="hud-button pause-button" onClick={onPause}>
          {isPaused ? '▶️' : '⏸️'}
        </button>
        
        <button className="hud-button quit-button" onClick={onQuit}>
          🏠
        </button>
      </div>
    </div>
  );
};

export default GameHUD;