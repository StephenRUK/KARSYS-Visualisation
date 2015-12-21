'use strict';

function ModelController(GraphicsService, SceneUtilsService, ObjectDataService, $scope) {
    /***********************************************
    * Private
    ***********************************************/

    var ctrl = this,        // Sometimes needed to 'escape' the current 'this' scope
        gfx = GraphicsService,
        utils = SceneUtilsService,
        ods = ObjectDataService;
    
    //
    // Private util methods
    //
    
    function replaceIDsWithNames() {
        var objects = gfx.getObjectHierarchy();
        
        for (var i = 0; i < objects.length; i++) {
            var o = objects[i];
            o.traverse(function (node) {
                if (ods.isValidID(node.name)) {
                    var id = node.name;
                    
                    node.userData.id = id;
                    
                    ods.getObjectField(id, 'name').then(function(result) {
                        if (result.data.fields) {
                            var displayName = result.data.fields[0].value;
                            if (displayName != null && displayName.length > 0) {
                                node.name = displayName;
                            }
                        }
                    });
                    
                }
            });
        }
    }
    
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
    this.model = null;

    // Display variables
    this.mouseCoordinates = {x: 0, y: 0, z: 0};
    this.coordinatesUnit = "";

    // Refactor: Move to a new cross-section directive
    this.csMode;    // Cross-section Horizontal/Vertical/undefined
    this.csFlipped; // "Flip" or undefined
    this.csShowPlane = 'Show';   // Show or hide the red plane
    this.crossSection = utils.crossSection;   // Binds to distance

    //
    // Functions
    //

    this.toggleCrossSection = function (newMode, oldMode) {
        if (newMode) {
            utils.enableCrossSection(newMode, ctrl.crossSection.distance);
        } else {
            utils.disableCrossSection();
        }
    };

    this.toggleCrossSectionPlane = function () {
        utils.showCrossSectionPlane(ctrl.csShowPlane === 'Show');
    };

    this.moveCrossSection = function () {
        utils.moveCrossSection(ctrl.crossSection.distance);
    };

    this.rotateCrossSection = function (axis, newAngle, oldAngle) {
        var deltaAngle = newAngle - oldAngle;
        utils.rotateCrossSection(axis, deltaAngle);
    };

    this.flipCrossSection = function () {
        utils.flipCrossSection();
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
            this.mouseCoordinates = transformCoordinates(coords, ctrl.model.params.coordinatesTransform);
        }
    };
    
    
    /*************************
    * Main/Init
    *************************/
    
    function init() {
        $scope.$watchCollection('ctrl.csMode', ctrl.toggleCrossSection);     // TODO Replace with ngChange in view
        
        // Event handling
        $scope.$on('MODEL_LOADED', function (event, model) {
            replaceIDsWithNames();
            if (model.params.unit) {
                ctrl.coordinatesUnit = model.params.unit;
            } else {
                ctrl.coordinatesUnit = '';
            }
			if (model.params.transform) {
				utils.translateObject(model.name, model.params.transform.offset);
				utils.scaleObject(model.name, model.params.transform.scale);
			}
            
            utils.centerScene();
            utils.zoomToScene();

            $scope.$broadcast('UPDATE');  // Forward event to child directives
        });
    }
    
    init();
}