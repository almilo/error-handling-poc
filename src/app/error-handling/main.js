var WITH_GENERIC_ERROR_HANDLING = 'X-WITH-GENERIC-ERROR-HANDLING';

angular.module('error-handling', [])
    .config(function ($provide) {
        $provide.decorator('$http', function ($delegate, withLocalErrorHandling) {
            var extend = angular.extend, forEach = angular.forEach;

            return decorateHttp($delegate);

            function decorateHttp($http) {
                var decoratedHttp = function (config) {
                    return $http(decorateConfig(config));
                };

                decoratedHttp = extend(decoratedHttp, $http);

                forEach(['head', 'get', 'delete', 'jsonp'], function (methodName) {
                    decoratedHttp[methodName] = function (url, config) {
                        return $http[methodName](url, decorateConfig(config));
                    };
                });

                forEach(['post', 'put'], function (methodName) {
                    decoratedHttp[methodName] = function (url, data, config) {
                        return $http[methodName](url, data, decorateConfig(config));
                    };
                });

                return decoratedHttp;

                function decorateConfig(config) {
                    config = config || {};
                    config.headers = config.headers || {};
                    config.headers[WITH_GENERIC_ERROR_HANDLING] = !withLocalErrorHandling.inProgress();

                    return config;
                }
            }
        });
    })
    .factory('withLocalErrorHandling', function () {
        var inProgress = false,
            withLocalErrorHandling = function (block) {
                inProgress = true;
                try {
                    return block();
                } finally {
                    inProgress = false;
                }
            };

        withLocalErrorHandling.inProgress = function () {
            return inProgress;
        };

        return withLocalErrorHandling;
    })
    .factory('errorHandlingInterceptor', function ($q, $injector, applicationEventBus) {
        return {
            responseError: function (rejection) {
                if (shouldHandleGenerically(rejection)) {
                    applicationEventBus.fire('serverRequestFailed', rejection);
                }

                return $q.reject(rejection);

                function shouldHandleGenerically(rejection) {
                    var config = rejection.config;

                    return config && config.headers && config.headers[WITH_GENERIC_ERROR_HANDLING];
                }
            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorHandlingInterceptor');
    });
