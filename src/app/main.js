angular.module('app', ['ngRoute'])
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
