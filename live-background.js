/**
  Simulates some points for the background of my homepage
  @Author Cody Smith
*/

const canvas = document.getElementById('background-canvas');
const canvasContext = canvas.getContext('2d');
function updateCanvasSize() {
    canvas.height = canvas.offsetHeight;
    canvas.width = canvas.offsetWidth;
}
updateCanvasSize();

const POINT_AREA_SIZE = 100; // The box area a single point is constrained too
const POINT_COLOR = '#424242'; // Gray 700
const POINT_CONNECTION_COLOR = '#212121'; // Gray 800
const TWO_PI = 2 * Math.PI;

let points = []; // 2d array of points
/**
 * Represents a point in the cloud simulation
 */
class Point {
    constructor(x, y) {
        this.xStart = x * POINT_AREA_SIZE;
        this.yStart = y * POINT_AREA_SIZE;
        this.x = this.xStart + POINT_AREA_SIZE/2 + getRandomPointOffset();
        this.y = this.yStart + POINT_AREA_SIZE/2 + getRandomPointOffset();
        this.weight = Math.floor(Math.random() * 5 + 3);
        this.connections = new Set();
    }
    connectTo(point) {
        this.connections.add(point);
        point.connections.add(this);
    }
}

function getRandomPointOffset() {
    return (Math.random() - 0.5) * 70;
}

function generatePoints() {
    let sizeX = Math.floor(canvas.offsetWidth / POINT_AREA_SIZE);
    let sizeY = Math.floor(canvas.offsetHeight / POINT_AREA_SIZE);
    for (let x = 0; x < sizeX; x++) {
        if (!points[x]) {
            points[x] = [];
        }
        for (let y = 0; y < sizeY; y++) {
            points[x][y] = new Point(x, y);
        }
    }
    for (let x = 0; x < sizeX; x+=2) {
        for (let y = 0; y < sizeY; y+=2) {
            let point = points[x][y];
            // Left
            if (x - 1 >= 0 && shouldDrawConnection()) {
                point.connectTo(points[x-1][y]);
            }
            // Right
            if (x+1 < sizeX && shouldDrawConnection()) {
                point.connectTo(points[x+1][y]);
            }
            // Top
            if (y-1 >= 0 && shouldDrawConnection()) {
                point.connectTo(points[x][y-1]);
            }
            // Bottom
            if (y+1 < sizeY && shouldDrawConnection()) {
                point.connectTo(points[x][y+1]);
            }
            // Top-left
            if (y-1 >= 0 && x-1 >= 0 && shouldDrawConnection()) {
                point.connectTo(points[x-1][y-1]);
            }
            // Top-right
            if (y-1 >= 0 && x+1 < sizeX && shouldDrawConnection()) {
                point.connectTo(points[x+1][y-1]);
            }
            // Bottom-left
            if (y+1 < sizeY && x-1 >= 0 && shouldDrawConnection()) {
                point.connectTo(points[x-1][y+1]);
            }
            // Bottom-right
            if (y+1 < sizeY && x+1 < sizeX && shouldDrawConnection()) {
                point.connectTo(points[x+1][y+1]);
            }
        }
    }
}

function shouldDrawConnection() {
    return Math.random() > 0.15;
}

function drawPoint(point) {
    canvasContext.beginPath();
    canvasContext.arc(point.x, point.y, point.weight, 0, TWO_PI);
    canvasContext.fill();
}

function drawConnections(point) {
    point.connections.forEach(connectedPoint => {
        canvasContext.beginPath();
        canvasContext.moveTo(point.x, point.y);
        canvasContext.lineTo(connectedPoint.x, connectedPoint.y);
        canvasContext.stroke();
    });
}

function drawPoints() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = POINT_COLOR;
    canvasContext.strokeStyle = POINT_CONNECTION_COLOR;

    for (let x = 0; x < points.length; x+=2) {
        for (let y = 0; y < points[x].length; y+=2) {
            drawConnections(points[x][y]);
        }
    }
    for (let x = 0; x < points.length; x++) {
        for (let y = 0; y < points[x].length; y++) {
            drawPoint(points[x][y]);
        }
    }
}

generatePoints();
drawPoints();

window.onresize = () => {
    updateCanvasSize();
    generatePoints();
    drawPoints();
}