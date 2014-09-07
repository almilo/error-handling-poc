angular.module('app')
    .directive('fail', function ($http) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div><button ng-click="failController.performAction()">fail</button></div>',
            controllerAs: 'failController',
            controller: function () {
                var controller = this;

                controller.performAction = function () {
                    $http.post('/rest/fail');
                };
            }
        };
    });
