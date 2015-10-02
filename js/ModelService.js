/*
* ModelService.js
* Manages the list of available models.
*
* Date:		1st October 2015
* Author:	Stephen Randles
*/

function ModelServiceStatic() {

	var models = [
		new Model("Box", "models/Box/Box.obj", ModelFormat.OBJMTL),
		new Model("Cross Scene", "models/CrossScene/CrossScene.obj", ModelFormat.OBJMTL),
		new Model("Male Three.js example", "models/male02/male02.obj", ModelFormat.OBJMTL),
		new Model("Spaceship", "models/Spaceship/Spaceship.obj", ModelFormat.OBJMTL),
		new Model("House", "models/StephenHouse/StephenHouse.obj", ModelFormat.OBJMTL),
		new Model("KARSYS Model 1", "models/KARSYS_1/KARSYS_1.dae", ModelFormat.DAE)
	];

	this.getAll = function () {
		return models;
	};
    
    this.getByID = function(id) {
        return models[id];
    };

}