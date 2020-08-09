/**
  Orbital simulation for the background of my homepage
  @Author Cody Smith
*/

/**
 * Wrapper around the canvas. The simulation is square, so abstracts out transforms. Also handles drawling.
 */
class SimulationContainer {
    static TWO_PI = 2 * Math.PI;
    static settings = {
        minPointMass : 3,
        maxPointMass : 7,
        pixelsPerPoint : 150,
        deviationFactor : 75
    };

    constructor (canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.updateDimensions();
    }

    clear () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPoint (point) {
        let _fillStyle = this.context.fillStyle;
        this.context.fillStyle = point.color;
        this.context.beginPath();
        this.context.arc(point.x, point.y, point.mass, 0, SimulationContainer.TWO_PI);
        this.context.fill();
        this.context.fillStyle = _fillStyle;
    }

    drawConnection (point, otherPoint) {
        this.context.beginPath();
        this.context.moveTo(point.x, point.y);
        this.context.lineTo(otherPoint.x, otherPoint.y);
        this.context.stroke();
    }

    updateDimensions () {
        this.canvas.height = this.canvas.offsetHeight;
        this.canvas.width = this.canvas.offsetWidth;

        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    generatePoints () {
        const size = Math.max(this.canvas.height, this.canvas.width);
        const startX = (this.canvas.width - size)/2;
        const startY = (this.canvas.height - size)/2;
        const halfDeviationFactor = SimulationContainer.settings.deviationFactor / 2;
        const massMinMaxDifference = SimulationContainer.settings.maxPointMass - SimulationContainer.settings.minPointMass;

        const points = [];
        for (let x = startX; x < size; x+= SimulationContainer.settings.pixelsPerPoint) {
            for (let y = startY; y < size; y+= SimulationContainer.settings.pixelsPerPoint) {
                // Random chance to not generate a point
                if (Math.random() > 0.05) {
                    let xOffset = (Math.random() * SimulationContainer.settings.deviationFactor) - halfDeviationFactor;
                    let yOffset = (Math.random() * SimulationContainer.settings.deviationFactor) - halfDeviationFactor;
                    let mass = Math.floor(Math.random() * massMinMaxDifference + massMinMaxDifference);
                    points.push(new Point(x + xOffset, y + yOffset, mass));
                }
            }
        }

        return points;
    }
}

/**
 * Represents a point in the cloud simulation
 */
class Point {
    constructor(x, y, mass) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.color = '#424242';
        this.velocity = {
            x : 0,
            y : 0
        }
        this.connections = new Set();
    }

    connectTo(point) {
        this.connections.add(point);
        point.connections.add(this);
    }

    updatePosition() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

function applyOrbitForce(point, container) {
    let dX = point.x - container.centerX;
    let dY = point.y - container.centerY;

    let theta = Math.atan2(dX, dY);

    point.velocity.x = -Math.cos(theta) / point.mass;
    point.velocity.y = Math.sin(theta) / point.mass;
}

function updatePoints(points, container) {
    points.forEach((point) => {
        applyOrbitForce(point, container);
        point.updatePosition();
    });
}

/** Function to render simulation - designed to be bound */
function _render(simulationContainer, points) {
    updatePoints(points, simulationContainer);
    simulationContainer.clear();

    points.forEach(point => {
        simulationContainer.drawPoint(point);
    });
}

const simulationContainer = new SimulationContainer(document.getElementById('background-canvas'));
const points = simulationContainer.generatePoints();
const renderFn = _render.bind(null, simulationContainer, points)

window.onresize = () => {
    simulationContainer.updateDimensions();
}

window.setInterval(renderFn, 16);