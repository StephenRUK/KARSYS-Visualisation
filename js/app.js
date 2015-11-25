'use strict';

var app = angular.module('karsys', ['ui.bootstrap']);

app.value('canvasID', 'canvas');
app.value('arcGisAPI', 'http://localhost/backend/gisapi.php');

app.service('ModelRepo', ModelServiceStatic);
app.service('GraphicsSvc', ['canvasID', '$timeout', GraphicsService]);
app.service('ObjectDataService', ['arcGisAPI', '$http', ArcGisService]);

app.controller('ModelController', ['ModelRepo', 'GraphicsSvc', 'ObjectDataService', '$scope', '$uibModal', ModelController]);
app.controller('ModalInfoController', ['$modalInstance', 'objectName', 'objectInfo', ModalInfoController]);

app.directive('vkModelList', ['ModelRepo', 'GraphicsSvc', ModelListDirective]);
app.directive('vkControls', ['GraphicsSvc', ControlsDirective]);

app.filter('listObjectInTree', function () {
  return function (sceneObjects) {
    var filtered = [];
      
    for (var i = 0; i < sceneObjects.length; i++) {
      var item = sceneObjects[i];
        
      if (item.name.length > 0) {
        filtered.push(item);
      }
    }
      
    return filtered;
  };
});
app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});