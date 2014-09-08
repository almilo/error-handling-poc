angular.module('messages', ['ui.bootstrap'])
    .controller('messageController', function ($modalInstance) {
        this.ok = $modalInstance.close;
    })
    .factory('dialogService', function ($modal, $rootScope) {
        return {
            showMessage: function (title, message) {
                $modal.open({
                    templateUrl: 'dialogs/message.tpl.html',
                    controller: 'messageController as messageController',
                    scope: createScope({title: title, message: message})
                });
            }
        };

        function createScope(prototypicalScope) {
            var scope = $rootScope.$new(true);

            return angular.extend(scope, prototypicalScope)
        }
    });
