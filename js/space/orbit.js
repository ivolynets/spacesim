'use strict';

/**
 * An orbit of the body. Objects of this class are immutable.
 */
class Orbit {

    /**
     * Periapsis of the orbit in meters.
     */
     #periapsis;
    
    /**
     * Apoapsis of the orbit in meters.
     */
    #apoapsis;

    /**
     * Eccentricity of the orbit.
     */
    #eccentricity;

    /**
     * A major axis of the orbit.
     */
    #majorAxis;

    /**
     * A minor axis of the orbit.
     */
    #minorAxis;

    /**
     * A semi-major axis of the orbit.
     */
    #semiMajorAxis;

    /**
     * A semi-minor axis of the orbit.
     */
    #semiMinorAxis;

    /**
     * A flag that indicates whether this orbit is elliptical orbit. It has value `true` of the orbit is elliptical or `false` if the orbit is either parabolic or hyperbolic.
     */
    #elliptical;

    /**
     * Constructs the orbit with parameters calculated using semi-major axis and eccentricity.
     * 
     * @param {number} sma orbit semi-major axis in meters.
     * @param {number} eccentricity orbit eccentricity.
     * @returns {Orbit} an orbit.
     */
     static forSMA(sma, eccentricity) {
        if (sma === null || eccentricity === null) throw new ReferenceError("Semi-major axis and eccentricity cannot be null");
        if (typeof sma !== "number" || typeof eccentricity !== "number") throw new TypeError("Semi-major axis and eccentricity must be numbers");
        return new Orbit(sma * (1 - eccentricity), sma * (1 + eccentricity));
    }

    /**
     * Constructs the orbit for given periapsis and apoapsis.
     * 
     * @param {number} periapsis orbit periapsis in meters.
     * @param {number} apoapsis orbit apoapsis in meters.
     */
    constructor(periapsis, apoapsis) {
        
        if (periapsis === null || apoapsis === null) throw new ReferenceError("Periapsis and apoapsis cannot be null");
        if (typeof periapsis !== "number" || typeof apoapsis !== "number") throw new TypeError("Periapsis and apoapsis must be numbers");
        
        // todo: lazy calculations if the performance is compromized

        this.#periapsis = periapsis;
        this.#apoapsis = apoapsis;
        this.#eccentricity = Math.abs((apoapsis - periapsis) / (apoapsis + periapsis));
        this.#majorAxis = periapsis + apoapsis;
        this.#minorAxis = this.#majorAxis * Math.sqrt(1 - this.#eccentricity ** 2);
        this.#semiMajorAxis = this.#majorAxis / 2;
        this.#semiMinorAxis = this.#minorAxis / 2;
        this.#elliptical = this.#eccentricity < 1;
    }

    /**
     * Apoapsis of the orbit.
     */
    get apoapsis() {
        return this.#apoapsis;
    }

    /**
     * Periapsis of the orbit.
     */
    get periapsis() {
        return this.#periapsis;
    }

    /**
     * Eccentricity of the orbit.
     */
    get eccentricity() {
        return this.#eccentricity;
    }

    /**
     * A major axis of the orbit.
     */
    get majorAxis() {
        return this.#majorAxis;
    }

    /**
     * A minor axis of the orbit.
     */
    get minorAxis() {
        return this.#minorAxis;
    }

    /**
     * A semi-major axis of the orbit.
     */
    get semiMajorAxis() {
        return this.#semiMajorAxis;
    }

    /**
     * A semi-minor axis of the orbit.
     */
    get semiMinorAxis() {
        return this.#semiMinorAxis;
    }

    /**
     * A flag that indicates whether this orbit is elliptical orbit. It has value `true` of the orbit is elliptical or `false` if the orbit is either parabolic or hyperbolic.
     */
    get isElliptical() {
        return this.#elliptical;
    }

}

// Orbit inclination
// cos(inc) = cos(lat) * sin(azimuth) => inc = acos(cos(lat) * sin(azimuth))
