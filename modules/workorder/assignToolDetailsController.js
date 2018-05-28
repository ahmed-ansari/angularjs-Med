app.controller('AssignToolDetailsCtrl', function ($scope, $stateParams, $state, AssignToolDetailService, $ionicLoading, SharedPreferencesService, ActivityService, $timeout, NetworkService, $ionicHistory) {
	var assignDetails = this;

	$ionicLoading.show({
      template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

	function showMessage(message) {
        navigator.notification.alert(message, alertDismissed, 'Medvantage', 'OK');
    }

    function alertDismissed() {}

    assignDetails.WOA = SharedPreferencesService.getWorkOrderActivity();

	AssignToolDetailService.fetchAssignedTool($stateParams.assignToolId).then(function (data) {
		assignDetails.WO = data.records[0];

		AssignToolDetailService.fetchToolDetails(data.records[0].MedConnectDev__Tool__c).then(function (record) {
			assignDetails.detail = record.records[0];
			$timeout(function() {
                angular.element('.item-note').show().css('color', 'black');
            }, 800);
			$ionicLoading.hide();
			
		}, function (err) {
			$ionicLoading.hide();
			if (NetworkService.isDeviceOnline()) {
               	showMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            }
		});
	}, function (err) {
		$ionicLoading.hide();
		if (NetworkService.isDeviceOnline()) {
            showMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
        }
	});
});