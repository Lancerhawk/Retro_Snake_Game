import React from 'react';
import './GameOver.css';

const GameOver = ({ score, highScore, isNewHighScore, onRestart, onMenu }) => {
  return (
    <div className="game-over">
      <div className="game-over-container">
        <div className="game-over-content">
          <h1 className="game-over-title">
            {isNewHighScore ? '🎉 NEW HIGH SCORE! 🎉' : '💀 GAME OVER 💀'}
          </h1>
          
          <div className="score-summary">
            <div className="final-score">
              <span className="score-label">Final Score</span>
              <span className="score-value">{score.toLocaleString()}</span>
            </div>
            
            <div className="high-score-summary">
              <span className="high-score-label">High Score</span>
              <span className="high-score-value">{highScore.toLocaleString()}</span>
            </div>
          </div>
          
          {isNewHighScore && (
            <div className="new-record-message">
              <p>🏆 Congratulations! You've set a new record! 🏆</p>
            </div>
          )}
          
          <div className="motivational-message">
            {score === 0 && (
              <p>Don't give up! Every expert was once a beginner. 🚀</p>
            )}
            {score > 0 && score < 100 && (
              <p>Not bad! Keep practicing to improve your skills. 🎯</p>
            )}
            {score >= 100 && score < 500 && (
              <p>Good job! You're getting the hang of it. 🔥</p>
            )}
            {score >= 500 && score < 1000 && (
              <p>Impressive! You're becoming a Snake master! ⭐</p>
            )}
            {score >= 1000 && !isNewHighScore && (
              <p>Outstanding performance! You're a true Snake legend! 👑</p>
            )}
          </div>
          
          <div className="game-over-buttons">
            <button className="game-over-button restart-button" onClick={onRestart}>
              🔄 Play Again
            </button>
            
            <button className="game-over-button menu-button" onClick={onMenu}>
              🏠 Main Menu
            </button>
          </div>
          
          <div className="game-over-tips">
            <h3>💡 Pro Tips:</h3>
            <ul>
              <li>🍎 Different fruits give different points</li>
              <li>⚡ Collect power-ups for special abilities</li>
              <li>🎯 Plan your moves to avoid getting trapped</li>
              <li>🛡️ Use invincibility to pass through tight spots</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;