function GraphicsService(canvasID) {
    var svc = this;
    
	var scene, camera, renderer, controls, objects = [];
    
    var CAM_DEFAULT_POS = new THREE.Vector3(0, 40, 100),
        CAM_NEAR_PLANE = 100,
        CAM_FAR_PLANE  = 2000;
    
    // Main
    init(canvasID);
    animate();
    
    //
    // Setup functions
    //
        
    function init(canvasID) {
		scene = new THREE.Scene();
        
        var canvas = document.getElementById(canvasID);
		renderer = new THREE.WebGLRenderer({canvas: canvas});
		renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
		
		// Camera
		camera = new THREE.PerspectiveCamera(75, renderer.domElement.width / renderer.domElement.height, CAM_NEAR_PLANE, CAM_FAR_PLANE);
        camera.position.set(CAM_DEFAULT_POS.x, CAM_DEFAULT_POS.y, CAM_DEFAULT_POS.z);
		
		// Orbit Controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.damping = 0.2;
		controls.addEventListener('change', render);
		
		// Lighting
		scene.add(new THREE.AmbientLight(0x404040));
		
		var light = new THREE.PointLight(0x606060);
		light.position.set(-100, 200, 100);
		scene.add(light);

		// Listeners
		window.addEventListener('resize', onWindowResize, true);
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
        
    function onWindowResize() {
        var w = renderer.domElement.clientWidth, h =  renderer.domElement.clientHeight;
        
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
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
        
        svc.onModelLoaded(name);    // Callback/Event
    }
    
    // Calculate world coordinates based on mouse position
    function calcMouseCoordinates(mouseEvent) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        var mouse = {x: 0, y: 0};

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
    * Public
    ******************************************************/
    
    //
    // Public utility functions
    //
    
    this.resetCamPosition = function() {
        camera.position.set(CAM_DEFAULT_POS.x, CAM_DEFAULT_POS.y, CAM_DEFAULT_POS.z);
        camera.lookAt(new THREE.Vector3(0,0,0));
    }
        
    this.moveCamera = function (x, y, z) {    
        camera.position.x = x;
        camera.position.y = y;
		camera.position.z = z;
    };
    
    this.enableMovement = function (isEnabled) {
        controls.enabled = isEnabled;
    };
    
    // TODO Bugfix: Scaling seems to be reset a moment later??
    this.scaleObject = function (name, scale) {
        var obj = scene.getObjectByName(name);
        
        console.info("GraphicsService.scaleObject: Old " + obj.scale);
        
        if (obj) {
            obj.scale.set(scale.x, scale.y, scale.z);
        }
        
        console.info("GraphicsService.scaleObject: New " + obj.scale);
    };
    
    this.translateObject = function (name, offset) {
        var obj = scene.getObjectByName(name);
        
        if (obj) {
            obj.translateX(offset.x);
            obj.translateY(offset.y);
            obj.translateZ(offset.z);
        }
    };
    
    //
    // Hooks, listeners
    //
    
    this.onModelLoaded = function (name){};     // Assigned function is called when model loading is completed
    
    //
    // Read-only data functions
    //
    
    this.getMouseWorldCoordinates = function(mouseEvent) {
        var intersections = getMouseIntersections(camera, mouseEvent);
        
        if (intersections.length > 0) {
            return intersections[0].point.clone();
        } else {
            return null;
        }
    };
    
    this.getCameraPosition = function() {
        return camera.position;
    }
    
	
	//
	// Model Loaders
	//
	
	this.loadObjMtl = function(name, objPath, mtlPath, displaySolo) { // TODO: Add asyncCallback to show progress
		new THREE.OBJMTLLoader().load(objPath, mtlPath,
            function(obj) { // Load complete
                displayModel(name, obj, displaySolo);
            },

            function ( xhr ) {  // In progress
                //document.getElementById('progress').innerHTML = (xhr.loaded / xhr.total * 100) + '% loaded';
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                //document.getElementById('progress').innerHTML = 'Model file ' + objFile + ' could not be loaded';
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
                //document.getElementById('progress').innerHTML = (xhr.loaded / xhr.total * 100) + '% loaded';
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                //document.getElementById('progress').innerHTML = 'Model file ' + objFile + ' could not be loaded';
                console.error( 'Model file ' + objFile + ' could not be loaded' );
            }
	    );
	};
	
	
}