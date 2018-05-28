app.directive('ngTranslateLanguageSelect', function ($translate,LocaleService,localStorageService) {

        return {
            restrict: 'A',
            replace: true,
            template: ''+
            ''+
                '<label class="item item-input item-select item1">'+
                    '<div class="input-label">'+
				      '{{"setting.index.language" | translate}}'+
				    '</div>'+                   
                    '<select ng-model="currentLocaleDisplayName"'+
                        'ng-options="localesDisplayName for localesDisplayName in localesDisplayNames"'+
                        'ng-change="changeLanguage(currentLocaleDisplayName)">'+
                    '</select>'+
                '</label>'+
            ''+
            '',
            controller: function ($scope) {
                $scope.currentLocaleDisplayName = LocaleService.getLocaleDisplayName();                
                $scope.localesDisplayNames = LocaleService.getLocalesDisplayNames();
                $scope.visible = $scope.localesDisplayNames &&
                $scope.localesDisplayNames.length > 1;
                $scope.changeLanguage = function (locale) {
                    LocaleService.setLocaleByDisplayName(locale);
                };
            }
        };
    });
