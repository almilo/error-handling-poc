angular.module('app', ['ngRoute', 'error-handling', 'session-handling', 'messages', 'serialization'])
    .factory('applicationEventBus', function ($rootScope) {
        return {
            on: on,
            fire: fire
        };

        function on(eventName, eventListener) {
            $rootScope.$on(eventName, adapt(eventListener));

            function adapt(eventListener) {
                return function (event, payload) {
                    eventListener(payload);
                }
            }
        }

        function fire(eventName, eventPayload) {
            $rootScope.$emit(eventName, eventPayload);
        }
    })
    .factory('loginService', function ($injector, applicationEventBus) {
        var restUrl = '/rest/';

        return {
            login: post('login'),
            logout: post('logout'),
            getUser: getUser

        };

        function getUser() {
            return getHttp().get(restUrl + 'user');
        }

        function post(action) {
            return function () {
                return getHttp().post(restUrl + action)
                    .then(broadcastUserStateChange);
            }
        }

        function getHttp() {
            return $injector.get('$http');
        }

        function broadcastUserStateChange(response) {
            applicationEventBus.fire('userLoginStateChanged', response.data);
        }
    })
    .config(function ($routeProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'home.tpl.html',
                controller: 'homeController',
                controllerAs: 'homeController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    })
    .run(function (applicationEventBus, dialogService) {
        applicationEventBus.on('serverRequestFailed', function (rejection) {
            dialogService.showMessage('Server error', 'Global: ' + rejection.statusText);
        })
    });
