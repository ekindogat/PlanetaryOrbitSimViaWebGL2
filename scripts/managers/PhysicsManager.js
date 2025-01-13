import { GameObject } from '../classes/GameObject.js';
import { Planet } from '../classes/Planet.js';
import * as THREE from 'three';

export class PhysicsManager {
    
    scene;

    refreshRate;

    constructor( scene ) {
        this.scene = scene;

        this.refreshRate = 60;  // Can be changed
    }

    updateObjects() {
        const dT = 1 / this.refreshRate;

        // Move each planet
        this.scene.traverse( (obj) => {
            if (obj instanceof Planet) {
                this.updateParameters( dT, obj );
            }
        } )
    }

    updateParameters( dT, obj ) {
        const Gconstant = 0.001;

        const position = obj.position;
        const velocity = obj.velocity;
        const mass = obj.mass;

        obj.updateTrail( position.clone() );

        const force = new THREE.Vector3( 0, 0, 0 );

        // ...around each (other) star and other planet
        this.scene.traverse( ( otherObj ) => {
            if ( !(otherObj instanceof GameObject) ) {
                return;
            }

            // Can't gravitate itself (well, actually the particles of them do and moreover even the subparticles
			// of each subatomic particle like a proton gravitate each other, at least according to ChatGPT)
            if ( otherObj.id == obj.id ) {
                return;
            }

            const positionOther = otherObj.position;
            const velocityOther = otherObj.velocity;
            const massOther = otherObj.mass;

            const distance = positionOther.clone().sub( position ).length();
            const vectorToOther = positionOther.clone().sub( position ).normalize();

            // Fᵢⱼ = G mᵢ mⱼ / d²
			// Add-up forces from every other object
            force.add( vectorToOther.clone().multiplyScalar( Gconstant * mass * massOther / (distance**2) ) );
        } );

        // F = ma
        const acceleration = force.clone().divideScalar( mass );

        velocity.add( acceleration.clone().multiplyScalar( dT ) );
        position.add( obj.velocity.clone().multiplyScalar( dT ) );
    }
}