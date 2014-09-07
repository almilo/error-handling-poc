angular.module('app', ['ngRoute'])
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
    .factory('unauthorizedInterceptor', function ($q, loginService, $injector) {
        return {
            responseError: function (rejection) {
                return canRecover(rejection) ? retry(rejection) : reject(rejection);

                function canRecover(rejection) {
                    return rejection.status === 401;
                }

                function retry(rejection) {
                    return loginService.login().then(retryRequest(rejection.config));

                    function retryRequest(config) {
                        return function () {
                            var $http = $injector.get('$http');

                            return $http(config);
                        };
                    }
                }
            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('unauthorizedInterceptor');
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
    });
