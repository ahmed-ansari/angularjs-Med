app.controller('syncController', function($scope, $state, DataService, MedSyncDownDataSQLService, $q, SOUPINFO, MedvantageUtils, $ionicLoading, localStorageService, $ionicHistory) {

        var syncSettings = this;

        syncSettings.SyncSettingPreferences = [
            { position: 0, text: 'Account List', soupObject: 'accountList', shortcutName: 'Account' },
            { position: 1, text: 'Contact List', soupObject: 'contactList', shortcutName: 'Contact' },
            { position: 2, text: 'Product List', soupObject: 'productList', shortcutName: 'Product' },
            { position: 3, text: 'Asset List', soupObject: 'assetsList', shortcutName: 'Asset' },
            { position: 4, text: 'Codes List', soupObject: 'codesList', shortcutName: 'Code' },
            { position: 5, text: 'Product Price List', soupObject: 'productPriceList', shortcutName: 'ProductPrice' },
            { position: 6, text: 'Technician Rate/Hr List', soupObject: 'technicianRateHrList', shortcutName: 'TechnicianRateHr' }
        ];

        syncSettings.syncCodesPreferences = [
            { soupObject: 'masterAnalysisCodeList', shortcutName: 'MasterAnalysisCode' },
            { soupObject: 'masterFaultCodeList', shortcutName: 'MasterFaultCode' },
            { soupObject: 'subCodeList', shortcutName: 'SubCode' }
        ];

        $scope.checkedItems = {};
        syncSettings.isListSelected = false;


        $scope.filterValues = [{
            value: '1',
            displayValue: '1 day'
        }, {
            value: '3',
            displayValue: '3 days'
        }, {
            value: '7',
            displayValue: '7 days'
        }, {
            value: '15',
            displayValue: '15 days'
        }, {
            value: '30',
            displayValue: '30 days'
        }, {
            value: '60',
            displayValue: '60 days'
        }];

        var filterDays = localStorageService.get("filterValue");

        if (filterDays === null) {
            $scope.filterValue = {
                value: '7'
            };
            localStorageService.set("filterValue", "7");
        } else {
            $scope.filterValue = {
                value: '' + filterDays + ''
            };
        }

        var bool = false;
        syncSettings.changeList = function(val) {
            bool = false;
            for (var pos in $scope.checkedItems) {
                if ($scope.checkedItems[pos] === true) {
                    bool = true;
                }
            }

            if (bool) {
                syncSettings.isListSelected = true;
            } else {
                syncSettings.isListSelected = false;
            }
        };

        syncSettings.invokeSyncDownServiceRequest = function() {

            var selectedSyncModulesList = [];
            for (var pos in $scope.checkedItems) {
                if ($scope.checkedItems[pos] === true) {
                    selectedSyncModulesList.push(syncSettings.SyncSettingPreferences[pos]);
                }
            }

            var getInternetConnectivity = MedvantageUtils.checkInternetAvailability();
            if (getInternetConnectivity != 'No network connection' && getInternetConnectivity != 'Unknown connection') {
                syncSettings.generateSyncDownRequest(selectedSyncModulesList);
            } else {
                syncSettings.showMessage('No network available. Please try again');
            }
        };

        syncSettings.generateSyncDownRequest = function(selectedSyncModulesList) {

            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            localStorageService.set('filterValue', $scope.filterValue.value);
            var filter = $scope.filterValue.value;

            var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
            sfOAuthPlugin.getAuthCredentials(function(usr) {

                var promises = [];
                for (var len in selectedSyncModulesList) {
                    if (selectedSyncModulesList[len].shortcutName.toLowerCase() === 'code') {
                        for (var dataLen in syncSettings.syncCodesPreferences) {
                            var soupObj = syncSettings.syncCodesPreferences[dataLen].soupObject;
                            var moduleName = syncSettings.syncCodesPreferences[dataLen].shortcutName;
                            promises.push(DataService.syncDownData(SOUPINFO[soupObj], MedSyncDownDataSQLService.startSyncDownData(moduleName, filter, usr.userId)));
                        }
                    } else {
                        var soupObj = selectedSyncModulesList[len].soupObject;
                        var moduleName = selectedSyncModulesList[len].shortcutName;
                        promises.push(DataService.syncDownData(SOUPINFO[soupObj], MedSyncDownDataSQLService.startSyncDownData(moduleName, filter, usr.userId)));
                    }

                }

                $q.all(promises).then(function(result) {
                    $ionicLoading.hide();
                    syncSettings.showMessage('Sync was successfull');
                }, function(err) {
                    $ionicLoading.hide();
                    console.log("DONE--err--->>>>>>>>>>" + err);
                });
            });

        };

        syncSettings.showMessage = function(message) {
            navigator.notification.alert(message, alertDismissed, 'Medvantage', 'OK');
        };

        function alertDismissed() {
            $state.go('app.settings');
        }

        syncSettings.cancelSync = function() {
            $ionicHistory.goBack();
        };

    })
.controller('offlineController', function($scope, $state, DataService, $q, SOUPINFO, $ionicLoading, $ionicPopover, $location, $window, NetworkService, $timeout, $rootScope) {

        var offlineData = this;
        offlineData.checkedItems = {};
        offlineData.SelectPendingAllIsVisible = true;
        offlineData.SelectSuccessAllIsVisible = true;
        offlineData.SelectFailedAllIsVisible = true;
        $scope.global = $rootScope;

        setOfflineHeight();

        offlineData.lockThenProceed = function(obj) {
            console.log('$rootScope.freezePendingRecords', $rootScope.freezePendingRecords);
            if ($rootScope.freezePendingRecords === 'true') {
                return;
            }

            // var offlineObj = {
            //     "action": obj.action,
            //     "type": obj.type,
            //     "Name": obj.Name,
            //     "WOName": obj.WOName,
            //     "object": obj.object,
            //     "data": obj.data,
            //     "randomId": obj.randomId,
            //     "resync": obj.resync,
            //     "createdDate": obj.createdDate,
            //     "href": obj.href,
            //     "params": (obj.params) ? obj.params : '',
            //     "lock": true
            // };

            // if (obj.type === "RA") {
            //     SharedPreferences.setOfflineRAId(obj.randomId);
            // }
            obj.lock = true;
            console.log('locked obj',obj);
            DataService.setOfflineSoupData(obj).then(function() {
            // DataService.setOfflineSoupData(offlineObj).then(function() {
                console.log('obj.href.split("#")[1]',obj.href.split("#")[1]);
                $location.path(obj.href.split("#")[1]);
            });
        };

        // $ionicPopover.fromTemplateUrl('modules/setting/offlinePopover.html', {
        //     scope: $scope
        // }).then(function(popover) {
        //     offlineData.popover = popover;
        // });

        offlineData.getSelectedPendingRecords = function(item) {
            offlineData.SelectPendingAllIsVisible = false;
            offlineData.countCheckPending = 0;
            angular.forEach(item, function(val) {
                if (val.checked === true) {
                    ++offlineData.countCheckPending;
                }
            });
            if (offlineData.countCheckPending === 0) {
                offlineData.SelectPendingAllIsVisible = true;
            }
        };

        offlineData.selectAllPendingItems = function() {
            if ($rootScope.freezePendingRecords === 'true') {
                console.log('records are being syncing , ..');
                return;
            }
            console.log('offlineData.offlineRecords', offlineData.offlineRecords);
            if (offlineData.offlineRecords.length > 0) {
                console.log('come inside loop');
                offlineData.SelectPendingAllIsVisible = false;
                offlineData.countCheckPending = 0;
                angular.forEach(offlineData.offlineRecords, function(val) {
                    val.checked = true;
                    ++offlineData.countCheckPending;
                });
            }
            console.log('offlineData.offlineRecords', offlineData.offlineRecords);
        };

        offlineData.deSelectAllPendingItems = function() {
            if ($rootScope.freezePendingRecords === 'true') {
                return;
            }
            offlineData.SelectPendingAllIsVisible = true;
            offlineData.countCheckPending = 0;
            angular.forEach(offlineData.offlineRecords, function(val) {
                val.checked = false;
                --offlineData.countCheckPending;
            });
        };

        offlineData.getSelectedSuccessRecords = function(item) {
            offlineData.SelectSuccessAllIsVisible = false;
            offlineData.countCheckSuccess = 0;
            angular.forEach(item, function(val) {
                if (val.checked === true) {
                    ++offlineData.countCheckSuccess;
                }
            });
            if (offlineData.countCheckSuccess === 0) {
                offlineData.SelectSuccessAllIsVisible = true;
            }
        };

        offlineData.selectAllSuccessItems = function() {
            if (offlineData.successRecords.length > 0) {
                offlineData.SelectSuccessAllIsVisible = false;
                offlineData.countCheckSuccess = 0;
                angular.forEach(offlineData.successRecords, function(val) {
                    val.checked = true;
                    ++offlineData.countCheckSuccess;
                });
            }
        };

        offlineData.deSelectAllSuccessItems = function() {
            offlineData.SelectSuccessAllIsVisible = true;
            offlineData.countCheckSuccess = 0;
            angular.forEach(offlineData.successRecords, function(val) {
                val.checked = false;
                --offlineData.countCheckSuccess;
            });
        };

        offlineData.getSelectedFailedRecords = function(item) {
            offlineData.SelectFailedAllIsVisible = false;
            offlineData.countCheckFailed = 0;
            angular.forEach(item, function(val) {
                if (val.checked === true) {
                    ++offlineData.countCheckFailed;
                }
            });
            if (offlineData.countCheckFailed === 0) {
                offlineData.SelectFailedAllIsVisible = true;
            }
        };

        offlineData.selectAllFailedItems = function() {
            if (offlineData.failedRecords.length > 0) {
                offlineData.SelectFailedAllIsVisible = false;
                offlineData.countCheckFailed = 0;
                angular.forEach(offlineData.failedRecords, function(val) {
                    val.checked = true;
                    ++offlineData.countCheckFailed;
                });
            }
        };

        offlineData.deSelectAllFailedItems = function() {
            offlineData.SelectFailedAllIsVisible = true;
            offlineData.countCheckFailed = 0;
            angular.forEach(offlineData.failedRecords, function(val) {
                val.checked = false;
                --offlineData.countCheckFailed;
            });
        };

        offlineData.getAllSoupData = function() {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading! Please wait...'
            });
            $rootScope.freezePendingRecords = 'false';
            DataService.getSoupData(SOUPINFO.offlineDataSoup).then(function(resp) {
                // console.log('old Pending Records: ', resp.currentPageOrderedEntries);

                angular.forEach(resp.currentPageOrderedEntries, function(offlineDataValue) {

                    if (offlineDataValue.lock === true) {
                        console.log('offlineDataValue', offlineDataValue);
                        offlineDataValue.lock = false;
                        offlineDataValue.checked = false;
                        DataService.setOfflineSoupData(offlineDataValue);
                    }
                });
                // console.log('offlineData.offlineRecords', resp.currentPageOrderedEntries);

            }, function(er) {
                console.log('Error in retriving offline data in Offline Controller');
                $ionicLoading.hide();
            }).then(function() {
                $timeout(function() {
                    DataService.getSoupData(SOUPINFO.offlineDataSoup).then(function(resp) {
                        console.log('offline records ', resp.currentPageOrderedEntries);
                        offlineData.offlineRecords = resp.currentPageOrderedEntries;
                        $ionicLoading.hide();
                    });
                    DataService.getSoupData(SOUPINFO.successRecordsSoup).then(function(resp) {
                        offlineData.successRecords = resp.currentPageOrderedEntries;
                        console.log('Success Records: ', offlineData.successRecords);
                    }, function(er) {
                        console.log('Error in retriving offline data in Offline Controller');
                    });

                    DataService.getSoupData(SOUPINFO.failedRecordsSoup).then(function(resp) {
                        offlineData.failedRecords = resp.currentPageOrderedEntries;
                        console.log('Failed Records: ', offlineData.failedRecords);
                    }, function(er) {
                        console.log('Error in retriving offline data in Offline Controller');
                    });
                }, 2500);

            });


        };

        offlineData.deleteRecords = function(syncStatusType) {
            if ($rootScope.freezePendingRecords === 'true') {
                console.log('records are syncing');
                return;
            }
            navigator.notification.confirm(
                'Delete will delete them permanently. Do you wish to confirm ?',
                function(buttonIndex) {
                    offlineData.onConfirm(buttonIndex, syncStatusType);
                },
                'Medvantage', ['Confirm', 'Cancel']
            );
        };

        offlineData.onConfirm = function(buttonIndex, syncStatusType) {
            if (buttonIndex === 1) {
                if (syncStatusType === 'pending') {
                    var pendingRecordIds = [];
                    angular.forEach(offlineData.offlineRecords, function(val) {
                        if (val.checked) {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', val.randomId);
                            navigator.smartstore.removeFromSoup(false, SOUPINFO.offlineDataSoup.Name, querySpec, offlineData.successClear, offlineData.failureClear);
                        }
                    });
                    $state.reload();
                } else if (syncStatusType === 'success') {
                    var successRecordIds = [];
                    angular.forEach(offlineData.successRecords, function(val) {
                        if (val.checked) {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', val.randomId);
                            navigator.smartstore.removeFromSoup(false, SOUPINFO.successRecordsSoup.Name, querySpec, offlineData.successClear, offlineData.failureClear);
                        }
                    });
                    $state.reload();
                } else if (syncStatusType === 'failed') {
                    var failedRecordIds = [];
                    angular.forEach(offlineData.failedRecords, function(val) {
                        if (val.checked) {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', val.randomId);
                            navigator.smartstore.removeFromSoup(false, SOUPINFO.failedRecordsSoup.Name, querySpec, offlineData.successClear, offlineData.failureClear);
                        }
                    });
                    $state.reload();
                }
            }
        };

        $timeout(function() {
            setOfflineHeight();
        }, 800);

        offlineData.successClear = function(resp) {
            console.log('Delete Records Success');
        };

        offlineData.failureClear = function(er) {
            console.log('Delete Records Failed');
        };

        offlineData.manualSyncRecords = function() {
            if (NetworkService.isDeviceOnline()) {
                var manualSyncRecords = [];
                angular.forEach(offlineData.failedRecords, function(val) {
                    if (val.checked) {
                        manualSyncRecords.push(val);
                    }
                });

                if (manualSyncRecords.length > 0) {
                    $ionicLoading.show({
                        template: '<ion-spinner icon="ios-small"></ion-spinner> Syncing Records! Please wait...'
                    });

                    DataService.syncUpManualData(manualSyncRecords);
                }
            } else {
                $scope.displayAlertMessage('Device is not connected to the Internet');
            }
        };

        offlineData.getAllSoupData();

        angular.element($window).on('resize', setOfflineHeight);

        function setOfflineHeight() {
            var windowHt = $(window).outerHeight(true);
            var headerHt = $(".offline-header").outerHeight(true);
            var tabHt = $(".tsb-icons").outerHeight(true);
            var offlineDivHt = $(".offlineDivider").outerHeight(true);
            var cntCtHt = windowHt - (headerHt + tabHt + offlineDivHt + 40);
            $(".scroll-offline").css({ "height": cntCtHt, "overflow": "auto" });
        }

        function cleanUp() {
            angular.element($window).off('resize', setOfflineHeight);
        }

        $scope.$on('$destroy', cleanUp);

    });
