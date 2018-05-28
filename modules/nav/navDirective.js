app.directive('logOut', ['localStorageService','$state',function (localStorageService,$state) {
	return {
		restrict: 'AE',
		link: function (scope, elem, iAttrs) {
			elem.click(function(){
					angular.element('#logout-modal').openModal();					
			});
		}
	};
}]);

app.directive('sideNav', [function () {
	return {
		restrict: 'AE',
		link: function (scope, iElement, iAttrs) {
			iElement.click(function () {
				console.log('clicked');
				angular.element('.button-collapse').sideNav({});
			});
		}
	};
}]);

