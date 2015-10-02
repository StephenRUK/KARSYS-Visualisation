var app = angular.module('karsys', []);

app.service('ModelRepo', ModelServiceStatic);

app.value('htmlContainerID', 'visualisation');
app.service('GraphicsSvc', ['htmlContainerID', GraphicsService]);

app.controller('ModelController', ['ModelRepo', 'GraphicsSvc', ModelController]);