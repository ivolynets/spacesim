'use strict';

import { Temporal } from "./core.js";
import {Tank, Engine} from "./engine.js";

/**
 * A gauge that can be displayed on the MFD.
 */
class Gauge {

    /**
     * Renders the gauge on the given MFD.
     * 
     * @param {MFD} mfd an MFD to render the gauge on.
     * @param {number} x X coordinate of the position (top-left corner) to render the gauge at.
     * @param {number} y Y coordinate of the position (top-left corner) to render the gauge at.
     */
    render(mfd, x, y) {
        
        if (mfd === null) throw new ReferenceError("MFD cannot be null");
        if (!(mfd instanceof MFD)) throw new TypeError("Invalid MFD type");

        if (x === null || y === null) throw new ReferenceError("Coordinates cannot be null");
        if (typeof x !== "number" || typeof y !== "number") throw new TypeError("Coordinates must be numbers");
        
        // to override
    }

}

/**
 * Displays a propellant tank state on the MFD.
 */
export class TankGauge extends Gauge {

    /**
     * A tank which state is displayed by this gauge.
     */
    #tank;

    /**
     * Gauge width.
     */
    #width;

    /**
     * Gauge height.
     */
    #height;

    /**
     * A radius of the gauge corner.
     */
    #radius;

    /**
     * A flag that indicates whether to show a level of propellant in the tank in percent.
     */
    #propellantLevel;

    /**
     * An optional label to display on the tank gauge.
     */
    #label;

    /**
     * Constructs a new engine gauge.
     * 
     * @param {Tank} tank a tank which state is displayed by this gauge.
     * @param {number} width gauge width.
     * @param {number} height gauge height.
     * @param {number} radius a radius of the gauge corner.
     * @param {boolean} propellantLevel a flag that indicates whether to show a level of propellant in the tank in percent.
     * @param {string} label an optional label to display on the tank gauge.
     */
    constructor(tank, width, height, radius, propellantLevel = false, label = undefined) {

        super();

        if (tank === null) throw new ReferenceError("Tank cannot be null");
        if (!(tank instanceof Tank)) throw new TypeError("Invalid tank type");

        if (width === null || height === null) throw new ReferenceError("Gauge width and height cannot be null");
        if (typeof width !== "number" || typeof height !== "number") throw new TypeError("Gauge width and height must be numbers");

        if (radius === null) throw new ReferenceError("Gauge corner radius cannot be null");
        if (typeof radius !== "number") throw new TypeError("Gauge corner radius must be a number");

        if (propellantLevel === null) throw new ReferenceError("Propellant level flag cannot be null");
        if (typeof propellantLevel !== "boolean") throw new TypeError("Propellant level flag must be a boolean value");

        if (label === null) throw new ReferenceError("Gauge label cannot be null");
        if (typeof label !== "string") throw new TypeError("Gauge label must be a string");

        this.#tank = tank;
        this.#width = width;
        this.#height = height;
        this.#radius = radius;
        this.#propellantLevel = propellantLevel;
        this.#label = label;
    }

    /**
     * @inheritdoc
     */
    render(mfd, x, y) {
        
        super.render(mfd, x, y);
        const context = mfd.canvas.getContext("2d");

        // clear area

        context.clearRect(x, y, this.#width, this.#height);

        // draw the shape

        context.beginPath();
        context.moveTo(x, y + this.#height - this.#radius);
        context.arcTo(x, y + this.#height, x + this.#width - this.#radius, y + this.#height, this.#radius);
        context.arcTo(x + this.#width, y + this.#height, x + this.#width, y + this.#radius, this.#radius);
        context.arcTo(x + this.#width, y, x + this.#radius, y, this.#radius);
        context.arcTo(x, y, x, y + this.#radius, this.#radius);
        context.closePath();
        
        // show the propellant level

        const h = this.#height * this.#tank.level;

        context.save();
        context.clip();
        context.fillRect(x, y + this.#height - h, this.#width, h);
        
        if (this.#propellantLevel) {

            const font = this.#width / 4;
            context.font = `${font}px monospace`;

            const percentage = `${Math.round(this.#tank.level * 100)}%`;
            const text = context.measureText(percentage);
            context.globalCompositeOperation = "difference";
            context.fillText(percentage, x + (this.#width - text.width) / 2, y + this.#height / 2 + font);
        }

        if (this.#label) {

            const font = this.#width / 4;
            context.font = `${font}px monospace`;
            
            const text = context.measureText(this.#label);
            context.globalCompositeOperation = "difference";
            context.fillText(this.#label, x + (this.#width - text.width) / 2, y + this.#height / 2);
        }

        context.restore();
        context.stroke();

    }

}

/**
 * Displays an engine state on the MFD.
 */
export class EngineGauge extends Gauge {

    /**
     * An engine which state is displayed by this gauge.
     */
    #engine;

    /**
     * Gauge width.
     */
    #width;

    /**
     * A flag that indicates whether to show engine thrust level in percent.
     */
    #thrustLevel;

    /**
     * An optional label to display on the engine gauge.
     */
    #label;

    /**
     * Constructs a new engine gauge.
     * 
     * @param {Engine} engine an engine which state is displayed by this gauge.
     * @param {number} width gauge width.
     * @param {boolean} thrustLevel a flag that indicates whether to show engine thrust level in percent.
     * @param {string} label an optional label to display on engine gauge.
     */
    constructor(engine, width, thrustLevel = false, label = undefined) {

        super();

        if (engine === null) throw new ReferenceError("Engine cannot be null");
        if (!(engine instanceof Engine)) throw new TypeError("Invalid engine type");

        if (width === null) throw new ReferenceError("Gauge width cannot be null");
        if (typeof width !== "number") throw new TypeError("Gauge width must be a number");

        if (thrustLevel === null) throw new ReferenceError("Thrust level flag cannot be null");
        if (typeof thrustLevel !== "boolean") throw new TypeError("Thrust level flag must be a boolean value");

        if (label === null) throw new ReferenceError("Gauge label cannot be null");
        if (typeof label !== "string") throw new TypeError("Gauge label must be a string");

        this.#engine = engine;
        this.#width = width;
        this.#thrustLevel = thrustLevel;
        this.#label = label;
    }

    /**
     * @inheritdoc
     */
    render(mfd, x, y) {
        
        super.render(mfd, x, y);
        const context = mfd.canvas.getContext("2d");
        
        /*
        
        DRAWING GRID:
          
           x  x1 x2 x3 x4 x5 x6 w
         y +--+--+--+--+--+--+--+
        y1 +--+--+--+--+--+--+--+
        y2 +--+--+--+--+--+--+--+
           |  |  |  |  |  |  |  |
        y3 +--+--+--+--+--+--+--+
        y4 +--+--+--+--+--+--+--+
           |  |  |  |  |  |  |  |
           |  |  |  |  |  |  |  |
        y5 +--+--+--+--+--+--+--+
           |  |  |  |  |  |  |  |
           |  |  |  |  |  |  |  |
         h +--+--+--+--+--+--+--+

        */

        const x1 = x + this.#width / 7;
        const x2 = x1 + this.#width / 7;
        const x3 = x2 + this.#width / 7;
        const x4 = x3 + this.#width / 7;
        const x5 = x4 + this.#width / 7;
        const x6 = x5 + this.#width / 7;
        const w = x + this.#width;
        
        const chamber_height = this.#width;
        const y1 = y + chamber_height / 5;
        const y2 = y1 + chamber_height / 5;
        const y3 = y2 + 2 * chamber_height / 5;
        const y4 = y3 + chamber_height / 5;
        const y5 = y4 + this.#width / 2;
        const h = y5 + this.#width / 2;

        // clear area

        context.clearRect(x, y, this.#width, h - y);

        // draw engine

        context.beginPath();
        context.moveTo(x3, y);
        context.lineTo(x4, y);
        context.lineTo(x4, y1);
        context.lineTo(x5, y1);
        context.lineTo(x6, y2);
        context.lineTo(x6, y1);
        context.lineTo(w, y1);
        context.lineTo(w, y2);
        context.lineTo(x6, y3);
        context.lineTo(x5, y4);
        context.quadraticCurveTo(w, y5, w, h);
        context.lineTo(x, h);
        context.quadraticCurveTo(x, y5, x2, y4);
        context.lineTo(x1, y3);
        context.lineTo(x1, y2);
        context.lineTo(x2, y1);
        context.lineTo(x3, y1);
        context.closePath();

        // show thrust level

        context.save();
        context.clip();
        context.fillRect(x, y, this.#width, (h - y) * this.#engine.thrustLevel);
        
        // display thrust level percent
        
        if (this.#thrustLevel) {

            const font = this.#width / 3;
            context.font = `${font}px monospace`;

            const percentage = `${Math.round(this.#engine.thrustLevel * 100)}%`;
            const text = context.measureText(percentage);
            context.globalCompositeOperation = "difference";
            context.fillText(percentage, x + (this.#width - text.width) / 2, y5 + font);
        }

        // display engine label

        if (this.#label) {

            const font = this.#width / 3;
            context.font = `${font}px monospace`;
            
            const text = context.measureText(this.#label);
            context.globalCompositeOperation = "difference";
            context.fillText(this.#label, x + (this.#width - text.width) / 2, (y3 + y2) / 2 + font / 3);
        }

        context.restore();
        context.stroke();
    }

}

/**
 * This class represents an MFD screen.
 */
class Screen {

    /**
     * A reference to the MFD this screen belongs to.
     */
    #mfd;

    /**
     * An array of gauges to display on the screen.
     */
    #gauges = [];

    /**
     * Constructs a new MFD screen.
     * @param {MFD} mfd a reference to the MFD this screen belongs to.
     */
    constructor(mfd) {

        if (mfd === null) throw new ReferenceError("MFD cannot be null");
        if (!(mfd instanceof MFD)) throw new TypeError("Invalid MFD type");

        this.#mfd = mfd;
    }

    /**
     * Adds a guage to the screen.
     * 
     * @param {Gauge} gauge a gauge to display on the screen.
     * @param {number} x X coordinate of the position (top-left corner) to display the gauge at.
     * @param {number} y Y coordinate of the position (top-left corner) to display the gauge at.
     */
    add(gauge, x, y) {

        if (gauge === null) throw new ReferenceError("Gauge cannot be null");
        if (!(gauge instanceof Gauge)) throw new TypeError("Invalid gauge type");

        if (x === null || y === null) throw new ReferenceError("Coordinates cannot be null");
        if (typeof x !== "number" || typeof y !== "number") throw new TypeError("Coordinates must be numbers");

        this.#gauges.push([gauge, x, y]);
    }

    /**
     * Renders the screen. All gauges are rendered on the screen in the same order as they were added to the screen.
     */
    render() {
        this.#gauges.forEach(g => g[0].render(this.#mfd, g[1], g[2]));
    }

}

/**
 * Multi-functional display.
 */
export class MFD extends Temporal {

    /**
     * HTML element in which the MFD is rendered.
     */
    #element;
    
    /**
     * MFD canvas.
     */
    #canvas;

    /**
     * An array of MFD screens.
     */
    #screens = [];

    /**
     * An index of the selected screen.
     */
    #screen = Number.NaN;

    /**
     * Creates and returns an MFD object for a given ID of the element in which it is rendered.
     * 
     * @param {string} canvasId canvas element ID.
     * @returns {MFD} an MFD object.
     */
    static getMFD(canvasId) {
        if (canvasId === null) throw new ReferenceError("HTML element ID cannot be null");
        if (typeof canvasId !== "string") throw new TypeError("HTML element ID must be a string");
        return new MFD(document.getElementById(canvasId));
    }

    /**
     * Constructs a new MFD.
     * @param {HTMLElement} element an element in which the MFD is rendered.
     */
    constructor(element) {

        super();

        if (element === null) throw new ReferenceError("HTML element cannot be null");
        if (!(element instanceof HTMLElement)) throw new TypeError("Object is not HTML element");

        this.#element = element;
        this.#canvas = document.createElement("canvas");

        this.#canvas.width = 500;
        this.#canvas.height = 500;
        this.#canvas.style.background = "black";
        element.appendChild(this.#canvas);
    }

    /**
     * MFD canvas.
     */
    get canvas() {
        return this.#canvas;
    }

    /**
     * Creates a new screen on the MFD.
     * @returns {Screen} a reference to the created screen.
     */
    createScreen() {
        const screen = new Screen(this);
        this.#screens.push(screen);
        if (isNaN(this.#screen)) this.#screen = 0;
        return screen;
    }

    /**
     * Renders the MFD.
     */
    render() {
        
        const context = this.#canvas.getContext("2d");
        context.strokeStyle = "green";
        context.fillStyle = "green";

        if (!isNaN(this.#screen)) this.#screens[this.#screen].render();
    }

    /**
     * @inheritdoc
     */
    tick(elapsed = 1) {
        this.render();
    }

}

// pipe() {

//     this.#context.lineWidth = 4;

//     this.#context.beginPath();
//     this.#context.moveTo(300, 100);
//     this.#context.lineTo(300, 200);
//     this.#context.arcTo(300, 250, 250, 250, 50);
//     this.#context.lineTo(200, 250);
//     this.#context.stroke();

//     this.#context.save();
//     this.#context.globalCompositeOperation = 'destination-out'
//     this.#context.lineWidth = 2;
//     this.#context.stroke();
//     this.#context.restore();

// }