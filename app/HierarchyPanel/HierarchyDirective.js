'use strict';

function HierarchyDirective(GraphicsService, $uibModal, $timeout) {
    return {
        scope: {},
        
        controller: function ($scope, $timeout) {
            $scope.objects = GraphicsService.getObjectHierarchy();
            var highlightColor = 0xffb3b3;
            
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
            
            $scope.objectMouseOver = function(object) {
                GraphicsService.highlightObject(object.name, highlightColor);
            };
            
            $scope.objectMouseOut = function(object) {
                GraphicsService.unhighlightObject(object.name);
            };
            
            $scope.toggleVisibility = function (object, show) {
                // Visibility after model change
                if (show) {
                    GraphicsService.showChildren(object.name);
                } else {
                    GraphicsService.hideChildren(object.name);
                }
            };
            
            // TODO Move logic to ModelController or separate info modal service
            $scope.showObjectInfo = function (object) {
                
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/ObjectInfo/ObjectInfoView.html',
                    controller: 'ObjectInfoController as modalCtrl',
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
        
        templateUrl: 'app/HierarchyPanel/HierarchyView.html'
    };
}