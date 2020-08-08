/**
  Orbital simulation for the background of my homepage
  @Author Cody Smith
*/

const canvas = document.getElementById('background-canvas');
const canvasContext = canvas.getContext('2d');
function updateCanvasSize() {
    canvas.height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth;
    canvas.centerX = Math.floor(canvas.width/2);
    canvas.centerY = Math.floor(canvas.height/2);
}
updateCanvasSize();

const POINT_SETTINGS = {
    numberOfPoints : 500,
    minMass : 3,
    maxMass : 7,
    maxConnections : 2
}
const TWO_PI = 2 * Math.PI;

/**
 * Represents a point in the cloud simulation
 */
class Point {
    constructor(x, y, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.velocity = {
            x : 0,
            y : 0
        }
        this.connections = new Set();
    }

    connectTo(point) {
        if (this.connections.size <= POINT_SETTINGS.maxConnections && point.connections.size <= POINT_SETTINGS.maxConnections) {
            this.connections.add(point);
            point.connections.add(this);
        }
    }

    updatePosition() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    distanceTo(point) {
        return Math.sqrt(Math.pow((this.x - point.x), 2) + Math.pow((this.y - point.y), 2));
    }
}

function getRandomPosition() {
    let largerScale = Math.max(canvas.width, canvas.height);
    let smallerScale = Math.min(canvas.width, canvas.height);
    let delta = largerScale - smallerScale;
    let offset = delta / 2;
    let largerRandom = Math.random() * largerScale;
    let smallerRandom = (Math.random() * largerScale) - offset;
    if (canvas.width > canvas.height) {
        return [largerRandom, smallerRandom];
    } else {
        return [smallerRandom, largerRandom];
    }
}

function generatePoints(numberOfPoints) {
    const points = [];
    for (let n = 0; n < numberOfPoints; n++) {
        let [x, y] = getRandomPosition();
        let mass = Math.floor((Math.random() * (POINT_SETTINGS.maxMass - POINT_SETTINGS.minMass)) + POINT_SETTINGS.minMass);
        points.push(new Point(x, y, mass));
    }

    return points;
}

function drawPoint(point) {
    canvasContext.beginPath();
    canvasContext.arc(point.x, point.y, point.mass, 0, TWO_PI);
    canvasContext.fill();
}

function drawConnections(point, visitedPoints) {
    point.connections.forEach(connectedPoint => {
        if (!visitedPoints.has(connectedPoint)) {
            canvasContext.beginPath();
            canvasContext.moveTo(point.x, point.y);
            canvasContext.lineTo(connectedPoint.x, connectedPoint.y);
            canvasContext.stroke();
        }
    });
}

function orbitForce(point) {
    let dX = point.x - canvas.centerX;
    let dY = point.y - canvas.centerY;

    let theta = Math.atan2(dX, dY);

    point.velocity.x = -Math.cos(theta) / point.mass;
    point.velocity.y = Math.sin(theta) / point.mass;
}

function updatePoints(points) {
    points.forEach((point) => {
        orbitForce(point);
        point.updatePosition();
    });
}

function render(points) {
    updatePoints(points);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.fillStyle = '#424242';

    let visitedPoints = new Set();
    let toVisit = [...points];
    let currentPoint = toVisit.pop();

    while (currentPoint != null) {
        drawConnections(currentPoint, visitedPoints);
        currentPoint = toVisit.pop();
    }

    points.forEach(point => {
        drawPoint(point);
    });
}

const points = generatePoints(POINT_SETTINGS.numberOfPoints);

// Render Loop
let renderLoop = window.setInterval(render.bind(this, points), 16);

window.onresize = () => {
    updateCanvasSize();
}

render(points);