angular.module('app')
    .directive('login', function ($http) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: '<div><button ng-click="doAction()" ng-bind="action()"></button></div>',
            link: function (scope) {
                scope.action = getAction;

                scope.doAction = function () {
                    var actionUrl = '/rest/' + getAction();

                    $http.post(actionUrl).then(mapUser);
                };

                $http.get('/rest/user').then(mapUser);

                function getAction() {
                    return scope.user ? 'logout' : 'login';
                }

                function mapUser(response) {
                    scope.user = response.data;
                }
            }
        };
    });
