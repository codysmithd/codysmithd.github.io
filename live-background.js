/**
  Orbital simulation for the background of my homepage
  @Author Cody Smith
*/

const TWO_PI = 2 * Math.PI;
const SETTINGS = {
    minPointMass : 3,
    maxPointMass : 7,

    // How many pixels should be between each point to start
    pixelsPerPoint : 150,

    // Factor to deviate the starting positions by +/-
    deviationFactor : 75,

    // Time in ms for the render loop interval
    renderLoopRate : 16
};

/**
 * Container for the simulation state
 */
class SimulationContainer {
    constructor (canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.updateDimensions();
        this.points = this.generatePoints();
    }

    clear () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPoint (point) {
        let _fillStyle = this.context.fillStyle;
        this.context.fillStyle = point.color;
        this.context.beginPath();
        this.context.arc(point.x, point.y, point.mass, 0, TWO_PI);
        this.context.fill();
        this.context.fillStyle = _fillStyle;
    }

    drawConnection (point, otherPoint) {
        this.context.beginPath();
        this.context.moveTo(point.x, point.y);
        this.context.lineTo(otherPoint.x, otherPoint.y);
        this.context.stroke();
    }

    drawPoints () {
        for (const point of this.points) {
            this.drawPoint(point);
        }
    }

    updatePoints() {
        for (const point of this.points) {
            this.applyOrbitForce(point);
            point.updatePosition();
        }
    }

    applyOrbitForce (point) {
        let dX = point.x - this.centerX;
        let dY = point.y - this.centerY;

        let theta = Math.atan2(dX, dY);

        point.velocity.x = -Math.cos(theta) / point.mass;
        point.velocity.y = Math.sin(theta) / point.mass;
    }

    render () {
        this.updatePoints();
        this.clear();
        this.drawPoints();
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
        const halfDeviationFactor = SETTINGS.deviationFactor / 2;
        const massMinMaxDifference = SETTINGS.maxPointMass - SETTINGS.minPointMass;

        const points = [];
        for (let x = startX; x < size; x+= SETTINGS.pixelsPerPoint) {
            for (let y = startY; y < size; y+= SETTINGS.pixelsPerPoint) {
                let xOffset = (Math.random() * SETTINGS.deviationFactor) - halfDeviationFactor;
                let yOffset = (Math.random() * SETTINGS.deviationFactor) - halfDeviationFactor;
                let mass = Math.floor(Math.random() * massMinMaxDifference + massMinMaxDifference);
                points.push(new Point(x + xOffset, y + yOffset, mass));
            }
        }

        return points;
    }
}

/**
 * Represents a point in the simulation
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

    connectTo (point) {
        this.connections.add(point);
        point.connections.add(this);
    }

    updatePosition () {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const simulationContainer = new SimulationContainer(document.getElementById('background-canvas'));

window.onresize = () => {
    simulationContainer.updateDimensions();
}

window.setInterval(() => simulationContainer.render(), 16);