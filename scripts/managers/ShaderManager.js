import * as THREE from "three";
import { GameObject } from "../classes/GameObject.js";

export class ShaderManager{

    scene;

    inPhongShading;
    inToonShading;
    backgroundColor;

    constructor( scene ) {
        this.scene = scene;

        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener( 'keydown', (event) => {
            switch (event.key) {
                case '1':
                    this.switchToPhong();
                    break;
                case '2':
                    this.switchToToon();
                    break;
            }
        } )
    }

    switchToPhong() {
        this.scene.traverse( (obj) => {
            if (obj instanceof GameObject) {
                obj.switchToPhong();
            }
        } );
        this.backgroundColor = new THREE.Color(0x000000);
        this.scene.background = this.backgroundColor;

        this.inPhongShading = true;
        this.inToonShading = false;
    }

    switchToToon() {
        this.scene.traverse( (obj) => {
            if (obj instanceof GameObject) {
                obj.switchToToon();
            }
        } );
        this.backgroundColor = new THREE.Color(0x000000);
        this.scene.background = this.backgroundColor;

        this.inPhongShading = false;
        this.inToonShading = true;
    }
}