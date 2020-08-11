'use strict';
/**
  Orbital simulation for the background of my homepage
  @Author Cody Smith
*/

const TWO_PI = 2 * Math.PI;
const SETTINGS = {
    minPointMass : 1,
    maxPointMass : 2.5,

    // How many pixels should be between each point to start
    pixelsPerPoint : 60,

    // Factor to deviate the starting positions by +/-
    deviationFactor : 75
};

const colorGrey = '#424242';

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

    drawPoints () {
        this.context.fillStyle = colorGrey;
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
        const theta = Math.atan2(point.x - this.centerX, point.y - this.centerY);

        point.velocityX = -Math.cos(theta) / point.mass;
        point.velocityY = Math.sin(theta) / point.mass;
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
                let mass = Math.floor((Math.random() * massMinMaxDifference) + SETTINGS.minPointMass);
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
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updatePosition () {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
}

const simulationContainer = new SimulationContainer(document.getElementById('background-canvas'));

window.onresize = () => {
    simulationContainer.updateDimensions();
}

const _render = () => {
    requestAnimationFrame(_render);
    simulationContainer.updatePoints();
    simulationContainer.clear();
    simulationContainer.drawPoints();
}
_render();