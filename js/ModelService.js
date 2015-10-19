/*
* ModelService.js
* Manages the list of available models.
*
* Date:		1st October 2015
* Author:	Stephen Randles
*/

function ModelServiceStatic() {

	var models = [
		new Model("Box", "models/Box/Box.obj", ModelFormat.OBJMTL, {
            unit: "cm",
            transform: new Transform(10, 10, 10, 3, 3, 3),
            mtlPath:  "models/Box/Box.mtl"
        }),
		new Model("Cross Scene", "models/CrossScene/CrossScene.obj", ModelFormat.OBJMTL, { mtlPath: "models/CrossScene/CrossScene.mtl"}),
		new Model("Male Three.js example", "models/male02/male02.obj", ModelFormat.OBJMTL, { mtlPath: "models/male02/male02.mtl"}),
		new Model("Spaceship", "models/Spaceship/Spaceship.obj", ModelFormat.OBJMTL, { mtlPath: "models/Spaceship/Spaceship.mtl"}),
		new Model("House", "models/StephenHouse/StephenHouse.obj", ModelFormat.OBJMTL, { mtlPath: "models/StephenHouse/StephenHouse.mtl"}),
		new Model("KARSYS Model 1", "models/KARSYS_1/KARSYS_1.dae", ModelFormat.DAE, {
            transform: new Transform(10, 10, 10, 5, 5, 5)
        }),
		new Model("ISSKA 3D (level 6)", "models/ISSKA_3D/Model_isska3d_6.dae", ModelFormat.DAE, {
            coordinatesTransform: new Transform(1000, 100, 0,  1, 1, 1),
            unit: "km",
            transform: new Transform(0, 0, 0, 0.1, 0.1, 0.1)
        })
	];
    
    var modelObjectInfo = [
        {
            model: "Spaceship",
            object: "Booster_Blade_001",
            info: "Helps propel the ship!"
        }
    ]

	this.getAll = function () {
		return models;
	};
    
    this.getByID = function (id) {
        return models[id];
    };
    
    this.getObjectInfo = function (modelName, objName) {
        for (var i=0; i<modelObjectInfo.length; i++) {
            if (modelObjectInfo[i].model == modelName && modelObjectInfo[i].object == objName) {
                return modelObjectInfo[i].info;
            }
        }
    }

}