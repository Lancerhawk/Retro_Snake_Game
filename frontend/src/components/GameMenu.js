import React from 'react';
import './GameMenu.css';

const GameMenu = ({ 
  onStartGame, 
  onShowInstructions, 
  onToggleSound, 
  soundEnabled, 
  highScore,
  showInstructions,
  onHideInstructions 
}) => {
  const difficulties = [
    { key: 'easy', label: 'Easy', description: 'Relaxed pace, fewer obstacles' },
    { key: 'medium', label: 'Medium', description: 'Moderate challenge' },
    { key: 'hard', label: 'Hard', description: 'Fast-paced, many obstacles' }
  ];

  if (showInstructions) {
    return (
      <div className="game-menu instructions-screen">
        <div className="menu-container">
          <h1 className="game-title">How to Play</h1>
          <div className="instructions-content">
            <div className="instruction-section">
              <h3>🎮 Controls</h3>
              <ul>
                <li><strong>Desktop:</strong> Use Arrow Keys or WASD to move</li>
                <li><strong>Mobile:</strong> Swipe in any direction</li>
                <li><strong>Pause:</strong> Press Space Bar</li>
              </ul>
            </div>
            
            <div className="instruction-section">
              <h3>🍎 Fruits & Points</h3>
              <ul>
                <li><span className="fruit apple">🍎</span> Apple: 10 points</li>
                <li><span className="fruit cherry">🍒</span> Cherry: 20 points</li>
                <li><span className="fruit banana">🍌</span> Banana: 15 points</li>
                <li><span className="fruit grape">🍇</span> Grape: 25 points</li>
              </ul>
            </div>
            
            <div className="instruction-section">
              <h3>⚡ Power-ups</h3>
              <ul>
                <li><span className="power-up invincibility">🛡️</span> Invincibility: Pass through obstacles and yourself</li>
                <li><span className="power-up slow">⏳</span> Slow Motion: Slows down game speed</li>
                <li><span className="power-up double">💎</span> Double Points: 2x points for a limited time</li>
              </ul>
            </div>
            
            <div className="instruction-section">
              <h3>🎯 Game Rules</h3>
              <ul>
                <li>Eat fruits to grow longer and score points</li>
                <li>Avoid hitting walls, obstacles, or your own tail</li>
                <li>Snake gets faster as you eat more fruits</li>
                <li>Collect power-ups for special abilities</li>
                <li>Try to beat your high score!</li>
              </ul>
            </div>
          </div>
          
          <button className="menu-button back-button" onClick={onHideInstructions}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-menu">
      <div className="menu-container">
        <h1 className="game-title">
          <span className="title-snake">🐍</span>
          RETRO SNAKE
          <span className="title-apple">🍎</span>
        </h1>
        
        <div className="high-score-display">
          <span className="high-score-label">High Score:</span>
          <span className="high-score-value">{highScore.toLocaleString()}</span>
        </div>
        
        <div className="menu-buttons">
          <div className="difficulty-section">
            <h3>Choose Difficulty</h3>
            <div className="difficulty-buttons">
              {difficulties.map(diff => (
                <button
                  key={diff.key}
                  className={`difficulty-button ${diff.key}`}
                  onClick={() => onStartGame(diff.key)}
                >
                  <span className="difficulty-label">{diff.label}</span>
                  <span className="difficulty-desc">{diff.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="menu-actions">
            <button className="menu-button" onClick={onShowInstructions}>
              📖 Instructions
            </button>
            
            <button className="menu-button sound-toggle" onClick={onToggleSound}>
              {soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'}
            </button>
          </div>
        </div>
        
        <div className="menu-footer">
          <p>Built with ❤️ for retro gaming enthusiasts</p>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;