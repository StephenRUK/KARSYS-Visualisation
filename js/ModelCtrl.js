'use strict';

function ModelController(ModelRepo, GraphicsSvc, ObjectDataService, $scope, $uibModal) {
    /***********************************************
    * Private
    ***********************************************/

    var ctrl = this,        // Sometimes needed to 'escape' the current 'this' scope
        repo = ModelRepo,
        gfx = GraphicsSvc,
        ods = ObjectDataService,
        loadedModel;        // Reference to currently loaded model object
    
    //
    // Event handlers
    //
    
    function modelLoadedHandler(name) {
        // Apply transformations
        if (loadedModel.params.transform) {
            gfx.translateObject(loadedModel.name, loadedModel.params.transform.offset);
            gfx.scaleObject(loadedModel.name, loadedModel.params.transform.scale);
        }
        
        ctrl.objectTree = gfx.getObjectHierarchy();
        $scope.$apply();    // This function is outside of Angular's scope. Tell it to update view.
        
        CollapsibleLists.applyTo(document.getElementById('objectHierarchy'));
        
        var hierarchyRootElement = document.getElementById('hierarchyRoot');
        if (hierarchyRootElement) {
            hierarchyRootElement.click(); // Hackily expand first level
        }
        
        ctrl.isModelLoaded = true;
    }
    
    //
    // Private util methods
    //
    
    /*
    * transfromCoordinates
    * Accepts a 3D coordinates object and applies coordinatesTransform object (scale & offset).
    */
    function transformCoordinates(coords, transform) {
        if (!transform) {
            return coords;
        }
        
        var newCoords = {x: 0, y: 0, z: 0};
        
        // Scale
        if (transform.scale) {
            newCoords.x = coords.x * transform.scale.x;
            newCoords.y = coords.y * transform.scale.y;
            newCoords.z = coords.z * transform.scale.z;
        }
        
        // Offset
        newCoords.x = coords.x + transform.offset.x;
        newCoords.y = coords.y + transform.offset.y;
        newCoords.z = coords.z + transform.offset.z;
        
        return newCoords;
    }
    
    /***********************************************
    * Public
    ***********************************************/
    
    // Temporary variables
    this.currentModelID;
    this.camCoords = gfx.getCameraPosition();
    
    this.isModelLoaded = false;

    // Display variables
    this.mouseCoordinates = {x: 0, y: 0, z: 0};
    this.coordinatesUnit = "";
    this.objectHierarchy;
    
    // Settings
    this.coordinatesEnabled = false;    // Toggle coordinates display
    this.movementEnabled = true;    // Toggle movement controls
    this.cameraEnabled = false; // Toggle camera controls
    this.csMode;    // Cross-section Horizontal/Vertical/undefined
    this.csFlipped; // "Flip" or undefined
    this.csShowPlane = 'Show';   // Show or hide the red plane
    this.crossSection = gfx.crossSection;   // Binds to distance
	
    //
    // Functions
    //
    
    this.showObjectInfo = function (name) {
        var modalInstance = $uibModal.open({
            templateUrl: 'dialog.html',
            controller: 'ModalInfoController as modalCtrl',
            backdrop: false,
            resolve: {
                objectName: function () {
                    return name;
                },
                objectInfo: function () {
                    if (ods.isValidID(name)) {
                        return ods.getObjectData(name);
                    }
                }
            }
        });
        
        modalInstance.result.then(function () {
			console.info("Modal opened successfully!");
		}, function (error) {
			console.warn("Modal couldn't be opened. error.");
		});
        
    };
    
    this.toggleCrossSection = function (newMode, oldMode) {
        if (newMode) {
            gfx.enableCrossSection(newMode, ctrl.crossSection.distance);
        } else {
            gfx.disableCrossSection();
        }
    };
    
    this.toggleCrossSectionPlane = function () {
        gfx.showCrossSectionPlane(ctrl.csShowPlane === 'Show');
    };
    
    this.moveCrossSection = function () {
        gfx.moveCrossSection(ctrl.crossSection.distance);
    };
    
    this.rotateCrossSection = function (axis, newAngle, oldAngle) {
        var deltaAngle = newAngle - oldAngle;
        gfx.rotateCrossSection(axis, deltaAngle);
    };
    
    this.flipCrossSection = function () {
        gfx.flipCrossSection();
    };
	
    //
    // Data access
    //
    
	this.getAll = repo.getAll();
    
    this.getModelName = function () {
        if (loadedModel) {
            return loadedModel.name;
        }
    };

    
    //
    // Config change
    //
    
    this.toggleMovementControls = function () {
        gfx.enableMovement(ctrl.movementEnabled);
    };
    
    this.toggleCoordinatesDisplay = function () {
        gfx.enableCoordinatesDisplay(ctrl.coordinatesEnabled);
    };
    
    //
    // Event Handlers
    //
    this.canvasMouseMoved = function ($event) {
        var isMouseClicked = ($event.buttons !== 0);
        
        // Don't proceed if coordinates are disabled or user is moving model (results in bad performance)
        if (!this.coordinatesEnabled || isMouseClicked) {
            return;
        }
        
        var coords = gfx.getMouseWorldCoordinates($event);
        if (coords) {
            this.mouseCoordinates = transformCoordinates(coords, loadedModel.params.coordinatesTransform);
        }
        
    };
    
    
    /*************************
    * Main/Init
    *************************/
    
    function init() {
        gfx.onModelLoaded = modelLoadedHandler;
        $scope.$watchCollection('ctrl.csMode', ctrl.toggleCrossSection);     // TODO Replace with ngChange in view
    }
    
    init();
}


/*****************************
* Modal Dialog Controller
******************************/
function ModalInfoController($modalInstance, objectName, objectInfo) {
    this.name = objectName;
    this.info = objectInfo;
    
    this.ok = function () {
        $modalInstance.close();
    };
}