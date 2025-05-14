/**
 * Game manager for the Canadian Coin Counter game
 */
import { Coin } from './Coin.js';
import { getRandomInt, formatCurrency, resolveCollision, clamp } from '../utils/mathHelpers.js';
import { updateUserCount, updateActualTotal } from '../utils/canvasHelpers.js';

export class Game {
  /**
   * Create a new game instance
   * @param {p5} p - The p5 instance
   * @param {Object} coinImages - Object containing loaded coin images
   */
  constructor(p, coinImages) {
    this.p = p;
    this.coinImages = coinImages;
    this.coins = [];
    this.draggedCoin = null;
    this.totalValue = 0;
    this.userGuess = 0;
    this.gameEnded = false;
    this.debugMode = false; // Debug flag
    
    // Game configuration
    this.minCoins = 5;
    this.maxCoins = 12;
    
    // Initialize game
    this.init();
    
    // Setup event listeners for game controls
    this.setupEventListeners();
  }
  
  /**
   * Initialize the game with random coins
   */
  init() {
    this.coins = [];
    this.gameEnded = false;
    this.totalValue = 0;
    
    // Reset UI displays
    updateUserCount('$0.00');
    updateActualTotal('$0.00', false);
    
    // Generate random coins
    const numCoins = getRandomInt(this.minCoins, this.maxCoins);
    
    // Coin types and their probabilities
    const coinTypes = ['toonie', 'loonie', 'quarter', 'dime', 'nickel'];
    
    for (let i = 0; i < numCoins; i++) {
      // Choose a random coin type
      const coinType = coinTypes[getRandomInt(0, coinTypes.length - 1)];
      
      // Find a valid position for the new coin
      let validPosition = false;
      let x, y;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!validPosition && attempts < maxAttempts) {
        // Generate random position within canvas
        const padding = 50;
        x = getRandomInt(padding, this.p.width - padding);
        y = getRandomInt(padding, this.p.height - padding);
        
        // Create a temporary coin to check for collisions
        const tempCoin = new Coin(this.p, x, y, coinType, this.coinImages);
        
        // Check if this coin overlaps with any existing coins
        validPosition = this.coins.every(coin => {
          const dx = coin.x - tempCoin.x;
          const dy = coin.y - tempCoin.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance > (coin.radius + tempCoin.radius);
        });
        
        attempts++;
      }
      
      // If we found a valid position, create the coin
      if (validPosition) {
        const coin = new Coin(this.p, x, y, coinType, this.coinImages);
        this.coins.push(coin);
        this.totalValue += coin.value;
      }
    }
    
    console.log(`Game started with ${this.coins.length} coins. Total value: ${formatCurrency(this.totalValue)}`);
  }
  
  /**
   * Setup event listeners for game controls
   */
  setupEventListeners() {
    const submitBtn = document.getElementById('submit-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const debugBtn = document.getElementById('debug-btn');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.checkAnswer();
      });
    }
    
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        this.init();
      });
    }
    
    if (debugBtn) {
      debugBtn.addEventListener('click', () => {
        this.toggleDebugMode();
      });
    } else {
      // Create debug button if it doesn't exist
      this.createDebugButton();
    }
  }
  
  /**
   * Create a debug button if it doesn't exist
   */
  createDebugButton() {
    const controlsDiv = document.querySelector('.buttons');
    if (controlsDiv) {
      const debugBtn = document.createElement('button');
      debugBtn.id = 'debug-btn';
      debugBtn.textContent = 'Debug Mode';
      debugBtn.addEventListener('click', () => {
        this.toggleDebugMode();
      });
      controlsDiv.appendChild(debugBtn);
    }
  }
  
  /**
   * Toggle debug mode
   */
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    
    // Update button text if it exists
    const debugBtn = document.getElementById('debug-btn');
    if (debugBtn) {
      debugBtn.textContent = this.debugMode ? 'Hide Debug' : 'Debug Mode';
    }
  }
  
  /**
   * Handle canvas resize
   * @param {number} width - New canvas width
   * @param {number} height - New canvas height
   */
  handleCanvasResize(width, height) {
    // Ensure all coins stay within new boundaries
    for (const coin of this.coins) {
      coin.x = clamp(coin.x, coin.radius, width - coin.radius);
      coin.y = clamp(coin.y, coin.radius, height - coin.radius);
    }
  }
  
  /**
   * Handle mouse pressed event
   */
  handleMousePressed() {
    if (this.gameEnded) return;
    
    // Check if mouse is over any coin
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (coin.isMouseOver(this.p.mouseX, this.p.mouseY)) {
        // Move this coin to the top of the stack (end of array)
        this.coins.splice(i, 1);
        this.coins.push(coin);
        
        // Start dragging the coin
        coin.startDrag(this.p.mouseX, this.p.mouseY);
        this.draggedCoin = coin;
        break;
      }
    }
  }
  
  /**
   * Handle mouse released event
   */
  handleMouseReleased() {
    if (this.draggedCoin) {
      this.draggedCoin.stopDrag();
      this.draggedCoin = null;
    }
  }
  
  /**
   * Update game state
   */
  update() {
    // Update dragged coin position
    if (this.draggedCoin) {
      this.draggedCoin.updateDrag(this.p.mouseX, this.p.mouseY, 0, this.p.width, 0, this.p.height);
    }
    
    // Check and resolve collisions between coins
    for (let i = 0; i < this.coins.length; i++) {
      for (let j = i + 1; j < this.coins.length; j++) {
        const coin1 = this.coins[i];
        const coin2 = this.coins[j];
        
        // Calculate distance between coins
        const dx = coin2.x - coin1.x;
        const dy = coin2.y - coin1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check for collision
        if (distance < (coin1.radius + coin2.radius)) {
          // Resolve the collision
          const { circle1, circle2 } = resolveCollision(
            { x: coin1.x, y: coin1.y, radius: coin1.radius },
            { x: coin2.x, y: coin2.y, radius: coin2.radius }
          );
          
          // Collision Normal (points from coin1 to coin2)
          const normalX = dx / distance;
          const normalY = dy / distance;

          // Calculate relative velocity for collision response
          const velX1 = coin1.vel.x;
          const velY1 = coin1.vel.y;
          const velX2 = coin2.vel.x;
          const velY2 = coin2.vel.y;
          
          // Relative velocity magnitude along collision normal
          const vRelNormal = (velX2 - velX1) * normalX + 
                             (velY2 - velY1) * normalY;
          
          // Only proceed with collision response if coins are moving toward each other
          if (vRelNormal < 0) {
            // Bounciness. e = 1 perfectly elastic like billard balls
            // e = 0 perfectly inelastic objects stick together
            const elasticity = 0.08;
            const totalMass = coin1.mass + coin2.mass;
            // const impulse = (2 * vRelNormal * elasticity) / totalMass;
            const impulseMagnitude = -(1 + elasticity) * vRelNormal / (1 / coin1.mass + 1 / coin2.mass);

            const impulseX = normalX * impulseMagnitude;
            const impulseY = normalY * impulseMagnitude;
            
            // Only apply physics to non-dragged coins
            if (coin1 !== this.draggedCoin) {
              coin1.x = circle1.x;
              coin1.y = circle1.y;
              
              // Apply impulse directly to coin1's velocity
              coin1.vel.x -= impulseX / coin1.mass; // J/m for coin1, impulse is opposite to normal
              coin1.vel.y -= impulseY / coin1.mass;
              
              // Apply slight spin based on tangential velocity component
              const tangentialComponent = Math.abs((velX2 - velX1) * (-dy / distance) + 
                                              (velY2 - velY1) * (dx / distance));
              coin1.rotation += tangentialComponent * 0.01;
            }
            
            if (coin2 !== this.draggedCoin) {
              coin2.x = circle2.x;
              coin2.y = circle2.y;
              
              // Apply impulse directly to coin2's velocity
              coin2.vel.x += impulseX / coin2.mass; // J/m for coin2, impulse is along normal
              coin2.vel.y += impulseY / coin2.mass;
              
              // Apply slight spin based on tangential velocity component
              const tangentialComponent = Math.abs((velX1 - velX2) * (-dy / distance) + 
                                              (velY1 - velY2) * (dx / distance));
              coin2.rotation += tangentialComponent * 0.01;
            }
          } else {
            // Coins are separating, just fix positions
            if (coin1 !== this.draggedCoin) {
              coin1.x = circle1.x;
              coin1.y = circle1.y;
            }
            
            if (coin2 !== this.draggedCoin) {
              coin2.x = circle2.x;
              coin2.y = circle2.y;
            }
          }
        }
      }
    }
    
    // Update physics for all coins
    for (const coin of this.coins) {
      coin.update(0, this.p.width, 0, this.p.height);
    }
  }
  
  /**
   * Draw all coins and game elements
   */
  draw() {
    // Draw all coins
    for (const coin of this.coins) {
      coin.draw();
      
      // Draw debug outlines if debug mode is enabled
      if (this.debugMode) {
        this.p.push();
        this.p.noFill();
        this.p.stroke(255, 0, 0, 150);
        this.p.strokeWeight(2);
        this.p.circle(coin.x, coin.y, coin.radius * 2);
        
        // Draw a cross at the center
        this.p.stroke(0, 255, 0, 150);
        this.p.line(coin.x - 5, coin.y, coin.x + 5, coin.y);
        this.p.line(coin.x, coin.y - 5, coin.x, coin.y + 5);
        
        // Draw velocity vector
        const vectorScale = 2; // Scale factor to make vectors visible
        this.p.stroke(0, 0, 255);
        this.p.strokeWeight(2);
        const endX = coin.x + (coin.vel.x * vectorScale);
        const endY = coin.y + (coin.vel.y * vectorScale);
        this.p.line(coin.x, coin.y, endX, endY);
        
        // Draw arrowhead
        const arrowSize = 7;
        const angle = Math.atan2(coin.vel.y, coin.vel.x);
        if (coin.vel.mag() > 0.01) { // Only draw arrowhead if vector is visible
          this.p.push();
          this.p.translate(endX, endY);
          this.p.rotate(angle);
          this.p.fill(0, 0, 255, 200);
          this.p.triangle(0, 0, -arrowSize, arrowSize/2, -arrowSize, -arrowSize/2);
          this.p.pop();
        }
        
        // Show coin value and type
        this.p.fill(0, 0, 255, 200);
        this.p.noStroke();
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(10);
        this.p.text(`${coin.type} ($${coin.value.toFixed(2)})`, coin.x, coin.y - coin.radius - 5);
        
        // Show velocity magnitude if non-zero
        if (coin.vel.mag() > 0.01) {
          this.p.fill(0, 0, 255, 200);
          this.p.text(`v: ${coin.vel.mag().toFixed(2)}`, coin.x, coin.y + coin.radius + 15);
        }
        this.p.pop();
      }
    }
    
    // Display velocity of dragged coin
    if (this.debugMode && this.draggedCoin) {
      const velocity = this.draggedCoin.vel;
      const speed = velocity.mag().toFixed(2);
      const direction = Math.atan2(velocity.y, velocity.x) * 180 / Math.PI;
      
      // Display at the top of the screen
      let top = 100;
      this.p.push();
      this.p.fill(40, 40, 200);
      this.p.noStroke();
      this.p.textSize(16);
      this.p.textAlign(this.p.LEFT);
      this.p.text(`Dragged Coin Velocity:`, 20, top);
      this.p.text(`Speed: ${speed} pixels/sec`, 20, top+25);
      this.p.text(`Direction: ${direction.toFixed(0)}°`, 20, top+50);
      this.p.text(`X: ${velocity.x.toFixed(2)}, Y: ${velocity.y.toFixed(2)}`, 20, top+75);
      this.p.pop();
    }
    
    // Display game over message if game has ended
    if (this.gameEnded) {
      this.p.fill(0, 0, 0, 200);
      this.p.rect(0, 0, this.p.width, this.p.height);
      
      this.p.fill(255);
      this.p.textSize(32);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text('Game Over!', this.p.width/2, this.p.height/2 - 50);
      
      this.p.textSize(24);
      this.p.text(`Your count: ${formatCurrency(this.userGuess)}`, this.p.width/2, this.p.height/2);
      this.p.text(`Actual total: ${formatCurrency(this.totalValue)}`, this.p.width/2, this.p.height/2 + 50);
      
      const difference = Math.abs(this.userGuess - this.totalValue);
      if (difference < 0.01) {
        this.p.fill(40, 200, 40);
        this.p.text('Perfect count! Well done!', this.p.width/2, this.p.height/2 + 100);
      } else {
        this.p.fill(200, 40, 40);
        this.p.text(`You were off by ${formatCurrency(difference)}. Try again!`, this.p.width/2, this.p.height/2 + 100);
      }
    }
  }
  
  /**
   * Check the user's answer against the actual total
   */
  checkAnswer() {
    // Parse the user's count from the UI
    const userCountElement = document.getElementById('user-count');
    if (userCountElement) {
      this.userGuess = parseFloat(userCountElement.textContent.replace('$', '')) || 0;
    }
    
    this.gameEnded = true;
    updateActualTotal(formatCurrency(this.totalValue), true);
    
    // Display results
    console.log(`User guessed: ${formatCurrency(this.userGuess)}, Actual: ${formatCurrency(this.totalValue)}`);
  }
  
  /**
   * Handle key pressed events
   */
  handleKeyPressed() {
    // Press 'r' to rotate the currently selected coin
    if (this.p.key === 'r' && this.draggedCoin) {
      this.draggedCoin.rotation += this.p.PI / 4;
    }
    
    // Press 'c' to check the answer
    if (this.p.key === 'c') {
      this.checkAnswer();
    }
    
    // Press 'n' to start a new game
    if (this.p.key === 'n') {
      this.init();
    }
    
    // Press 'd' to toggle debug mode
    if (this.p.key === 'd' && this.p.keyCode !== 68) { // Make sure it's not conflicting with the dime shortcut
      this.toggleDebugMode();
    }
    
    // Arrow keys to adjust user count
    if (!this.gameEnded) {
      const userCountElement = document.getElementById('user-count');
      if (userCountElement) {
        let currentCount = parseFloat(userCountElement.textContent.replace('$', '')) || 0;
        
        // Handle more coin increments for different keys
        if (this.p.keyCode === this.p.UP_ARROW) {
          currentCount += 0.05;  // Add a nickel
        } else if (this.p.keyCode === this.p.DOWN_ARROW) {
          currentCount = Math.max(0, currentCount - 0.05);  // Subtract a nickel, min 0
        } else if (this.p.keyCode === this.p.RIGHT_ARROW) {
          currentCount += 0.25;  // Add a quarter
        } else if (this.p.keyCode === this.p.LEFT_ARROW) {
          currentCount = Math.max(0, currentCount - 0.25);  // Subtract a quarter, min 0
        } else if (this.p.key === '1') {
          currentCount += 1.00;  // Add a loonie
        } else if (this.p.key === '2') {
          currentCount += 2.00;  // Add a toonie
        } else if (this.p.key === 'q') {
          currentCount -= 1.00;  // Subtract a loonie
        } else if (this.p.key === 'w') {
          currentCount -= 2.00;  // Subtract a toonie
        } else if (this.p.key === 'd') {
          currentCount += 0.10;  // Add a dime
        } else if (this.p.key === 's') {
          currentCount = Math.max(0, currentCount - 0.10);  // Subtract a dime
        }
        
        // Keep count at or above 0
        currentCount = Math.max(0, currentCount);
        
        updateUserCount(formatCurrency(currentCount));
      }
    }
  }
}