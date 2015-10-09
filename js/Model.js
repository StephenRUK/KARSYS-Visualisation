/*
* Model class
*
* Date:		1st October 2015
* Author:	Stephen Randles
*	
* Arguments:
*	- filePath		file path relative to root
*	- fileFormat	Value of type ModelFormat (OBJ, OBJMTL, DAE)
*	- params		Valid parameters: coordinatesTransform, mtlPath
*/

var ModelFormat = {
	OBJ: 0,
	OBJMTL: 1,
	DAE: 2
};

var CoordinatesTransform = function CoordinatesTransform(offsetX, offsetY, offsetZ, scaleX, scaleY, scaleZ) {
    this.offset = {x: offsetX, y: offsetY, z: offsetZ };
    this.scale = {x: scaleX, y: scaleY, z: scaleZ };
};

var Model = function Model(name, filePath, fileFormat, params) {
	this.name = name;
	this.filePath = filePath;
	this.fileFormat = fileFormat;
	this.params = {};
    
	if (params) {
		this.params = params;
	}
    
};