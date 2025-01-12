import * as THREE from './../../node_modules/three/build/three.module.js';

import { StarMaterial } from '../materials/StarMaterial.js';

import { ShaderToonOutline } from '../materials/ShaderToonMaterial.js';
import {GameObject} from "./GameObject.js";

export class Star extends GameObject {
    
    constructor(color) {
        super();
        
        this.light = new THREE.PointLight( 0xffffff, 25 );
        
        // this.light.castShadow = true;
        // this.light.shadow.mapSize.height = 4096;
        // this.light.shadow.mapSize.width = 4096;
        // this.receiveShadow = true;
        
        this.switchToPhong();
    }

    switchToPhong() {
        this.reset()

        this.geometry = new THREE.SphereGeometry();
        this.material = new StarMaterial();

    }

    switchToToon() {
        this.reset();

        this.geometry = new THREE.SphereGeometry( 1.40 );
        this.material = new THREE.MeshBasicMaterial( {color: 0xfc2e00, transparent: true, opacity: 0.8} );

        const sphere1 = new THREE.SphereGeometry( 1.25 );
        const material1 = new THREE.MeshBasicMaterial( {color: 0xfc9100, transparent: true, opacity: 0.9} );
        material1.side = THREE.BackSide;
        const middleSphere = new THREE.Mesh( sphere1, material1 );
        
        this.attach( middleSphere );
        
        middleSphere.position.set( 0, 0, 0 );
        middleSphere.scale.set( 1, 1, 1 );

        const sphere2 = new THREE.SphereGeometry( 1.00 );
        const material2 = new THREE.MeshBasicMaterial( {color: 0xfcd900} );
        const innerSphere = new THREE.Mesh( sphere2, material2 );
        
        this.attach( innerSphere );

        innerSphere.position.set( 0, 0, 0 );
        innerSphere.scale.set( 1, 1, 1 );

        const outline = new ShaderToonOutline( innerSphere );
        this.attach( outline );

        outline.position.set( 0, 0, 0 );
        outline.scale.set( 1, 1, 1 );
        
        // This is needed as the two outer layers are both semi-transparent and the renderer renders them in the wrong order
        middleSphere.renderOrder = 1;
        this.renderOrder = 2;

    }

    reset() {
        this.clear();

        this.attach( this.light );
        this.light.position.set( 0, 0, 0 );

        this.geometry = null;
        this.material = null;
    }

}