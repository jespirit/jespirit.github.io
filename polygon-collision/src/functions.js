// Draws an arrow between two vectors.
export function drawArrow(p, base, vec, myColor) {
  p.push();
  p.stroke(myColor);
  p.strokeWeight(2);
  p.fill(myColor);
  p.translate(base.x, base.y);
  p.line(0, 0, vec.x, vec.y);
  p.rotate(vec.heading());
  let arrowSize = 4;
  p.translate(vec.mag() - arrowSize, 0);
  p.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  p.pop();
}