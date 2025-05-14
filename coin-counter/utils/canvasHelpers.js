/**
 * Canvas setup and p5.js helper utilities
 */

/**
 * Creates and sets up the canvas
 * @param {p5} p - The p5 instance
 * @param {number} width - Canvas width 
 * @param {number} height - Canvas height
 * @returns {HTMLElement} The created canvas element
 */
export function setupCanvas(p, width, height) {
  const canvas = p.createCanvas(width, height);
  canvas.parent('game-canvas');
  return canvas;
}

/**
 * Preloads images for different Canadian coins
 * @param {p5} p - The p5 instance
 * @returns {Object} Object containing loaded images
 */
export function preloadCoinImages(p) {
  const coinImages = {
    toonie: p.loadImage('assets/images/toonie.png'),
    loonie: p.loadImage('assets/images/loonie.png'),
    quarter: p.loadImage('assets/images/quarter.png'),
    dime: p.loadImage('assets/images/dime.png'),
    nickel: p.loadImage('assets/images/nickel.png')
  };
  
  return coinImages;
}

/**
 * Updates user count display on the HTML page
 * @param {string} amount - Formatted amount to display
 */
export function updateUserCount(amount) {
  const userCountElement = document.getElementById('user-count');
  if (userCountElement) {
    userCountElement.textContent = amount;
  }
}

/**
 * Updates actual total display on the HTML page 
 * @param {string} amount - Formatted amount to display
 * @param {boolean} show - Whether to show or hide the actual total
 */
export function updateActualTotal(amount, show = false) {
  const actualCountElement = document.getElementById('actual-count');
  if (actualCountElement) {
    actualCountElement.textContent = amount;
    if (show) {
      actualCountElement.classList.remove('hidden');
    } else {
      actualCountElement.classList.add('hidden');
    }
  }
}

/**
 * Checks if the point is inside a circle
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {number} cx - Circle center x coordinate
 * @param {number} cy - Circle center y coordinate
 * @param {number} r - Circle radius
 * @returns {boolean} True if the point is inside the circle
 */
export function pointInCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Resizes the canvas when the window is resized
 * @param {p5} p - The p5 instance
 * @param {number} minWidth - Minimum width for the canvas
 * @param {number} aspectRatio - Aspect ratio to maintain (width/height)
 */
export function handleWindowResize(p, minWidth = 300, aspectRatio = 4/3) {
  const parentElement = document.getElementById('game-canvas');
  if (!parentElement) return;
  
  let newWidth = Math.max(minWidth, parentElement.offsetWidth);
  let newHeight = newWidth / aspectRatio;
  
  p.resizeCanvas(newWidth, newHeight);
}