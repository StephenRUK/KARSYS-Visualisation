'use strict';

function SceneUtilsService(GraphicsService) {
    var svc = this,
        gfx = GraphicsService,
        
        objects  = gfx.getSceneContainer(),
        camera   = gfx.getCamera(),
        controls = gfx.getControls(),
        
        boundingBox = new THREE.Box3(),
        crossSectionPlaneObj;
    
    /********************************************
    * Private
    ********************************************/
    
    function calculateSceneBoundingBox() {
        var box = new THREE.Box3();
        box.setFromObject(objects);
        
        if (!(isNaN(box.size().x) || isNaN(box.size().y) || isNaN(box.size().z))) {
            boundingBox = box;
        }
    }
    
    /*
    * Performs the actual calculations on the camera projection matrix to form a cross-section.
    */
    function setCrossSection(normal, distance) {
        // Set oblique camera frustum
        // Algorithm & paper:   http://www.terathon.com/code/oblique.html
        // ThreeJS snippets:    https://github.com/mrdoob/three.js/blob/af21991fc7c4e1d35d6a93031707273d937af0f9/examples/js/WaterShader.js
        
        camera.updateProjectionMatrix();    // Reload original matrix
        
        // Position of cross-section plane is relative to bounding box size (+/- n% of half-depth)
        var relativeDistance = (distance / 100) * (boundingBox.size().z / 2);
        
        var crossSectionPlane = new THREE.Plane(normal.clone(), -relativeDistance); // Normal vector MUST be cloned!
        crossSectionPlane.applyMatrix4(camera.matrixWorldInverse);
        
        var clipPlaneV = new THREE.Vector4(crossSectionPlane.normal.x, crossSectionPlane.normal.y, crossSectionPlane.normal.z, crossSectionPlane.constant);
        
        var q = new THREE.Vector4();
        var projectionMatrix = camera.projectionMatrix;

        q.x = (Math.sign(clipPlaneV.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
        q.y = (Math.sign(clipPlaneV.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
        q.z = -1.0;
        q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

        // Calculate the scaled plane vector
        var c = new THREE.Vector4();
        c = clipPlaneV.multiplyScalar(2.0 / clipPlaneV.dot(q));

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[2] = c.x;
        projectionMatrix.elements[6] = c.y;
        projectionMatrix.elements[10] = c.z + 1.0;
        projectionMatrix.elements[14] = c.w;
        
        // Update the plane object displayed to the user
        var center = boundingBox.center();
        crossSectionPlaneObj.position.set(center.x, center.y, center.z);
    
    /*
    * Controls changed event handler.
    * Maintains cross-section settings when the camera is moved.
    */
    function updateCrossSection() {
        if (svc.crossSection.enabled) {
            setCrossSection(svc.crossSection.normal, svc.crossSection.distance);
        }
    }
        crossSectionPlaneObj.rotation.set(0, 0, 0);
        crossSectionPlaneObj.translateOnAxis(normal, relativeDistance);
        crossSectionPlaneObj.rotateOnAxis(new THREE.Vector3(1, 0, 0), svc.crossSection.angleX / 180 * Math.PI);
        crossSectionPlaneObj.rotateOnAxis(new THREE.Vector3(0, 1, 0), svc.crossSection.angleY / 180 * Math.PI);
    }

    // Maths util
    Math.sign = Math.sign || function (x) {
        x = +x; // convert to a number
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };

    function init() {
        // Create cross-section plane
        var geometry = new THREE.PlaneBufferGeometry(1, 1);
        var material = new THREE.MeshBasicMaterial({color: 0xf00000, side: THREE.DoubleSide, transparent: true, opacity: 0.1 });
        crossSectionPlaneObj = new THREE.Mesh(geometry, material);
        crossSectionPlaneObj.visible = false;
        gfx.addNonuserObject(crossSectionPlaneObj); // Add to scene directly
        
        controls.addEventListener('change', updateCrossSection);
    }
    
    /********************************************
    * Contruction
    ********************************************/
    init();

    /********************************************
    * Public API
    ********************************************/
    
    //
    // Scene management
    //
    
    this.resetScene = function () {
        for (var i=0; i < objects.children.length; i++) {
            objects.remove(objects.children[i]);
        }

        svc.disableCrossSection();
        svc.resetCrossSection();
        updateCrossSectionPlane(svc.crossSection.normal, svc.crossSection.distance);
        gfx.resetCamera();
    };
    
    /*
    * Translates the scene objects to the origin.
    */
    this.centerScene = function() {
        calculateSceneBoundingBox();
        if (!boundingBox) { return; }
        
        var center = boundingBox.center(),
            origin = new THREE.Vector3(0, 0, 0),
            offset = origin.sub(center);
        
        objects.position.add(offset);
        calculateSceneBoundingBox();
    }
    
    /*
    * Zooms into scene so it fills most of the screen.
    * Assumes camera is looking towards negative z.
    */
    this.zoomToScene = function() {
        var bbox = boundingBox;
        
        var fillFactor = 0.70;  // Percentage of screen to fill when zoomed in

        var center = bbox.center(),
            width  = bbox.size().x / fillFactor,
            height = bbox.size().y / fillFactor,
            maxZ   = bbox.max.z;

        var fovY = camera.fov * (Math.PI / 180),
            fovX = 2 * Math.atan(Math.tan(fovY / 2) * camera.aspect);

        var vDist = height / (2 * Math.tan(fovY / 2)),    // Distance at which height fills the frustum
            hDist = width / (2 * Math.tan(fovX / 2)),     // Distance at which width fills the frustum
            zDist = Math.max(vDist, hDist);

        // Calculate elevation
        var elevationAngle = 30/180*Math.PI,
            elevation = Math.sin(elevationAngle) * zDist;

        camera.position.x = center.x;
        camera.position.y = center.y + elevation;
        camera.position.z = zDist + maxZ;

        controls.target.copy(center);
        controls.update();
    }

    //
    // Transforms
    //

    this.scaleObject = function (name, scale) {
        var obj = objects.getObjectByName(name);
        
        if (obj) {
            obj.scale.set(scale.x, scale.y, scale.z);
            svc.centerScene();
        }
    };
    
    this.translateObject = function (name, offset) {
        var obj = objects.getObjectByName(name);

        if (obj) {
            obj.translateX(offset.x);
            obj.translateY(offset.y);
            obj.translateZ(offset.z);
        }

        calculateSceneBoundingBox();
    };
    
    this.highlightObject = function(name, colorHex) {
        var obj = objects.getObjectByName(name);
        if (!obj) return;
        
        obj.traverse(function (node) {
            if ('material' in node) {
                //console.log(node.id + " | " + node.name + " >> Orig: " + node.material.color.);
                if (!node.material.color) node.material.color.setHex(0xFFFFFF); // Default to white if missing. Attempted bugfix.
                
                node.material.colorOrig = node.material.color.clone();
                node.material.color.setHex(colorHex);
            }
        });
    };
    
    this.unhighlightObject = function(name) {
        var obj = objects.getObjectByName(name);
        if (!obj) return;
        
        obj.traverse(function (node) {
            if ('material' in node) {
                node.material.color.set(node.material.colorOrig);
                delete node.material.colorOrig;
            }
        });
    };
    
    //
    // Visibility & isolation
    //
    
    this.showChildren = function (object) {
        object.traverse(function (node) {
            node.visible = true;
            delete node.userData.visible;
        });
    };
    
    this.hideChildren = function (object, skipParent) {
        object.traverse(function (node) {
            if (skipParent && node == object) return;
            if (!('visible' in node.userData)) {
                node.userData.visible = node.visible;   // Store current state for restoring later
                node.visible = false;
            }
        });
    };
    
    this.restoreChildVisibility = function (object, skipParent) {
        object.traverse(function (node) {
            if (skipParent && node == object) return;
            if ('visible' in node.userData) {
                node.visible = node.userData.visible;   // Restore previous visibility state
                delete node.userData.visible;
            }
        });
    };
    
    this.isolateObject = function (object) {
        svc.stopIsolation();

        object.userData.isolated = true;
        
        svc.hideChildren(objects, true);   // 1 - Hide all objects
        svc.showChildren(object, false);   // 2 - Show isolated object and its children

        // 3 - Show parents, otherwise child object isn't visible
        object.traverseAncestors(function (parent) {
            parent.visible = true;
        });
    };

    this.stopIsolation = function() {
        objects.traverse(function (node) {
            delete node.userData.isolated;
        });

        svc.restoreChildVisibility(objects);
    };
    
    //
    // Cross-sections
    //

    this.crossSection = {
        enabled: false,
        normal: new THREE.Vector3(0, 0, -1),    // Plane normal vector
        distance: 0,                             // Plane distance from origin
        angleX: 0,
        angleY: 0,                              // Angle (in rad) the normal is rotated by (Used for storage only)
    };
    
    /*
    * Creates a vertical cross-section at given distance from the origin.
    * Distance: Relative distance as percentage of model depth.
    */
    this.enableCrossSection = function (distance) {
        svc.crossSection.enabled = true;
        svc.crossSection.distance = distance;

        setCrossSection(svc.crossSection.normal, svc.crossSection.distance);

        crossSectionPlaneObj.userData.visibility = crossSectionPlaneObj.visible;
        crossSectionPlaneObj.visible = false;
    };
    
    this.disableCrossSection = function () {
        if (!svc.crossSection.enabled) return;
        
        camera.updateProjectionMatrix();
        svc.crossSection.enabled = false;
        
        // Reset plane to original size 1x1x1
        crossSectionPlaneObj.scale.divideScalar(crossSectionPlaneObj.scale.x, crossSectionPlaneObj.scale.y, 1);

        crossSectionPlaneObj.visible = crossSectionPlaneObj.userData.visibility;
        delete crossSectionPlaneObj.userData.visibility;
    };
    
    this.enableCrossSectionAtObject = function (object) {
        var center = boundingBox.center().clone();
        var distanceFromCenter = center.sub(object.position).z;
        var relativeDistance = (2*distanceFromCenter / boundingBox.size().z) * 100;
        relativeDistance = relativeDistance.toFixed(0);

        svc.crossSection.distance = relativeDistance;
        svc.enableCrossSection('V', relativeDistance);
    };
    
    this.moveCrossSection = function (distance) {
        if (!svc.crossSection.enabled) return;
        
        svc.crossSection.distance = distance;
        setCrossSection(svc.crossSection.normal, svc.crossSection.distance);
    };
    
    /*
    * axis: 'X' or 'Y'
    * deltaAngle: In degrees
    */
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
        //render();   // May be superfluous
        
        svc.crossSection.distance *= -1;    // Flip distance to origin
        
        svc.disableCrossSection();
        svc.enableCrossSection(svc.crossSection.distance);
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

}