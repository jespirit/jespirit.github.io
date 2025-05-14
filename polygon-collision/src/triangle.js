export class Triangle {
  constructor(p, x, y, b1, b2, h, c) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.base = b1 + b2;
    this.base1 = b1;
    this.base2 = b2;
    // this.width = w;
    this.height = h;
    this.color = c;

    this.p1 = this.p.createVector(x - b1, y);
    this.p2 = this.p.createVector(x, y - h);
    this.p3 = this.p.createVector(x + b2, y);

    this.resetTriangle();
  }

  draw() {
    this.p.fill(this.color);
    this.p.triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
  }

  resetTriangle() {
    // this.width = 40;
    this.height = 40;
    this.base1 = this.base2 = this.height / 2;
    this.base = this.base1 + this.base2;
    this.x = this.p.random(0, this.p.width - this.base);
    this.y = this.p.random(0, this.p.height - this.height);
    

    this.p1 = this.p.createVector(this.x - this.base1, this.y);
    this.p2 = this.p.createVector(this.x, this.y - this.height);
    this.p3 = this.p.createVector(this.x + this.base2, this.y);

    this.color = this.p.color(
      this.p.random(0, 255),
      this.p.random(0, 255),
      this.p.random(0, 255)
    );
  }

  contains(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }
}
