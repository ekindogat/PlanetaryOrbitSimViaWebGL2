import * as THREE from "three";
import gsap from 'gsap';

export class CreditsManager {

    letterMap;
    creatorNames;
    isCreditsMode = false;
    creditsPosition;
    constructor(scene,renderer,cameraManager) {
        this.scene = scene;
        this.renderer = renderer;
        this.cameraManager = cameraManager;
        this.camera = this.cameraManager.camera;

    }

    //
    init(){
        this.letterMap = this.createLetterMap();
        this.creators = new THREE.Group();
        this.creditsPosition = {x:-20, y:80, z:-50}
    }
    initCreators(){
        this.creatorNames = ["EKIN DOGA TASKIN",
            "ILTER DOGAC DONMEZ",
            "MELIH KOC",
            "MURAT EREN GUVEN"];
        const offsetY = 5; // Space between names in Y axis
        for (let i = 0; i < this.creatorNames.length; i++) {
            this.creators.add(this.createSentence(this.creatorNames[i], i * offsetY));
        }
    }



    addCreditsEventListeners(){
        window.addEventListener("keypress", (event) => {
            switch (event.key) {
                case 'j':
                    this.isCreditsMode = !this.isCreditsMode;
                    let targetOfOrbitControls = new THREE.Vector3(0,0,0);
                    if(this.isCreditsMode){
                        const lastPos = this.cameraManager.camera.position.clone();
                        console.log("Last camera position: ",lastPos);
                        targetOfOrbitControls = this.cameraManager.orbitControls.target;
                        this.cameraManager.updatePreviousCameraPosition(lastPos);
                        // disable orbit controls
                        this.cameraManager.disableOrbitControls();
                        if(this.creators){
                            this.removeCredits();
                        }
                        // init creators
                        this.initCreators();
                        // move camera
                        this.smoothCameraAnimation(this.creditsPosition, 2.0, targetOfOrbitControls);
                        // Draw - Add Creator Names on Scene
                        //this.addCreditsRelativeToPosition(this.camera, this.creditsPosition);
                    }
                    else {
                        this.cameraManager.disableOrbitControls();
                        const lastPos = this.cameraManager.getLastCameraPosition();

                        console.log("Returning to last position: ", lastPos);
                        const duration = 2.0;
                        // Animate camera to previous position
                        this.returnToInitialCameraPosition(lastPos, duration, targetOfOrbitControls);

                        // Remove credits from the scene
                        this.removeCredits();

                        /*
                        setTimeout(()=>{
                            this.cameraManager.enableOrbitControls();
                        }, duration * 1000);
                        */
                    }
                    break;
            }
        });
    }
    smoothCameraAnimation(target = { x: 0, y: 0, z: 0 }, duration = 2.0, target_oc) {
        // Disable OrbitControls
        // this.cameraManager.disableOrbitControls();

        this.creditsPosition = {x:-20, y:80, z:-50};
        this.cameraManager.enableOrbitControls();
        this.cameraManager.orbitControls.target = new THREE.Vector3(target.x,target.y, target.y);

        // Animate the camera's position
        gsap.to(this.camera.position, {
            x: target.x + 40,
            y: target.y,
            z: target.z + 50,
            duration: duration,
            onComplete: () => {
                // Re-enable OrbitControls after animation
                this.cameraManager.updateCameraManager();
                this.positionCreditsInFrontOfCamera();
                this.cameraManager.orbitControls.target = new THREE.Vector3(this.creditsPosition.x,this.creditsPosition.y,this.creditsPosition.z);
                this.cameraManager.enableOrbitControls();

            },
        });
    }

    positionCreditsInFrontOfCamera(distance = 50) {

        // Compute the target position in front of the camera
        const cameraPosition = this.camera.position.clone();
        const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion); // Camera forward direction
        this.creditsPosition = cameraPosition.add(forwardVector.multiplyScalar(distance));

        // Update the position and orientation of the credits
        this.creators.position.copy(this.creditsPosition);
        this.creators.quaternion.copy(this.camera.quaternion);

        this.scene.add(this.creators);
    }

    addCreditsRelativeToPosition(camera, offset = this.creditsPosition) {
        // console.log("-- addCreditsRelativeToPosition START --")
        this.initCreators();
        // Determine the position relative to the camera
        const cameraPosition = camera.position.clone();
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion); // Forward vector
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);   // Right vector
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);      // Up vector
        // console.log("Camera Position: ", cameraPosition);

        // Compute the target position relative to the camera
        const targetPosition = cameraPosition
            .add(forward.multiplyScalar(offset.z))
            .add(right.multiplyScalar(offset.x))
            .add(up.multiplyScalar(offset.y));

        // console.log("Target Position: ", targetPosition)

        // Set the position of the sentence group

        // console.log("this.creators: ",this.creators);


        this.creators.position.copy(targetPosition);

        // Align the sentence group to face the camera
        this.creators.quaternion.copy(camera.quaternion);

        // Add the sentence to the scene
        this.scene.add(this.creators);
        // console.log("-- addCreditsRelativeToPosition END --")

    }

    returnToInitialCameraPosition(target = {x:4, y:4, z:8}, duration = 2.0, target_oc){
        // this.cameraManager.disableOrbitControls();
        this.cameraManager.enableOrbitControls();
        this.cameraManager.orbitControls.target = target_oc;
        gsap.to(this.camera.position, {
            x : target.x,
            y : target.y,
            z : target.z,
            duration : duration,
            onComplete: () => {
                // this.cameraManager.updateCameraManager();
                this.cameraManager.orbitControls.update();
                //this.cameraManager.enableOrbitControls();
            }

        });
    }

    createLetter(letter){
        const vertices = this.letterMap[letter];
        if (!vertices || vertices.length === 0) return new THREE.Group();

        const group = new THREE.Group();
        for (let i = 0; i < vertices.length; i += 2) {
            const geometry = new THREE.BufferGeometry().setFromPoints([vertices[i], vertices[i + 1]]);
            const material = new THREE.LineBasicMaterial({ color: 0xffffff });
            const line = new THREE.Line(geometry, material);
            group.add(line);
        }
        return group;
    }
    createSentence(sentence, offsetY = 0) {
        const sentenceGroup = new THREE.Group();
        let offsetX = 0;

        for (let char of sentence.toUpperCase()) {
            const letterGroup = this.createLetter(char);
            letterGroup.position.x = offsetX;
            letterGroup.position.y = offsetY;
            sentenceGroup.add(letterGroup);
            offsetX += 3; // Adjust spacing between letters
        }

        return sentenceGroup;
    }

    createLetterMap() {
        // Line coordinates from i to i+1
        const unit = 1;

        return {
            E: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(1, 1, 0),
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0.5, 0, 0),
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
            ],
            K: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 1, 0),
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, -1, 0),
            ],
            I: [
                new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
            ],
            N: [
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(1, -1, 0), new THREE.Vector3(1, 1, 0),
            ],
            " ": [], // Space has no lines.
            D: [
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(0.5, 0.5, 0),
                new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(0.5, -0.5, 0),
                new THREE.Vector3(0.5, -0.5, 0), new THREE.Vector3(-1, -1, 0),
            ],
            O: [
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(0, -1, 0), new THREE.Vector3(-1, 0, 0),
            ],
            G: [
                new THREE.Vector3(1, 1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(1, -1, 0), new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0),
            ],
            A: [
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(-0.5, 0, 0), new THREE.Vector3(0.5, 0, 0),
            ],
            T: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(1, 1, 0),
                new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
            ],
            S: [
                new THREE.Vector3(1, 1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, 0, 0), new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(1, -1, 0), new THREE.Vector3(-1, -1, 0),
            ],
            L: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, -1, 0),
            ],
            R: [
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(0.5, 1, 0),
                new THREE.Vector3(0.5, 1, 0), new THREE.Vector3(0.5, 0, 0),
                new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(-1, 0, 0),
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0.5, -1, 0),
            ],
            C: [
                new THREE.Vector3(1, 1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, -1, 0),
            ],
            M: [
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(-1, 1, 0),
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 0),
                new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, -1, 0),
            ],
            Z: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(1, 1, 0),
                new THREE.Vector3(1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, -1, 0),
            ],
            U: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, -1, 0), new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(1, -1, 0), new THREE.Vector3(1, 1, 0),
            ],
            V: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 1, 0),
            ],
            H: [
                new THREE.Vector3(-1, 1, 0), new THREE.Vector3(-1, -1, 0),
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, -1, 0),
            ],
        };
    }

    removeCredits() {
        this.scene.remove(this.creators);
    }
}