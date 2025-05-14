/**
 * Represents a Canadian coin in the coin counting game
 */
export class Coin {
  /**
   * Create a new coin
   * @param {p5} p - The p5 instance
   * @param {number} x - X position of the coin
   * @param {number} y - Y position of the coin
   * @param {string} type - Type of coin (toonie, loonie, quarter, dime, nickel)
   * @param {Object} images - Object containing loaded images for coins
   */
  constructor(p, x, y, type, images) {
    this.p = p;
    this.x = x;
    this.y = y;
    // Add previous position tracking for velocity calculation
    this.prevX = x;
    this.prevY = y;
    this.type = type;
    this.rotation = p.random(0, p.TWO_PI);
    this.dragging = false;
    this.image = images[type];
    
    // Set coin properties based on type
    switch(type) {
      case 'toonie':
        this.radius = 59;
        this.value = 2.00;
        break;
      case 'loonie':
        this.radius = 55.5;
        this.value = 1.00;
        break;
      case 'quarter':
        this.radius = 50;
        this.value = 0.25;
        break;
      case 'dime':
        this.radius = 38;
        this.value = 0.10;
        break;
      case 'nickel':
        this.radius = 44.5;
        this.value = 0.05;
        break;
      default:
        this.radius = 20;
        this.value = 0;
    }

    this.visualRadius = this.radius;
    this.radius *= 0.90;
    
    // Calculate mass based on radius (proportional to area: πr²)
    this.mass = Math.PI * this.radius * this.radius * 0.01;
    
    // Save the offset from mouse to center of coin when dragging
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Vector for velocity when moving coins
    this.vel = p.createVector(0, 0);
    
    // Track time for calculating velocity during drag
    this.lastUpdateTime = p.millis();
  }
  
  /**
   * Draw the coin on the canvas
   */
  draw() {
    const p = this.p;
    p.push();
    p.translate(this.x, this.y);
    p.rotate(this.rotation);
    
    if (this.image) {
      p.imageMode(p.CENTER);
      p.image(this.image, 0, 0, this.visualRadius * 2, this.visualRadius * 2);
    } else {
      // Fallback if image isn't loaded
      p.fill(200, 200, 200);
      p.ellipse(0, 0, this.visualRadius * 2);
      p.fill(0);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(this.type, 0, 0);
    }
    
    p.pop();
  }
  
  /**
   * Check if the mouse is over this coin
   * @param {number} mx - Mouse X position
   * @param {number} my - Mouse Y position
   * @returns {boolean} True if mouse is over coin
   */
  isMouseOver(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
  
  /**
   * Start dragging this coin
   * @param {number} mx - Mouse X position
   * @param {number} my - Mouse Y position
   */
  startDrag(mx, my) {
    this.dragging = true;
    this.offsetX = this.x - mx;
    this.offsetY = this.y - my;
    this.lastUpdateTime = this.p.millis();
  }
  
  /**
   * Stop dragging this coin
   */
  stopDrag() {
    this.dragging = false;
  }
  
  /**
   * Update coin position during drag
   * @param {number} mx - Mouse X position
   * @param {number} my - Mouse Y position
   * @param {number} minX - Minimum X boundary
   * @param {number} maxX - Maximum X boundary
   * @param {number} minY - Minimum Y boundary
   * @param {number} maxY - Maximum Y boundary
   */
  updateDrag(mx, my, minX, maxX, minY, maxY) {
    if (this.dragging) {
      // Save previous position
      this.prevX = this.x;
      this.prevY = this.y;
      
      // Get current time
      const currentTime = this.p.millis();
      const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
      
      // Update position based on mouse and offset
      this.x = Math.max(minX + this.radius, Math.min(maxX - this.radius, mx + this.offsetX));
      this.y = Math.max(minY + this.radius, Math.min(maxY - this.radius, my + this.offsetY));
      
      // Calculate velocity based on position change
      if (deltaTime > 0) {
        let velX = (this.x - this.prevX) / deltaTime;
        let velY = (this.y - this.prevY) / deltaTime;

        const scaleFactor = 0.05;
        velX *= scaleFactor;
        velY *= scaleFactor;
        this.vel.set(velX, velY);

        // Limit the magnitude of the coin's velocity (this.vel)
        // This is the maximum speed the coin will have when released, after the scaleFactor is applied.
        const maxThrowSpeed = 5; // Adjust this value as needed (pixels per second)
        this.vel.limit(maxThrowSpeed); 
      }
      
      // Update time
      this.lastUpdateTime = currentTime;
      
      // Slowly rotate the coin when dragging
      // this.rotation += 0.02;
    }
  }
  
  /**
   * Applies force to the coin (when pushed by another coin)
   * @param {number} fx - Force in X direction
   * @param {number} fy - Force in Y direction
   */
  applyForce(fx, fy) {
    // F = ma, so a = F/m
    this.vel.x += fx / this.mass;
    this.vel.y += fy / this.mass;
  }
  
  /**
   * Update physics of the coin
   * @param {number} minX - Minimum X boundary
   * @param {number} maxX - Maximum X boundary
   * @param {number} minY - Minimum Y boundary
   * @param {number} maxY - Maximum Y boundary
   */
  update(minX, maxX, minY, maxY) {
    if (!this.dragging) {
      // Save previous position
      this.prevX = this.x;
      this.prevY = this.y;
      
      // Apply velocity
      this.x += this.vel.x;
      this.y += this.vel.y;
      
      // --- NEW FRICTION MODEL ---
      const speed = this.vel.mag(); // Magnitude of the velocity vector
      if (speed > 0) { // Only apply friction if the coin is moving
        // Friction force opposes direction of motion
        // We can't use a true "force" that acts over time for friction in an impulse system's update step
        // Instead, we directly reduce velocity.

        // Option A: Constant Deceleration (more like sliding friction)
        // This will reduce the speed by a fixed amount each frame, until it stops.
        const frictionMagnitude = 0.1; // Tune this value! Higher means more friction (stops faster)
                                      // This is pixels/frame^2 if you think of it as deceleration.

        if (speed < frictionMagnitude) {
          // If the speed is less than the amount we want to reduce it by, just stop it.
          // This prevents the coin from reversing direction due to friction.
          this.vel.set(0, 0);
        } else {
          // Reduce speed by frictionMagnitude in the opposite direction of velocity
          const frictionDecelX = (this.vel.x / speed) * frictionMagnitude;
          const frictionDecelY = (this.vel.y / speed) * frictionMagnitude;
          this.vel.x -= frictionDecelX;
          this.vel.y -= frictionDecelY;
        }

        // Option B: Velocity-Dependent Damping (your current approach, but can be tuned)
        // This makes friction stronger at higher speeds.
        // const frictionCoefficient = 0.05; // Tune this value (0.01 to 0.1 is a typical range)
                                        // Higher means it slows down faster.
        // this.vel.mult(1 - frictionCoefficient);

      } // --- END NEW FRICTION MODEL ---

      // Check boundary collisions
      if (this.x < minX + this.radius) {
        this.x = minX + this.radius;
        this.vel.x *= -0.7;
      } else if (this.x > maxX - this.radius) {
        this.x = maxX - this.radius;
        this.vel.x *= -0.7;
      }
      
      if (this.y < minY + this.radius) {
        this.y = minY + this.radius;
        this.vel.y *= -0.7;
      } else if (this.y > maxY - this.radius) {
        this.y = maxY - this.radius;
        this.vel.y *= -0.7;
      }
    }
  }
}