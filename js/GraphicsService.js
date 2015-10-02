function GraphicsService(htmlContainerID) {
	var scene, camera, renderer, controls, objects = [];
    var mouseWorldCoords = { x: 0, y: 0, z: 0 };
    
    var statusBar, showStatusBar = true;
    var coordinateTransformer = null;   // Can be specified to transform displayed world coordinates
    
    init(htmlContainerID);
    animate();
    
    //
    // Setup functions
    //
    
    function init (containerID) {
		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer();
        
        var container = document.getElementById(containerID);
		container.appendChild(renderer.domElement);
		renderer.setSize(container.clientWidth, container.clientHeight);
		
		// Camera
		camera = new THREE.PerspectiveCamera(75, renderer.domElement.width/renderer.domElement.height, 0.1, 1000);
		camera.position.y = 40;
		camera.position.z = 100;
		
		// Orbit Controls
		controls = new THREE.OrbitControls( camera, renderer.domElement);
		controls.damping = 0.2;
		controls.addEventListener( 'change', render );
		
		// Lighting
		scene.add(new THREE.AmbientLight(0x404040));
		
		var light = new THREE.PointLight(0x606060);
		light.position.set(-100,200,100);
		scene.add(light);

		// Listeners
		window.addEventListener( 'resize', onWindowResize, true);
        renderer.domElement.addEventListener('mousemove', showWorldCoordinates);
        
        //renderer.domElement.addEventListener('click', onClick, false);
        
        statusBar = createStatusBar();
        container.appendChild(statusBar);

	}
    
    function createStatusBar () {
        statusBar = document.createElement('div');
        statusBar.style.position = 'absolute';
        statusBar.style.left = '20px';
        statusBar.style.top = '10px';
        statusBar.style.width = '200px';
        statusBar.style.textAlign = 'center';
        statusBar.style.backgroundColor = 'lightgray';
        statusBar.style.opacity = 0.6;
        statusBar.innerHTML = 'x: 0, y: 0, z: 0';
        statusBar.style.visibility = showStatusBar;
        
        return statusBar;
    }
    
    //
    // Render loop
    //
    function render() {
        renderer.render(scene, camera);
    }
    
    function animate() {
        requestAnimationFrame(animate);
        render();
    }
    
    //
    // Event handlers
    //
    
    //
    // TODO: Refactor and move status bar logic into the main controller
    //       Simply provide method to aget the world coordinates.
    //       Controller can then transform if wanted & use bindings to display the coordinates
    function showWorldCoordinates (event) {
        if (!showStatusBar) return;
        
        var COORDS_PRECISION = 2;
        
        var coords = {x: 0, y: 0, z: 0};
        var intersections = getMouseIntersections(camera, event);
        
        if (intersections.length > 0) {
            coords = intersections[0].point;
        
            // Pass to transform function if one's specified
            if (coordinateTransformer != null) {
                coords = coordinateTransformer(coords);
            }

            // Display
            statusBar.innerHTML = 'x: '+ coords.x.toFixed(COORDS_PRECISION) +', y: '+ coords.y.toFixed(COORDS_PRECISION) +', z: '+ coords.z.toFixed(COORDS_PRECISION);
        } else {
            statusBar.innerHTML = '(Move over an object)';
        }
    }
    
    function onWindowResize() {	
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    
    //
    // Private Utility functions
    //
    
    function displayModel(name, object3d, solo) {
        if (solo) {
            for (var i=0; i < objects.length; i++) {
                scene.remove(objects[i]);
            }
            objects.splice(0, objects.length);
        }
        
        object3d.name = name;
        scene.add(object3d);
        objects.push(object3d);
    }
    
    // Calculate world coordinates based on mouse position
    function calcMouseCoordinates(mouseEvent) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        var mouse = {x:0, y:0};

        mouse.x = ( (mouseEvent.offsetX) / renderer.domElement.width ) * 2 - 1;
        mouse.y = - ( (mouseEvent.offsetY) / renderer.domElement.height ) * 2 + 1;

        return mouse;
    }

    // Return objects at mouse position
    function getMouseIntersections(camera, mouseEvent) {
        var mouse = calcMouseCoordinates(mouseEvent);
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( mouse, camera );

        return raycaster.intersectObjects( scene.children, true );	// 2nd param: Recursive
    }
    
    
    /******************************************************
    *
    * Public
    *
    ******************************************************/
    
    
    //
    // Public utility functions
    //
    
    this.moveCamera = function (x, y, z) {
        camera.position.x = x;
        camera.position.y = y;
		camera.position.z = z;
    };
    
    this.enableMovement = function (isEnabled) {
        controls.enabled = isEnabled;
    };
    
    this.enableCoordinatesDisplay = function (isEnabled) {
        statusBar.style.visibility = isEnabled ? 'visible' : 'hidden';
        showStatusBar = isEnabled;
    };
    
    //
    // Read-only data functions
    //
    
    
	
	//
	// Model Loaders
	//
	
	this.loadObjMtl = function(name, objPath, mtlPath, displaySolo) { // TODO: Add asyncCallback to show progress
		new THREE.OBJMTLLoader().load(objPath, mtlPath,
            function(obj) { // Load complete
                displayModel(name, obj, displaySolo);
            },

            function ( xhr ) {  // In progress
                document.getElementById('progress').innerHTML = (xhr.loaded / xhr.total * 100) + '% loaded';
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                document.getElementById('progress').innerHTML = 'Model file ' + objFile + ' could not be loaded';
                console.error( 'Model file ' + objFile + ' could not be loaded' );
            }
        );
	};
	
	this.loadDae = function(name, daePath, displaySolo) { // TODO: Add asyncCallback to show progress
		new THREE.ColladaLoader().load(daePath,
            function(collada) { // Load complete
                displayModel(name, collada.scene, displaySolo);
            },

            function ( xhr ) {  // In progress
                document.getElementById('progress').innerHTML = (xhr.loaded / xhr.total * 100) + '% loaded';
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                document.getElementById('progress').innerHTML = 'Model file ' + objFile + ' could not be loaded';
                console.error( 'Model file ' + objFile + ' could not be loaded' );
            }
	    );
	};
	
	
}