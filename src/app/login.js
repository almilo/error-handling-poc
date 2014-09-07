angular.module('app')
    .directive('login', function (loginService, applicationEventBus) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: '<div><button ng-click="loginController.performLoginAction()" ng-bind="loginController.getLoginAction()"></button></div>',
            controllerAs: 'loginController',
            controller: function () {
                var controller = this;

                controller.getLoginAction = function () {
                    return controller.user ? 'logout' : 'login';
                };

                loginService.getUser().then(mapUser);

                applicationEventBus.on('userLoginStateChanged', function (user) {
                    controller.user = user;
                });

                controller.performLoginAction = function () {
                    loginService[controller.getLoginAction()]();
                };

                function mapUser(response) {
                    controller.user = response.data;
                }
            }
        };
    });
