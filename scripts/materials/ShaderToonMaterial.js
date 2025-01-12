import * as THREE from "./../../node_modules/three/build/three.module.js";

import { toonVertex } from "./shaders/toon_shading.js";
import { toonFragment } from "./shaders/toon_shading.js";

import { outlineVertex } from "./shaders/toon_shading_outline.js";
import { outlineFragment } from "./shaders/toon_shading_outline.js";

export class ShaderToonMaterial extends THREE.ShaderMaterial {

    constructor( parameters ) {
        super();

        this.vertexShader = toonVertex;
        this.fragmentShader = toonFragment;

        this.lights = true; // Pass the properties of three.js lights to our shaders

        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            parameters
        ]);
    }
}

// Black outline on the objects when in toon shading
export class ShaderToonOutline extends THREE.Mesh {
    constructor( mesh, strength = 0, thickness = 0.05) {
        super();

        this.geometry = mesh.geometry;
        this.material = new THREE.ShaderMaterial({
            vertexShader: outlineVertex,
            fragmentShader: outlineFragment,
            
            uniforms: {
                strength: {value: strength},
                thickness: {value: thickness}
            },

            side: THREE.BackSide
        });

    }

}