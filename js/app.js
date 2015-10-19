var app = angular.module('karsys', []);

app.service('ModelRepo', ModelServiceStatic);

app.value('canvasID', 'canvas');
app.service('GraphicsSvc', ['canvasID', GraphicsService]);

app.controller('ModelController', ['ModelRepo', 'GraphicsSvc', '$scope', ModelController]);

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