/*
* Model class
*
* Date:		1st October 2015
* Author:	Stephen Randles
*	
* Arguments:
*	- filePath		file path relative to root
*	- fileFormat	Value of type ModelFormat (OBJ, OBJMTL, DAE)
*	- params		Type-specific parameters of type ModelParams.
*/

var ModelFormat = {
	OBJ: 0,
	OBJMTL: 1,
	DAE: 2
};

var ModelParams = function ModelParams (modelFormat) {    
    var params = {};
    
    this.format = modelFormat;
    
    this.setParam = function (paramName, paramValue) {
        params.push(paramName, paramValue);
    };
    
};


var Model = function Model (name, filePath, fileFormat, params) {
	this.name = name;
	this.filePath = filePath;
	this.fileFormat = fileFormat;
	
	if (params != undefined) {
		this.params = params;
	}
	
	if (params == undefined && fileFormat == ModelFormat.OBJMTL) {
		// Assume MTL file is called the same as OBJ file
		// Better would be to read it from the file, but meh...
		this.params = {
			mtlPath: filePath.replace(".obj", ".mtl")
		};
	}
};