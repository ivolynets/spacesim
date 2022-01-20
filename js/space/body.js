'use strict';

/**
 * An astronomical object that has a mass.
 */
export class CelestialBody {

    /**
     * A mass of the body in kilograms.
     */
    #mass;

    /**
     * The standard gravitational parameter of the body.
     */
    #gm;

    /**
     * A primary body being orbited by this celestial body.
     */
    #primary;

     /**
      * A distance in meters between centers of mass of this celestial body and the primary (orbited) body.
      */
    #distance;

    /**
     * Constructs a body.
     * 
     * @param {number} mass a mass of the body in kilograms.
     * @param {CelestialBody} primary an optional primary body being orbited by this celestial body.
     * @param {number} distance a distance in meters between centers of mass of this celestial body and the primary 
     * (orbited) body. If the {@link primary} body is defined, then this argument is mandatory.
     */
    constructor(mass, primary = undefined, distance = undefined) {
        
        if (mass === null) throw new ReferenceError("Mass cannot be null");
        if (primary === null) throw new ReferenceError("Primary body cannot be null");
        if (distance === null) throw new ReferenceError("Distance cannot be null");
        if (typeof mass !== "number") throw new TypeError("Mass must be a number");
        if (typeof primary !== "undefined" && !(primary instanceof CelestialBody)) throw new TypeError("Primary must be a celestial body");
        if (typeof primary !== "undefined" && typeof distance !== "number") throw new ReferenceError("Distance must be a defined number");
        
        this.#mass = mass;
        this.#gm = G * mass;
        this.#primary = primary;
        this.#distance = distance;
    }

    /**
     * A mass of the body in kilograms.
     */
    get mass() {
        return this.#mass;
    }

    /**
     * The standard gravitational parameter of the body.
     */
    get GM() {
        return this.#gm;
    }

    /**
     * A primary body being orbited by this body.
     * @see {@link distance} for the distance to the primary body.
     */
    get primary() {
        return this.#primary;
    }

    /**
     * A distance in meters between centers of mass of this celestial body and the primary (orbited) body.
     * @see {@link primary} for the primary body.
     */
    get distance() {
        return this.#distance;
    }

    /**
     * Gravitational acceleration at a specified distance from the center of the body (m/s^2).
     */
    g(distance) {
        if (distance === null) throw new ReferenceError("Distance cannot be null");
        if (typeof distance !== "number") throw new TypeError("Distance must be a number");
        return G * this.mass / distance ** 2;
    }

}

/**
 * A celestial body that has the shape of a spheroid (or sphere if the equatorial radius equals the polar radius).
 */
export class Spheroid extends CelestialBody {

    /**
     * Equatorial radius of the spheroid in meters.
     */
    #equatorialRadius;

    /**
     * Polar radius of the spheroid in meters.
     */
    #polarRadius;

    /**
     * Mean radius of the spheroid in meters.
     */
    #meanRadius;

    /**
     * Gravitational acceleration near surface at equator (m/s^2).
     */
    #equatorialG;

    /**
     * Gravitational acceleration near surface at pole (m/s^2).
     */
    #polarG;

    /**
     * Mean gravitational acceleration near surface (m/s^2).
     */
    #meanG;

     /**
      * Constructs a spheroid.
      * 
      * @param {number} mass a mass of the spheroid in kilograms.
      * @param {number} equatorialRadius equatorial radius of the spheroid in meters.
      * @param {number} polarRadius polar radius of the spheroid in meters.
      * @param {CelestialBody} primary an optional primary body being orbited by this celestial body.
      * @param {number} distance an optional distance in meters between centers of mass of this spheroid and the 
      * primary (orbited) body. The default value is the sum of mean radius of this spheroid and the mean radius of the 
      * primary spheroid, e.g. this spheroid is located at the surface of the primary body. If the primary body is not 
      * a spheroid, then its mean radius is assumed being 0.
      */
    constructor(mass, equatorialRadius, polarRadius, primary = undefined, distance = undefined) {
        
        if (equatorialRadius === null || polarRadius === null) throw new ReferenceError("Equatorial and polar radiuses cannot be null");
        if (typeof equatorialRadius !== "number" || typeof polarRadius !== "number") throw new TypeError("Equatorial and polar radiuses must be numbers");

        const meanRadius = (this.#equatorialRadius + this.#polarRadius) / 2;
        super(mass, primary, 
            distance !== undefined ? distance : meanRadius + (primary instanceof Spheroid) ? primary.meanRadius : 0);
        
        this.#equatorialRadius = equatorialRadius;
        this.#polarRadius = polarRadius;
        this.#meanRadius = meanRadius;
        this.#equatorialG = this.g(equatorialRadius);
        this.#polarG = this.g(polarRadius);
        this.#meanG = this.g(this.#meanRadius);
    }

    /**
     * Equatorial radius of the spheroid in meters.
     */
    get equatorialRadius() {
        return this.#equatorialRadius;
    }

    /**
     * Equatorial radius of the spheroid in meters.
     */
    get polarRadius() {
        return this.#polarRadius;
    }

    /**
     * Mean radius of the spheroid in meters.
     */
    get meanRadius() {
        return this.#meanRadius;
    }

    /**
     * Gravitational acceleration near surface at equator (m/s^2).
     */
    get equatorialG() {
        return this.#equatorialG;
    }

    /**
     * Gravitational acceleration near surface at pole (m/s^2).
     */
    get polarG() {
        return this.#polarG;
    }

    /**
     * Mean gravitational acceleration near surface (m/s^2).
     */
    get meanG() {
        return this.#meanG;
    }

}

/**
 * Known stars.
 */
export const Stars = Object.freeze({
    SUN: new Spheroid(696342000, 696332000, 1.9885e30),
});

/**
 * Known planets.
 */
export const Planets = Object.freeze({
    EARTH: new Spheroid(6378137, 6356752, 5.97237e24, Stars.SUN),
});
