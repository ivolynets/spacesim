'use strict';

/**
 * Gravitational constant.
 */
export const G = 6.67259e-11;

/**
 * The constant represents the full length of the unit circle (2π).
 */
const DOUBLE_PI = 2 * Math.PI;

/**
 * The constant represents a number of radians in one degree.
 */
const DEGREE_RADIANS = Math.PI / 180;

 /**
  * Class represents a geometric angle.
  */
export class Angle {

    /**
     * A value of the angle in radians.
     */
    #value;

    /**
     * Creates a geometric angle using its degrees value.
     * 
     * @param {number} degrees a value of the angle in degrees. If the angle is less than 0° or greater than 259°, 
     * then it will be normalized internally to the value between 0° and 259°.
     * @returns {Angle} an instance of the angle.
     */
    static fromDegrees(degrees) {
        
        if (degrees === null) throw new ReferenceError("Angle cannot be null");
        if (typeof degrees !== "number") throw new TypeError("Angle must be a number");

        return new Angle(DEGREE_RADIANS * degrees);
    }

    /**
     * Creates a geometric angle using its radians value.
     * 
     * @param {number} radians a value of the angle in radians. If the angle is less than 0 or greater than or equals 
     * to 2π, then it will be normalized internally to the value between 0 and 2π.
     */
    constructor(radians) {

        if (radians === null) throw new ReferenceError("Angle cannot be null");
        if (typeof radians !== "number") throw new TypeError("Angle must be a number");

        // normalize the value between 0 and 2π
        const normalized = radians % DOUBLE_PI;
        this.#value = normalized < 0 ? DOUBLE_PI - normalized : normalized; 
    }

    /**
     * A value of the angle in radians.
     * @see {@link degrees} for angle value in degrees.
     */
    get radians() {
        return this.#value;
    }

    /**
     * A value of the angle in degrees.
     * @see {@link radians} for angle value in radians.
     */
    get degrees() {
        return this.#value / DEGREE_RADIANS;
    }

}

/**
 * A top-level class of all objects that depend on time.
 */
export class Temporal {

    /**
     * Registers this temporal object with the given clock.
     * @param {Clock} clock a clock to register this object with.
     */
    register(clock) {

        if (clock === null) throw new ReferenceError("Clock cannot be null");
        if (!(clock instanceof Clock)) throw new TypeError("Invalid type of clock");

        clock.register(this);
    }

    /**
     * A call to this method represents an event which indicates that the specified amount of time (in seconds) has 
     * elapsed.
     * @param {number} elapsed a number of elapsed seconds (default 1).
     */
    tick(elapsed = 1) {
        
        if (elapsed === null) throw new ReferenceError("Elapsed time cannot be null");
        if (typeof elapsed !== "number") throw new TypeError("Elapsed time must be a number");
        
        // to be overridden
    }

}

/**
 * Class represents a clock which generates ticks with a configured interval. Clock ticks are signals to temporal 
 * objects, registered with the clock, to perform a certain actions. Clock is used to synchronize objects that depend 
 * on time and change their state over time.
 */
export class Clock {

    /**
     * A clock tick rate (per second).
     */
    #rate;

    /**
     * A time interval (in milliseconds) between clock ticks.
     */
    #interval;

    /**
     * This is the internal property used to hold a cached value of elapsed time (since the latest tick). We pass this 
     * value to temporal objects so that they can do their calculations. We store it in seconds bacause it is the 
     * standard time unit in physics.
     */
    #elapsed;
    
    /**
     * The array of temporal objects registered with this clock.
     */
    #temporals = [];

    /**
     * Interval identifier.
     */
    #id;
    
    /**
     * Constructs a new clock.
     * @param {number} rate a clock tick rate (number of clock ticks) per second.
     */
    constructor(rate) {

        if (rate === null) throw new ReferenceError("Clock tick rate cannot be null");
        if (typeof rate !== "number") throw new TypeError("Clock tick rate must be a number");

        this.#rate = rate;
        this.#interval = 1000 / rate;
        this.#elapsed = 1 / rate;
    }

    /**
     * A clock tick rate (number of clock ticks) per second.
     */
    get rate() {
        return this.#rate;
    }

    /**
     * A time interval (in milliseconds) between clock ticks.
     */
    get interval() {
        return this.#interval;
    }

    /**
     * The current state of the clock. Value `true` means that the clock is running and `false` means that the clock is 
     * not currently running.
     */
     get isRunning() {
        return this.#id ? true : false;
    }

    /**
     * Registers a temporal object with this clock.
     * @param {Temporal} temporal a temporal object to be registered.
     */
    register(temporal) {
        
        if (temporal === null) throw new ReferenceError("Temporal object cannot be null");
        if (!(temporal instanceof Temporal)) throw new TypeError(`Invalid type of temporal object: ${temporal.constructor.name}`);

        this.#temporals.push(temporal);
    }

    /**
     * Starts the clock.
     * 
     * @throws {IllegalStateError} if the clock is already running.
     * @see {@link stop} to stop the clock.
     */
    start() {
        if (this.#id) throw new IllegalStateError("Clock is already running");
        this.#id = setInterval(this.#tick.bind(this), this.#interval);
    }

    /**
     * Stops the clock.
     * 
     * @throws {IllegalStateError} if the clock is not running.
     * @see {@link start} to start the clock.
     */
    stop() {
        if (this.#id) throw new IllegalStateError("Clock is not running");
        clearInterval(this.#id);
        this.#id = null;
    }

    /**
     * A clock tick handler. It triggers an action for every registered temporal object.
     */
    #tick() {
        this.#temporals.forEach(t => {
            try {
                t.tick(this.#elapsed);
            } catch (e) {
                console.error(e);
            }
        });
    }

}

/**
 * Error which indicates that the application is currently cannot perform the opration because it is in invalid state.
 */
 class IllegalStateError extends Error {}
