import * as THREE from '/node_modules/three/build/three.module.js';

import { ShaderPhongMaterial } from '../materials/ShaderPhongMaterial.js';
import { ShaderToonMaterial } from '../materials/ShaderToonMaterial.js';
import {GameObject} from "./GameObject.js";


export class Asteroid extends GameObject {
	
	constructor (color) {
		super();
		
		this.defaultMaterial = new THREE.MeshPhongMaterial({color: color}); // This is only for testing while development, will be removed in final
		this.phongMaterial = new ShaderPhongMaterial( {color: {value: color}, shininess: {value: 1.0}} );
		this.toonMaterial = new ShaderToonMaterial( {color: {value: color}} );
		this.geometry = asteroGeometry;
		
		this.material = this.defaultMaterial;
	}
	
}