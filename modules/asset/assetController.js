app.controller('AssetListCtrl', function($scope, force, $ionicModal, AssetsService, localStorageService, $ionicLoading, DataService, SOUPINFO) {

    var assetlist = this;
    assetlist.no_asset = 'No record Found!';
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    var filterValue = localStorageService.get("filterValue");
    if (filterValue === null) {
        assetlist.filterDays = 7;
    } else {
        assetlist.filterDays = filterValue;
    }

    assetlist.noMoreItemsAvailable = true;
    assetlist.loggedInId = '';

    var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfOAuthPlugin.getAuthCredentials(function(usr) {
        assetlist.loggedInId = usr.userId;
        assetlist.callList(assetlist.filterContact, assetlist.loggedInId);
    });

    var rec_entries = localStorageService.get('maxRecords');
    if (rec_entries === null) {
        localStorageService.set('maxRecords', 20);
        rec_entries = 20;
    }
    /** 
    *   Desc - fetches assets list
    *   @param - days - [number of days], userId [loggedIn user Id]
    */
    assetlist.callList = function(days, userId) {
        DataService.getSoupData(SOUPINFO.assetsList, rec_entries).then(
            function(entries) {
                assetlist.assets = entries.currentPageOrderedEntries;
                assetlist.noMoreItemsAvailable = true;
                $ionicLoading.hide();
            },
            function(err) {
                assetlist.assets = [];
                $ionicLoading.hide();
            }
        );
        $ionicLoading.hide();
    };

    assetlist.entries = 0;
})

.controller('AssetCtrl', function($window, $scope, $stateParams, AssetsService, $q, $ionicLoading, DataService, SOUPINFO, force, AssetNetworkService,$timeout) {
    var singleasset = this;
    var assetsSubModulesList = ["asset", "work_order", "service_contract"];
    singleasset.dontProceed = false;

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfOAuthPlugin.getAuthCredentials(successCall, failureCall);
    /** 
    *   Desc - set asset page height
    *   @param - none
    */
    function setAssetHt() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subNameHt = $(".subTopHdr").outerHeight(true);
        var subHeaderHt = $(".subtmHdr").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var subCtInfo = $(".cntInfo").outerHeight(true);
        //Adding 40px as buffer
        var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt + 40);
        var cntCtOthersHt = windowHt - (headerHt + subNameHt + subHeaderHt + subCtInfo + tabHt + 40);
        $(".scrollAtHtGI").css({ "height": cntCtHt, "overflow": "auto" });
        $(".scrollAtHt").css({ "height": cntCtOthersHt, "overflow": "auto" });
    }

    function cleanUp() {
        angular.element($window).off('resize', setAssetHt);
    }

    $scope.$on('$destroy', cleanUp);

    function successCall(data) {
        $scope.userTechId = data.userId;

        //Calling service for assets
        var assetsID = $stateParams.assetId;
        var aspromise1 = AssetsService.getAssetById(assetsID);
        var aspromise2 = AssetsService.getAssetWorkOrder(assetsID);
        var aspromise3 = AssetsService.getAssetServiceContract(assetsID);
        $q.all([aspromise1, aspromise2, aspromise3]).
        then(
            function(asdata) {
                singleasset.asset = asdata[0].records[0];
                singleasset.work_order = asdata[1].records;
                singleasset.service_contract = asdata[2].records;
                angular.element($window).on('resize', setAssetHt);

                $ionicLoading.hide();

                angular.forEach(assetsSubModulesList, function(module) {
                    storeAssetsDataInOffline(module, assetsID);
                });

                 $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                    setAssetHt();
                }, 800);
            },
            function(err) {
                if (AssetNetworkService.isDeviceOnline()) {
                    $scope.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error message: ' + err[0].message);
                    return;
                } else {
                    angular.forEach(assetsSubModulesList, function(module) {
                        getAssetsDataFromOffline(module, assetsID);
                    });

                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                        setAssetHt();
                    }, 800);
                }
            }
        );
    }

    function failureCall(data) {
        console.log("Failure Callback is: ", data);
    }
    /** 
    *   Desc - store offline data in soup
    *   @param - none
    */
    function storeAssetsDataInOffline(type, assetsId) {
        var configObject = getAssetsPreFilledJSONArray(type);
        var AssetsDetailsArr = [];
        var AssetsDetailsObj = {};
        AssetsDetailsObj.Id = assetsId;
        AssetsDetailsObj.data = singleasset[type];
        AssetsDetailsArr.push(AssetsDetailsObj);
        DataService.setSoupData(configObject.soupName, AssetsDetailsArr);
    }
    /** 
    *   Desc - fetch offline data from soup
    *   @param - type [ tabs of asset], asset Id[asset Id]
    */
    function getAssetsDataFromOffline(type, assetsId) {
        if (singleasset.dontProceed) {
            return;
        }

        var configObject = getAssetsPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName).then(
            function(entries) {
                var assetsIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === assetsId) {
                        return index;
                    }
                });
                if (assetsIdIndex.length === 0) {
                    if (singleasset.asset === undefined && singleasset.dontProceed === false) {
                        singleasset.dontProceed = true;
                        $scope.showAlertMessage('No Offline Data Found');
                        return;
                    }
                }
                singleasset[type] = entries.currentPageOrderedEntries[assetsIdIndex].data;
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }
    /** 
    *   Desc - Maps the soups names to the tabs of asset pages for showing data in offline
    *   @param - type [ tabs of asset]
    */
    function getAssetsPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'asset':
                configJSON.soupName = SOUPINFO.assetsDetails;
                return configJSON;
            case 'work_order':
                configJSON.soupName = SOUPINFO.assetsWorkOrderDetails;
                return configJSON;
            case 'service_contract':
                configJSON.soupName = SOUPINFO.assetsServiceContractDetails;
                return configJSON;
        }
    }

});
