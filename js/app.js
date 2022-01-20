'use strict';

import { Clock } from "./space/core.js";
import {Tank, Engine, Fuels, Oxidizers} from "./space/engine.js";
import {MFD, TankGauge, EngineGauge} from "./space/mfd.js";

export function draw() {
    
    const oxidizerTank = new Tank(Oxidizers.LIQUID_OXIGEN, 50000 / Oxidizers.LIQUID_OXIGEN.density);
    const fuelTank = new Tank(Fuels.RP_1, 10000 / Fuels.RP_1.density);

    oxidizerTank.fillMass(100000);
    fuelTank.fillMass(50000);

    const engineL = new Engine(7770000, 788, 2578);
    const engineR = new Engine(7770000, 788, 2578);

    engineL.fuelTank = fuelTank;
    engineL.oxidizerTank = oxidizerTank;

    engineR.fuelTank = fuelTank;
    engineR.oxidizerTank = oxidizerTank;

    engineL.preburnerIgnition = true;
    engineR.preburnerIgnition = true;

    engineL.chamberIgnition = true;
    engineR.chamberIgnition = true;

    engineL.throttle = 1.0;
    engineR.throttle = 1.0;

    const mfd = MFD.getMFD("engine");
    const screen = mfd.createScreen();
    
    screen.add(new TankGauge(oxidizerTank, 90, 200, 20, true, "Ox"), 50, 50);
    screen.add(new TankGauge(fuelTank, 90, 100, 20, true, "Fl"), 50, 260);
    screen.add(new EngineGauge(engineL, 40, true, "L"), 50, 370);
    screen.add(new EngineGauge(engineR, 40, true, "R"), 100, 370);
    
    
    const clock = new Clock(24);
    clock.register(engineL);
    clock.register(engineR);
    clock.register(mfd);
    
    mfd.render();
    clock.start();

}

draw();
