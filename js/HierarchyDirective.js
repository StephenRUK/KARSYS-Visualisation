'use strict';

function HierarchyDirective(Graphics, ObjectDataService, $uibModal) {
    return {
        scope: {},
        
        controller: function ($scope) {
            var ods = ObjectDataService;
            
            $scope.objects = Graphics.getObjectHierarchy();
            
            $scope.updateHierarchy = function () {
                CollapsibleLists.applyTo(document.getElementById("objectHierarchy"));
        
                /*var hierarchyRootElement = document.getElementById('hierarchyRoot');
                if (hierarchyRootElement) {
                    hierarchyRootElement.click(); // Hackily expand first level
                }*/
            };
            
            $scope.showObjectInfo = function (name) {
                
                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/objectDetailDialog.html',
                    controller: 'ModalInfoController as modalCtrl',
                    backdrop: false,
                    resolve: {
                        objectName: function () {
                            return name;
                        },
                        objectInfo: function () {
                            if (ods.isValidID(name)) {
                                return ods.getObjectData(name);
                            }
                        }
                    }
                });

                modalInstance.result.then(function () {
                    console.info("Modal opened successfully!");
                }, function (error) {
                    console.warn("Object info modal couldn't be opened. error.");
                });

            };
        },
        
        templateUrl: 'partials/modelHierarchy.html'
    };
}