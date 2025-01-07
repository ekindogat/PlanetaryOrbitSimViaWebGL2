//import './../style/style.css'; # Done from the html page. I remember that css shouldn't be imported from script anyway.
import * as THREE from './../node_modules/three/build/three.module.js';


const main = () => {
	// Let's also expose to global
	window.ThreeJS = THREE;
	
	const theCanvas = document.getElementById("the_canvas"); // Use our already-existent canvas
	const canvasWebGLRendererContext = theCanvas.getContext("webgl2");
	
	
	// Initialize Three.js
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	
	// Get the renderer on top of the WebGL context of the existing canvas element
	const renderer = new THREE.WebGLRenderer({context: canvasWebGLRendererContext});
	camera.position.set(4, 4, 8);
	camera.lookAt(0, 0, 0);
	
	
	// Do the appropriate work upon each resize
	window.updateResize = () => {
		
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
		
		theCanvas.width = window.innerWidth;
		theCanvas.height = window.innerHeight;
	};
	
	// Initially call too
	window.updateResize();
	window.addEventListener("resize", window.updateResize);
	
	
	// Set the size of the canvas for best visual experience
	renderer.setSize(window.innerWidth, window.innerHeight);
	// If we just give the WebGL context instead of the canvas while constructing Three.JS renderer then we
	// should specify the background interestingly
	renderer.setClearColor(0x101016, 1);
	
	// Do not add as we're using an existing canvas and not creating a new one from the depths of Three.JS
	// Actually we're not even using the canvas, we're using its WebGL rendering context
	//	document.body.appendChild(renderer.domElement);
	
	// Mass ~ volume ~ height³, mass ~ density
	// However, that would require very and very big masses and distances and would not be quite good for visualization.
	// In many solar system modes, the sizes of the objects are much closer to each other than they actually are.
	const getMassProportianalPlanetGeometry = (massMultiplier) => {
		const sideLen = (massMultiplier**(1/3));
		return new THREE.SphereGeometry(sideLen * 0.2);
	}
	const defaultCubeGeometry = getMassProportianalPlanetGeometry(1);
	const material = new THREE.MeshStandardMaterial({color: 0x000055});
	
	
	/* 3D THREE mesh astronomical objects */
	window.objects = {
		"planet 1": new THREE.Mesh(defaultCubeGeometry, material),
		"satellite 1": new THREE.Mesh(defaultCubeGeometry, material),
		"star 1": new THREE.Mesh(defaultCubeGeometry, material)
	};
	window.positionInfo = {
		"planet 1": new THREE.Vector3(7, 2, 0).clone(),
		"satellite 1": new THREE.Vector3(7, 2.2, 0).clone(),
		"star 1": new THREE.Vector3(0, 0, 0).clone()
	};
	window.velocityInfo = {
		"planet 1": new THREE.Vector3(0, 2, -5).clone(),
		"satellite 1": new THREE.Vector3(0, 2, -3).clone(),
		"star 1": new THREE.Vector3(0, 0, 0).clone()
	};
	window.massInfo = {
		"planet 1": 1000,
		"satellite 1": 10,
		"star 1": 360000
	};
	const orbitCurves = {};
	
	
	// Re-adjust the geometries of the objects in accordance with the masses
	{
		for (const oName in window.objects)
			window.objects[oName].geometry = getMassProportianalPlanetGeometry(window.massInfo[oName] / 100000);
	}
	
	// Populate the scene with the orbit objects
	for (const key in window.objects) {
		const t = 0;
		const obj = window.objects[key];
		obj.position.set(2*Math.cos(t), 0, 2*Math.sin(t));
		scene.add(obj);
	}
	
	// Initially set the positions
	{
		// For each, get the mutable object from the 3D object, set its value with the value and store it back
		for (const key in window.objects) {
			const obj = window.objects[key];
			const posObj = obj.position;
			posObj.multiplyScalar(0);
			posObj.add(window.positionInfo[key]);
			window.positionInfo[key] = posObj;
		}
	}
	
	
	{ // Look from up
		// camera.position.set(0, 12, 0);
		// camera.lookAt(0, 0, 0);
	}
	{ // Point light
		const plight = new THREE.PointLight( 0xffffff, 100, 0 );
		plight.position.set(-3, 3, 3);
		scene.add(plight);
	} { // Ambient light
		const alight = new THREE.AmbientLight(0xffffff, 10);
		scene.add(alight);
	}
	
	
	
	
	let lastTime = null;
	
	/** The FPS that will be used to update the dynamic variables of the objects. Warning: This is not the animation
	 *  frame FPS as it will be determined by the browser's requestAnimationFrame function. The purpose of this
	 *  making this one explicit is to avoid device/software/environment caused low FPS values' effectively making
	 *  the internal calculations' infinitesmall derivetaion/integration related variables in time dimension (such as
	 *  dT) too big and causing miscalculation.
	 */
	const updateFPS = 60;
	
	let timeStamp = 0;
	let stepNum = 0;
	
	
	const getRand = () => {
		return 2*(Math.random() - 0.5) * 100000;
	}
	
	const copyMap = (vec3ByNames) => {
		const obj = {};
		for (const objectName in vec3ByNames)
			obj[objectName] = vec3ByNames[objectName].clone();
		return obj;
	}
	
	/** Calculates the new values and updates the values of the Three.JS mutable Vector3 objects without mutating the
	 *  map object parameters passed.
	 * 
	 *  @param {*} objects For the names of the astronomical objects
	 *  @param {*} masses Masses mapped by the names
	 *  @param {*} positions Mutabe ThreeJS vectors as positions of the objects, mapped by the names
	 *  @param {*} velocities Mutabe ThreeJS vectors to update the position vectors, mapped by the names
	 *  @param {*} advanceTheTimestamp Whether or not to advance the actual timestamp by dT (should be true for actually
	 *                                 moving the objects)
	 */
	const updatePositionParams = (dT, objects, masses, positions, velocities, advanceTheTimestamp) => {
		const Gconstant = 0.001;
		
		if (advanceTheTimestamp) {
			timeStamp += dT;
			stepNum++;
		}
		
		// Move each planet (or star)...
		for (const objectKey in objects) {
			const position = positions[objectKey];
			const velocity = velocities[objectKey];
			const mass = masses[objectKey]
			
			const force = new THREE.Vector3(0, 0, 0);
			
			
			// ...around each (other) star and other planet
			for (const supposedlyHeavyObjectKey in objects) {
				
				// Can't gravitate itself (well, actually the particles of them do and moreover even the subparticles
				// of each subatomic particle like a proton gravitate each other, at least according to ChatGPT)
				if (objects[objectKey] === objects[supposedlyHeavyObjectKey])
					continue;
				
				const positionHeavy = positions[supposedlyHeavyObjectKey];
				const velocityHeavy = velocities[supposedlyHeavyObjectKey];
				
				const distance = positionHeavy.clone().sub(position).length();
				const toSupposedlyHeavyObject = positionHeavy.clone().sub(position).normalize();
				
				const massHeavy = masses[supposedlyHeavyObjectKey];
				
				// Fᵢⱼ = G mᵢ mⱼ / d²
				// Add-up forces from every other object
				force.add(toSupposedlyHeavyObject.clone().multiplyScalar(Gconstant * mass * massHeavy / (distance**2)));
			}
			
			// F = ma
			const acceleration = force.clone().divideScalar(mass);
			
			// If the posiiton vector is a ThreeJS object's own position (not created separately or clone),
			// mutating it here will immediately result in changing the object's actual position!
			velocity.add(acceleration.clone().multiplyScalar(dT));
			position.add(velocity.clone().multiplyScalar(dT));
		}
	}
	
	
	const updateObjects = () => {
		const dT = 1/updateFPS;
		
		// Move the objects
		updatePositionParams(dT, window.objects, window.massInfo, window.positionInfo, window.velocityInfo, true);
		
		
		// Draw the orbit for the upcoming one full revolution!!!
		if ((stepNum - 1) % 60 == 0)
			// May use bigger dT with fewer steps here to avoid making too many calculations
			drawOrUpdateOrbits(dT, 30000, window.objects, window.massInfo, window.positionInfo, window.velocityInfo);
		
		
		{ // Rotate the planets
			for (const oName in window.objects) {
				if (oName.slice(1-1, 6) != "planet")
					continue;
				const obj = window.objects[oName];
				const t = timeStamp * 2;
				obj.rotation.y = t;
				obj.rotation.x = -1.3*t;
			}
		}
		{ // Rotate the stars
			for (const oName in window.objects) {
				if (oName.slice(1-1, 4) != "star")
					continue;
				const obj = window.objects[oName];
				const t = timeStamp;
				obj.rotation.y = t;
			}
		}
		
	}
	
	// TODO: Trigger this when we manually adjust the velocities (or masses or gravitating objects)
	const drawOrUpdateOrbits = (dT, maxSteps, objects, massInfo, positionInfo, velocityInfo) => {
		// If an object would end up diverging into space forever don't try to calculate when it would ever
		// come back
		
		
		const nearFarCountMax = 15; // 3 yields a single full orbit
		const enoughlyClose = 0.005; // End the orbit if it comes this close to the starting
		
		// Of course do not touch the objects while calculating the upNext orbit just to show off as curves.
		// Copy a snapshot of the system
		const currentPositionInfo = copyMap(positionInfo);
		const currentVelocityInfo = copyMap(velocityInfo);
		
		const orbitCurvePositions = {};
		
		
		const objectsWithCompleteOrbits = new Set();
		const objectsWithIncompleteOrbits = new Set();
		
		
		const initialPositionOfOrbitByObject = {};
		const lastDistanceByObject = {};
		const smallestDistanceByObject = {};
		const closerOrFartherLastByObject = {}; // true = closer, false = farther
		const closerOrFartherChangeCountByObject = {}
		
		// Update the copied system for at most maxSteps
		for (let i = 1; i <= maxSteps; i++) {
			updatePositionParams(dT, objects, massInfo, currentPositionInfo, currentVelocityInfo, false);
			
			// TODO: Break when all orbits are drawn sufficiently done!
			// if len(a) == len(b) then break
			
			
			// For each object, save the next point of its orbit
			for (const objectName in window.objects) {
				const position = currentPositionInfo[objectName];
				
				if (orbitCurvePositions[objectName] == null)
					orbitCurvePositions[objectName] = [];
				
				if (objectsWithCompleteOrbits.has(objectName))
					continue; // Do not add to its orbit anymore
				
				// For each point in the orbit of each object
				{
					if (initialPositionOfOrbitByObject[objectName] == null) {
						initialPositionOfOrbitByObject[objectName] = position.clone();
					}
					// We have our initial point
					else {
						const currentDistance = position.clone().sub(initialPositionOfOrbitByObject[objectName]).length();
						if (lastDistanceByObject[objectName] == null) {
							lastDistanceByObject[objectName] = currentDistance;
						}
						if (smallestDistanceByObject[objectName] == null || currentDistance < smallestDistanceByObject[objectName]) {
							smallestDistanceByObject[objectName] = currentDistance;
						}
						
						// We have the last distance (the distance of the prev. point in the orbit to the beginning)
						else {
							const closerOrFarther = currentDistance < lastDistanceByObject[objectName];
							// console.log(currentDistance < lastDistanceByObject[objectName])
							// console.log(currentDistance > lastDistanceByObject[objectName])
							// console.log(currentDistance)
							// console.log(lastDistanceByObject[objectName])
							
							if (closerOrFartherLastByObject[objectName] == null) {
								closerOrFartherLastByObject[objectName] = closerOrFarther;
							}
							
							// We have whether we went closer or further away last time
							else {
								if (closerOrFartherChangeCountByObject[objectName] == null) {
									closerOrFartherChangeCountByObject[objectName] = 1;
								}
								else {
									// We're going farther altough went closer last time OR vice versa
									if (closerOrFarther != closerOrFartherLastByObject[objectName])
										closerOrFartherChangeCountByObject[objectName]++;
								}
								
								closerOrFartherLastByObject[objectName] = closerOrFarther;
								
								// End if it comes too close to the initial point (except it is first time going
								// farther of course)
								// If an object will start moving after many loops (because another object will slide
								// very near it and distrupt), finishing the orbit curve with this will prevent it from
								// being displayed until it actually starts moving.
								{
									if (closerOrFartherChangeCountByObject[objectName] >= 2 && smallestDistanceByObject[objectName] < enoughlyClose)
										objectsWithCompleteOrbits.add(objectName);
								
								}
								// End if it has too many loops
								{
									if (closerOrFartherChangeCountByObject[objectName] == nearFarCountMax) {
										objectsWithCompleteOrbits.add(objectName);
									}
									if (closerOrFartherChangeCountByObject[objectName] > nearFarCountMax) {
										throw new Error();
									}
								}
								// If not end, the planet's orbit will be marked as incomplete (it will most likely fly off)
							}
							
							lastDistanceByObject[objectName] = currentDistance;
						}
					}
					
					
				}
				
				// If close enough to the first point (one complete orbit drawn) then maybe cut it off there
				orbitCurvePositions[objectName].push(position.clone());
			}
			
		}
		
		// Mark all the rest as incomplete so we can mark their orbits with red
		for (const objectName in window.objects) {
			if (!objectsWithCompleteOrbits.has(objectName)) {
				objectsWithIncompleteOrbits.add(objectName);
			}
		}
		
		
		
		for (const objectName in window.objects) {
			
			// Create the material
			let material = new THREE.LineBasicMaterial({color: 0xa0a0a0});
			if (objectsWithIncompleteOrbits.has(objectName))
				material = new THREE.LineBasicMaterial({color: 0xb05050});
			else
				material = new THREE.LineBasicMaterial({color: 0xa0a0a0});
			
			const mainPoints = orbitCurvePositions[objectName]
			const abstractCurve = new THREE.CatmullRomCurve3(mainPoints);
			
			// Sample many points along the curve
			const points = abstractCurve.getPoints(10 * mainPoints.length);
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			
			
			// Add the curvy line with that geometry
			if (orbitCurves[objectName] == null) {
				
				// Create a curved line from the geometry and material
				const curve3DObject = new THREE.Line(geometry, material);
				orbitCurves[objectName] = curve3DObject;
				
				// Add the curve to the scene
				scene.add(curve3DObject);
			}
			
			// Or update its geometry with a new one from the new list of points
			// Also update the material (sometimes we will color it up)
			else {
				const curve3DObject = orbitCurves[objectName];
				curve3DObject.geometry = geometry;
				curve3DObject.material = material;
			}
		}
	};
	
	
	
	// I noticed that if the time is too small then Chrome does not execute it that often (or at all) when the tab's
	// content is not visible than it is visible (kind of like that requestAnimationFrame does not call animation for
	// an invisible tab), but there is no such difference if it is large.
	window.setInterval(updateObjects, 1000 * 1/updateFPS);
	
	
	
	const animateStep = (timeStamp) => {
		renderer.render(scene, camera);
	}
	
	
	{
		const animate = (timeStamp) => {
			animateStep(timeStamp); // Call the actual animation frame
			requestAnimationFrame(animate); // Request to be called again
		}
		requestAnimationFrame(animate); // Request to be called again
	}
	// Alternatively the actual animation may also have manually defined FPS but that's not any good of an idea:
	// window.setInterval(animateStep, 1000 * 1/60);
}


main();
