angular.module('app')
    .controller('homeController', function ($http, withLocalErrorHandling, dialogService) {
        var controller = this;

        this.makeRequest = function (fail, localErrorHandling) {
            if (localErrorHandling) {
                withLocalErrorHandling(performCall).then(mapItems).catch(function (rejection) {
                        clearItems();

                        dialogService.showMessage('Server error', 'Local: ' + rejection.statusText);
                    }
                );
            } else {
                performCall().then(mapItems).catch(clearItems);
            }

            function performCall() {
                var url = '/rest/items' + (fail ? '?fail=true' : '');

                return $http.get(url);
            }

            function mapItems(response) {
                controller.items = response.data;
            }

            function clearItems() {
                controller.items = [];
            }
        }
    });
