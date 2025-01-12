import * as THREE from "three";
import {OrbitControls} from "/node_modules/three/examples/jsm/controls/OrbitControls.js";

export class CameraManager {
    constructor(renderer) {
        this.fov = 75;
        this.zFar = 1000;
        this.zNear = 0.1;
        this.aspect = window.innerWidth / window.innerHeight;

        this.renderer = renderer;
        this.camera = null;
        this.orbitControls = null;
    }

    init() {
        // Init Camera
        this.initCamera();

        // Init OrbitControls
        this.initOrbitControls();

    }

    setCamPosition(x,y,z){
        this.camera.position.set(x,y,z);
    }

    lookAt(x,y,z) {
        this.camera.lookAt(x,y,z);
    }
    updateCameraView(){
        this.camera.updateWorldMatrix();
    }
    resetCamera(){
        this.orbitControls.reset();
        this.camera.position.set(4, 4, 8);
        // this.camera.lookAt(0, 0, 0); // unnecessary
        this.camera.updateProjectionMatrix();
        // this.controls.update(); // need to update whenever OrbitControls or camera get updates
        this.updateCameraView();

    }
    initCamera(){
        this.camera = new THREE.PerspectiveCamera(this.fov,this.aspect,this.zNear, this.zFar);
        this.setCamPosition(4,4,8);
        this.lookAt(0,0,0);
    }
    initOrbitControls() {
        // Init OrbitControls
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        // Configure OrbitControls
        this.orbitControls.panSpeed = 2;
        this.orbitControls.rotateSpeed = 2;
        this.orbitControls.zoomSpeed = 2;
        this.orbitControls.maxDistance = 50;
        this.orbitControls.minDistance = 5;
    }
    addEventListeners(){
        // Reset Camera
        window.addEventListener("keydown", (event) =>{
            switch (event.key) {
                case ',':
                    this.resetCamera();
                    break;
            }
        });
    }
    disableOrbitControls(){
        this.orbitControls.enabled = false;
    }
    enableOrbitControls(){
        this.orbitControls.enabled = true;
    }
    resize(width,height){
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( width, height );
    }
}