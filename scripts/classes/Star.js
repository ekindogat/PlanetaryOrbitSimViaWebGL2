import * as THREE from 'three';

import { ShaderToonOutline } from '../materials/ShaderToonMaterial.js';
import { GameObject } from "./GameObject.js";
import { StarPhongMaterial } from '../materials/StarPhongMaterial.js';

// TODO: Will make the stars bigger
export class Star extends GameObject {
    
    constructor() {
        super();

        this.light = new THREE.PointLight( 0xffffff, 25 );
        this.light.decay = 3.0; // TODO: Will adjust based on how close the planets get to the star in the Kepler formula

        let textureLoader = new THREE.TextureLoader();
        this.lavaTexture = textureLoader.load( '/resources/textures/lava/lavatile.jpg' );
        this.cloudTexture = textureLoader.load( '/resources/textures/lava/cloud.png' );
        this.lavaTexture.colorSpace = THREE.SRGBColorSpace;
        this.cloudTexture.wrapS = this.cloudTexture.wrapT = THREE.RepeatWrapping;
        this.lavaTexture.wrapS = this.lavaTexture.wrapT = THREE.RepeatWrapping;

        this.mass = 360000; // TODO: We'll be able to change this in application
        this.velocity = new THREE.Vector3( 0, 0, 0 );   // TODO: We'll be able to change this in application 

        this.switchToPhong();
    }

    switchToPhong() {
        this.reset()

        this.geometry = new THREE.SphereGeometry();
        this.material = new StarPhongMaterial( this.lavaTexture, this.cloudTexture );
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