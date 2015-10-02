function ModelController(ModelRepo, GraphicsController) {
	var repo = ModelRepo;
	var gfx = GraphicsController;
    
    var LOAD_MODELS_SOLO = true;
    
    this.test = "Hello from ModelController!";
    
    this.currentModel = null;
	
	this.loadModel = function (modelID) {
        var model = repo.getByID(modelID);
        
		switch (model.fileFormat) {
        case ModelFormat.OBJMTL:
            gfx.loadObjMtl(model.name, model.filePath, model.params.mtlPath, LOAD_MODELS_SOLO);
            break;
			
        case ModelFormat.DAE:
            gfx.loadDae(model.filePath);
            break;
			
        default:
            break;
		}
	};
	
	this.getAll = repo.getAll();	
	
}