import { Polygon } from './polygon.js';

export class Rectangle extends Polygon {
  
  constructor(p, x, y, w, h, c) {
    super(p);
    this.p = p;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = c;

    this.reset();
  }

  draw() {
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.rotate(this.angle);
    this.p.fill(this.color);
    this.p.rect(-this.width/2, -this.height/2, this.width, this.height);
    this.p.pop();
  }

  reset() {
    this.width = 40;
    this.height = 40;
    let x = this.p.random(0, this.p.width - this.width);
    let y = this.p.random(0, this.p.height - this.height);
    this.position = this.p.createVector(x, y);
    this.angle = 0;

    let left = -this.width/2;
    let top = -this.height/2;
    let right = left + this.width;
    let bottom = top + this.height;

    this.vertices = [this.p.createVector(left, top),
      this.p.createVector(right, top),
      this.p.createVector(right, bottom),
      this.p.createVector(left, bottom)
    ];

    this.color = this.p.color(
      this.p.random(0, 255),
      this.p.random(0, 255),
      this.p.random(0, 255)
    );
  }

  containsMouse(px, py) {
    let left = this.position.x - this.width/2;
    let top = this.position.y - this.height/2;
    let right = left + this.width;
    let bottom = top + this.height;
    return (
      px >= left &&
      px <= right &&
      py >= top &&
      py <= bottom
    );
  }

  getAxes() {
    return super.getAxes();
  }

  project(axis) {
    return super.project(axis);
  }

  mousePressed() {
    let mousePos = this.p.createVector(this.p.mouseX, this.p.mouseY);
    
    if (this.containsMouse(mousePos.x, mousePos.y)) {
      if (this.p.mouseButton === this.p.LEFT) {
        this.isDragging = true;
        this.dragOffset = p5.Vector.sub(this.position, mousePos);
        return true;
      } else if (this.p.mouseButton === this.p.RIGHT) {
        let offsetAngle = Math.atan2(
          mousePos.y - this.position.y,
          mousePos.x - this.position.x
        );
        this.isRotating = true;
        this.rotationOffset = this.position.copy();
        this.debugInfo.offsetAngle = offsetAngle;
      }
    }

    return false;
  }

  mouseDragged() {
    if (this.isDragging) {
      this.position.x = this.p.mouseX + this.dragOffset.x;
      this.position.y = this.p.mouseY + this.dragOffset.y;
    } else if (this.isRotating) {
      let dx = this.p.mouseX - this.rotationOffset.x;
      let dy = this.p.mouseY - this.rotationOffset.y;

      this.angle = (this.angle + -dx) % 360;
      this.rotationOffset.set(this.p.mouseX, this.p.mouseY);
    }
  }

  mouseReleased() {
    this.isDragging = false;
    this.isRotating = false;
    this.dragOffset = null;
  }
}
