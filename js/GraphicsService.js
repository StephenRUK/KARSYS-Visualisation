function GraphicsService(canvasID) {
    var svc = this;
    
	var scene, camera, renderer, controls, objects = [];
    
    var CAM_DEFAULT_POS = new THREE.Vector3(0, 40, 100),
        CAM_NEAR_PLANE = 0.1,
        CAM_FAR_PLANE  = 500;
    
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
		scene.add(new THREE.AmbientLight(0x707070));
		
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
    
    function fixNearToCrossSection() {
        svc.updateCrossSection();
    }
    
    //
    // Cross-section
    //
    function setCrossSection(distance) {
        // Set oblique camera frustum
        // Algorithm & paper:   http://www.terathon.com/code/oblique.html
        // ThreeJS snippets:    https://github.com/mrdoob/three.js/blob/af21991fc7c4e1d35d6a93031707273d937af0f9/examples/js/WaterShader.js
        
        var crossSectionPlane = new THREE.Plane(new THREE.Vector3(0,0,-1), distance);
        crossSectionPlane.applyMatrix4(camera.matrixWorldInverse);
        
        var clipPlaneV = new THREE.Vector4(crossSectionPlane.normal.x, crossSectionPlane.normal.y, crossSectionPlane.normal.z, crossSectionPlane.constant);
        
        var q = new THREE.Vector4();
        var projectionMatrix = camera.projectionMatrix;

        q.x = ( Math.sign( clipPlaneV.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
        q.y = ( Math.sign( clipPlaneV.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
        q.z = - 1.0;
        q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

        // Calculate the scaled plane vector
        var c = new THREE.Vector4();
        //c = clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );
        c = clipPlaneV.multiplyScalar( 2.0 / clipPlaneV.dot( q ) );

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[ 2 ] = c.x;
        projectionMatrix.elements[ 6 ] = c.y;
        projectionMatrix.elements[ 10 ] = c.z + 1.0;
        projectionMatrix.elements[ 14 ] = c.w;
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
        
        // DEBUG
        object3d.traverse( function( node ) {
            if( node.material ) {
                node.material.side = THREE.DoubleSide;
            }
        });
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
    
    // Maths util (to be moved?)
    Math.sign = Math.sign || function(x) {
      x = +x; // convert to a number
      if (x === 0 || isNaN(x)) {
        return x;
      }
      return x > 0 ? 1 : -1;
    }
    
    
    /******************************************************
    * Public
    ******************************************************/
    
    //
    // Camera
    //
    
    this.resetCamPosition = function() {
        camera.position.set(CAM_DEFAULT_POS.x, CAM_DEFAULT_POS.y, CAM_DEFAULT_POS.z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    };

    this.moveCamera = function (x, y, z) {    
        camera.position.x = x;
        camera.position.y = y;
		camera.position.z = z;
    };
    
    this.cameraLookAt = function (x, y, z) {
        camera.lookAt(new THREE.Vector3(x, y, z));
    };

    //
    // Cross section
    //
    
    this.crossSection = {
        enabled: false,
        distance: 0
    };
    
    this.enableCrossSection = function (distance) {
        this.crossSection.enabled = true;
        this.crossSection.distance = distance;
        
        setCrossSection(distance);
    };
    
    this.disableCrossSection = function () {
        camera.updateProjectionMatrix();
    };
    
    this.updateCrossSection = function (distance) {
        setCrossSection(distance);
    }
    
    //
    // Controls
    //
    
    this.enableMovement = function (isEnabled) {
        controls.enabled = isEnabled;
    };
    
    // Transforms
    
    this.scaleObject = function (name, scale) {
        var obj = scene.getObjectByName(name);
        
        //console.info("GraphicsService.scaleObject: Old " + obj.scale);
        
        if (obj) {
            obj.scale.set(scale.x, scale.y, scale.z);
        }
        
        //console.info("GraphicsService.scaleObject: New " + obj.scale);
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
    
    this.getObjectHierarchy = function() {
        return objects.slice(0);    // Clone
    };
    
    this.getObjectByName = function(name) {
      return scene.getObjectByName(name).clone();
    };
    
	
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
	
    /******************************************************
    * Main
    ******************************************************/
    init(canvasID);
    animate();
	
}