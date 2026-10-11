const canvas = document.getElementById("canvas");
const view = canvas.getContext("2d");

// resize the canvas to fill the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Util {
  static subtractPoints(p1, p2) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
  }

  static addPoints(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
  }

  static normalise(p) {
    const length = Math.hypot(p.x, p.y);
    return { x: p.x / length, y: p.y / length };
  }

  static scale(vector, scale) {
    return { x: vector.x * scale, y: vector.y * scale };
  }
}

class Circle {
  constructor(x, y, radius, color) {
    const speed = 4; // maximum speed of the circle
    this.x = x;
    this.y = y;
    this.dx = (Math.random() - 0.5) * speed; // random velocity in x direction
    this.dy = (Math.random() - 0.5) * speed; // random velocity in y direction
    this.radius = radius;
    this.color = color;
  }
  update() {
    // update the position of the circle based on its velocity
    let x = this.x + this.dx;
    let y = this.y + this.dy;
    // check for collision with the edges of the canvas
    if (x - this.radius < 0) {
      x = this.radius; // keep the circle inside the canvas
      this.dx = -this.dx; // reverse the x velocity
    }
    if (x + this.radius > canvas.width) {
      x = canvas.width - this.radius; // keep the circle inside the canvas
      this.dx = -this.dx; // reverse the x velocity
    }
    if (y - this.radius < 0) {
      y = this.radius; // keep the circle inside the canvas
      this.dy = -this.dy; // reverse the y velocity
    }
    if (y + this.radius > canvas.height) {
      y = canvas.height - this.radius; // keep the circle inside the canvas
      this.dy = -this.dy; // reverse the y velocity
    }
    this.x = x;
    this.y = y;
  }
  draw() {
    this.update();
    view.beginPath();
    view.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    view.fillStyle = this.color;
    view.fill();
    // draw the outline of the circle in black
    view.strokeStyle = "black";
    view.stroke();
  }
}

class Point {
  constructor(x, y, radius = 10, color = "red") {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    view.beginPath();
    view.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    view.fillStyle = this.color;
    view.fill();
  }
}

class Line {
  constructor(x1, y1, x2, y2, color) {
    this.p1 = new Point(x1, y1, 10, color);
    this.p2 = new Point(x2, y2, 10, color);
    this.color = color;
  }
  get midPoint() {
    return new Point(
      (this.p1.x + this.p2.x) / 2,
      (this.p1.y + this.p2.y) / 2,
      10,
      "yellow"
    );
  }

  draw() {
    // draw a dashed line between the two points
    view.beginPath();
    view.setLineDash([5, 5]);
    view.moveTo(this.p1.x, this.p1.y);
    view.lineTo(this.p2.x, this.p2.y);
    view.strokeStyle = this.color;
    view.stroke();
    view.setLineDash([]);
    // draw the points at the ends of the line
    this.p1.draw();
    this.p2.draw();

    const difference = Util.subtractPoints(this.p1, this.p2);
    const normal = { x: -difference.y, y: difference.x };
    const unitNormal = Util.normalise(normal);
    const scaledNormal = Util.scale(unitNormal, 50);
    const endpoint = Util.addPoints(this.midPoint, scaledNormal);

    view.beginPath();
    view.moveTo(this.midPoint.x, this.midPoint.y);
    view.lineTo(endpoint.x, endpoint.y);
    view.strokeStyle = "red";
    view.stroke();
    this.midPoint.draw();
  }
}

let selectedPoint = null;
const line = new Line(100, 100, 200, 200, "black");
// add event listeners for mouse events to allow the user to drag the points of the line
canvas.addEventListener("mousedown", (event) => {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  // check if the mouse is over one of the points of the line
  if (Math.hypot(mouseX - line.p1.x, mouseY - line.p1.y) < line.p1.radius) {
    selectedPoint = line.p1;
  } else if (
    Math.hypot(mouseX - line.p2.x, mouseY - line.p2.y) < line.p2.radius
  ) {
    selectedPoint = line.p2;
  }
});
canvas.addEventListener("mousemove", (event) => {
  if (selectedPoint) {
    selectedPoint.x = event.clientX;
    selectedPoint.y = event.clientY;
  }
});
canvas.addEventListener("mouseup", () => {
  selectedPoint = null;
});

const circles = [];
const numCircles = 1;
for (let i = 0; i < numCircles; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const radius = 20;
  const color = "white";
  const circle = new Circle(x, y, radius, color);
  circles.push(circle);
}

// animation loop to update and draw all the circles and the line
function animate() {
  view.clearRect(0, 0, canvas.width, canvas.height);
  line.draw();
  for (const circle of circles) {
    circle.draw();
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
