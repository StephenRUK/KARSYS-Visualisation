var app = angular.module('karsys', ['ui.bootstrap']);

app.service('ModelRepo', ModelServiceStatic);

app.value('canvasID', 'canvas');
app.service('GraphicsSvc', ['canvasID', GraphicsService]);

app.controller('ModelController', ['ModelRepo', 'GraphicsSvc', '$scope', '$uibModal', ModelController]);
app.controller('ModalInfoController', ['$modalInstance', 'objectName', 'objectInfo', ModalInfoController]);

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