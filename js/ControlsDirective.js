'use strict';

function ControlsDirective(Graphics) {
    return {
        scope: {
            coordinatesEnabled: '=',
            movementEnabled: '='
        },
        
        controller: function ($scope) {
            $scope.toggleMovementControls = Graphics.toggleMovementControls;
        },
        
        templateUrl: 'partials/controls.html'
    };
}