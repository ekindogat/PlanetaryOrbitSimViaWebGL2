//import './../style/style.css'; # Done from the html page. I remember that css shouşdn't be imported from script anyway.
import * as THREE from './../node_modules/three/build/three.module.js';


const main = () => {
	const theCanvas = document.getElementById("the_canvas"); // Use our already-existent canvas
	
	// Initialize Three.js
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer({canvas: theCanvas});
	camera.position.set(4, 4, 8);
	camera.lookAt(0, 0, 0);
	
	// Set the size of the canvas for best visual experience
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	// Do not add as we're using an existing canvas and not creating a new one from the depths of Three.JS
//	document.body.appendChild(renderer.domElement);
	
	const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
	const material = new THREE.MeshStandardMaterial({color: 0x000055});
	
	const centerCube = new THREE.Mesh( cubeGeometry, material );
	centerCube.position.set(0, 0, 0);
	scene.add(centerCube);
	
	const orbitCube = new THREE.Mesh( cubeGeometry, material );
	
	
	let t = 0;
	orbitCube.position.set(2*Math.cos(t), 0, 2*Math.sin(t));
	scene.add(orbitCube);
	
	
	
	{ // Look from up
//		camera.position.set(0, 12, 0);
//		camera.lookAt(0, 0, 0);
	}
	{ // Point light
		const plight = new THREE.PointLight( 0xffffff, 100, 0 );
		plight.position.set(-3, 3, 3);
		scene.add(plight);
	} { // Ambient light
		const alight = new THREE.AmbientLight(0xffffff, 10);
		scene.add(alight);
	}
	
	const animateStep = (timestamp) => {
		
		{ // Move the orbit cube
			const t = timestamp / 1000 * 3;
			const a = 4, b = 5;
			const focusDistance = (b**2 - a**2)**0.5;
			let x = a * Math.cos(t);
			let y = 0;
			let z = b * Math.sin(t);
			z = z - focusDistance; // Move the orbit so that one of its focuses align into the center cube that is also at (0, 0, 0)
			{
				const th = -60 * (Math.PI / 180); // Tilt the orbit around (0, 0, 0) by some degrees
				// Too me like hours to fix it!!! The second param should not be calcullated based on the
				// modified version of the first version!!!!!!
				const xNew =  x * Math.cos(th) + z * Math.sin(th);
				const zNew = -x * Math.sin(th) + z * Math.cos(th);
				x = xNew;
				z = zNew;
			}
			{
				const th = -15 * (Math.PI / 180); // Tilt the orbit around (0, 0, 0) by some degrees
				const xNew =  x * Math.cos(th) + y * Math.sin(th);
				const yNew = -x * Math.sin(th) + y * Math.cos(th);
				x = xNew;
				y = yNew;
			}
			orbitCube.position.set(x, y, z);
		}
		{ // Rotate the orbit cube
			const t = timestamp / 1000 * 2;
			orbitCube.rotation.y = t;
			orbitCube.rotation.x = -1.3*t;
		}
		{ // Rotate the center cube
			const t = timestamp / 1000;
			centerCube.rotation.y = t;
		}
		
		renderer.render(scene, camera);
	}
	
	const animate = (timestamp) => {
		animateStep(timestamp); // Call the actual animation frame
		requestAnimationFrame(animate); // Request to be called again
	}
	
	requestAnimationFrame(animate); // Request to be called again
}


main();