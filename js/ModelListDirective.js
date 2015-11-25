'use strict';

function ModelListDirective(ModelRepo, Graphics) {
    return {
        scope: {},
        
        controller: function ($scope) {
            var model;
            
            function loadCompleted() {
                if (model.params.transform) {
                    Graphics.translateObject(model.name, model.params.transform.offset);
                    Graphics.scaleObject(model.name, model.params.transform.scale);
                }
            }
            
            $scope.currentModelID;
            
            $scope.models = ModelRepo.getAll();
            
            $scope.loadModel = function (modelID) {
                model = ModelRepo.getByID(modelID);
                Graphics.resetScene();

                switch (model.fileFormat) {
                case ModelFormat.OBJMTL:
                    Graphics.loadObjMtl(model.name, model.filePath, model.params.mtlPath, loadCompleted);
                    break;

                case ModelFormat.DAE:
                    Graphics.loadDae(model.name, model.filePath, loadCompleted);
                    break;

                default:
                    break;
                }
            };
  
        },
        
        templateUrl: 'partials/modelList.html'
    };
}