import { Circle } from './circle.js';
import { Rectangle } from './rect.js';
import { Polygon } from './polygon.js';
import { Triangle } from './triangle.js';
import { Shape } from './shape.js';
import { intersect, isIntersecting, polygonCircleIntersect, 
  rayTriangleIntersect, isIntersectingWithMTV, isIntersectingWithMTVWithEdge } from './intersections.js';
import { drawArrow } from './functions.js';

// ES6 modules are subject to same-origin policy
let circleX;
let circleY;
let circleRadius;
let circleMaximumRadius;
let circleColor;
let score = 0;
let highScore;
let rotateImage;

const shapes = [];

// let c1 = new Circle();
let draggedShape;
let offset;
let rotatedShape;
let rotateOffset;

const sketchProc = function (p) {
  let showDebug = false;  // Global toggle state

  function startGame() {
    for (let i = 0; i < 4; i++) {
      const c = new Circle(p);
      c.reset();
      shapes.push(c);
    }

    for (let i = 0; i < 3; i++) {
      const o = new Rectangle(p);
      o.reset();
      shapes.push(o);
    }

    // for (let i = 0; i < 3; i++) {
    //   const o = new Triangle(p);
    //   o.resetTriangle();
    //   triangles.push(o);
    // }

    let nShapes = 10;
    for (let i = 0; i < nShapes; i++) {
      const o = new Polygon(p);
      o.reset();
      shapes.push(o);
    }
  }
  
  function disableRightClick() {
    p.canvas.addEventListener('contextmenu', function (e) {
      if (e.button === 2) {
        console.log("canvas:contextmenu: right-click!");
        e.preventDefault();
        // e.stopPropagation();
      }
    }, true);

    // p.canvas.addEventListener('mousedown', function (e) {
    //   if (e.button === 2) {
    //     console.log("canvas:mousedown: right-click!");
    //     e.stopPropagation();
    //   }
    // }, true);

    // p.canvas.addEventListener('mousemove', function (e) {
    //   if (e.button === 2) {
    //     console.log("canvas:mousemove: right-click!");
    //     e.stopPropagation();
    //   }
    // }, true);

    // p.canvas.addEventListener('mouseup', function (e) {
    //   if (e.button === 2) {
    //     console.log("canvas:mouseup: right-click!");
    //     e.stopPropagation();
    //   }
    // }, true);
  }

  p.preload = function() {
    // Load the image and create a p5.Image object.
    rotateImage = p.loadImage('src/images/rotate-left.png');
  }

  p.setup = function setup() {
    // [[BoundThis]]: p5
    p.createCanvas(720, 400);
    p.colorMode(p.HSB);
    p.noStroke();
    p.ellipseMode(p.RADIUS);
    p.textSize(36);

    // Note: Default is radians mode
    p.angleMode(p.DEGREES);

    p.frameRate(30);

    // Get the last saved high score
    highScore = p.getItem('high score');

    // If no score was saved, start with a value of 0
    if (highScore === null) {
      highScore = 0;
    }

    disableRightClick();

    startGame();

    // Create toggle button
    let button = p.createButton('Toggle Debug View');
    button.position(10, 10);
    button.mousePressed(() => {
      showDebug = !showDebug;
      // Update all shapes
      for (let shape of shapes) {
        shape.showDebug = showDebug;
      }
    });

    let resolveButton = p.createButton('Resolve Collision');
    resolveButton.position(10, 50);
    resolveButton.mousePressed(() => {
      // Check intersections and update states
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const shapeA = shapes[i];
          const shapeB = shapes[j];
          let mtv = intersect(shapeA, shapeB);
          if (mtv && mtv.overlap > 0.1) {

            // Determine MTV direction (from A to B)
            const centerA = shapeA.getCenter();
            const centerB = shapeB.getCenter();
            const dir = p5.Vector.sub(centerB, centerA);
            const smallestAxis = mtv.axis.copy().mult(mtv.overlap);
            if (p5.Vector.dot(dir, smallestAxis) < 0) {
              smallestAxis.mult(-1);
            }

            // Push polygon outside of circle
            shapeA.position.sub(smallestAxis);
          }
        }
      }
    });
  }

  p.draw = function draw() {
    // game logic

    p.background(20);
    
    // Reset intersection states
    for (let shape of shapes) {
      shape.isIntersecting = false;
    }

    // Check intersections and update states
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const shapeA = shapes[i];
        const shapeB = shapes[j];

        let mtv = intersect(shapeA, shapeB);
        if (mtv && mtv.overlap > 0.1) {
          // Draw MTV arrow
          let center1 = shapes[i].position;
          let center2 = shapes[j].position;
          // let midPoint = p5.Vector.lerp(center1, center2, 0.5);

          let center = shapes[i].isDragging ? center2 : center1;

          // let e1 = mtv.edge[0];
          // let e2 = mtv.edge[1];
          // // p.line(e1.x, e1.y, e2.x, e2.y);

          // center = p5.Vector.lerp(e1, e2, 0.5);
          // drawArrow(p, center, mtv.axis.copy().mult(mtv.overlap), p.color(255, 0, 0));
          
          // Draw intersection text
          // let v1 = shapes[i].vertices[0];
          // p.fill(220);
          // p.textSize(16);
          // p.text(`${i+1}x${j+1}`, v1.x + 20, v1.y);

          // Determine MTV direction (from A to B)
          const centerA = shapeA.getCenter();
          const centerB = shapeB.getCenter();
          const dir = p5.Vector.sub(centerB, centerA);
          const smallestAxis = mtv.axis.copy().mult(mtv.overlap);
          if (p5.Vector.dot(dir, smallestAxis) < 0) {
            smallestAxis.mult(-1);
          }

          // center = p5.Vector.lerp(e1, e2, 0.7);
          // drawArrow(p, shapeA.position, dir.copy().normalize().mult(10), p.color(0, 0, 128));

          p.push();
          p.fill(220);
          p.textSize(16);
          // p.translate(polyA.position.x, polyA.position.y);
          p.text('A', centerA.x, centerA.y, 50, 50);
          p.pop();

          p.push();
          p.fill(220);
          p.textSize(16);
          // p.translate(polyB.position.x, polyB.position.y);
          p.text('B', centerB.x, centerB.y, 50, 50);
          p.pop();

          // center = p5.Vector.lerp(e1, e2, 0.7);
          // drawArrow(p, center, smallestAxis, p.color(255));

          // Push B out of A
          // FIX: The one being dragged is either polygon A or B
          if (shapeA.isDragging && !shapeB.isDragging) {
            shapeB.position.add(smallestAxis);
          }
          else if (shapeB.isDragging && !shapeA.isDragging) {
            shapeA.position.sub(smallestAxis);
          }
        }
      }
    }

    // render

    p.image(rotateImage, 0, 0);

    let mouse = p.createVector(p.mouseX, p.mouseY);

    // for (let i = 0; i < circles.length; i++) {
    //   const c = circles[i];
    //   c.draw();
    //   // let text = `(${c.x}, ${c.y})`;
    //   // p.fill(220);
    //   // p.textSize(8);
    //   // p.text((i+1)+"", c.x, c.y);
    // }

    // for (let i = 0; i < rectangles.length; i++) {
    //   const r = rectangles[i];
    //   r.draw();
    //   p.fill(220);
    //   p.textSize(8);
    //   p.text((i+1)+"", r.position.x, r.position.y);
    // }

    // for (let i = 0; i < triangles.length; i++) {
    //   const t = triangles[i];
    //   t.draw();
    //   p.fill(220);
    //   p.textSize(8);
    //   p.text((i+1)+"", t.x, t.y);
    // }

    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      s.draw();
    }

    // for (let i = 0; i < shapes.length; i++) {
    //   const s = shapes[i];
    //   let v1 = s.vertices[0];
    //   s.draw();
    //   p.fill(220);
    //   p.textSize(12);
    //   p.text((i+1)+"", v1.x, v1.y);

    //   if (s.contains(mouse)) {
    //     p.image(rotateImage, v1.x, v1.y);
    //   }
    // }

    if (draggedShape) {
      let text = `(${draggedShape.x}, ${draggedShape.y})`;
      p.fill(220);
      p.textSize(16);
      p.text(text, 10, 50);
    }
  }

  p.mousePressed = function mousePressed(e) {
    // Ignore right-clicks
    // If the game is unpaused
    if (p.isLooping() === true) {
      let isDragged = false;

      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        isDragged = shape.mousePressed();
        if (isDragged)
          break;
      }
      
    }
  }

  p.mouseDragged = function mouseDragged(e) {
    if (p.isLooping() === true) {
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        shape.mouseDragged();
      }
    }
  }

  p.mouseReleased = function mouseReleased(e) {
    if (p.isLooping() === true) {
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        shape.mouseReleased();
      }
    }
  }
}

// myp5 declaration is hoisted to the top, but not initialized
// It can be referenced elsewhere in the code eg. myp5.random
let myp5 = new p5(sketchProc);