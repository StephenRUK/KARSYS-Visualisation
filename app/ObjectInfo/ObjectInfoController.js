function ObjectInfoController($uibModalInstance, ObjectDataService, GraphicsService, object) {
    var modal = this;
    
    this.loading = false;
    this.error = null;
    
    this.name = object.name;
    this.isolated = ('isolated' in object.userData);
    this.info = null;

    if ('id' in object.userData) {
        var objectID = object.userData.id;
        modal.loading = true;
        ObjectDataService.getObjectData(objectID).then(
            function success(response) {
                var data = response.data;
                if (data.error) {
                    modal.error = data.error;
                } else {
                    modal.info = data;
                }
                modal.loading = false;
            },
            function error(response) {
                modal.error = 'Data could not be retrieved';
                modal.loading = false;
            }
        );
    }
    
    this.isolateObject = function () {
        GraphicsService.isolateObject(object.name);
        modal.isolated = true;
    }
    
    this.deisolateObject = function () {
        GraphicsService.stopIsolation();
        modal.isolated = false;
    }
    
    this.keyHandler = function ($event) {
        // ENTER or ESCAPE pressed?
        if ($event.keyCode == 13 || $event.keyCode == 27) {
            $uibModalInstance.close();
        }
    };

    this.ok = function () {
        $uibModalInstance.close();
    };
}