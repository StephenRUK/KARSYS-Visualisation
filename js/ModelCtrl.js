function ModelController(ModelRepo, GraphicsController) {
    /***********************************************
    * Private
    ***********************************************/

    var ctrl = this;    // Sometimes needed to 'escape' the current 'this' scope
    
	var repo = ModelRepo;
	var gfx = GraphicsController;
        
    // Config
    var LOAD_MODELS_SOLO = true;
    
    // Params
    var InterActionMode = {
        MOVE: 0,
        MEASURE: 1,
        CROSS_SECTION: 2
    };
    
    /***********************************************
    * Public
    ***********************************************/
    
    // Variables
    this.currentModel = null;

    this.mouseCoordinates = { x: 0, y: 0, z: 0 };
    
    this.coordinatesEnabled = true;
    this.movementEnabled = true;
    
    //this.interactionMode = InteractionMode.MOVE;
    
	
    //
    // Functions
    //
    
	this.loadModel = function (modelID) {
        var model = repo.getByID(modelID);
        
		switch (model.fileFormat) {
        case ModelFormat.OBJMTL:
            gfx.loadObjMtl(model.name, model.filePath, model.params.mtlPath, LOAD_MODELS_SOLO);
            break;
			
        case ModelFormat.DAE:
            gfx.loadDae(model.name, model.filePath, LOAD_MODELS_SOLO);
            break;
			
        default:
            break;
		}
        
        this.mouse
        
	};
	
    //
    // Data access
    //
    
	this.getAll = repo.getAll();

    
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
        var coords = gfx.getMouseWorldCoordinates($event);
        if (coords != null) {
            this.mouseCoordinates = coords;
        }
    };
	
}