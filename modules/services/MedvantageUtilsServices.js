app.factory('MedvantageUtils', function($http) {

    var medConfigObject = null;

    function initializeMedConfigObject() {
        return $http({
            method: 'get',
            url: "assets/data/medvantageConfig.json"
        });
    }

    function setMedConfigData(data) {
        medConfigObject = data;
    }

    function getMedConfigData() {
        return medConfigObject;
    }

    function getMedSQlServerInstance() {
        // return 'MED_SQL_SERVICE_INSTANCE';
        return getMedConfigData().data.MED_SQL_SERVICE_INSTANCE;
    }

    function getMedSQlDataLimit() {
        return getMedConfigData().data.MED_SQL_DATA_LIMIT;
    }

    function checkInternetAvailability() {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        return states[networkState];
    }

    var MedvantageUtils = {
        initializeMedConfigObject: initializeMedConfigObject,
        getMedSQlServerInstance: getMedSQlServerInstance,
        setMedConfigData: setMedConfigData,
        getMedConfigData: getMedConfigData,
        getMedSQlDataLimit: getMedSQlDataLimit,
        checkInternetAvailability: checkInternetAvailability
    };

    return MedvantageUtils;
});

app.factory('SyncUpService', function($rootScope,localStorageService) {
    return {
        start: function() {
            // console.log('syncup started');
            // $rootScope.freezePendingRecords =  'true';  
            $rootScope.$emit('notifying-start-event');
        },
        startReceived: function(scope, callback) {
            // console.log('syncup start recieved');         
            var handler = $rootScope.$on('notifying-start-event', callback);
            scope.$on('$destroy', handler);
        },
        stop: function() {
            // console.log('syncup stopped');
             localStorageService.set('syncup', false);
           // $rootScope.freezePendingRecords =  'false'; 
            $rootScope.$emit('notifying-stop-event');
        },
        stopReceived: function(scope, callback) {
            // console.log('syncup stop recieved');
            var handler = $rootScope.$on('notifying-stop-event', callback);
            scope.$on('$destroy', handler);
        }
    };
});
