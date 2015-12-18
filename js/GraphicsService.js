'use strict';

function GraphicsService(canvasID, $timeout) {
    var svc = this;
    
	var scene, camera, renderer, controls;
    
    var objects = new THREE.Object3D();     // Contains user-loaded objects. Used to separate camera, lights etc from user objects.
    var boundingBox = new THREE.Box3();
    
    var crossSectionPlaneObj;
    
    var CAM_DEFAULT_POS = new THREE.Vector3(0, 40, 100),
        CAM_NEAR_PLANE = 0.1,
        CAM_FAR_PLANE  = 500;
    
    
    /******************************************************
    * Public
    ******************************************************/
    
    //
    // Camera
    //
    
    this.resetScene = function () {
        for (var i=0; i < objects.children.length; i++) {
            objects.remove(objects.children[i]);
        }
        
        svc.disableCrossSection();
        
        controls.reset();
        camera.near = CAM_NEAR_PLANE;
        camera.far = CAM_FAR_PLANE;
    };

    this.moveCamera = function (x, y, z) {    
        camera.position.x = x;
        camera.position.y = y;
		camera.position.z = z;
    };
    
    this.cameraLookAt = function (x, y, z) {
        camera.lookAt(new THREE.Vector3(x, y, z));
    };

    /**
    * Zooms into an object so it fills most of the screen.
    * Assumes camera is looking towards negative z.
    **/
    this.zoomToObject = function (name) {
        var obj = scene.getObjectByName(name);
        if (!obj) return;
        
        var bbox = new THREE.Box3();
        bbox.setFromObject(obj);
        if (!bbox) return;
        
        var screenPercentage = 0.9; // Percentage of screen to fill when zoomed
        
        var nearPlaneSize = calcVisibleSize(camera, camera.near);
        var targetVisibleSize = nearPlaneSize.multiplyScalar(screenPercentage);
        
        // Width only for now
        var currDistance = bbox.max.z - camera.position.z;
        var currWidth    = calcVisibleSize(camera, currDistance).x;
        var targetWidth  = targetVisibleSize.x;
        
        var newDistance  = currDistance * currWidth/targetWidth;
        
        camera.position.x = bbox.center().x;
        camera.position.y = bbox.center().y;
        camera.position.z = bbox.max.z - newDistance;
        
        controls.update();
    };
    
    //
    // Cross section
    //
    
    this.crossSection = {
        enabled: false,
        normal: new THREE.Vector3(0, 0, -1),    // Plane normal vector
        distance: 0,                             // Plane distance from origin
        angleX: 0,
        angleY: 0,                              // Angle (in rad) the normal is rotated by (Used for storage only)
    };
    
    this.enableCrossSection = function (direction, distance) {
        svc.crossSection.enabled = true;
        svc.crossSection.distance = distance;
        svc.crossSection.direction = direction;
        
        var vecFacingOrigin, camDirection;
        
        if (direction == 'V') {
            vecFacingOrigin = new THREE.Vector3(0, 0, 1);
            camDirection = Math.sign(camera.getWorldDirection().z);
            
        } else { // assume horizontal
            vecFacingOrigin = new THREE.Vector3(0, 1, 0);
            camDirection = Math.sign(camera.getWorldDirection().y);
        }
        
        vecFacingOrigin.multiplyScalar(camDirection);
        svc.crossSection.normal = vecFacingOrigin;

        setCrossSection(this.crossSection.normal, this.crossSection.distance);
        
        // Set plane to size of the model's bounding box
        var scale = boundingBox.size().multiplyScalar(1.1);
        crossSectionPlaneObj.scale.set(scale.x, scale.y, 1);
        // Move to bbox centre
        var center = boundingBox.center();
        crossSectionPlaneObj.position.set(center.x, center.y, center.z);
        scene.add(crossSectionPlaneObj);
    };
    
    this.disableCrossSection = function () {
        if (!svc.crossSection.enabled) return;
        
        camera.updateProjectionMatrix();
        svc.crossSection.enabled = false;
        
        scene.remove(crossSectionPlaneObj);
        // Reset plane to original size 1x1x1
        crossSectionPlaneObj.scale.divideScalar(crossSectionPlaneObj.scale.x, crossSectionPlaneObj.scale.y, 1);
    };
    
    this.moveCrossSection = function (distance) {
        if (!svc.crossSection.enabled) return;
        
        svc.crossSection.distance = distance;
        setCrossSection(svc.crossSection.normal, svc.crossSection.distance);
    };
    
    /**
    * axis: 'X' or 'Y'
    * deltaAngle: In degrees
    **/
    this.rotateCrossSection = function (axis, deltaAngle) {
        if (!svc.crossSection.enabled) return;
        
        var rotAxis;
        if (axis === 'X') {
            rotAxis = new THREE.Vector3(1, 0, 0);
        } else { // Assume 'Y'
             rotAxis = new THREE.Vector3(0, 1, 0);
        }
        
        var radAngle = deltaAngle / 180 * Math.PI;
        
        svc.crossSection.normal.applyAxisAngle(rotAxis, radAngle);
        setCrossSection(svc.crossSection.normal, svc.crossSection.distance);
    }
    
    this.flipCrossSection = function () {
        if (!svc.crossSection.enabled) return;
        
        controls.rotateLeft(Math.PI);
        controls.update();
        render();   // May be superfluous
        
        svc.crossSection.distance *= -1;    // Flip distance to origin
        
        svc.disableCrossSection();
        svc.enableCrossSection(svc.crossSection.direction, svc.crossSection.distance);
    };
    
    this.resetCrossSection = function () {
        svc.crossSection.enabled = false;
        svc.crossSection.normal = new THREE.Vector3(0, 0, -1);
        svc.crossSection.distance = 0;
        svc.crossSection.angleX = 0;
        svc.crossSection.angleY = 0;
    };
    
    this.showCrossSectionPlane = function (isVisible) {
        crossSectionPlaneObj.visible = isVisible;
    };
    
    //
    // Controls
    //
    
    this.toggleMovementControls = function (state) {
        if (state!=undefined) {
            controls.enabled = state;
        } else {
            controls.enabled = !controls.enabled;
        }
    };
    
    // Transforms
    
    this.scaleObject = function (name, scale) {
        var obj = scene.getObjectByName(name);
        
        if (obj) {
            obj.scale.set(scale.x, scale.y, scale.z);
        }
        
        calculateSceneBoundingBox();
        centerScene();
    };
    
    this.translateObject = function (name, offset) {
        var obj = scene.getObjectByName(name);
        
        if (obj) {
            obj.translateX(offset.x);
            obj.translateY(offset.y);
            obj.translateZ(offset.z);
        }
        
        calculateSceneBoundingBox();
    };
    
    this.highlightObject = function(name, colorHex) {
        var obj = scene.getObjectByName(name);
        if (!obj) return;
        
        obj.traverse(function(node){
            if ('material' in node) {
                //console.log(node.id + " | " + node.name + " >> Orig: " + node.material.color.);
                node.material.colorOrig = node.material.color.clone();
                node.material.color.setHex(colorHex);
            }
        });
    };
    
    this.unhighlightObject = function(name) {
        var obj = scene.getObjectByName(name);
        if (!obj) return;
        
        obj.traverse(function (node) {
            if ('material' in node) {
                node.material.color.set(node.material.colorOrig);
                delete node.material.colorOrig;
            }
        });
        
    };
        
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
        return objects.children;
    };
    
    this.getObjectByName = function(name) {
      return scene.getObjectByName(name).clone();
    };
    
    this.hideChildren = function(name) {
        var o = scene.getObjectByName(name);
        o.traverse(function (node) {
            if (node != o) {
                node.userData.visible = node.visible;   // Store current state for restoring later
                node.visible = false;
            }
        });
    };
    
    this.showChildren = function(name) {
        
        for (var i = 0; i < objects.length; i++) {
            objects.traverse(function(node){
                // Showing objects cancels isolation mode.
                // More efficient if we store a reference to isolated object (future idea ;) )
                delete node.userData.isolated;
            });
        }
        
        var o = scene.getObjectByName(name);
        o.traverse(function (node) {
            if (node != o) {
                if ('visible' in node.userData) {
                    node.visible = node.userData.visible;   // Restore previous visibility state
                    delete node.userData.visible;
                } else {
                    node.visible = true;
                }
            }
        });
    };
    
    this.isolateObject = function(name) {
        var isoObject = scene.getObjectByName(name);
        isoObject.userData.isolated = true;

        objects.traverse(function(node) {
            svc.hideChildren(node.name);
        });
        
        // Revert child visibility
        isoObject.traverse(function(node) {
            node.visible = node.userData.visible;
        });
        
        isoObject.userData.visible = true;

        // Show parents, otherwise child object isn't visible
        isoObject.traverseAncestors(function(parent) {
            parent.visible = true;
        });
    };
    
    this.deisolateObject = function(name) {
        var isoObject = scene.getObjectByName(name);
        delete isoObject.userData.isolated;
        
        // Restore all objects visibility
        objects.traverse(function(node) {
            svc.showChildren(node.name);
        });
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
                //document.getElementById('progress').innerHTML = (xhr.loaded / xhr.total * 100) + '% loaded';
                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            function ( xhr ) {  // On error
                //document.getElementById('progress').innerHTML = 'Model file ' + objFile + ' could not be loaded';
                console.error( 'Model file ' + objFile + ' could not be loaded' );
            }
        );
	};
	
	this.loadDae = function(name, daePath, successHandler) { // TODO: Add asyncCallback to show progress
		new THREE.ColladaLoader().load(daePath,
            function(collada) { // Load complete
                displayModel(name, collada.scene, successHandler);
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
        controls.addEventListener('change', controlsMovedHandler);
        		
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
        
        // Cross-sections
        var geometry = new THREE.PlaneBufferGeometry(1, 1);
        var material = new THREE.MeshBasicMaterial( {color: 0xf00000, side: THREE.DoubleSide, transparent: true, opacity: 0.1 } );
        crossSectionPlaneObj = new THREE.Mesh( geometry, material );

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
    
    function controlsMovedHandler() {
        if (svc.crossSection.enabled) {
            setCrossSection(svc.crossSection.normal, svc.crossSection.distance);
        }
    }
    
    //
    // Cross-section
    //
    function setCrossSection(normalVector, distance) {
        // Set oblique camera frustum
        // Algorithm & paper:   http://www.terathon.com/code/oblique.html
        // ThreeJS snippets:    https://github.com/mrdoob/three.js/blob/af21991fc7c4e1d35d6a93031707273d937af0f9/examples/js/WaterShader.js
        
        camera.updateProjectionMatrix();    // Reload original matrix
        var normal = normalVector.clone();
        
        // Position of cross-section plane is relative to bounding box size (+/- n% of half-depth)
        var relativeDistance = distance/100 * boundingBox.size().z/2;
        
        var crossSectionPlane = new THREE.Plane(normal, -relativeDistance);
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
        c = clipPlaneV.multiplyScalar( 2.0 / clipPlaneV.dot( q ) );

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[ 2 ] = c.x;
        projectionMatrix.elements[ 6 ] = c.y;
        projectionMatrix.elements[ 10 ] = c.z + 1.0;
        projectionMatrix.elements[ 14 ] = c.w;
        
        // DEBUG Update plane object
        var center = boundingBox.center();
        crossSectionPlaneObj.position.set(center.x, center.y, center.z);
        crossSectionPlaneObj.rotation.set(0, 0, 0);
        crossSectionPlaneObj.translateOnAxis(normalVector, relativeDistance);
        crossSectionPlaneObj.rotateOnAxis(new THREE.Vector3(1, 0, 0), svc.crossSection.angleX/180*Math.PI);    // TODO Make independent from the crossSection variable
        crossSectionPlaneObj.rotateOnAxis(new THREE.Vector3(0, 1, 0), svc.crossSection.angleY/180*Math.PI);    // TODO Make independent from the crossSection variable
    }
    
    //
    // Private Utility functions
    //
    
    function displayModel(name, object3d, callback) {        
        object3d.name = name;
        objects.add(object3d);
        
        $timeout(function() {
            callback();
            
            calculateSceneBoundingBox();
            centerScene();
        }, 200);
        
        object3d.traverse(function( node ) {
            node.name = node.name.replace('_', ' ').trim();
            
            if( node.material ) {
                node.material.side = THREE.DoubleSide;
            }
        });
    }
    
    function centerScene () {
        if (!boundingBox) return;
        
        var center = boundingBox.center();
        var origin = new THREE.Vector3(0, 0, 0);
        var offset = origin.sub(center);
        
        objects.position.add(offset);
        calculateSceneBoundingBox();
    }
    
    function calculateSceneBoundingBox() {
        
        var box = new THREE.Box3();
        box.setFromObject(objects);
        
        if (!isNaN(box.size().x) && !isNaN(box.size().y) && !isNaN(box.size().z)) {
            boundingBox = box;
        }
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

        return raycaster.intersectObjects( objects.children, true );	// 2nd param: Recursive
    }
    
    /*
    * Calculates the visible size of an object in specified perspective camera.
    * Returns the width and height as a THREE.Vector2
    */
    function calcVisibleSize(camera, objectDistance) {
        var fovy = camera.fov * Math.PI / 180;
        var height = 2 * Math.tan(fovy/2) * objectDistance;   // visible height
        var width = height * camera.aspect;                   // visible width
        
        return new THREE.Vector2(width, height);
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
    * Main
    ******************************************************/
    init(canvasID);
    animate();
	
}