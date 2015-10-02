/*
* ModelService.js
* Manages the list of available models.
*
* Date:		1st October 2015
* Author:	Stephen Randles
*/

function ModelServiceStatic() {

	var models = [
		new Model("Box", "Box/Box.obj", ModelFormat.OBJMTL),
		new Model("Cross Scene", "CrossScene/CrossScene.obj", ModelFormat.OBJMTL),
		new Model("male02", "Male Three.js example", ModelFormat.OBJMTL),
		new Model("Spaceship", "Spaceship", ModelFormat.OBJMTL),
		new Model("StephenHouse", "House Architecture"),
		new Model("KARSYS_1/KARSYS_1.dae", ModelFormat.DAE)
	];

	this.getAll = function () {
		return models;
	};
	
	


}