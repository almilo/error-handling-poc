angular.module('app')
    .directive('login', function (loginService, applicationEventBus) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div><button ng-click="loginController.performAction()" ng-bind="loginController.getAction()"></button></div>',
            controllerAs: 'loginController',
            controller: function () {
                var controller = this;

                controller.getAction = function () {
                    return controller.user ? 'logout' : 'login';
                };

                loginService.getUser().then(mapUser);

                applicationEventBus.on('userLoginStateChanged', function (user) {
                    controller.user = user;
                });

                controller.performAction = function () {
                    loginService[controller.getAction()]();
                };

                function mapUser(response) {
                    controller.user = response.data;
                }
            }
        };
    });
