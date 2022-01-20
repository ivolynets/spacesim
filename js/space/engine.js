'use strict';

import {Temporal} from "./core.js";

/**
 * A chemical compound model, which represents a component of the propellant.
 */
class Compound {

    /**
     * A density of the compound (kg/ml).
     */
    #density;

    /**
     * A melting point of the compound (°C).
     */
    #meltingPoint;

    /**
     * A boiling point of the compound (°C).
     */
     #boilingPoint;

    /**
     * Constructs a new compound.
     * 
     * @param {number} density compound density (kg/ml).
     * @param {number} meltingPoint compound melting point (°C).
     * @param {number} boilingPoint compound boiling point (°C).
     */
    constructor(density, meltingPoint, boilingPoint) {

        if (density === null) throw new ReferenceError("Compound density cannot be null");
        if (meltingPoint === null || boilingPoint === null) throw new ReferenceError("Compound melting and boiling points cannot be null");
        if (typeof density !== "number") throw new TypeError("Compound density must be a number");
        if (typeof meltingPoint !== "number" || typeof boilingPoint !== "number") throw new TypeError("Compound melting and boiling points must be numbers");

        this.#density = density;
        this.#meltingPoint = meltingPoint;
        this.#boilingPoint = boilingPoint;
    }

    /**
     * A density of the compound (kg/ml).
     */
    get density() {
        return this.#density;
    }

    /**
     * A melting point of the compound (°C).
     */
    get meltingPoint() {
        return this.#meltingPoint;
    }

    /**
     * A boiling point of the compound (°C).
     */
    get boilingPoint() {
        return this.#boilingPoint;
    }

}

/**
 * A fuel.
 */
class Fuel extends Compound {
}

/**
 * An oxidizer.
 */
class Oxidizer extends Compound {
}

/**
 * Standard fuels.
 */
export const Fuels = Object.freeze({
    KEROSENE: new Fuel(0.000749, -9.6, 216.3), // C12H26
    RP_1: new Fuel(0.000820, Number.NaN, 274.0), // CnH1.953n (RP-1)
    HYDRAZINE: new Fuel(0.001004, 1.4, 113.5), // N2H4
    METHYL_HYDRAZINE: new Fuel(0.000866, -52.4, 87.5), // monomethylhydrazine (CH3)NH(NH2) (MMH)
    DIMETHYL_HYDRAZINE: new Fuel(0.000791, -58.0, 63.9), // unsymmetrical dimethylhydrazine (CH3)2NH(NH2) (UDMH)
    AEROZINE_50: new Fuel(0.000899, -7.3, 70.0), // 50% of hydrazine and 50% of UDMH
    LIQUID_HYDROGEN: new Fuel(0.000071, -259.3, -252.9), // H2 (LH2)
});

/**
 * Standard oxidizers.
 */
export const Oxidizers = Object.freeze({
    LIQUID_OXIGEN: new Oxidizer(0.00114, -218.8, -183.0), // O2 (LOX)
    NITROGEN_TETROXIDE: new Oxidizer(0.00145, -9.3, 21.15), // N2O4 (NTO)
});

/**
 * A tank with propellant.
 */
export class Tank {

    /**
     * A propellant compound which the tank contains.
     */
    #compound;

    /**
     * A capacity of the tank in milliliters.
     */
    #volumeCapacity;

    /**
     * A capacity of the tank in kilograms.
     */
    #massCapacity;

    /**
     * Current level of a compound in the tank (kilograms).
     */
    #level = 0.0;

    /**
     * Constructs a new tank.
     * 
     * @param {Compound} compound a propellant compound which the tank contains.
     * @param {number} capacity tank capacity in milliliters.
     */
    constructor(compound, capacity) {

        if (compound === null) throw new ReferenceError("Propellant compound cannot be null");
        if (capacity === null) throw new ReferenceError("Tank capacity cannot be null");
        if (!(compound instanceof Compound)) throw new TypeError("Invalid compound type");
        if (typeof capacity !== "number") throw new TypeError("Tank capacity must be a number");

        this.#compound = compound;
        this.#volumeCapacity = capacity;
        this.#massCapacity = capacity * compound.density;
    }

    /**
     * A propellant compound which the tank contains.
     */
    get compound() {
        return this.#compound;
    }

    /**
     * A capacity of the tank in milliliters.
     */
    get volumeCapacity() {
        return this.#volumeCapacity;
    }

    /**
     * A capacity of the tank in kilograms.
     */
    get massCapacity() {
        return this.#massCapacity;
    }

    /**
     * Current level of a compound in the tank in milliliters.
     */
    get volumeLevel() {
        return this.#level / this.#compound.density;
    }
    
    /**
     * Current level of a compound in the tank in kilograms.
     */
    get massLevel() {
        return this.#level;
    }

    /**
     * Current level of a compound in the tank. Value 0 means that the tank is empty. Value 1 means that the tank is full.
     */
    get level() {
        return this.#level / this.#massCapacity;
    }

    /**
     * Flag that indicates whether the tank is empty.
     */
    get empty() {
        return this.#level <= 0;
    }

    /**
     * Fills the tank with a compound of a requested volume (milliliters). It returns the actual volume of the compound added to the tank. The actual added volume may be less than requested, e.g. when the tank is already full.
     * 
     * @param {number} volume a volume of the compound to be added to the tank.
     * @returns {number} the actual volume of the compound added to the tank.
     */
    fillVolume(volume) {
        
        if (volume === null) throw new ReferenceError("Compound volume cannot be null");
        if (typeof volume !== "number") throw new TypeError("Compound volume must be a number");
        
        const mass = Math.min(this.#massCapacity - this.#level, volume * this.#compound.density);
        this.#level += mass;

        return mass / this.#compound.density;
    }

    /**
     * Fills the tank with a compound of a requested mass (kg). It returns the actual mass of the compound added to the tank. The actual added mass may be less than requested, e.g. when the tank is already full.
     * 
     * @param {number} mass a mass of the compound to be added to the tank.
     * @returns {number} the actual mass of the compound added to the tank.
     */
    fillMass(mass) {
        
        if (mass === null) throw new ReferenceError("Compound mass cannot be null");
        if (typeof mass !== "number") throw new TypeError("Compound mass must be a number");
        
        mass = Math.min(this.#massCapacity - this.#level, mass);
        this.#level += mass;

        return mass;
    }

    /**
     * Drains a compound of a requested volume (milliliters) from the tank. It returns the actual volume of the compound drained from the tank. The actual drained volume may be less than requested, e.g. when the remaining volume of the compound in the tank is not enough.
     * 
     * @param {number} volume a volume of the compound to be drained from the tank.
     * @returns {number} the actual volume of the compound drained from the tank.
     */
    drainVolume(volume) {
        
        if (volume === null) throw new ReferenceError("Compound volume cannot be null");
        if (typeof volume !== "number") throw new TypeError("Compound volume must be a number");
        
        const mass = Math.min(this.#level, volume * this.#compound.density);
        this.#level -= mass;

        return mass / this.#compound.density;
    }

    /**
     * Drains a compound of a requested mass (kg) from the tank. It returns the actual mass of the compound drained from the tank. The actual drained mass may be less than requested, e.g. when the remaining mass of the compound in the tank is not enough.
     * 
     * @param {number} mass a mass of the compound to be drained from the tank.
     * @returns {number} the actual mass of the compound drained from the tank.
     */
    drainMass(mass) {
        
        if (mass === null) throw new ReferenceError("Compound mass cannot be null");
        if (typeof mass !== "number") throw new TypeError("Compound mass must be a number");
        
        mass = Math.min(this.#level, mass);
        this.#level -= mass;

        return mass;
    }

}

/* ==================================================== ENGINE ===================================================== */

/**
 * Generic engine error.
 */
class EngineError extends Error {}

/**
 * An error which indicates that one or more of the tanks are not connected to the engine.
 */
class NoTankConnectedError extends EngineError {}

/**
 * An error which indicates that the fuel tank is not connected to the engine.
 */
class NoFuelTankConnectedError extends NoTankConnectedError {}

/**
 * An error which indicates that the oxidizer tank is not connected to the engine.
 */
class NoOxidizerTankConnectedError extends NoTankConnectedError {}

/**
 * An error which indicates that there is no supply of one of the propellant components to the engine.
 */
class OutOfPropellantError extends EngineError {}

/**
 * An error which indicates that there is no fuel supply to the engine.
 */
class OutOfFuelError extends OutOfPropellantError {}

/**
 * An error which indicates that there is no oxidizer supply to the engine.
 */
class OutOfOxidizerError extends OutOfPropellantError {}

/**
 * A rocket engine model. This is simplified model, it does not take into account various parameters like atmospheric 
 * pressure. It takes into account gravitational acceleration but ignores the direction of the trhust vector.
 */
export class Engine extends Temporal {

    /**
     * The fraction of propellant tapped off for the pre-burner. We do not care here whether the pre-burner produces 
     * a fuel-rich gas or oxidizer-rich gas. Since, the propellant component that was not burned in the pre-burner 
     * anyway ends up in the combustion chamber and burns there (we assume that the engine has a closed cycle), this 
     * property shows how much of propellant percent is actually burned in the pre-burner.
     * 
     * todo: actually we do care whether the pre-burner produces a fuel-rich gas or oxidizer-rich gas because in some
     * edge cases, e.g. when the pre-burner burns propellant but there is no ignition in the combustion chamber, the 
     * consumption of propellant components is different. We'll add this feature later.
     */
    #PREBURNER_TAP_OFF = 0.05;

    /**
     * The fraction of propellant tapped off for the combustion chamber. This is the major portion of the propellant 
     * that excludes the fraction of propellant percent burned in the pre-burner.
     */
    #CHAMBER_TAP_OFF = 1 - this.#PREBURNER_TAP_OFF;

    /**
     * Engine thrust in the vacuum (N).
     */
    #thrust;

    /**
     * The rate of the ejected fuel mass flow (kg/s).
     */
    #fuelFlow;

     /**
      * The rate of the ejected oxidizer mass flow (kg/s).
      */
    #oxidizerFlow;

    /**
     * A total propellant flow rate including fuel and oxidizer.
     */
    #propellantFlow;

    /**
     * Effective exhaust velocity (m/s).
     */
    #effectiveExhaustVelocity

    /**
     * A connected fuel tank.
     */
    #fuelTank = null;

    /**
     * A connected oxidizer tank.
     */
    #oxidizerTank = null;

    /**
     * A throttle control that indicates the current thrust level in fraction of its nominal value. Value 0 means that 
     * the engine is not currently working. Value 1 means that the engine is currently working at the maximum thrust 
     * level.
     */
    #throttle = 0.0;

    /**
     * Flag determines whether the pre-burner ignition is activated or not.
     */
    #preburnerIgnition = false;

    /**
     * Flag determines whether the combustion chamber ignition is activated or not.
     */
    #chamberIgnition = false;

    /**
     * A property that indicates the current level of combustion in the pre-burner. Value 0 means that there is no 
     * combustion currently happening in the pre-burner. Value 1 means that there is a full combustion currently 
     * happening in the pre-burner.
     */
     #preburnerCombustion = 0.0;

    /**
     * A property that indicates the current level of combustion in the chamber. Value 0 means that there is no 
     * combustion currently happening in the chamber. Value 1 means that there is a full combustion currently happening 
     * in the chamber.
     */
    #chamberCombustion = 0.0;

    /**
     * Constructs a new engine with given parameters.
     * 
     * @param {number} thrust engine thrust in the vacuum (N).
     * @param {number} fuelFlow the rate of the ejected fuel mass flow (kg/s).
     * @param {number} oxidizerFlow the rate of the ejected oxidizer mass flow (kg/s).
     */
    constructor(thrust, fuelFlow, oxidizerFlow) {

        super();

        if (thrust === null) throw new ReferenceError("Engine thrust value cannot be null");
        if (fuelFlow === null || oxidizerFlow === null) throw new ReferenceError("Propellant flow cannot be null");
        if (typeof thrust !== "number") throw new TypeError("Engine thrust value must be a number");
        if (typeof fuelFlow !== "number" || typeof oxidizerFlow !== "number") throw new TypeError("Propellant flow must be a number");
        
        // todo: lazy calculations if the performance is compromized

        this.#thrust = thrust;
        this.#fuelFlow = fuelFlow;
        this.#oxidizerFlow = oxidizerFlow;
        this.#propellantFlow = fuelFlow + oxidizerFlow;
        this.#effectiveExhaustVelocity = thrust / this.#propellantFlow;
    }

    /**
     * A connected fuel tank.
     */
    get fuelTank() {
        return this.#fuelTank;
    }

    /**
     * A connected fuel tank.
     */
    set fuelTank(tank) {
        
        if (tank !== null) {
            if (!(tank instanceof Tank)) throw new TypeError("Invalid tank type");
            if (!(tank.compound instanceof Fuel)) throw new RangeError("The tank must contain a fuel");
        }
        
        this.#fuelTank = tank;
    }

    /**
     * A connected oxidizer tank.
     */
    get oxidizerTank() {
        return this.#oxidizerTank;
    }

    /**
     * A connected oxidizer tank.
     */
    set oxidizerTank(tank) {
        
        if (tank !== null) {
            if (!(tank instanceof Tank)) throw new TypeError("Invalid tank type");
            if (!(tank.compound instanceof Oxidizer)) throw new RangeError("The tank must contain an oxidizer");
        }
        
        this.#oxidizerTank = tank;
    }

    /**
     * A throttle control that indicates the current thrust level in fraction of its nominal value. Value 0 means that 
     * the engine is not currently working. Value 1 means that the engine is currently working at the maximum thrust 
     * level.
     */
    get throttle() {
        return this.#throttle;
    }

    /**
     * A throttle control that indicates the current thrust level in fraction of its nominal value. Value 0 means that 
     * the engine is not currently working. Value 1 means that the engine is currently working at the maximum thrust 
     * level.
     */
    set throttle(level) {
        
        if (level === null) throw new ReferenceError("Thrust level cannot be null");
        if (typeof level !== "number") throw new TypeError("Thrust level must be a number");
        if (level < 0 || level > 1) throw new RangeError("Thrust level must be a value between 0 and 1");

        this.#throttle = level;
    }

    /**
     * A pre-burner ignition control that determines whether it is activated or not.
     */
    get preburnerIgnition() {
        return this.#preburnerIgnition;
    }

    /**
     * A pre-burner ignition control that determines whether it is activated or not.
     */
    set preburnerIgnition(active) {
        
        if (active === null) throw new ReferenceError("Ignition control value cannot be null");
        if (typeof active !== "boolean") throw new TypeError("Ignition control value must be of a boolean type");
        
        this.#preburnerIgnition = active;
    }

    /**
     * A combustion chamber ignition control that determines whether it is activated or not.
     */
     get chamberIgnition() {
        return this.#chamberIgnition;
    }

    /**
     * A combustion chamber ignition control that determines whether it is activated or not.
     */
    set chamberIgnition(active) {

        if (active === null) throw new ReferenceError("Ignition control value cannot be null");
        if (typeof active !== "boolean") throw new TypeError("Ignition control value must be of a boolean type");

        this.#chamberIgnition = active;
    }

    /**
     * The current engine thrust in the vacuum (N). It depends on the current thrust level.
     * @see {@link throttle} to control thrust level.
     */
    get thrust() {
        return this.#thrust * this.thrustLevel;
    }

    /**
     * The current engine thrust level in fraction of its nominal value.
     * @see {@link throttle} to control thrust level.
     */
    get thrustLevel() {
        return this.#preburnerCombustion * this.#PREBURNER_TAP_OFF + this.#chamberCombustion * this.#CHAMBER_TAP_OFF;
    }

    /**
     * The current rate of the ejected fuel mass flow (kg/s). It depends on the current thrust level.
     * @see {@link throttle} to control thrust level.
     */
    get fuelFlow() {
        return this.#fuelFlow * this.#PREBURNER_TAP_OFF * this.#preburnerCombustion 
            + this.#fuelFlow * this.#CHAMBER_TAP_OFF * this.#chamberCombustion;
    }

    /**
     * The current rate of the ejected oxidizer mass flow (kg/s). It depends on the current thrust level.
     * @see {@link throttle} to control thrust level.
     */
    get oxidizerFlow() {
        return this.#oxidizerFlow * this.#PREBURNER_TAP_OFF * this.#preburnerCombustion 
            + this.#oxidizerFlow * this.#CHAMBER_TAP_OFF * this.#chamberCombustion;
    }

    /**
     * A total propellant flow rate including fuel and oxidizer. It depends on the current thrust level.
     * @see {@link throttle} to control thrust level.
     */
    get propellantFlow() {
        return this.#propellantFlow * this.#PREBURNER_TAP_OFF * this.#preburnerCombustion 
            + this.#propellantFlow * this.#CHAMBER_TAP_OFF * this.#chamberCombustion;
    }

    /**
     * Effective exhaust velocity (m/s). It depends on the current thrust level.
     * @see {@link throttle} to control thrust level.
     */
    get effectiveExhaustVelocity() {
        return this.#effectiveExhaustVelocity * this.#PREBURNER_TAP_OFF * this.#preburnerCombustion 
            + this.#effectiveExhaustVelocity * this.#CHAMBER_TAP_OFF * this.#chamberCombustion;
    }

    /**
     * Calculates and returns a specific impulse of the engine for a given gravitational acceleration that applies to a 
     * body carrying this engine or engine itself. It depends on the current thrust level.
     * 
     * @param {number} g gravitational acceleration applied to the engine (body) in m/s^2.
     * @returns {number} specific impulse in seconds.
     * @see {@link throttle} to control thrust level.
     */
    specificImpulse(g) {

        if (g === null) throw new ReferenceError("Gravitational acceleration cannot be null");
        if (typeof g !== "number") throw new TypeError("Gravitational acceleration must be a number");
        
        return this.thrust / this.propellantFlow * g;
    }

    /**
     * @inheritdoc
     */
    tick(elapsed = 1) {
        
        super.tick(elapsed);
        
        this.#preburner(elapsed);
        this.#chamber(this.#pump(elapsed));
        
        // if (fuelDrained) throw new OutOfFuelError("Fuel tank is empty");
        // if (oxidizerDrained) throw new OutOfOxidizerError("Oxidizer tank is empty");
    }

    /**
     * This function imitates the burning of the propellant in the pre-burner and the production of the gas for the 
     * turbine generator which feeds the main pumps. It updates the {@link #preburnerCombustion} property which 
     * reflects the amount of gas generated, hence the power for pumps, in fraction of engine's nominal power. Under 
     * normal circumstances it equals the current thrust, but it may be different if the propellant 
     * componets flow is disrupted for some reason.
     * 
     * @param {number} elapsed a number of elapsed seconds since the previous calculation cycle.
     */
     #preburner(elapsed) {
        
        if (!this.#fuelTank) throw new NoFuelTankConnectedError("Fuel tank is not connected");
        if (!this.#oxidizerTank) throw new NoOxidizerTankConnectedError("Oxidizer tank is not connected");

        // pre-calculated coefficients
        const a = this.#PREBURNER_TAP_OFF * elapsed;
        const b = a * this.#throttle;

        const fuelDrained = this.#fuelTank.drainMass(this.#fuelFlow * b);
        const oxidizerDrained = this.#oxidizerTank.drainMass(this.#oxidizerFlow * b);
        
        const fuelSupply = fuelDrained / (this.#fuelFlow * a);
        const oxidizerSupply = oxidizerDrained / (this.#oxidizerFlow * a);

        // combustion is self-sustained or may be ignited
        this.#preburnerCombustion = this.#preburnerIgnition || this.#preburnerCombustion > 0 
            ? Math.min(fuelSupply, oxidizerSupply) : 0;
    }

    /**
     * This function imitates the work of propellant pumps. It depennds on the power generated by the turbine fed by 
     * the pre-burner gases.
     * 
     * @param {number} elapsed a number of elapsed seconds since the previous calculation cycle.
     * @returns the amount of propellant mixture pumped in fraction of its nominal value.
     * @see {@link #preburner} to understand how the work of the pre-burner is imitated.
     */
    #pump(elapsed) {
        
        if (!this.#fuelTank) throw new NoFuelTankConnectedError("Fuel tank is not connected");
        if (!this.#oxidizerTank) throw new NoOxidizerTankConnectedError("Oxidizer tank is not connected");

        // pre-calculated coefficients
        const a = this.#CHAMBER_TAP_OFF * elapsed;
        const b = a * this.#preburnerCombustion;
        
        const fuelDrained = this.#fuelTank.drainMass(this.#fuelFlow * b);
        const oxidizerDrained = this.#oxidizerTank.drainMass(this.#oxidizerFlow * b);

        const fuelSupply = fuelDrained / (this.#fuelFlow * a);
        const oxidizerSupply = oxidizerDrained / (this.#oxidizerFlow * a);

        return Math.min(fuelSupply, oxidizerSupply)
    }

    /**
     * This function imitates the work of combustion chamber. It updates the {@link #chamberCombustion} property which 
     * reflects the actual engine thrust level.
     * 
     * @param {number} mixture a propellant mixture level in fraction of its nominal value.
     */
    #chamber(mixture) {

        if (mixture === null) throw new ReferenceError("Mixture level cannot be null");
        if (typeof mixture !== "number") throw new TypeError("Mixture level must be a number");
        if (mixture < 0 || mixture > 1) throw new RangeError("Mixture level must be a value between 0 and 1");

        // combustion is self-sustained or may be ignited
        this.#chamberCombustion = this.#chamberIgnition || this.#chamberCombustion > 0 ? mixture : 0;
    }

}
