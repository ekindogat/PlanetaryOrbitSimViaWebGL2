import * as THREE from 'three';

import { ShaderToonOutline } from '../materials/ShaderToonMaterial.js';

export class GameObject extends THREE.Mesh {
    /** TODO
     * Need to fill with the code that common for Star, Planet, Asteroid game objects etc.
     * Mass, Dimensions, Speed, Directions etc.
     *
     */

    velocity;
    mass;

    constructor() {
        super();
        this.light = new THREE.PointLight( 0xffffff, 25 );
        this.switchToPhong();

        this.layers.toggle(2);  // Raycaster layer
        this.velocity = new THREE.Vector3();

        //this.geometry.computeBoundingBox();
    }

    //
    switchToPhong() {
    }

    switchToToon() {
    }

    reset() {
    }
}