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

const POINT_AREA_SIZE = 150; // The box area a single point is constrained too
const POINT_COLOR = '#616161';
const POINT_CONNECTION_COLOR = '#616161';
const TWO_PI = 2 * Math.PI;

let points = []; // 2d array of points
/**
 * Represents a point in the cloud simulation
 */
class Point {
    constructor(x, y) {
        this.xStart = x * POINT_AREA_SIZE;
        this.yStart = y * POINT_AREA_SIZE;
        this.x = this.xStart + POINT_AREA_SIZE/2;
        this.y = this.yStart + POINT_AREA_SIZE/2;
        this.connections = new Set();
    }
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

            // Connect to left
            if (x > 0 && randomBoolean(0.5)) {
                points[x][y].connections.add(points[x-1][y]);
            }
            // Connect to top
            if (y > 0 && randomBoolean(0.5)) {
                points[x][y].connections.add(points[x][y-1]);
            }
            // Connect to top-left
            if (x > 0 && y > 0 && randomBoolean(0.5)) {
                points[x][y].connections.add(points[x-1][y-1]);
            }
        }
    }
}

function randomBoolean(bias) {
    return Math.random() > bias;
}

function drawPoint(point) {
    canvasContext.fillRect(point.x, point.y, 1, 1);
    point.connections.forEach(connectedPoint => {
        canvasContext.beginPath();
        canvasContext.moveTo(point.x, point.y);
        canvasContext.lineTo(connectedPoint.x, connectedPoint.y);
        canvasContext.stroke();
    })
}

function drawPoints() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = POINT_COLOR;
    canvasContext.strokeStyle = POINT_CONNECTION_COLOR;

    for (let x = 0; x < points.length; x++) {
        for (let y = 0; y < points[x].length; y++) {
            drawPoint(points[x][y])
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