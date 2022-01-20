'use strict';

import { Angle } from "./core.js";
import { CelestialBody } from "./body.js";

/**
 * Generic class that represents a spacecraft of any kind. It may be controlled or uncontrolled body. Objects of this 
 * class inherit all properties of the celestial body.
 */
export class Spacecraft extends CelestialBody {

    /**
     * A velocity of the spacecraft in meters per second.
     */
    #velocity;

    /**
     * The angle between the position and the velocity vectors of the spacecraft.
     */
    #zenithAngle;

    /**
     * A reference to the payload spacecraft that is being carried by this spacecraft.
     */
    #payload = null;

    /**
     * A reference to the spacecraft that is carrying this spacecraft.
     */
    #carrier = null;

    /**
      * Constructs a spacecraft.
      * 
      * @param {number} mass a mass of the spacecraft in kilograms.
      * @param {number} velocity a velocity of the spacecraft in meters per second.
      * @param {CelestialBody} primary a primary body being orbited by this spacecarft.
      * @param {number} distance an optional distance in meters between centers of mass of the spacecraft and the 
      * primary (orbited) body. The default value is the mean radius of the primary spheroid, e.g. this spacecraft is 
      * located at the surface of the primary body. If the primary body is not a spheroid, then its mean radius is 
      * assumed being 0.
      * @param {Angle} zenithAngle the angle between the position and the velocity vectors of the spacecarft.
      */
    constructor(mass, velocity, primary, distance = undefined, zenithAngle = 0) {
        
        super(mass, primary, distance !== undefined ? distance : (primary instanceof Spheroid ? primary.meanRadius : 0));

        if (velocity === null) throw new ReferenceError("Velocity cannot be null");
        if (zenithAngle === null) throw new ReferenceError("Zenith angle cannot be null");
        if (typeof velocity !== "number") throw new TypeError("Velocity must be a number");
        if (!(zenithAngle instanceof Angle)) throw new TypeError("Invalid angle type");
        
        this.#velocity = velocity;
        this.#zenithAngle = zenithAngle;
    }

    /**
     * A mass of the body in kilograms. If this spacecraft has a payload, then the mass of payload is added to the 
     * total mass of this spacecraft.
     * @override
     */
    get mass() {
        return this.#payload !== null ? this.#payload.mass + this.#mass : this.#mass;
    }

    /**
     * A distance in meters between centers of mass of this celestial body and the primary (orbited) body. If this 
     * spacecraft has a carrier, then the distance from this spacecraft is the same as the distance from its carrier.
     * @override
     * @see {@link primary} for the primary body.
     */
    get distance() {
        return this.#carrier !== null ? this.#carrier.distance : this.#distance;
    }

    /**
     * A velocity of the spacecraft in meters per second. If this spacecraft has a carrier, then the velocity of this 
     * spacecraft is the same as the velocity of its carrier.
     */
    get velocity() {
        return this.#carrier !== null ? this.#carrier.velocity : this.#velocity;
    }

    /**
     * The angle between the position and the velocity vectors of the spacecraft.
     */
    get zenithAngle() {
        return this.#zenithAngle;
    }

    /**
     * A reference to the payload spacecraft that is being carried by this spacecraft.
     * @see {@link carrier} for the carrier of this spacecraft.
     */
    get payload() {
        return this.#payload;
    }

    /**
     * A reference to the payload spacecraft that is being carried by this spacecraft.
     * @see {@link carrier} for the carrier of this spacecraft.
     */
    set payload(spacecarft) {
        
        if (spacecarft !== null) {
            if (!(spacecarft instanceof Spacecraft)) throw new TypeError("Invalid spacecraft type");
            spacecarft.carrier = this;
        } else {
            this.#payload.carrier = null;
        }
        
        this.#payload = spacecarft;
    }

    /**
     * A reference to the spacecraft that is carrying this spacecraft.
     * @see {@link payload} for the payload of this spacecraft.
     */
    get carrier() {
        return this.#carrier;
    }

    /**
     * A reference to the payload spacecraft that is being carried by this spacecraft.
     * @see {@link payload} for the payload of this spacecraft.
     */
    set carrier(spacecarft) {
        
        if (spacecarft !== null) {
            if (!(spacecarft instanceof Spacecraft)) throw new TypeError("Invalid spacecraft type");
            spacecarft.payload = this;
        } else {
            this.#carrier.payload = null;
        }
        
        this.#carrier = spacecarft;
    }

    /**
     * The vehicle's orbit around the primary body based on the current vehicle's parameters.
     */
    get orbit() {

        const C = 2 * this.primary.GM / (this.#distance * this.#velocity ** 2);
        
        // calculate periapsis and apoapsis

        const y = Math.PI / 180 * this.#zenithAngle;

        const r1 = (-C + Math.sqrt(C ** 2 - 4 * (1 - C) * (-(Math.sin(y) ** 2)))) / (2 * (1 - C)) * this.#distance;
        const r2 = (-C - Math.sqrt(C ** 2 - 4 * (1 - C) * (-(Math.sin(y) ** 2)))) / (2 * (1 - C)) * this.#distance;

        const periapsis = Math.min(r1, r2);
        const apoapsis = Math.max(r1, r2);
        
        return new Orbit(periapsis, apoapsis);
    }

}

function draw() {

    // input

    const vehicle = new Vehicle(Planets.EARTH, Planets.EARTH.meanRadius + 120000, 7900, 89);
    const orbit = vehicle.getOrbit();

    // ---

    // const r = (earth_radius + altitude) * 1000; // m
    // const C = 2 * GM / (r * velocity ** 2);

    // console.log(`C = ${C}`);

    // calculate apogee and perigee

    // const y = Math.PI / 180 * zenith_angle;

    // const r1 = (-C + Math.sqrt(C ** 2 - 4 * (1 - C) * (-(Math.sin(y) ** 2)))) / (2 * (1 - C)) * r;
    // const r2 = (-C - Math.sqrt(C ** 2 - 4 * (1 - C) * (-(Math.sin(y) ** 2)))) / (2 * (1 - C)) * r;

    // const rA = Math.max(r1, r2); // apogee (m)
    // const rP = Math.min(r1, r2); // perigee (m)

    // console.log(`rA = ${rA}, rP = ${rP}`);

    // const e = Math.abs((rA - rP) / (rA + rP)); // eccentricity
    // const e = Math.sqrt(r * velocity ** 2 / GM - 1) ** 2 * Math.sin(y) ** 2 + Math.cos(y) ** 2; // eccentricity

    // let axisX = rA + rP; // major axis (m)
    // let axisY = axisX * Math.sqrt(1 - e ** 2); // minor axis (m)

    // console.log(`axisX = ${axisX}, axisY = ${axisY}, e = ${e}`);

    // calculate true anomaly

    const y = Math.PI / 180 * vehicle.zenithAngle;
    const tanV = ((vehicle.distance * vehicle.velocity ** 2 / Planets.EARTH.GM) * Math.sin(y) * Math.cos(y)) / ((vehicle.distance * vehicle.velocity ** 2 / Planets.EARTH.GM) * Math.sin(y) ** 2 - 1);
    const V = Math.atan(tanV);
    console.log(`tanV = ${tanV}, V = ${V / (Math.PI / 180)}`);

    // draw

    const space = document.getElementById("space");
    space.style.background = "black";
    const context = space.getContext("2d");

    context.strokeStyle = "green";
    context.lineWidth = 1;

    // scale

    const allocation = 0.9;
    const effective_width = space.width * allocation;
    const scale_factor = effective_width / Math.max(orbit.majorAxis, Planets.EARTH.meanRadius * 2);

    console.log(`scale_factor = ${scale_factor}`);

    const axisX = orbit.majorAxis * scale_factor;
    const axisY = orbit.minorAxis * scale_factor;
    const earth_radius = Planets.EARTH.meanRadius * scale_factor;

    const centerX = space.width / 2;
    const centerY = space.height / 2;
    const a = axisX / 2;
    const b = axisY / 2;

    // draw the planet
    
    const coefficient = V < 0 ? -1 : 1;
    const focusDistance = Math.sqrt(a ** 2 - b ** 2); // focus distance from center
    let adjacent = coefficient * focusDistance * Math.cos(V);
    let opposite = coefficient * focusDistance * Math.sin(V);
    const focusX = centerX + adjacent;
    const focusY = centerY + opposite;
    
    context.beginPath();
    context.ellipse(focusX, focusY, earth_radius, earth_radius, 0, 0, 2 * Math.PI);
    context.stroke();

    // draw the focus
    
    context.beginPath();
    context.moveTo(focusX - 5, focusY);
    context.lineTo(focusX + 5, focusY);
    context.stroke();

    context.beginPath();
    context.moveTo(focusX, focusY - 5);
    context.lineTo(focusX, focusY + 5);
    context.stroke();

    // draw the orbit

    context.setLineDash([5, 5]);

    context.beginPath();
    context.ellipse(centerX, centerY, a, b, V, 0, 2 * Math.PI);
    context.stroke();

    // draw position

    const R = a * (1 - orbit.eccentricity ** 2) / (1 + orbit.eccentricity * Math.cos(V));
    // const adjacent = R * Math.cos(V);
    // const opposite = R * Math.sin(V);
    
    adjacent = coefficient * orbit.periapsis * scale_factor * Math.cos(V);
    opposite = coefficient * orbit.periapsis * scale_factor * Math.sin(V);

    context.beginPath();
    context.moveTo(focusX, focusY);
    context.lineTo(focusX + adjacent, focusY + opposite);
    context.stroke();

    adjacent = coefficient * orbit.apoapsis * scale_factor * Math.cos(V);
    opposite = coefficient * orbit.apoapsis * scale_factor * Math.sin(V);

    context.beginPath();
    context.moveTo(focusX, focusY);
    context.lineTo(focusX - adjacent, focusY - opposite);
    context.stroke();

    // ---

    context.setLineDash([]);
    
    context.beginPath();
    context.moveTo(focusX, focusY);
    // context.lineTo(focus + adjacent, centerY - opposite);
    context.lineTo(focusX + vehicle.distance * scale_factor, focusY);
    context.stroke();

}
