function ModelController(ModelRepo, GraphicsController) {
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
    
    // Event handlers
    gfx.onModelLoaded = function (name) {
        gfx.resetCamPosition();
        
        // Apply transformations
        if (loadedModel.params.transform) {
            if (loadedModel.params.transform.offset) {
                gfx.translateObject(loadedModel.name, loadedModel.params.transform.offset);
            }
            if (loadedModel.params.transform.scale) {
                gfx.scaleObject(loadedModel.name, loadedModel.params.transform.scale);
            }
        }
    };
    
    /*
    * transfromCoordinates
    * Accepts a 3D coordinates object and applies coordinatesTransform object (scale & offset).
    */
    function transformCoordinates(coords, transform) {
        if (!transform) {
            return;
        }
        
        // Scale
        if (transform.scale) {
            coords.x *= transform.scale.x;
            coords.y *= transform.scale.y;
            coords.z *= transform.scale.z;
        }
        
        // Offset
        coords.x += transform.offset.x;
        coords.y += transform.offset.y;
        coords.z += transform.offset.z;
    }
    
    /***********************************************
    * Public
    ***********************************************/
    
    // Temporary variables
    this.currentModelID = null;
    this.camCoords = gfx.getCameraPosition();

    // Display variables
    this.mouseCoordinates = {x: 0, y: 0, z: 0};
    this.coordinatesUnit = "";
    
    // Settings
    this.coordinatesEnabled = true;
    this.movementEnabled = true;
    //this.interactionMode = InteractionMode.MOVE;
    
	
    //
    // Functions
    //
    
	this.loadModel = function (modelID) {
        loadedModel = repo.getByID(modelID);
        
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
	
    //
    // Data access
    //
    
	this.getAll = repo.getAll();
    
    this.getModelName = function () {
        return loadedModel.name;
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
        
        //
        // Update coordinates display
        //
        if (!this.coordinatesEnabled) {
            return;
        }
        
        var coords = gfx.getMouseWorldCoordinates($event);
        if (coords) {
            if (loadedModel.params.coordinatesTransform) {
                transformCoordinates(coords, loadedModel.params.coordinatesTransform);
            }
            this.mouseCoordinates = coords;
        }
        
        //
        // TODO: Show tooltip with info? Or maybe on-click instead?
        //
    };
	
}