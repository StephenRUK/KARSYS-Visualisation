function ModelController(ModelRepo, GraphicsController) {
    /***********************************************
    * Private
    ***********************************************/

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

    this.coordinatesEnabled = true;
    this.movementEnabled = true;        // Enables/disabled movement controls
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
	};
	
	this.getAll = repo.getAll();
    
    this.toggleMovementControls = function() {
        gfx.enableMovement(this.movementEnabled);
    };
    
    this.toggleCoordinatesDisplay = function() {
        gfx.enableCoordinatesDisplay(this.coordinatesEnabled);
    };
	
}