import * as THREE from "./../../node_modules/three/build/three.module.js";

import { starVertex } from "./shaders/star_shaders.js";
import { starFragment } from "./shaders/star_shaders.js";

export class StarMaterial extends THREE.ShaderMaterial {

    constructor() {
        super();

        this.vertexShader = starVertex;
        this.fragmentShader = starFragment;

        const textureLoader = new THREE.TextureLoader();

        const cloudTexture = textureLoader.load( '/resources/textures/cloud.png' );
        const lavaTexture = textureLoader.load( '/resources/textures/lavatile.jpg' );

        lavaTexture.colorSpace = THREE.SRGBColorSpace;

        cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
        lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;


        this.uniforms = {

            'fogDensity': { value: 0.45 },
            'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
            'time': { value: 1.0 },
            'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
            'texture1': { value: cloudTexture },
            'texture2': { value: lavaTexture }

        };

        this.needsUpdate = true;
    }
}