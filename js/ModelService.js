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
            transform: {
                scale: {x: 2, y: 2, z: 2 }
            },
            mtlPath:  "models/Box/Box.mtl"
        }),
		new Model("Cross Scene", "models/CrossScene/CrossScene.obj", ModelFormat.OBJMTL, { mtlPath: "models/CrossScene/CrossScene.mtl"}),
		new Model("Male Three.js example", "models/male02/male02.obj", ModelFormat.OBJMTL, { mtlPath: "models/male02/male02.mtl"}),
		new Model("Spaceship", "models/Spaceship/Spaceship.obj", ModelFormat.OBJMTL, { mtlPath: "models/Spaceship/Spaceship.mtl"}),
		new Model("House", "models/StephenHouse/StephenHouse.obj", ModelFormat.OBJMTL, { mtlPath: "models/StephenHouse/StephenHouse.mtl"}),
		new Model("KARSYS Model 1", "models/KARSYS_1/KARSYS_1.dae", ModelFormat.DAE),
		//new Model("ISSKA 3D (level 5)", "models/ISSKA_3D/Model_isska3d_5.dae", ModelFormat.DAE),
		new Model("ISSKA 3D (level 6)", "models/ISSKA_3D/Model_isska3d_6.dae", ModelFormat.DAE, {
            coordinatesTransform: new CoordinatesTransform(1000, 100, 0,  1, 1, 1),
            unit: "km",
            transform: {
                scale: { x:0.2, y: 0.2, z: 0.2 }
            }
        })
	];

	this.getAll = function () {
		return models;
	};
    
    this.getByID = function (id) {
        return models[id];
    };

}