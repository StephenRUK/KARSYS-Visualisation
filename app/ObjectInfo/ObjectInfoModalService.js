function ObjectInfoModalService($uibModal) {
    this.openModal = function (object) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/ObjectInfo/ObjectInfoView.html',
            controller: 'ObjectInfoController as modalCtrl',
            backdrop: false,
            size: 'md',
            resolve: {
                object: function () {
                    return object;
                }
            }
        });

        modalInstance.result.then(
            function () { /* Success */},
            function (error) {
                console.warn("Object info popup couldn't be opened. Error.");
            }
        );

    };
}