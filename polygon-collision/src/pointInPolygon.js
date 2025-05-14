function pointInPolygon(point, vertices) {
  let x = point.x, y = point.y;
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i].x, yi = vertices[i].y;
    let xj = vertices[j].x, yj = vertices[j].y;

    let intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-10) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
