app.directive('username', ['localStorageService', function(localStorageService) {
    return {
        controller: function($scope, $element, $attrs, $transclude, UserService) {
            UserService.getUserDetails().then(function(usr) {
                $scope.user_info = usr.records[0];
                localStorageService.set('userName', usr.records[0].Name);
                localStorageService.set('userTitle', usr.records[0].Title);
                localStorageService.set('userEmail', usr.records[0].Email);
            }, function(err) {                
                $scope.user_info = {};
                $scope.user_info.Name = localStorageService.get('userName');
                $scope.user_info.Title = localStorageService.get('userTitle');
            });
        },
      
        template: '<div class="user-name">{{user_info.Name}}</div>' +
            '<div class="text-capitilize">{{user_info.Title}}</div>',
        link: function($scope, iElm, iAttrs, controller) {
        }
    };
}]);
app.directive('offline', [function() {
    return {
        template: '<div class="offline-div"><img src="assets/images/no-wifi.png" alt="OFFLINE" class="offline-img" /></div>',
        link: function($scope, iElm, iAttrs, controller) {
        }
    };
}]);
app.directive('syncup', ['localStorageService', function(localStorageService) {
    return {
        template: '<div class="syncup-div"><img src="assets/images/syncup.gif" alt="SYNCING" class="syncup-img" /></div>',
        controller: function($scope, SyncUpService) {
            SyncUpService.startReceived($scope, function() {
                angular.element('.syncup-img').show();
                localStorageService.set('syncup', true);
            });

            SyncUpService.stopReceived($scope, function() {
                angular.element('.syncup-img').hide();
                  localStorageService.set('syncup', false);
            });
        },
        link: function($scope, iElm, iAttrs, controller) {
        }
    };
}]);
app.directive('userdiv', ['$compile', function($compile) {
    return {
        compile: function(element, attrs) {
            var x = '<syncup></syncup><offline></offline><username></username>';
            element.append(x);
            $compile(x)(scope);
        },
        link: function($scope, iElm, iAttrs, controller) {
            
        }
    };
}]);
