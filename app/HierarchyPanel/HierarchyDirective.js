'use strict';

function HierarchyDirective(GraphicsService, ObjectInfoModalService, $timeout) {
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
            
            $scope.toggleVisibility = function(object, show) {
                // Visibility after model change
                if (show) {
                    GraphicsService.restoreChildVisibility(object, true);
                } else {
                    GraphicsService.hideChildren(object, true);
                }
            };
            
            // TODO Move logic to ModelController or separate info modal service
            $scope.showObjectInfo = function (object) {
                ObjectInfoModalService.openModal(object);
            };
        },
        
        templateUrl: 'app/HierarchyPanel/HierarchyView.html'
    };
}