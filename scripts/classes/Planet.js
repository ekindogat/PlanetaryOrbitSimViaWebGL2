import * as THREE from '/node_modules/three/build/three.module.js';

import { ShaderPhongMaterial } from '../materials/ShaderPhongMaterial.js';
import { ShaderToonMaterial } from '../materials/ShaderToonMaterial.js';

import { ShaderToonOutline } from '../materials/ShaderToonMaterial.js';
import {GameObject} from "./GameObject.js";


import * as Three_Bvh_Csg from 'three-bvh-csg';



export class Planet extends GameObject {
	
	constructor(color, texture, texture2 = texture) {
		super();

		this.dayTexture = texture;
		this.nightTexture = texture2;
		
		this.color = color; // Probably won't need in delivery as it's only used in test shading
		
		this.sizeX = 1;
		this.sizeY = 1;
		this.sizeZ = 1;

		this.outlineThickness = 0.05;

		this.isPhong = false;
		this.isToon = false;

		this.switchToTest();    // Will start in Phong shading in delivery
	}
	
	// Shading only for test!!! Will be removed in delivery!!!
	switchToTest() {
		this.reset();
		
		const getAsteroidGeometry = (scaleX, scaleY, scaleZ) => {
			// According to the example we should be calling .updateMatrixWorld after some operations
			// Brushes are meshes too (class three_bvh_csg.Brush extends THREE.Mesh)
			const resultingBrush = new Three_Bvh_Csg.Brush(/* a_geometry */);
			resultingBrush.geometry = new THREE.SphereGeometry(1);
			resultingBrush.geometry.scale(scaleX, scaleY, scaleZ);
			// resultingBrush.updateMatrixWorld();
			
			const evaluator = new Three_Bvh_Csg.Evaluator();
			// { // Subtract a single crater
			// 	smallBigSphereBrush.geometry = new THREE.SphereGeometry();
			// 	smallBigSphereBrush.geometry.scale(0.5, 0.5, 0.5);
			// 	smallBigSphereBrush.geometry.translate(3, 3, 3);
			// 	// smallBigSphereBrush.updateMatrixWorld();
			// 	resultingBrush.geometry = evaluator.evaluate(resultingBrush, smallBigSphereBrush, Three_Bvh_Csg.SUBTRACTION).geometry;
			// }
			
			for (let i of [-1, 0, 1]) for (let j of [-1, 0, 1]) for (let k of [-1, 0, 1]) {
				// Subtract a single crater
				const smallBigSphereBrush = new Three_Bvh_Csg.Brush(/* a_geometry */);
				smallBigSphereBrush.geometry = new THREE.SphereGeometry();
				
				const getRand = () => 0.1*(0.1 + 2*(Math.random() + 0.5))
				smallBigSphereBrush.geometry.scale(getRand(), getRand(), getRand());
				const distFromCenter = (i**2 + j**2 + k**2)**(1/2);
				smallBigSphereBrush.geometry.translate(scaleX*i/distFromCenter, scaleY*j/distFromCenter, scaleZ*k/distFromCenter);
				// smallBigSphereBrush.updateMatrixWorld();
				resultingBrush.geometry = evaluator.evaluate(resultingBrush, smallBigSphereBrush, Three_Bvh_Csg.SUBTRACTION).geometry;
			}
			
			resultingBrush.geometry.scale(2, 2, 2);
			return resultingBrush.geometry;
		}
		
		
		this.geometry = getAsteroidGeometry(1, 1.1, 1.2);
		// this.geometry = new THREE.SphereGeometry();
		
		
		
		this.geometry.scale(this.sizeX, this.sizeY, this.sizeZ);
		this.material = new THREE.MeshPhongMaterial( {color: this.color} );
	}

	switchToPhong() {
		this.reset();

		this.isPhong = true;

		this.geometry = new THREE.SphereGeometry();
		this.geometry.scale(this.sizeX, this.sizeY, this.sizeZ);
		this.material = new ShaderPhongMaterial( {color: {value: this.color}, shininess: {value: 1.0}, dayTexture: {value: this.dayTexture}, nightTexture: {value: this.nightTexture}} );
	}

	switchToToon() {
		this.reset();

		this.isToon = true;

		this.geometry = new THREE.SphereGeometry();
		this.geometry.scale(this.sizeX, this.sizeY, this.sizeZ);
		this.material = new ShaderToonMaterial( {color: {value: this.color}, dayTexture: {value: this.dayTexture}, nightTexture: {value: this.nightTexture}} );

		const outline = new ShaderToonOutline( this, 0, this.outlineThickness );
		this.attach( outline );
		outline.position.set( 0, 0, 0 );
		outline.scale.set( 1, 1, 1 );
	}

	// For some reason it doesn't work when we call it scale
	scaling(x, y, z) {
		this.outlineThickness *= x / this.sizeX;

		this.sizeX = x;
		this.sizeY = y;
		this.sizeZ = z;

		this.geometry.scale(this.sizeX, this.sizeY, this.sizeZ);

		if (this.isToon) this.children.at(2).material.uniforms.thickness = this.outline;
	}

	reset() {
		this.clear();
		this.isPhong = false;
		this.isToon = false;
	}

}