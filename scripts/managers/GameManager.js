//import './../style/style.css'; # Done from the html page. I remember that css shouldn't be imported from script anyway.
import * as THREE from 'three';

// importing orbital controls for the camera
import {GLTFLoader} from 'three-GLTFLoader-module';

// import {
//     BloomPass,
//     EffectComposer,
//     OrbitControls,
//     OutputPass,
//     RenderPass,
//     ShaderPass,
//     TransformControls,
//     UnrealBloomPass
// } from "three/addons";
import {BloomPass} from "three/addons/postprocessing/BloomPass.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {ShaderPass} from "three/addons/postprocessing/ShaderPass.js";
import {TransformControls} from "three/addons/controls/TransformControls.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";

import Stats from 'three-stats-module';

import {setupGUI} from './../gui.js';

import {Star} from './../classes/Star.js';
import {Planet} from './../classes/Planet.js';
import {selectiveFragment, selectiveVertex} from './../post_processing/selective_bloom.js';
import {ShaderToonOutline} from './../materials/ShaderToonMaterial.js';
import {CameraManager} from "./CameraManager.js";
import { ShaderManager } from './ShaderManager.js';
import { PhysicsManager } from './PhysicsManager.js';
import {DebugManager} from "./DebugManager.js";
import {CreditsManager} from "./CreditsManager.js";

export class GameManager {
    // fields
    canvas;
    scene;
    camManager;
    debugManager;
    creditsManager;
    renderer;
    transformControls;
    stats;
    objects;
    mainMenu;
    wrapper;
    musicButton;
    helpMenu;
    raycaster;
    mouse;

    previousSelectedObject;
    selectedObject;

    centerObject
    orbitObject;

    isDragging;
    isClickBlocked;

    objectDataMap;
    userRotation;
    userPosition;

    // shading and postprocessing
    inPhongShading;
    inToonShading;
    bloomComposer;
    finalComposer;
    renderScene;
    bloomPass;
    mixPass;
    outputPass;
    BLOOM_SCENE;
    bloomLayer;
    darkMaterial;
    materials;

    // texture loader
    textureLoader;
    earthDayTexture;
    earthNightTexture;
    mercuryTexture;
    saturnTexture;
    jupiterTexture;
    marsTexture;
    uranusTexture;
    venusTexture;
    neptuneTexture;
    ceresTexture;
    makemakeTexture;
    erisTexture;
    haumeaTexture;
    starSprite;

    // light
    alight;
    spotlight;
    spotlightIntensity;

    // Background
    background_stars;
    background_bloom;
    starsMaterial;
    starsGeometry;
    spaceBackground;
    bloomStarsGeometry;
    spaceBackgroundBloom;

    inEditMode;
    inSimulationMode;
    inPlacementMode;

    grid;

    wireframePlanet;

    shaderManager;
    physicsManager;

    // Audio
    listener;
    audioLoader;
    backgroundSound;
    audioStarted;

    textures;


    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camManager = null;
        this.debugManager = null;
        this.creditsManager = null;
        this.renderer = null;
        this.transformControls = null;
        this.stats = null;
        this.objects = {}; // Object registry
        this.mainMenu = null;
        this.wrapper = null;
        this.helpMenu = null;
        this.musicButton = document.getElementById('musicButton');
        this.raycaster = null;
        this.mouse = null;
        this.selectedObject = null;
        this.previousSelectedObject = null;
        this.isDragging = false; // Sürükleme durumu
        this.isClickBlocked = false; // Tıklama engellemeyi kontrol eden durum

        this.objectDataMap = new Map(); // Her obje için konum ve dönüş verilerini tutar.
        this.userRotation = {x: 0, y: 0};
        this.userPosition = {x: 0, y: 0, z: 0};

        this.audioStarted = null;
        //this.inPhongShading = true;   // Comment this out for now because our scene starts in three's own shading system, will uncomment later
    }

    // Will initialize the Scene / Game
    init() {
        // Initialize the scene manager
        this.scene = new THREE.Scene();
        this.initRenderer();

        // Initialize CameraManager for Camera and OrbitControl
        this.initCameraManager();

        // Initialize TransformControls
        this.initTransformControls();

        // Init mouse pos
        this.initMouse();

        // Init RayCaster
        this.initRayCaster();

        // Init TextureLoader
        this.initTextureLoader();

        // Init PostProcessing
        this.initPostProcessing();

        // Add performance stats
        this.initStats();

        // Initialize the main menu
        this.initMainMenu();

        this.initWrapper();

        // Initialize the help menu
        this.initHelpMenu();

        // Init Scene
        this.initScene();

        // Initialize DebugManager
        this.initDebugManager();

        // Initialize CreditsManager
        this.initCreditsManager();
        // Add EventListeners
        this.addEventListeners();

        this.initGrid();

        this.initMode();

        this.initWireframePlanet();

        this.initShaderManager();

        this.initPhysicsManager();
    }

    // Initialize the Game Loop
    update() {

        const updateLoop = (timestamp) => {
            this.gameLoop(timestamp); // Call the actual animation frame
            this.stats.update(); // Needs to be updated in order to show the FPS count
            requestAnimationFrame(updateLoop); // Request to be called again
        }
        requestAnimationFrame(updateLoop);
        window.onresize = this.resize;
    }

    gameLoop(timestamp) {
        if (this.inSimulationMode) {
            this.physicsManager.updateObjects();
        }

        /*
        { // Rotate the center cube
            const centerData = this.objectDataMap.get(this.centerObject) || {
                userPosition: {x: 0, y: 0, z: 0},
                userRotation: {x: 0, y: 0}
            };
            const t = timestamp / (1000 * 3);

            // Pozisyon ve rotasyonu uygula
            this.centerObject.rotation.y = t + centerData.userRotation.y;
            this.centerObject.rotation.x = centerData.userRotation.x;
        }
        */
        
        // Reset camera
        //this.camManager.camera.updateProjectionMatrix();
        //this.camManager.orbitControls.update();

        // Move spotlight to camera's position and point it to the camera's target
        this.spotlight.position.copy( this.camManager.camera.position );
        this.spotlight.target.position.copy( this.camManager.orbitControls.target );

        //userPosition = { x: 0, y: 0, z: 0 };
        if (this.inPhongShading) this.centerObject.material.uniforms.time.value += 0.005;	// Toon shading doesn't have a time uniform
        if (this.inToonShading) this.centerObject.material.opacity = 0.5 + (Math.sin(timestamp / 500) / 7);	// So the bloom effect in toon shading oscillates

        this.scene.remove(this.transformControls.getHelper());	// Remove before the bloom pass so it doesn't get included
        //this.scene.traverse(this.nonBloomed);	// Darken the objects which are not bloomed
        this.scene.traverse((child) => {
            // Arrow function ensures `this` refers to the class instance
            this.nonBloomed(child);
        });
        this.renderer.setClearColor(0x000000);	// Set the background to black before bloom

        this.bloomComposer.render();

        this.mixPass.material.uniforms.bloomTexture.value = this.bloomComposer.readBuffer.texture;	// Pass the output of first pass to the final pass

        //this.scene.traverse(this.restoreMaterial);	// Restore the darkened objects
        this.scene.traverse((child) => {
            // Arrow function ensures `this` refers to the class instance
            this.restoreMaterial(child);
            // to update world-matrix
            child.updateWorldMatrix();
        });
        this.scene.add(this.transformControls.getHelper());	// Restore transformControls
        this.renderer.setClearColor(this.shaderManager.backgroundColor);	// Restore background

        // Update Camera
        this.camManager.updateCameraManager();

        this.finalComposer.render();

    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        // Set the size of the canvas for best visual experience
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    initCameraManager() {
        if (this.renderer == null) this.initRenderer();
        this.camManager = new CameraManager(this.renderer);
        this.camManager.init();
    }


    initTransformControls() {
        this.transformControls = new TransformControls(this.camManager.camera, this.renderer.domElement);
    }

    initRayCaster() {
        // TRYING RAYCASTER
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 0.1;
        this.raycaster.far = 1000;
        this.raycaster.layers.set(2);   // Raycasting layer

    }

    initMouse() {
        this.mouse = new THREE.Vector2();
    }

    initStats() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    initMainMenu() {
        this.mainMenu = document.getElementById("mainMenu");
    }

    initWrapper() {
        this.wrapper = document.getElementById("wrapper");
    }

    initHelpMenu() {
        this.helpMenu = document.getElementById("helpMenu");
    }

    addEventListeners() {
        this.addMainMenuEventListeners();

        // HelpMenu Event Listener
        this.addHelpMenuEventListeners();

        this.addMusicButtonEventListeners();

        // OrbitControls Event Listener
        this.camManager.addEventListeners();

        // DebugManager Event Listener
        this.debugManager.addDebugEventListeners();

        // CreditsManager Event Listener
        this.creditsManager.addCreditsEventListeners();

        // TransformControls Event Listener
        this.addTransformControlEventListeners();

        // Raycasting Event Listener
        this.addRayCastingEventListeners();

        //this.addTestShadersEventListeners();

        this.addSwitchModeEventListeners();

        this.addPlacementEventListeners();
        this.addSpotlightEventListeners();

    }

    addMusicButtonEventListeners() {
        document.getElementById('musicButton').addEventListener('click', () => {
            if (!(this.audioStarted)){
                this.initAudio();
                this.audioStarted = true;
                this.musicButton.textContent = '🔊';
            } else {
                this.backgroundSound.stop();
                this.audioStarted = false;
                this.musicButton.textContent = '🔈';
            }
        });
    }

    addTransformControlEventListeners() {
        this.transformControls.addEventListener('dragging-changed', (event) => {
            console.log("in dragging-changed");
            this.isDragging = event.value; // Sürükleme başlatıldığında isDragging true olacak
            if (!this.isDragging) {
                // Sürükleme tamamlandığında tıklamayı tekrar engellemeyi kaldır
                this.isClickBlocked = true;
                setTimeout(() => {
                    this.isClickBlocked = false; // Tıklama engellemeyi kaldır
                }, 1000); // Sürükleme tamamlandıktan sonra bir süre tıklama engellenir
            }
        });

        this.transformControls.addEventListener('mouseDown', () => this.camManager.disableOrbitControls());
        this.transformControls.addEventListener('mouseUp', () => this.camManager.enableOrbitControls());
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case 'q':
                    this.transformControls.setMode('rotate');
                    break;
                case 'w':
                    this.transformControls.setMode('translate');
                    break;
                case 'e':
                    this.transformControls.setMode('scale');
                    break;
                default:
                    console.log(event.key + " is pressed!")
                    break;

            }
        });
    }

    addMainMenuEventListeners() {
        const button = document.getElementById('myButton');  // Butonun seçilmesi
        const backTo = document.getElementById('backTo');
        const playButton = document.getElementById('newButton');
        button.addEventListener('click', () => {
            this.mainMenu.style.display = 'none';  // Menü gizlendi
            this.wrapper.style.display = 'block';
            backTo.style.display = 'block';
        });

        playButton.addEventListener('click', () => {
            this.mainMenu.style.display = 'none';  // Menü gizlendi
        });


        backTo.addEventListener('click', () => {
            this.wrapper.style.display = 'none';
            backTo.style.display = 'none';
            this.mainMenu.style.display = 'block';
        })


    }

    addHelpMenuEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'h') {
                // Toggle help menu visibility
                if (this.helpMenu.style.display === 'none') {
                    this.helpMenu.style.display = 'block';
                } else {
                    this.helpMenu.style.display = 'none';
                }
            }
        });
    }



    addRayCastingEventListeners() {
        window.addEventListener('pointermove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        window.addEventListener('click', () => {


            console.log(this.isClickBlocked.valueOf());
            // ensure camera view - world view matrices are synch before raycasting
            this.camManager.updateCameraView();


            if (this.isDragging) {
                this.isClickBlocked = true;
                return; // Sürükleme işlemi devam ediyorsa tıklama işlemi yapma
            }
            if (this.isClickBlocked) {
                return;
            }


            if (event.target.closest('.lil-gui')) {
                return; // GUI'ye tıklanırsa işlem yapma
            }

            this.raycaster.setFromCamera(this.mouse, this.camManager.camera);
            
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);
            if (intersects.length > 0) {
                this.selectedObject = intersects[0].object; // Yeni objeyi seç


                if (!(this.selectedObject instanceof Star || this.selectedObject instanceof Planet)) {
                    this.selectedObject = null; // Hiçbir şey seçilmediyse

                    this.transformControls.detach();
                    this.scene.remove(this.transformControls.getHelper());
                    //return;
                } else if (this.selectedObject !== this.previousSelectedObject) {
                    this.transformControls.detach();
                    this.scene.remove(this.transformControls.getHelper());
                    console.log("Object changed. Previous:", this.previousSelectedObject, "New:", this.selectedObject);

                    this.transformControls.attach(this.selectedObject);
                    this.scene.add(this.transformControls.getHelper());

                    // Mevcut obje için veri varsa yükle, yoksa varsayılan oluştur
                    const data = this.objectDataMap.get(this.selectedObject) || {
                        userPosition: {x: 0, y: 0, z: 0},
                        userRotation: {x: 0, y: 0}
                    };
                    this.userPosition = data.userPosition;
                    this.userRotation = data.userRotation;

                    setupGUI(this.selectedObject);
                }

                this.previousSelectedObject = this.selectedObject; // Şu anki objeyi önceki objeye aktar

                // Debug
                if(this.debugManager.isDebugMode) this.debugManager.debugRaycaster();

                console.log("Selected Object:", this.selectedObject);

            } else {
                console.log("Selected : Null");
                this.selectedObject = null; // Hiçbir şey seçilmediyse
                this.previousSelectedObject = null;
                this.transformControls.detach();
                this.scene.remove(this.transformControls.getHelper());

                //updateAxisHelper(null);
                setupGUI(this.selectedObject);
            }
        });

        window.addEventListener( 'mousemove', () => {
            this.raycaster.setFromCamera(this.mouse, this.camManager.camera);

            let intersectingPosition = new THREE.Vector3();
            const intersects = this.raycaster.ray.intersectPlane( new THREE.Plane( new THREE.Vector3( 0, 1, 0 ) ), intersectingPosition );

            if ( intersects && this.inPlacementMode ) {
                this.wireframePlanet.position.copy( intersectingPosition );
            }
        } )
    }

    initPostProcessing() {
        // POST PROCESSING
        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;	// The output of this pass isn't displayed, it's sent to the next pass

        this.renderScene = new RenderPass(this.scene, this.camManager.camera);	// The contents of our scene before post processing
        this.bloomComposer.addPass(this.renderScene);

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.75, 0.1, 0.0);
        this.bloomComposer.addPass(this.bloomPass);

        this.finalComposer = new EffectComposer(this.renderer);

        this.finalComposer.addPass(this.renderScene);

        // Adds objects with bloom to the rest of the scene
        this.mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: {value: null},
                    bloomTexture: {value: null}
                },
                vertexShader: selectiveVertex,
                fragmentShader: selectiveFragment,
                defines: {}
            }), 'baseTexture'
        );
        this.mixPass.needsSwap = true;
        this.finalComposer.addPass(this.mixPass);

        this.outputPass = new OutputPass();	// For color space conversion and tone mapping
        this.finalComposer.addPass(this.outputPass);

        // The layer which will contain the objects that we'll apply the bloom effect
        this.BLOOM_SCENE = 1;
        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(this.BLOOM_SCENE);

        this.darkMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        this.materials = {};

        // POST PROCESSING END

        this.resize();
    }

    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camManager.resize(width, height);

        this.bloomComposer.setSize(width, height);
        this.finalComposer.setSize(width, height);
    }

    /*
    addTestShadersEventListeners() {
        const self = this; // Need to differ instance referencing between this => document and this => class object
        // To see the difference between shaders (only for testing)
        document.addEventListener('keydown', function (event) {
            switch (event.key) {
                case "1":
                    self.inPhongShading = false;
                    self.inToonShading = false;

                    self.backgroundColor = 0x000000;

                    self.centerObject.switchToPhong();
                    self.orbitObject.switchToTest();
                    break;
                case "2":
                    if (self.inPhongShading) break; // Without this the game slows down when we hold the key
                    self.inPhongShading = true;
                    self.inToonShading = false;

                    self.backgroundColor = 0x000000;

                    self.centerObject.switchToPhong();
                    self.orbitObject.switchToPhong();
                    break;
                case "3":
                    if (self.inToonShading) break;  // Without this the game slows down when we hold the key
                    self.inPhongShading = false;
                    self.inToonShading = true;

                    //backgroundColor = 0x06000e;
                    self.backgroundColor = 0x010005;

                    self.centerObject.switchToToon();
                    self.orbitObject.switchToToon();
                    break;
            }
        });
    }
    */

    initTextureLoader() {
        this.textureLoader = new THREE.TextureLoader();
        this.earthDayTexture = this.textureLoader.load("/resources/textures/earth/2k_earth_daymap.jpg");
        this.earthNightTexture = this.textureLoader.load("/resources/textures/earth/2k_earth_nightmap.jpg");
        this.mercuryTexture = this.textureLoader.load("/resources/textures/mercury/2k_mercury.jpg");
        this.venusTexture = this.textureLoader.load("/resources/textures/venus/2k_venus_surface.jpg");
        this.marsTexture = this.textureLoader.load("/resources/textures/mars/2k_mars.jpg");
        this.jupiterTexture = this.textureLoader.load("/resources/textures/jupiter/2k_jupiter.jpg");
        this.saturnTexture = this.textureLoader.load("/resources/textures/saturn/2k_saturn.jpg");
        this.uranusTexture = this.textureLoader.load("/resources/textures/uranus/2k_uranus.jpg");
        this.neptuneTexture = this.textureLoader.load("/resources/textures/neptune/2k_neptune.jpg");
        this.ceresTexture = this.textureLoader.load("/resources/textures/ceres/2k_ceres_fictional.jpg");
        this.makemakeTexture = this.textureLoader.load("/resources/textures/makemake/2k_makemake_fictional.jpg");
        this.erisTexture = this.textureLoader.load("/resources/textures/eris/2k_eris_fictional.jpg");
        this.haumeaTexture = this.textureLoader.load("/resources/textures/haumea/2k_haumea_fictional.jpg");
        this.starSprite = this.textureLoader.load('/resources/textures/star_sprite/star.png');

        this.textures = [];
        this.textures.push(this.earthDayTexture, this.earthNightTexture, this.mercuryTexture,this.venusTexture,
            this.marsTexture, this.jupiterTexture, this.saturnTexture, this.uranusTexture, this.neptuneTexture,
            this.ceresTexture, this.haumeaTexture, this.erisTexture ,this.makemakeTexture);

        //this.starSprite.colorSpace = THREE.SRGBColorSpace;    // I don't think we have to define its color space, because it's completely white
    }

    initScene() {
        // Init star
        this.centerObject = new Star();
        this.centerObject.position.set(0, 0, 0);
        this.centerObject.layers.toggle(this.BLOOM_SCENE);	// To add our star to the bloom layer
        this.scene.add(this.centerObject);
        // Init planets
        this.orbitObject = new Planet(new THREE.Color(0x0077cc), this.earthDayTexture, this.earthNightTexture);	// If there are separate day/night textures
        let t = 0;
        //this.orbitObject.position.set(2 * Math.cos(t), 0, 2 * Math.sin(t));
        this.orbitObject.position.set( 10, 0, 10 );
        this.scene.add(this.orbitObject);

        // Add Light
        this.addLights();

        // Add Background Objects
        this.addBackgroundObjects();

    }

    addStarToScene() {
        /** TODO
         * Generate new star with given positions and textures
         * Add the Star to the scene
         */
    }

    addPlanetToScene( position ) {
        // TODO: Give random textures each time
        let planet;
        let texture = this.textures[Math.floor(Math.random() * this.textures.length)];
        console.log(texture);
        if (texture === (this.earthNightTexture || this.earthDayTexture)){
            planet = new Planet(new THREE.Color(0xffffff), this.earthDayTexture, this.earthNightTexture);
        } else {
            planet = new Planet(0xffffff, texture);
        }

        planet.position.copy( position );

        if (this.shaderManager.inPhongShading) planet.switchToPhong();
        if (this.shaderManager.inToonShading) planet.switchToToon();

        this.scene.add( planet );
    }

    addLights() {
        this.alight = new THREE.AmbientLight(0x777777, 0.25);
        this.scene.add(this.alight);

        this.spotlight = new THREE.SpotLight( 0xffffff, 0 );
        this.spotlight.angle = Math.PI / 18;

        this.spotlightIntensity = 10;

        // We will start with the spotlight off
        this.scene.add( this.spotlight );
        this.scene.add( this.spotlight.target );
    }


    addBackgroundObjects() {
        // Star background
        this.background_stars = [];
        for (let i = 0; i < 3000; i++) {
            let x = THREE.MathUtils.randFloatSpread(1000);
            let y = THREE.MathUtils.randFloatSpread(1000);
            let z = THREE.MathUtils.randFloatSpread(1000);
            // Nearby stars are not created
            if (x * x + y * y + z * z > 60000) {
                this.background_stars.push(x, y, z);
            }
        }

        this.background_bloom = [];
        for (let i = 0; i < 500; i++) {
            let x = THREE.MathUtils.randFloatSpread(1000);
            let y = THREE.MathUtils.randFloatSpread(1000);
            let z = THREE.MathUtils.randFloatSpread(1000);
            if (x * x + y * y + z * z > 60000) {
                this.background_bloom.push(x, y, z);
            }
        }

        this.starsMaterial = new THREE.PointsMaterial({
            color: 0xffddff,
            map: this.starSprite,
            transparent: true,
            size: 1,
            sizeAttenuation: true
        });

        this.starsGeometry = new THREE.BufferGeometry();
        this.starsGeometry.setAttribute(
            "position", new THREE.Float32BufferAttribute(this.background_stars, 3)
        );

        this.spaceBackground = new THREE.Points(this.starsGeometry, this.starsMaterial);
        this.scene.add(this.spaceBackground);

        this.bloomStarsGeometry = new THREE.BufferGeometry();
        this.bloomStarsGeometry.setAttribute(
            "position", new THREE.Float32BufferAttribute(this.background_bloom, 3)
        );

        this.spaceBackgroundBloom = new THREE.Points(this.bloomStarsGeometry, this.starsMaterial);
        this.spaceBackgroundBloom.layers.toggle(this.BLOOM_SCENE);
        this.scene.add(this.spaceBackgroundBloom);


    }


    initAudio()  {
        this.listener = new THREE.AudioListener();
        this.camManager.camera.add(this.listener);

        this.audioLoader = new THREE.AudioLoader();

        this.backgroundSound = new THREE.Audio(this.listener);

        this.audioLoader.load('sounds/emotional-guitar-loop-v13-275455.ogg', (buffer) => {
            this.backgroundSound.setBuffer(buffer);
            this.backgroundSound.setLoop(true);
            this.backgroundSound.setVolume(0.5);
            this.backgroundSound.play();
        });
    }

    // We will darken the objects which are "non-bloomed" before the first pass
    nonBloomed(obj) {
        if (this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = this.darkMaterial;
        }
    }

    // We restore the materials after the bloom pass
    restoreMaterial(obj) {
        if (this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }

    // TODO: Move everything below to their corresponding places before merging with test

    // Switch to edit mode
    editMode() {
        this.inEditMode = true;
        this.inSimulationMode = false;

        this.scene.add( this.grid );

        this.trailsOff();
    }

    // Switch to simulation mode
    simulationMode() {
        this.inEditMode = false;
        this.inSimulationMode = true;

        // Remove transformControls from the scene if it exists
        this.transformControls.detach();
        this.scene.remove(this.transformControls.getHelper());

        this.scene.remove( this.grid );

        this.trailsOn();
    }

    addSwitchModeEventListeners() {
        document.addEventListener( 'keydown', (event) => {
            switch (event.key) {
                case ' ':
                    if (this.inEditMode) {
                        this.simulationMode();
                    }
                    else {
                        this.editMode();
                    }
                    break;
                case 'p':
                    if (this.inEditMode) {
                        if (this.inPlacementMode) {
                            this.inPlacementMode = false;
                            this.scene.remove( this.wireframePlanet );
                        }
                        else {
                            this.inPlacementMode = true;
                            this.scene.add( this.wireframePlanet );
                        }
                    }
                    
            }
        } );
    }

    initGrid() {
        this.grid = new THREE.GridHelper( 100, 50, 0x888888, 0x444444 );
    }

    // Our scene will start in edit mode
    initMode() {
        this.editMode();
    }

    initWireframePlanet() {
        let wireframe = new THREE.WireframeGeometry( new THREE.SphereGeometry( 0.3, 10, 6 ) );

        this.wireframePlanet = new THREE.LineSegments( wireframe );
    }

    addPlacementEventListeners() {
        document.addEventListener( 'click', () => {
            if (this.inPlacementMode) {
                this.inPlacementMode = false;
                this.addPlanetToScene( this.wireframePlanet.position );
                this.scene.remove( this.wireframePlanet );
            }
        } )
    }

    initShaderManager() {
        this.shaderManager = new ShaderManager( this.scene );
    }

    initPhysicsManager() {
        this.physicsManager = new PhysicsManager( this.scene );
    }
    
    initDebugManager() {
        this.debugManager = new DebugManager(this.renderer, this.scene);
        this.debugManager.initRaycaster(this.raycaster);
    }

    initCreditsManager() {
        this.creditsManager = new CreditsManager(this.scene,this.renderer, this.camManager);
        this.creditsManager.init();
    }
    
    // Enable trails for all planets
    trailsOn() {
        this.scene.traverse( (obj) => {
            if (obj instanceof Planet) {
                this.scene.add( obj.trail );
            }
        } );
    }

    // Disable trails for all planets
    trailsOff() {
        this.scene.traverse( (obj) => {
            if (obj instanceof Planet) {
                this.scene.remove( obj.trail );
            }
        } );
    }
    addSpotlightEventListeners() {
        document.addEventListener( 'keydown', (event) => {
            switch (event.key) {
                case 's':
                    if (this.spotlight.intensity == 0) {
                        this.spotlight.intensity = this.spotlightIntensity;
                    }
                    else {
                        this.spotlight.intensity = 0;
                    }
                    break;
            }
        } )
    }
}