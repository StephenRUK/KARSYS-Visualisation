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
    
    
    /******************************************************
    * Public
    ******************************************************/
    
    //
    // Camera
    //
    
    this.resetCamPosition = function() {
        camera.position.set(CAM_DEFAULT_POS.x, CAM_DEFAULT_POS.y, CAM_DEFAULT_POS.z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
        
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
        var clipBoxGeo = new THREE.BoxGeometry(100,100,10);
        clipBoxGeo.z = distance;
        var clipBoxObject = new THREE.Mesh(clipBoxGeo, new THREE.MeshLambertMaterial({color: 0xFF0000, alpha: 0.5}));
        var clipBoxBsp = new ThreeBSP( clipBoxGeo );

        var clippedModel = new THREE.Object3D();
        clippedModel.name = "_CLIPPED_MODEL";

        scene.children[2].traverse(
          function(c){
            if(c instanceof THREE.Mesh){ 
                var bsp = new ThreeBSP(c);
                var bsp_clip = bsp.subtract(clipBoxBsp).toMesh(c);
                bsp_clip.scale.set(c.scale.x, c.scale.y, c.scale.z);
                clippedModel.add(bsp_clip);
            }
          });

        scene.add(clipBoxObject);
        scene.add(clippedModel);
        objects[0].visible = false; // TODO
    };
    
    this.disableCrossSection = function () {
        scene.remove(scene.getObjectByName("_CLIPPED_MODEL"));
        objects[0].visible = true; // TODO
    };
    
    /*
    this.enableCrossSection = function (distance) {
        this.crossSection.enabled = true;
        if (distance) {
            this.crossSection.distance = distance;
        }
        
        //camera.position.y = 0;
        camera.lookAt( new THREE.Vector3(camera.position.x, camera.position.y, 0) );
        
        fixNearToCrossSection();
        renderer.domElement.addEventListener('mousewheel', fixNearToCrossSection);
        renderer.domElement.addEventListener('DOMMouseScroll', fixNearToCrossSection); // Firefox
        controls.noRotate = true;        
    };
    
    this.disableCrossSection = function () {
        this.crossSection.distance = 0;
        this.crossSection.enabled = false;
        
        renderer.domElement.removeEventListener('mousewheel', fixNearToCrossSection);
        renderer.domElement.removeEventListener('DOMMouseScroll', fixNearToCrossSection); // Firefox
        controls.noRotate = false;
        
        camera.near = CAM_NEAR_PLANE;
        camera.updateProjectionMatrix();
    };
    
    this.updateCrossSection = function () {
        if(!this.crossSection.enabled) return;
        
        camera.near = camera.position.z + svc.crossSection.distance;
        camera.updateProjectionMatrix();
    };
    */
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