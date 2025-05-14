import { Projection } from "./projection.js";
import { MTV } from "./mtv.js";
import { Shape } from "./shape.js";

export class Polygon extends Shape {

  constructor(p) {
    super(p);
  }

  reset() {
    // Generate random number of vertices between 5 and 10
    const numVertices = Math.floor(Math.random() * 6) + 5;
    const radius = 40; // Base radius for the polygon
    
    // Generate random angles for vertices
    let angles = [];
    for (let i = 0; i < numVertices; i++) {
      angles.push(Math.random() * Math.PI * 2);
    }
    // Sort angles to ensure convex shape
    angles.sort((a, b) => a - b);

    // Create vertices based on angles
    this.vertices = angles.map(angle => {
      return this.p.createVector(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    });

    // Random position on screen
    this.position = this.p.createVector(
      this.p.random(0, this.p.width - radius * 2),
      this.p.random(0, this.p.height - radius * 2)
    );

    let r1 = this.p.random(0, 255);
    let r2 = this.p.random(0, 255);
    let r3 = this.p.random(0, 255);
    this.color = this.p.color(r1, r2, r3);
    this.angle = 0;
  }

  draw() {
    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.rotate(this.angle);
    
    // Draw the polygon with transparency if intersecting
    if (this.isIntersecting) {
      let c = this.color;
      let transparent = this.p.color(this.p.hue(c), this.p.saturation(c), this.p.brightness(c), 0.5);
      this.p.fill(transparent);
    } else {
      this.p.fill(this.color);
    }
    if (this.isDragging) {
      this.p.stroke(255);
      this.p.strokeWeight(4);
    }
    else {
      this.p.stroke(0);
    }
    this.p.beginShape();
    for (let v of this.vertices) {
      this.p.vertex(v.x, v.y);
    }
    this.p.endShape(this.p.CLOSE);

    if (this.isRotating)
    {
      this.p.push();
      this.p.fill(220);
      this.p.textSize(8);
      //p.translate(polyA.position.x, polyA.position.y);
      this.p.text(this.angle.toFixed(2), 10, 10, 50, 50);
      this.p.text(this.debugInfo.offsetAngle.toFixed(2), 10, 20, 50, 50);
      
      this.p.pop();
    }

    // Draw debug visualization if enabled
    if (this.showDebug) {
      // Draw the circle used for vertex generation
      this.p.noFill();
      this.p.stroke(200, 100); // Semi-transparent gray
      this.p.circle(0, 0, 40); // 80 = 2 * radius (40)
      
      // Draw vertices as dots
      this.p.fill(0);
      this.p.stroke(0);
      for (let v of this.vertices) {
        this.p.circle(v.x, v.y, 4);
      }
      let center = this.getCenter();
      this.p.circle(0, 0, 4);
    }
    
    this.p.pop();
  }

  mousePressed() {
    let mousePos = this.p.createVector(this.p.mouseX, this.p.mouseY);
    let localMouse = this.getLocalMousePosition(mousePos);
    
    if (this.contains(localMouse)) {
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

  getLocalMousePosition(mousePos) {
    let local = p5.Vector.sub(mousePos, this.position);
    local.rotate(-this.angle);
    return local;
  }

  // Returns center of polygon
  getCenter() {
    return this.position;
    // let sum = this.p.createVector(0, 0);
    // for (let p of this.vertices) sum.add(p);
    // return sum.div(this.vertices.length);
  }


  getTransformedVertices() {
    return this.vertices.map(v => {
      let vWorld = v.copy().rotate(this.angle).add(this.position);
      return vWorld;
    });
  }

  getAxes() {
    let verts = this.getTransformedVertices();
    let axes = [];

    for (let i = 0; i < verts.length; i++) {
      let p1 = verts[i];
      let p2 = verts[i + 1 == verts.length ? 0 : i + 1];
      // NOTE: sub modifies the original vector
      // p1p2 is p2 - p1
      let edge = p5.Vector.sub(p2, p1);
      // (-y, x) or (y, -x)
      let normal = this.p.createVector(-edge.y, edge.x).normalize();
      axes.push(normal);
    }

    return axes;
  }

  getAxesWithEdges() {
    let verts = this.getTransformedVertices();
    let axes = [];
    let edges = [];

    for (let i = 0; i < verts.length; i++) {
      let p1 = verts[i];
      let p2 = verts[i + 1 == verts.length ? 0 : i + 1];
      // NOTE: sub modifies the original vector
      // p1p2 is p2 - p1
      let edge = p5.Vector.sub(p2, p1);
      // (-y, x) or (y, -x)
      let normal = this.p.createVector(-edge.y, edge.x).normalize();
      axes.push(normal);
      edges.push(p1, p2);
    }

    return { axes, edges };
  }

  project(axis) {
    // NOTE: The axis must be normalized to get accurate projections
    let verts = this.getTransformedVertices();
    let axisNorm = axis.copy().normalize();
    let min = axisNorm.dot(verts[0]);
    let max = min;

    for (let i = 1; i < verts.length; i++) {
      let p = axisNorm.dot(verts[i]);
      if (p < min) {
        min = p;
      } else if (p > max) {
        max = p;
      }
    }

    return new Projection(min, max);
  }

  contains(local) {

    // Ray-casting algorithm
    let inside = false;
    for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
      let vi = this.vertices[i];
      let vj = this.vertices[j];
      
      if (((vi.y > local.y) !== (vj.y > local.y)) &&
          (local.x < (vj.x - vi.x) * (local.y - vi.y) / (vj.y - vi.y) + vi.x)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
}
