app.controller('NavController', ['$scope','localStorageService','$state','force', function ($scope, localStorageService, $state, force) {

    var nav =  this;

    nav.logout = function() {
    	var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            navigator.notification.confirm(
	            'All offline data will be lost after logout',
	           	 nav.confirmLogout,
	            'Medvantage', 
	            ['Logout', 'Cancel']
        	);
        } else {
            nav.showAlertMessage('This functionality is not accessible offline');
        }
    };
    nav.goToInventory = function() {
    	var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            $state.go('app.inventorylist');
        } else {
            nav.showAlertMessage('You need internet connection to view the Inventory');
        }
    };

    nav.confirmLogout = function(buttonIndex) {
    	if(buttonIndex === 1) {
    		localStorageService.clearAll();
    		var sfOAuthPlugin  = cordova.require("com.salesforce.plugin.oauth");
  			sfOAuthPlugin.logout();	
    	}
    };

    nav.moduleArray = ['calendar', 'account', 'asset', 'contact', 'product','inventory','setting'];
	nav.mappingArr = [];
	angular.forEach(nav.moduleArray, function (value, index) {
		var obj = {};
		switch(value) {
			case 'account':
				obj = {'type': 'Accounts', 'url': 'app.accountlist', 'img': 'products.png'};
				break;
			case 'asset':
				obj = {'type': 'Assets', 'url': 'app.assetlist', 'img': 'products.png'};
				break;
			case 'calendar':
				obj = {'type': 'Calendar', 'url': 'app.calendar', 'img': 'calendar.png'};
				break;
			case 'contact':
				obj = {'type': 'Contacts', 'url': 'app.contactlist', 'img': 'contacts.png'};
				break;
			case 'product':
				obj = {'type': 'Products', 'url': 'app.productlist', 'img': 'products.png'};
				break;
			case 'inventory':
				obj = {'type': 'Inventory', 'url': 'app.inventorylist', 'img': 'products.png'};
				break;
			case 'setting':
				obj = {'type': 'Settings', 'url': 'app.settings', 'img': 'settings.png'};
				break;
			default:
				break;
		}
		nav.mappingArr.push(obj);
	});

	nav.showAlertMessage = function(message) {
        navigator.notification.alert(message, nav.alertDismissed, 'Medvantage', 'OK');
    };
    nav.alertDismissed = function() {};

}]);