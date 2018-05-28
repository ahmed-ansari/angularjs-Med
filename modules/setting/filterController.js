app.controller('filterController', ['$scope', 'localStorageService', function ($scope, localStorageService) {
	var filter = this;

	//Default value of filter is 7 days
	var filterValue = localStorageService.get("filterValue");

	if (filterValue === null) {
		filter.filterDays = 7;
	} else {
		filter.filterDays = filterValue;
	}

	filter.changeFilter = function (value) {
		filter.filterDays = value;
		localStorageService.set("filterValue", value);
	};

}]);