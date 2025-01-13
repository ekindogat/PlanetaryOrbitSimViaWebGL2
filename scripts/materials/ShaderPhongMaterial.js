import * as THREE from "three";

import { phongVertex } from "./shaders/phong_shading.js";
import { phongFragment } from "./shaders/phong_shading.js";

export class ShaderPhongMaterial extends THREE.ShaderMaterial {

    constructor() {
        super();

        this.vertexShader = phongVertex;
        this.fragmentShader = phongFragment;

        this.lights = true; // Pass the properties of three.js lights to our shaders

        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            {
                'shininess': {value: 10.0},   // Low values: 10-50, high values: 100-200
                'texture1': null,
                'texture2': null,
                'isStar': {value: false},
                'time': {value: 0.0},
                'uvScale': {value: new THREE.Vector2( 1.0, 1.0 )}
            }
        ]);
    }
}