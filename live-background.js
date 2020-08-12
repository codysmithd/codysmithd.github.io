'use strict';
/**
  Orbital simulation for the background of my homepage
  @Author Cody Smith
*/

const TWO_PI = 2 * Math.PI;
const FPS = 60;
const MS_PER_FRAME = 1000/FPS;

const SETTINGS = {
    minPointMass : 1,
    maxPointMass : 2.5,

    activation : {

        // The maximum RGB value when a point gets activated
        max : 100,

        // What percent of the points should get activated per second
        percentageActivatedPerSecond : 0.5,

        // How long should it take for a point to get fully activated (in ms)
        activationTime : 2000
    },

    // How many pixels should be between each point to start
    pixelsPerPoint : 30,

    // Factor to deviate the starting positions by +/-
    deviationFactor : 40
};

const _percentOfPointsActivatedPerFrame = SETTINGS.activation.percentageActivatedPerSecond / FPS;
const _activationDeltaPerFrame = SETTINGS.activation.max / (SETTINGS.activation.activationTime / MS_PER_FRAME);

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
        if (point.activationLevel > 0) {
            this.context.fillStyle = point.color;
            this.context.beginPath();
            this.context.arc(point.x, point.y, point.mass, 0, TWO_PI);
            this.context.fill();
        }
    }

    drawPoints () {
        for (const point of this.points) {
            this.drawPoint(point);
        }
    }

    updatePoints() {
        for (const point of this.points) {
            this.applyOrbitForce(point);
            this.applyActivation(point);
            point.update();
        }
    }

    applyOrbitForce (point) {
        const theta = Math.atan2(point.x - this.centerX, point.y - this.centerY);

        point.velocityX = -Math.cos(theta) / point.mass;
        point.velocityY = Math.sin(theta) / point.mass;
    }

    applyActivation (point) {
        if (Math.random() <= _percentOfPointsActivatedPerFrame) {
            point.activationCounter += FPS; // Activates for one second of frames
        }
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
                points.push(new Point(x + xOffset, y + yOffset, mass, 0));
            }
        }

        return points;
    }
}

/**
 * Represents a point in the simulation
 */
class Point {
    constructor(x, y, mass, activationLevel) {
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.velocityX = 0;
        this.velocityY = 0;

        this.activationLevel = activationLevel;
        this.activationCounter = 0;
    }

    update () {
        this.updatePosition();
        this.updateColor();
    }

    updatePosition () {
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    updateColor () {
        if (this.activationCounter > 0) {
            this.activationCounter--;
            if (this.activationLevel < SETTINGS.activation.max) {
                this.activationLevel += _activationDeltaPerFrame;
            }
        } else if (this.activationLevel > 0){
            this.activationLevel -= _activationDeltaPerFrame;
        }
        this.color = `rgb(${this.activationLevel},${this.activationLevel},${this.activationLevel})`;
    }
}

const simulationContainer = new SimulationContainer(document.getElementById('background-canvas'));

window.onresize = () => {
    simulationContainer.updateDimensions();
}

window.setInterval(() => simulationContainer.updatePoints(), MS_PER_FRAME);

const _render = () => {
    requestAnimationFrame(_render);
    simulationContainer.clear();
    simulationContainer.drawPoints();
}
_render();