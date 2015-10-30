function ModelController(ModelRepo, GraphicsController, $scope, $uibModal) {
    /***********************************************
    * Private
    ***********************************************/

    var ctrl = this,        // Sometimes needed to 'escape' the current 'this' scope
        repo = ModelRepo,
        gfx = GraphicsController,
        loadedModel;        // Reference to currently loaded model object
        
    // Config
    var LOAD_MODELS_SOLO = true;
    
    // Params
    var InterActionMode = {
        MOVE: 0,
        MEASURE: 1,
        CROSS_SECTION: 2
    };
    
    //
    // Event handlers
    //
    
    function modelLoadedHandler(name) {
        gfx.resetCamPosition();
        
        // Apply transformations
        if (loadedModel.params.transform) {
            gfx.translateObject(loadedModel.name, loadedModel.params.transform.offset);
            gfx.scaleObject(loadedModel.name, loadedModel.params.transform.scale);
        }
        
        ctrl.objectTree = gfx.getObjectHierarchy();
        $scope.$apply();    // This function is outside of Angular's scope. Tell it to update view.
        
        CollapsibleLists.applyTo(document.getElementById('objectHierarchy'));
        document.getElementById('hierarchyRoot').click(); // Hackily expand first level
        
        ctrl.isModelLoaded = true;
    };
    
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
    this.coordinatesEnabled = false;
    this.movementEnabled = true;
    this.cameraEnabled = false;
    //this.interactionMode = InteractionMode.MOVE;
    this.csMode;    // Cross-section Horizontal/Vertical/null
    this.crossSection = gfx.crossSection;
	
    //
    // Functions
    //
    
	this.loadModel = function (modelID) {        
        var modelToLoad = repo.getByID(modelID);
        
        if (modelToLoad === loadedModel) return;
        
        loadedModel = modelToLoad;
        ctrl.isModelLoaded = false;
        
		switch (loadedModel.fileFormat) {
        case ModelFormat.OBJMTL:
            gfx.loadObjMtl(loadedModel.name, loadedModel.filePath, loadedModel.params.mtlPath, LOAD_MODELS_SOLO);
            break;
			
        case ModelFormat.DAE:
            gfx.loadDae(loadedModel.name, loadedModel.filePath, LOAD_MODELS_SOLO);
            break;
			
        default:
            break;
		}
                
        // Set up coordinate display
        this.mouseCoordinates = {x: 0, y: 0, z: 0};
        this.coordinatesUnit = loadedModel.params.unit;
	};
    
    this.showObjectInfo = function (name) {
        var obj = gfx.getObjectByName(name);
        var hierarchyObjInfo = repo.getObjectInfo(loadedModel.name, name);
        
        var modalInstance = $uibModal.open({
            templateUrl: 'dialog.html',
            controller: 'ModalInfoController as modalCtrl',
            backdrop: false,
            resolve: {
                objectName: function () {
                    return name;
                },
                objectInfo: function () {
                    return hierarchyObjInfo;
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
            gfx.enableCrossSection();
        } else {
            gfx.disableCrossSection();
        }
    };
    
    this.updateCrossSection = function () {
        gfx.updateCrossSection();
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
    */
    
    function init() {
        gfx.onModelLoaded = modelLoadedHandler;
        $scope.$watchCollection('ctrl.csMode', ctrl.toggleCrossSection);        
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