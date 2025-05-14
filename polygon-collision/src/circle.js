import { Projection } from "./projection.js";
import { MTV } from "./mtv.js";
import { Shape } from "./shape.js";

export class Circle extends Shape {
  radius;

  defaultRadius = 20;

  constructor(p, x, y, r, c) {
    super();
    this.p = p;
    this.x = x;
    this.y = y;
    this.radius = r || this.defaultRadius;
    this.color = c;

    // this.resetCircle();
  }

  draw() {
    if (this.isDragging) {
      this.p.fill(122, 0, 100);
      this.p.circle(this.position.x, this.position.y, this.radius+2);
    }
    // Draw the polygon with transparency if intersecting
    if (this.isIntersecting) {
      let c = this.color;
      let transparent = this.p.color(this.p.hue(c), this.p.saturation(c), this.p.brightness(c), 0.5);
      this.p.fill(transparent);
    } else {
      this.p.fill(this.color);
    }
    this.p.circle(this.position.x, this.position.y, this.radius);
  }

  reset() {
    // FIXME: Why is random undefined?
    // FIXME: Why is color undefined?

    // window.p5.prototype
    // _main.default.prototype.colorMode = function (mode, max1, max2, max3, maxA) {

    // function p5(sketch, node)
    // console.log(window.p5.prototype.random.toString())

    let x = this.p.random(this.radius, this.p.width - this.radius);
    let y = this.p.random(this.radius, this.p.height - this.radius);

    this.position = this.p.createVector(x, y);
    this.color = this.p.color(this.p.random(240, 360), this.p.random(40, 80), this.p.random(50, 90));
  }

  contains(px, py) {
    let cx = this.position?.x || -100;
    let cy = this.position?.y || -100;
    // Check how far the mouse is from the circle
    let distanceToCircle = this.p.dist(px, py, cx, cy);

    // If the mouse is closer to the circle's center than the circle's radius,
    // that means the player clicked on it
    if (distanceToCircle < this.radius) {
      return true;
    }

    return false;
  }

  getCenter() {
    return this.position;
  }

  project(axis) {
    // NOTE: The axis must be normalized to get accurate projections
    let axisNorm = axis.copy().normalize();
    let centerProj = axisNorm.dot(this.position);

    return new Projection(centerProj - this.radius, centerProj + this.radius);
  }

  intersects(circle) {
    let distanceToCircle = this.p.dist(this.position.x, this.position.y, circle.position.x, circle.position.y);

    // If the mouse is closer to the circle's center than the circle's radius,
    // that means the player clicked on it
    if (distanceToCircle < this.radius + circle.radius) {
      return true;
    }

    return false;
  }

  intersectsMTV(circle) {
    let distanceToCircle = this.p.dist(this.position.x, this.position.y, circle.position.x, circle.position.y);

    // If the mouse is closer to the circle's center than the circle's radius,
    // that means the player clicked on it
    if (distanceToCircle < this.radius + circle.radius) {
      // A to B
      let axis = p5.Vector.sub(circle.position, this.position).normalize();
      let p1 = this.project(axis);
      let p2 = circle.project(axis);

      let overlap = p1.getOverlap(p2);
      return new MTV(axis, overlap);
    }

    return false;
  }

  mousePressed() {
    let mousePos = this.p.createVector(this.p.mouseX, this.p.mouseY);
    
    if (this.contains(mousePos.x, mousePos.y)) {
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
