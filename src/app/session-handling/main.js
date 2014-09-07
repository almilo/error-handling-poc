angular.module('session-handling', [])
    .factory('unauthorizedInterceptor', function ($q, $injector, loginService) {
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
                            return getHttp()(config);
                        };
                    }
                }

                function reject(rejection) {
                    return $q.reject(rejection);
                }

                function getHttp() {
                    return $injector.get('$http');
                }

            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('unauthorizedInterceptor');
    });
