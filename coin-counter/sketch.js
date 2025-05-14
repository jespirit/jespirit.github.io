/**
 * Canadian Coin Counter Game
 * A p5.js game where users count Canadian coins
 */
import { setupCanvas, preloadCoinImages, handleWindowResize } from './utils/canvasHelpers.js';
import { Game } from './classes/Game.js';

// Using p5.js instance mode to avoid polluting global scope
const sketch = (p) => {
  // Game variables
  let game;
  let coinImages;
  
  p.preload = () => {
    // Preload coin images (fallback to placeholders if images aren't available)
    try {
      coinImages = preloadCoinImages(p);
    } catch (e) {
      console.warn('Failed to load coin images, using placeholders', e);
      coinImages = { toonie: null, loonie: null, quarter: null, dime: null, nickel: null };
    }
  };
  
  p.setup = () => {
    // Create responsive canvas and place it in the game-canvas div
    const parentElement = document.getElementById('game-canvas');
    const canvasWidth = parentElement ? parentElement.offsetWidth : 800;
    const canvasHeight = 600;
    
    setupCanvas(p, canvasWidth, canvasHeight);
    
    // Initialize game
    game = new Game(p, coinImages);
    
    // Set text properties
    p.textFont('Arial');
    p.textSize(16);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      handleWindowResize(p, 300, canvasWidth / canvasHeight);
      
      // Ensure coins stay within new boundaries after resize
      if (game) {
        game.handleCanvasResize(p.width, p.height);
      }
    });
  };
  
  p.draw = () => {
    // Clear the background
    p.background(240);
    
    // Update and draw the game
    game.update();
    game.draw();
    
    // Draw instructions
    if (!game.gameEnded) {
      p.fill(80);
      p.textAlign(p.LEFT, p.TOP);
      p.text('Click and drag to move coins', 10, 10);
      p.text('Press R to rotate selected coin', 10, 30);
      p.text('Use arrow keys to adjust your count', 10, 50);
      p.text('Press C to check your answer', 10, 70);
    }
  };
  
  // Event handlers
  p.mousePressed = () => {
    game.handleMousePressed();
  };
  
  p.mouseReleased = () => {
    game.handleMouseReleased();
  };
  
  p.keyPressed = () => {
    game.handleKeyPressed();
  };
};

// Start the sketch
new p5(sketch);