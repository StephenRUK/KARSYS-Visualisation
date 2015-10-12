var app = angular.module('karsys', []);

app.service('ModelRepo', ModelServiceStatic);

app.value('canvasID', 'canvas');
app.service('GraphicsSvc', ['canvasID', GraphicsService]);

app.controller('ModelController', ['ModelRepo', 'GraphicsSvc', '$scope', ModelController]);