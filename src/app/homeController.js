angular.module('app')
    .controller('homeController', function ($http) {
        var controller = this;

        this.makeRequest = function () {
            $http.get('/rest/items').then(mapItems);

            function mapItems(response) {
                controller.items = response.data;
            }
        }
    });
