//import './../style/style.css'; # Done from the html page. I remember that css shouşdn't be imported from script anyway.
import * as THREE from './../node_modules/three/build/three.module.js';
// importing orbital controls for the camera
import {GLTFLoader} from './../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

// import {BloomPass, EffectComposer, OrbitControls, OutputPass, RenderPass, ShaderPass, TransformControls, UnrealBloomPass} from "three/addons";
// Suggested by GPT to separate like these:
import { BloomPass } from '/node_modules/three/examples/jsm/postprocessing/BloomPass.js';
import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { OutputPass } from '/node_modules/three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { TransformControls } from '/node_modules/three/examples/jsm/controls/TransformControls.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';


import Stats from './../node_modules/three/examples/jsm/libs/stats.module.js';

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