'use strict';

function GraphicsService(canvasID, $timeout) {
    var svc = this;
    
	var scene, camera, renderer, controls;
    
    var objects = new THREE.Object3D();     // Contains user-loaded objects. Used to separate camera, lights etc from user objects.
    
    var CAM_DEFAULT_POS = new THREE.Vector3(0, 40, 100),
        CAM_NEAR_PLANE = 0.1,
        CAM_FAR_PLANE  = 500;
    
    /******************************************************
    * Private
    ******************************************************/
    
    function render() {
        renderer.render(scene, camera);
    }
    
    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function init(canvasID) {
		scene = new THREE.Scene();
        
        objects.name = 'LoadedObjects';
        scene.add(objects);
        
        var canvas = document.getElementById(canvasID);
		renderer = new THREE.WebGLRenderer({canvas: canvas});
        var w = renderer.domElement.clientWidth, h =  renderer.domElement.clientHeight;
		renderer.setSize(w, h);
		renderer.setViewport(0, 0, w, h);
        renderer.setClearColor(0xdad1d0);
        
		// Camera
		camera = new THREE.PerspectiveCamera(75, renderer.domElement.width / renderer.domElement.height, CAM_NEAR_PLANE, CAM_FAR_PLANE);
        camera.position.set(CAM_DEFAULT_POS.x, CAM_DEFAULT_POS.y, CAM_DEFAULT_POS.z);
		
		// Orbit Controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.damping = 0.2;
        		
		// Lighting
		var light;
        // Key
        light = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        light.position.set(-7, 4.5, 3);
		scene.add(light);
        // Fill
        light = new THREE.DirectionalLight(0xFFFFFF, 0.4);
		light.position.set(5, 3.5, 4);
		scene.add(light);
        // Back
        light = new THREE.DirectionalLight(0xFFFFFF, 0.3);
        light.position.set(0, 8, -10);
		scene.add(light);

		// Listeners
		window.addEventListener('resize', onWindowResize, true);
	}

    //
    // Event handlers
    //
        
    function onWindowResize() {
        var w = renderer.domElement.clientWidth, h =  renderer.domElement.clientHeight;
        
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        
        renderer.setSize(w, h);
        renderer.setViewport(0, 0, w, h);
    }
    
    //
    // Private Utility functions
    //
    
    function displayModel(name, object3d, callback) {        
        object3d.name = name;
        objects.add(object3d);
        
        $timeout(function() {
            callback();
        }, 200);
        
        object3d.traverse(function (node) {
            node.name = node.name.replace('_', ' ').trim();
            
            if(node.material) {
                node.material.side = THREE.DoubleSide;
            }
        });
    }
    
    // Calculate world coordinates based on mouse position
    function calcMouseCoordinates(mouseEvent) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        var mouse = {x: 0, y: 0};

        mouse.x = ((mouseEvent.offsetX) / renderer.domElement.width) * 2 - 1;
        mouse.y = -((mouseEvent.offsetY) / renderer.domElement.height) * 2 + 1;

        return mouse;
    }

    // Return objects at mouse position
    function getMouseIntersections(camera, mouseEvent) {
        var mouse = calcMouseCoordinates(mouseEvent);
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        return raycaster.intersectObjects(objects.children, true);	// 2nd param: Recursive
    }
    
    /*
    * Calculates the visible size of an object in specified perspective camera.
    * Returns the width and height as a THREE.Vector2
    */
    function calcVisibleSize(camera, objectDistance) {
        var fovy = camera.fov * Math.PI / 180;
        var height = 2 * Math.tan(fovy / 2) * objectDistance;   // visible height
        var width = height * camera.aspect;                   // visible width
        
        return new THREE.Vector2(width, height);
    }
	
    /******************************************************
    * Main
    ******************************************************/
    init(canvasID);
    animate();

    
    /******************************************************
    * Public
    ******************************************************/
    
    /*
    * Add an object to the scene directly, outside of the user objects.
    * Examples: Lights, HUD elements
    */
    this.addNonuserObject = function(object) {
        scene.add(object);
    };
    
    this.getSceneContainer = function() {
        return objects;
    };
    
    this.getCamera = function() {
        return camera;
    };
    
    this.getControls = function() {
        return controls;
    };
    
    this.resetCamera = function() {
        camera.position.copy(CAM_DEFAULT_POS);
        controls.target.set(0, 0, 0);
        controls.update();
        
        // Obsolete after resetting cross-section?
        camera.near = CAM_NEAR_PLANE;
        camera.far = CAM_FAR_PLANE;
    };
    
    this.toggleMovementControls = function (state) {
        if (state!=undefined) {
            controls.enabled = state;
        } else {
            controls.enabled = !controls.enabled;
        }
    };
    
    this.getMouseWorldCoordinates = function(mouseEvent) {
        var intersections = getMouseIntersections(camera, mouseEvent);
        
        if (intersections.length > 0) {
            return intersections[0].point.clone();
        } else {
            return null;
        }
    };
    
    this.getObjectHierarchy = function() {
        return objects.children;
    };
    
	//
	// Model Loaders
	//
	
	this.loadObjMtl = function(name, objPath, mtlPath, successHandler) { // TODO: Add asyncCallback to show progress
		new THREE.OBJMTLLoader().load(objPath, mtlPath,
            function(obj) { // Load complete
                displayModel(name, obj, successHandler);
            },

            function ( xhr ) {  // In progress
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                console.error( 'Model file ' + objPath + ' could not be loaded' );
            }
        );
	};
	
	this.loadDae = function(name, daePath, successHandler) { // TODO: Add asyncCallback to show progress
		new THREE.ColladaLoader().load(daePath,
            function(collada) { // Load complete
                displayModel(name, collada.scene, successHandler);
            },

            function ( xhr ) {  // In progress
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                console.error( 'Model file ' + daePath + ' could not be loaded' );
            }
	    );
	};

}