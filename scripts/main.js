//import './../style/style.css'; # Done from the html page. I remember that css shouşdn't be imported from script anyway.
import * as THREE from 'three';
// importing orbital controls for the camera
import {GLTFLoader} from 'three-GLTFLoader-module';


// import {BloomPass, EffectComposer, OrbitControls, OutputPass, RenderPass, ShaderPass, TransformControls, UnrealBloomPass} from "three/addons";
import {BloomPass} from "three/addons/postprocessing/BloomPass.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {ShaderPass} from "three/addons/postprocessing/ShaderPass.js";
import {TransformControls} from "three/addons/controls/TransformControls.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";

import Stats from 'three-stats-module';

import { setupGUI } from './gui.js';

import { Star } from './classes/Star.js';
import { Planet } from './classes/Planet.js';
import { selectiveFragment, selectiveVertex } from './post_processing/selective_bloom.js';
import { ShaderToonOutline } from './materials/ShaderToonMaterial.js';

import {GameManager} from "./managers/GameManager.js";

let inPhongShading, inToonShading;	// To know what shading the scene is in
let backgroundColor;



const main = () => {
	const theCanvas = document.getElementById("the_canvas");
	// Init GameManager
	const gm = new GameManager(theCanvas);
	// Init Game
	gm.init();
	// Start Simulation
	gm.update();
}

main();