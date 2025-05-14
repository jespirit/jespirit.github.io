import { MTV } from "./mtv.js";

export function intersect(shapeA, shapeB) {
  let type1 = shapeA.constructor.name.toLowerCase();
  let type2 = shapeB.constructor.name.toLowerCase();
  let pair;

  if (type1.localeCompare(type2) <= 0) {
    pair = `${type1}-${type2}`;
  }
  else {
    pair = `${type2}-${type1}`;
    let tmp = shapeA;
    shapeA = shapeB;
    shapeB = tmp;
  }

  switch (pair) {
    case "circle-circle":
      return shapeA.intersectsMTV(shapeB);
    case "circle-polygon":
      return isCircleIntersectingWithMTVWithEdge(shapeA, shapeB);
    case "circle-rectangle":
      return isCircleIntersecting(shapeA, shapeB);
    case "polygon-rectangle":
      return isIntersectingWithMTV(shapeA, shapeB);
    case "polygon-polygon":
      return isIntersectingWithMTV(shapeA, shapeB);
    case "rectangle-rectangle":
      return isIntersectingWithMTV(shapeA, shapeB);
    default:
      console.error("Unsupported pair: " + pair);
      break;
  }
}

/**
 * Clamps a number between a minimum and maximum value
 * @param {number} x - The number to clamp
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {number} The clamped value
 * @throws {Error} If parameters are not numbers or min is greater than max
 */
function clamp(x, min, max) {
  // Check if all parameters are numbers
  if (typeof x !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('All parameters must be numbers');
  }

  // Check if min is less than or equal to max
  if (min > max) {
    throw new Error('Minimum value must be less than or equal to maximum value');
  }

  return Math.max(min, Math.min(max, x));
}

export function isIntersecting(shape1, shape2) {
  let axes1 = shape1.getAxes();
  let axes2 = shape2.getAxes();

  for (let i = 0; i < axes1.length; i++) {
    const axis = axes1[i];

    // Project both shapes onto the axis
    let p1 = shape1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
  }

  for (let i = 0; i < axes2.length; i++) {
    const axis = axes2[i];

    // Project both shapes onto the axis
    let p1 = shape1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
  }

  return true;
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  // dot product divided by squared length of the segment
  let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  // Clamp t between 0,1
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;
  return Math.sqrt(distSq);
}

function pointInPolygon(point, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-10) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function polygonCircleIntersect(polygon, circleObj) {
  let circle = {
    x: circleObj.position.x,
    y: circleObj.position.y,
    radius: circleObj.radius
  };
  const worldVerts = polygon.getTransformedVertices();
  // 1. Vertex inside circle
  for (const v of worldVerts) {
    const dx = v.x - circle.x;
    const dy = v.y - circle.y;
    if (dx * dx + dy * dy <= circle.radius * circle.radius) return true;
  }

  // 2. Circle center inside polygon
  if (pointInPolygon(circle, worldVerts)) return true;

  // 3. Circle-edge intersection
  for (let i = 0; i < worldVerts.length; i++) {
    const v1 = worldVerts[i];
    const v2 = worldVerts[(i + 1) % worldVerts.length];
    if (pointToSegmentDistance(circle.x, circle.y, v1.x, v1.y, v2.x, v2.y) <= circle.radius)
      return true;
  }

  return false;
}


export function isIntersectingWithMTV(shape1, shape2) {
  let overlap = 1e100;
  let smallest = null;
  let axes = shape1.getAxes();
  axes = axes.concat(shape2.getAxes());

  for (let i = 0; i < axes.length; i++) {
    const axis = axes[i];

    // Project both shapes onto the axis
    let p1 = shape1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
    else {
      let ov = p1.getOverlap(p2);
      if (p1.contains(p2) || p2.contains(p1)) {
        let mins = Math.abs(p1.min - p2.min);
        let maxs = Math.abs(p1.max - p2.max);
        if (mins < maxs) {
          ov += mins;
        }
        else {
          ov += maxs;
        }
      }

      if (ov < overlap) {
        overlap = ov;
        smallest = axis;
      }
    }
  }

  return new MTV(smallest, overlap);
}

export function isIntersectingWithMTVWithEdge(shape1, shape2) {
  let overlap = 1e100;
  let smallest = null;
  let edge = null;
  let axes1 = shape1.getAxesWithEdges();
  let axes2 = shape2.getAxesWithEdges();

  for (let i = 0; i < axes1.axes.length; i++) {
    const axis = axes1.axes[i];

    // Project both shapes onto the axis
    let p1 = shape1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
    else {
      let ov = p1.getOverlap(p2);
      if (p1.contains(p2) || p2.contains(p1)) {
        let mins = Math.abs(p1.min - p2.min);
        let maxs = Math.abs(p1.max - p2.max);
        if (mins < maxs) {
          ov += mins;
        }
        else {
          ov += maxs;
        }
      }

      if (ov < overlap) {
        overlap = ov;
        smallest = axis;
        edge = [axes1.edges[2*i], axes1.edges[2*i+1]]
      }
    }
  }

  for (let i = 0; i < axes2.axes.length; i++) {
    const axis = axes2.axes[i];

    // Project both shapes onto the axis
    let p1 = shape1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
    else {
      let ov = p1.getOverlap(p2);
      if (p1.contains(p2) || p2.contains(p1)) {
        let mins = Math.abs(p1.min - p2.min);
        let maxs = Math.abs(p1.max - p2.max);
        if (mins < maxs) {
          ov += mins;
        }
        else {
          ov += maxs;
        }
      }

      if (ov < overlap) {
        overlap = ov;
        smallest = axis;
        edge = [axes2.edges[2*i], axes2.edges[2*i+1]]
      }
    }
  }

  return new MTV(smallest, overlap, edge);
}

export function isCircleIntersecting(circle1, shape2) {
  let overlap = 1e100;
  let smallest = null;
  let edge = null;
  let axes = shape2.getAxes();

  let vertices = shape2.getTransformedVertices();
  let left = vertices[0].x;
  let top = vertices[0].y;
  let right = vertices[2].x;
  let bottom = vertices[2].y;
  // p5.constrain is undefined
  // FIX: constrain is an instance method. You need to pass a p5 instance
  let closestX = clamp(circle1.position.x, left, right);
  let closestY = clamp(circle1.position.y, top, bottom);
  let closestPoint = new p5.Vector(closestX, closestY);

  let circleAxis = p5.Vector.sub(closestPoint, circle1.position).normalize();
  axes.push(circleAxis);

  for (let i = 0; i < axes.length; i++) {
    const axis = axes[i];

    // Project both shapes onto the axis
    let p1 = circle1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
    else {
      let ov = p1.getOverlap(p2);
      if (p1.contains(p2) || p2.contains(p1)) {
        let mins = Math.abs(p1.min - p2.min);
        let maxs = Math.abs(p1.max - p2.max);
        if (mins < maxs) {
          ov += mins;
        }
        else {
          ov += maxs;
        }
      }

      if (ov < overlap) {
        overlap = ov;
        smallest = axis;
      }
    }
  }

  return new MTV(smallest, overlap, edge);
}

export function isCircleIntersectingWithMTVWithEdge(circle1, shape2) {
  let overlap = 1e100;
  let smallest = null;
  let edge = null;
  let data = shape2.getAxesWithEdges();

  for (let i = 0; i < data.axes.length; i++) {
    const axis = data.axes[i];

    // Project both shapes onto the axis
    let p1 = circle1.project(axis);
    let p2 = shape2.project(axis);

    if (!p1.overlap(p2)) {
      // Then the shapes do not overlap
      return false;
    }
    else {
      let ov = p1.getOverlap(p2);
      if (p1.contains(p2) || p2.contains(p1)) {
        let mins = Math.abs(p1.min - p2.min);
        let maxs = Math.abs(p1.max - p2.max);
        if (mins < maxs) {
          ov += mins;
        }
        else {
          ov += maxs;
        }
      }

      if (ov < overlap) {
        overlap = ov;
        smallest = axis;
        edge = [data.edges[2*i], data.edges[2*i+1]]
      }
    }
  }

  return new MTV(smallest, overlap, edge);
}

// https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/barycentric-coordinates.html
export function rayTriangleIntersect(v0, v1, v2, P) {
  let v0v1 = p5.Vector.sub(v1, v0);
  let v0v2 = p5.Vector.sub(v2, v0);
  let N = v0v1.cross(v0v2);

  // You just need two variables, and solve for the third
  // u + v + w = 1
  let u, v, w;

  // Calculate the area of the triangle
  let area = N.mag() / 2;

  // TODO: Convert array to vector
  // if (Array.isArray(P)) {
  //   // createVector is available on p5 instance, but what about p5 global?
  //   P = p.createVector(P[0], P[1]);
  // }

  // Calculate u (for triangle BCP)
  let v1p = p5.Vector.sub(P, v1);    // BP
  let v1v2 = p5.Vector.sub(v2, v1);  // BC
  let C = v1v2.cross(v1p);
  u = (C.mag() / 2 ) / area;
  if (N.dot(C) < 0) return false;  // P is on the wrong side of edge BC

  // Calculate v (for triangle CAP)
  let v2p = p5.Vector.sub(P, v2);
  let v2v0 = p5.Vector.sub(v0, v2);
  C = v2v0.cross(v2p);
  v = (C.mag() / 2 ) / area;
  if (N.dot(C) < 0) return false;  // P is on the wrong side of edge CA

  // Third edge
  let v0p = p5.Vector.sub(P, v0);
  // let v0v1 = p5.Vector.sub(v1, v0);
  C = v0v1.cross(v0p);
  w = (C.mag() / 2 ) / area;
  if (N.dot(C) < 0) return false;  // P is on the wrong side of edge AB

  return true;
}