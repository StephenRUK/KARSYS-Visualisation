function ObjectInfoController($uibModalInstance, ObjectDataService, SceneUtilsService, object) {
    var modal = this;

    this.loading = false;
    this.error = null;

    this.object = object;
    this.info = null;
    
    this.isolated = ('isolated' in object.userData);
    this.crossSectionSet = false;

    // Retrieve object info
    if ('id' in object.userData) {
        modal.loading = true;
        ObjectDataService.getObjectData(object.userData.id).then(
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
        SceneUtilsService.isolateObject(modal.object);
        modal.isolated = true;
    };
    
    this.deisolateObject = function () {
        SceneUtilsService.stopIsolation();
        modal.isolated = false;
    };
    
    this.setCrossSection = function () {
        SceneUtilsService.setCrossSectionToObjectPosition(modal.object);
        modal.crossSectionSet = true;
    };
    
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