/**
 * Utility functions for mathematical operations
 */

/**
 * Clamps a value between a minimum and maximum
 * @param {number} val - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {number} The clamped value
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Checks if two circles overlap
 * @param {Object} circle1 - First circle with x, y, radius properties
 * @param {Object} circle2 - Second circle with x, y, radius properties
 * @returns {boolean} True if the circles overlap
 */
export function circlesOverlap(circle1, circle2) {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < (circle1.radius + circle2.radius);
}

/**
 * Formats a number as Canadian currency
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

/**
 * Gets a random integer between min (inclusive) and max (inclusive)
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} A random integer
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the angle between two points
 * @param {number} x1 - x coordinate of first point
 * @param {number} y1 - y coordinate of first point
 * @param {number} x2 - x coordinate of second point
 * @param {number} y2 - y coordinate of second point
 * @returns {number} The angle in radians
 */
export function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Resolves collision between two circles by moving them apart
 * @param {Object} circle1 - First circle object with x, y, radius properties
 * @param {Object} circle2 - Second circle object with x, y, radius properties
 * @returns {Object} New positions for both circles
 */
export function resolveCollision(circle1, circle2) {
  const dx = circle2.x - circle1.x;
  const dy = circle2.y - circle1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // If circles are exactly on top of each other, move slightly
  if (distance === 0) {
    circle2.x += 0.1;
    return { circle1, circle2 };
  }
  
  // Calculate how much the circles overlap
  const overlap = (circle1.radius + circle2.radius) - distance;
  
  if (overlap <= 0) {
    // No collision
    return { circle1, circle2 };
  }
  
  // Move circles apart proportionally to their radii
  const moveX = (overlap * dx) / distance;
  const moveY = (overlap * dy) / distance;
  
  return {
    circle1: {
      ...circle1,
      x: circle1.x - moveX / 2,
      y: circle1.y - moveY / 2
    },
    circle2: {
      ...circle2,
      x: circle2.x + moveX / 2,
      y: circle2.y + moveY / 2
    }
  };
}