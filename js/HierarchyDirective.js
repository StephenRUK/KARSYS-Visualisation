'use strict';

function HierarchyDirective(GraphicsService, $uibModal, $timeout) {
    return {
        scope: {},
        
        controller: function ($scope, $timeout) {
            $scope.objects = GraphicsService.getObjectHierarchy();
            
            function makeTreeCollapsible() {
                CollapsibleLists.applyTo(document.getElementById("objectHierarchy"));

                var hierarchyRootElement = document.getElementById('hierarchyRoot');
                if (hierarchyRootElement) {
                    hierarchyRootElement.click(); // Hackily expand first level
                }
            }
            
            $scope.$on('UPDATE', function () {
                $timeout(makeTreeCollapsible, 0, false);    // Schedule for next digest cycle, to ensure DOM element was updated
            });
            
            // TODO Move logic to ModelController or separate info modal service
            $scope.showObjectInfo = function (object) {
                
                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/objectDetailDialog.html',
                    controller: 'ModalInfoController as modalCtrl',
                    backdrop: false,
                    resolve: {
                        objectName: function () {
                            return object.name;
                        },
                        objectData: function () {
                            return object.userData;
                        }
                    }
                });

                modalInstance.result.then(function () {}, function (error) {
                    console.warn("Object info modal couldn't be opened. error.");
                });

            };
        },
        
        templateUrl: 'partials/modelHierarchy.html'
    };
}