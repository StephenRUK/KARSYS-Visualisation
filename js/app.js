angular
 .module('VisualKarsys', [])
 .controller('GraphicsController', GraphicsController)
 .controller('ModelController', ['ModelRepo', 'GraphicsController', ModelController])
 .service('ModelRepo', ModelServiceStatic)
;