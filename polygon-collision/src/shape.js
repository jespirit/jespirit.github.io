export class Shape {
  position;
  vertices = [];
  angle;
  isDragging = false;
  isRotating = false;
  dragOffset = null;
  rotationOffset = 0;
  showDebug = false;  // New property to toggle debug visualization
  isIntersecting = false;  // New property to track intersection state
  debugInfo = {};

  constructor(p) {
    this.p = p;
  }

  reset() {
  }

  draw() {
  }

  mousePressed() {
  }

  mouseDragged() {
  }

  mouseReleased() {
    this.isDragging = false;
    this.isRotating = false;
    this.dragOffset = null;
  }

  getCenter() {
    
  }

  getTransformedVertices() {
    return this.vertices.map(v => {
      let vWorld = v.copy().rotate(this.angle).add(this.position);
      return vWorld;
    });
  }

  getAxes() {
  }

  getAxesWithEdges() {
  }

  project(axis) {
  }

  contains(local) {
  }
}
