/*
* ModelService.js
* Manages the list of available models.
*
* Date:		24th November 2015
* Author:	Stephen Randles
*/

function ModelServiceStatic() {

	var models = [
		new Model(0, "Box", "models/Box/Box.obj", ModelFormat.OBJMTL, {
            unit: "cm",
            transform: new Transform(0, 0, 0, 3, 3, 3),
            mtlPath:  "models/Box/Box.mtl"
        }),
		new Model(1, "Male Three.js example", "models/male02/male02.obj", ModelFormat.OBJMTL, { mtlPath: "models/male02/male02.mtl"}),
		new Model(2, "Spaceship", "models/Spaceship/Spaceship.obj", ModelFormat.OBJMTL, { mtlPath: "models/Spaceship/Spaceship.mtl"}),
		new Model(3, "KARSYS Model 1", "models/KARSYS_1/KARSYS_1.dae", ModelFormat.DAE, {
            transform: new Transform(10, 10, 10, 5, 5, 5)
        }),
		new Model(4, "ISSKA 3D (level 6)", "models/ISSKA_3D/Model_isska3d_6.dae", ModelFormat.DAE, {
            coordinatesTransform: new Transform(1000, 100, 0,  1, 1, 1),
            unit: "km",
            transform: new Transform(0, 0, 0, 0.1, 0.1, 0.1)
        }),
        new Model(5, "Tunnel", "models/Tunnel/Tunnel.dae", ModelFormat.DAE),
        new Model(6, "ArcGIS Test", "models/ArcGIS_Test/ArcGIS_Test.dae", ModelFormat.DAE)
	];

	this.getAll = function () {
		return models;
	};
    
    this.getByID = function (id) {
        return models[id];
    };

}