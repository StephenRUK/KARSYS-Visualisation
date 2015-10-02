function ModelController(ModelRepo, GraphicsController) {
	var repo = ModelRepo;
	var gfx = GraphicsController;
	
	this.loadModel = function (model) {
		switch (model.fileFormat) {
        case ModelFormat.OBJMTL:
            gfx.loadObjMtl(model.filePath, model.params.OBJMTL.mtlPath);
            break;
			
        case ModelFormat.DAE:
            gfx.loadDae(model.filePath);
            break;
			
        default:
            break;
		}
	};
	
	this.getAll = function () {
		repo.getAll();
	};
	
	
}