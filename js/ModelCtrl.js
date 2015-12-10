'use strict';

function ModelController(ModelRepo, GraphicsSvc, $scope) {
    /***********************************************
    * Private
    ***********************************************/

    var ctrl = this,        // Sometimes needed to 'escape' the current 'this' scope
        repo = ModelRepo,
        gfx = GraphicsSvc;
    
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
    
    // Refactoring - to keep
    this.movementEnabled = true;
    this.coordinatesEnabled = false;
    this.loadedModel = null;

    
    // Temporary variables
    this.currentModelID;
    
    // Display variables
    this.mouseCoordinates = {x: 0, y: 0, z: 0};
    this.coordinatesUnit = "";
    this.objectHierarchy;
    
    // Refactor: To cross-section
    this.csMode;    // Cross-section Horizontal/Vertical/undefined
    this.csFlipped; // "Flip" or undefined
    this.csShowPlane = 'Show';   // Show or hide the red plane
    this.crossSection = gfx.crossSection;   // Binds to distance
	
    //
    // Functions
    //
    
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
    
    this.getModelName = function () {
        if (ctrl.loadedModel) {
            return ctrl.loadedModel.name;
        }
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
            this.mouseCoordinates = transformCoordinates(coords, ctrl.loadedModel.params.coordinatesTransform);
        }
        
    };
    
    
    /*************************
    * Main/Init
    *************************/
    
    function init() {
        $scope.$watchCollection('ctrl.csMode', ctrl.toggleCrossSection);     // TODO Replace with ngChange in view
        
        // Event handling
        $scope.$on('MODEL_LOADED', function () {
            $scope.$broadcast('UPDATE');  // Forward event to child directives
        });
    }
    
    init();
}

/*****************************
* Modal Dialog Controller
******************************/
function ModalInfoController($modalInstance, objectName, ObjectDataService) {
    var modal = this;
    
    this.loading = false;
    this.error = 'LOL';
    
    this.name = objectName;
    this.info = null;
    
    if (ObjectDataService.isValidID(objectName)) {
        modal.loading = true;
        ObjectDataService.getObjectData(objectName).then(
            function success(response) {
                var data = response.data;
                if (data.error) {
                    modal.error = data.error;
                } else {
                    modal.info = data;
                }
                modal.loading = false;
            },
            function error(response) {
                modal.error = 'Data could not be retrieved (HTTP ' + response.status + ')';
                modal.loading = false;
            }
        );
    }

    this.ok = function () {
        $modalInstance.close();
    };
}