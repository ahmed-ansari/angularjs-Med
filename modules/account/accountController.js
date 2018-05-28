/* jshint -W100 */
    app.controller('AccountListCtrl', function($scope, force, $ionicModal, $ionicLoading, localStorageService, AccountsService, DataService, SOUPINFO) {
        var accountlist = this;
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        accountlist.noaccounts = false;
        accountlist.no_account = 'No Record Found!';

        var filterValue = localStorageService.get("filterValue");
        if (filterValue === null) {
            accountlist.filterContact = 7;
        } else {
            accountlist.filterContact = filterValue;
        }

        accountlist.noMoreItemsAvailable = true;
        accountlist.loggedInId = '';

        var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
        sfOAuthPlugin.getAuthCredentials(function(usr) {
            accountlist.loggedInId = usr.userId;
            accountlist.callList(accountlist.filterContact, accountlist.loggedInId);
        });

        var rec_entries = localStorageService.get('maxRecords');
        if (rec_entries === null) {
            localStorageService.set('maxRecords', 20);
            rec_entries = 20;
        }


        $scope.filterDays = "7";
        var filterValue2 = localStorageService.get('filterValue');
        if (filterValue2 !== null) {
            $scope.filterDays = filterValue2;
        }
    /** 
    *   Desc - fetches account list
    *   @param - days - [number of days], userId [loggedIn user Id]
    */
        accountlist.callList = function(days, userId) {
            DataService.getSoupData(SOUPINFO.accountList, rec_entries).then(
                function(entries) {
                    accountlist.accounts = entries.currentPageOrderedEntries;
                    $ionicLoading.hide();
                },
                function(err) {
                    accountlist.accounts = [];
                    accountlist.noaccounts = true;
                    $ionicLoading.hide();
                }
            );
            $ionicLoading.hide();
        };
        accountlist.entries = 0;
    })

    .controller('AccountCtrl', function($scope, $stateParams, AccountsService, $q, $ionicLoading, DataService, SOUPINFO, $ionicConfig, $state, $timeout, $window, MedvantageUtils, NetworkService) {

        var singleaccount = this;
    /** 
    *   Desc - trigger email pop up
    *   @param - none
    */
        singleaccount.sendEmail = function() {
            cordova.plugins.email.isAvailable(
                function(isAvailable) {
                    if (isAvailable) {
                        cordova.plugins.email.open({
                            to: singleaccount.account.MedConnectDev__Email_Address__c,
                            cc: '',
                            bcc: [],
                            subject: '',
                            body: ''
                        });
                    } else {
                        $scope.showAlertMessage('Email not configured in device');
                    }
                }
            );
        };
        singleaccount.FSD = {};

        singleaccount.showMessage = function(message) {
            navigator.notification.alert(message, singleaccount.alertDismissed, 'Medvantage', 'OK');
        };
        singleaccount.alertDismissed = function() {};
    /** 
    *   Desc - show/hide field based on record types
    *   @param - recordType [record type of account], Parent Record Type [record type of parent acc]
    */
        singleaccount.FSD.Billing = function(recordType, ParentType) {
            var typeAccArray = ['Hospital/Surgery Centres', 'Clinic', 'Laboratories', 'Pharmacy', 'Internal Account', 'Depot Account'];
            var typeSubArray = ['Billing Account', 'Purchase Account'];
            if (typeSubArray.indexOf(recordType) != -1 && typeAccArray.indexOf(ParentType) != -1) {
                return true;
            } else if (typeAccArray.indexOf(recordType) != -1) {
                return true;
            }
            return false;
        };
        singleaccount.FSD.Shipping = function(recordType, ParentType) {
            var typeAccArray = ['Hospital/Surgery Centres', 'Clinic', 'Laboratories', 'Pharmacy', 'Depot Account'];
            var typeSubArray = ['Shipping Account', 'Purchase Account'];
            if (typeSubArray.indexOf(recordType) != -1 && typeAccArray.indexOf(ParentType) != -1) {
                return true;
            } else if (typeAccArray.indexOf(recordType) != -1) {
                return true;
            }
            return false;
        };

        singleaccount.FSD.customer_priority = function(recordType, ParentType) {
            if (recordType === 'Internal Account' || ParentType === 'Internal Account') {
                return false;
            }
            if (recordType === 'Billing Account' || ParentType === 'Billing Account') {
                return false;
            }
            if (recordType === 'Depot Account' || ParentType === 'Depot Account') {
                return false;
            }
            return true;
        };
        singleaccount.FSD.typeRatingPreferred = function(recordType, ParentType) {
            if (recordType === 'Internal Account' || ParentType === 'Internal Account') {
                return false;
            }
            if (recordType === 'Billing Account' || ParentType === 'Billing Account') {
                return false;
            }
            return true;
        };
        
        $ionicConfig.views.maxCache(0);
        singleaccount.dontProceed = false;
        var accountSubModulesList = ["account", "aincidents", "service_request", "open_activity", "service_contract", "asset", "acontacts", "acc_history", "acc_notes", "acc_attachments"];
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        var accountID = $stateParams.accountId;
        var promisea1 = AccountsService.getAccountById(accountID);
        var promisea2 = AccountsService.getAccountIncidents(accountID);
        var promisea3 = AccountsService.getAccountServiceRequest(accountID);
        var promisea4 = AccountsService.getAccountServiceContract(accountID);
        var promisea5 = AccountsService.getAccountAsset(accountID);
        var promisea6 = AccountsService.getAccountOpenActivity(accountID);
        var promisea7 = AccountsService.getContactsById(accountID);
        var promisea8 = AccountsService.getActivityHistory(accountID);
        var promisea9 = AccountsService.getNotesnAttachments(accountID);

        $q.all([promisea1, promisea2, promisea3, promisea4, promisea5, promisea6, promisea7, promisea8, promisea9]).
        then(
            function(adata) {
                singleaccount.account = adata[0].records[0];
                singleaccount.aincidents = adata[1].records;
                singleaccount.service_request = adata[2].records;
                singleaccount.service_contract = adata[3].records;
                singleaccount.asset = adata[4].records;
                if (adata[5].records[0].OpenActivities === null) {
                    singleaccount.open_activity = [];
                } else {
                    singleaccount.open_activity = adata[5].records[0].OpenActivities.records;
                }
                singleaccount.acontacts = adata[6].records;

               $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                    angular.element($window).on('resize', setAccountHt);
                    setAccountHt();
                }, 800);

                singleaccount.acc_history = adata[7].records[0].ActivityHistories;
                singleaccount.acc_notes = adata[8].records[0].Notes;
                singleaccount.acc_attachments = adata[8].records[0].Attachments;

                $ionicLoading.hide();
                angular.forEach(accountSubModulesList,function(module) { 
                    storeAccountDataInOffline(module, accountID); 
                });
            },
            function(err) {
                if (NetworkService.isDeviceOnline()) {
                    singleaccount.showMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                }

                angular.forEach(accountSubModulesList, function(module) { 
                    getAccountDataFromOffline(module, accountID); 
                });

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                    angular.element($window).on('resize', setAccountHt);
                    setAccountHt();
                }, 800);
            }
        );
    /** 
    *   Desc - set account  page height
    *   @param - none
    */
        function setAccountHt() {
            var windowHt = $(window).outerHeight(true);
            var headerHt = $(".bar-header").outerHeight(true);
            var subNameHdr = $(".NameHdr").outerHeight(true);
            var subDetailsHdr = $(".subDetailsHdr").outerHeight(true);
            var tabHt = $(".tsb-icons").outerHeight(true);
            var rowHt = $(".titleHdr").outerHeight(true);
            var sliderHeightGI = windowHt - (headerHt + subNameHdr + subDetailsHdr + tabHt + 40);
            var sliderHeight = windowHt - (headerHt + subNameHdr + subDetailsHdr + tabHt + rowHt + 40);
            $(".accScroll").css({ "height": sliderHeight });
            $(".accScrollGI").css({ "height": sliderHeightGI });
        }

        function cleanUp() {
            angular.element($window).off('resize', setAccountHt);
        }

        $scope.$on('$destroy', cleanUp);
    /** 
    *   Desc - open the url in web
    *   @param - webLink [link of the url]
    */
        singleaccount.openWebLink = function(weblink) {
            var Internet_handler1 = MedvantageUtils.checkInternetAvailability();
            if (Internet_handler1 === 'No network connection') {
                navigator.notification.alert('Cannot view webpage in offline', singleaccount.alertDismissed, 'Medvantage', 'OK');
            } else {
                window.open(weblink, '_blank', 'location=no');
            }
        };

        singleaccount.alertDismissed = function() {};
    /** 
    *   Desc - store offline data in soup
    *   @param - none
    */
        function storeAccountDataInOffline(type, accountId) { 
            var configObject = getAccountPreFilledJSONArray(type); 
            var accountDetailsArr = []; 
            var accountDetailsObj = {}; 
            accountDetailsObj.Id = accountId; 
            accountDetailsObj.data = singleaccount[type]; 
            accountDetailsArr.push(accountDetailsObj); 
            DataService.setSoupData(configObject.soupName, accountDetailsArr); 
        }

    /** 
    *   Desc - fetch offline data from soup
    *   @param - type [ tabs of account], account Id[account Id]
    */
        function getAccountDataFromOffline(type, accountId) { 
            if (singleaccount.dontProceed) {
                return;
            }
            var configObject = getAccountPreFilledJSONArray(type); 
            DataService.getSoupData(configObject.soupName, 10).then( 
                function(entries) { 
                    var accountIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                        if (obj.Id == accountId) {
                            return index; 
                        } 
                    }); 

                    if (accountIdIndex.length === 0) {
                        if (singleaccount.account === undefined && singleaccount.dontProceed === false) {
                            singleaccount.dontProceed = true;
                            $scope.showAlertMessage('No Offline Data Found');
                            return;
                        }
                    }

                    singleaccount[type] = entries.currentPageOrderedEntries[accountIdIndex].data; 

                    $ionicLoading.hide(); 
                },  
                function(err) { 
                    $ionicLoading.hide();
                } 
            ); 
        }
    /** 
    *   Desc - Maps the soups names to the tabs of account pages for showing data in offline
    *   @param - type [ tabs of account]
    */
        function getAccountPreFilledJSONArray(type) {
            var configJSON = {};
            switch (type) {
                case 'account':
                    configJSON.soupName = SOUPINFO.accountDetails;
                    return configJSON;
                case 'aincidents':
                    configJSON.soupName = SOUPINFO.accountIncidentDetails;
                    return configJSON;
                case 'service_request':
                    configJSON.soupName = SOUPINFO.accountServiceRequestDetails;
                    return configJSON;
                case 'open_activity':
                    configJSON.soupName = SOUPINFO.accountOpenActivitiesDetails;
                    return configJSON;
                case 'service_contract':
                    configJSON.soupName = SOUPINFO.accountServiceContractDetails;
                    return configJSON;
                case 'asset':
                    configJSON.soupName = SOUPINFO.accountAssetDetails;
                    return configJSON;
                case 'acc_history':
                    configJSON.soupName = SOUPINFO.accountHistory;
                    return configJSON;
                case 'acc_notes':
                    configJSON.soupName = SOUPINFO.accountNotes;
                    return configJSON;
                case 'acc_attachments':
                    configJSON.soupName = SOUPINFO.accountAttachments;
                    return configJSON;
                case 'acontacts':
                    configJSON.soupName = SOUPINFO.accountContactDetails;
                    return configJSON;
            }
        }
    })

    .controller('AccountMapCtrl', function($scope, $stateParams, AccountsService, $q, $ionicLoading, DataService, SOUPINFO) {
        var accountmap = this;
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        AccountsService.getAccountById($stateParams.accountId).then(
            function(accountm) {
                accountmap.account = accountm.records[0];

                if (accountmap.account.BillingLatitude === null || accountmap.account.BillingLongitude === null) {
                    accountmap.account.addr = (accountmap.account.BillingStreet !== null ? accountmap.account.BillingStreet : '') + ', ' +
                        (accountmap.account.BillingCity !== null ? accountmap.account.BillingCity : '') + ', ' +
                        (accountmap.account.BillingState !== null ? accountmap.account.BillingState : '') + ', ' +
                        (accountmap.account.BillingCountry !== null ? accountmap.account.BillingCountry : '');
                } else {
                    accountmap.account.addr = accountmap.account.BillingLatitude + ',' + accountmap.account.BillingLatitude;
                }

                $ionicLoading.hide();
            },
            function(err) {
                accountmap.account = '';
                $ionicLoading.hide();
            });

    })

    .controller('ServiceContractCtrl', function($scope, force, $ionicHistory, $ionicLoading, AccountsService, $stateParams, DataService, SOUPINFO, $timeout, $window) {
        var servicecontract = this;
        servicecontract.dontProceed = false;
        var woservicecontractList = ["service"];
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        servicecontract.showMessage = function(message) {
            navigator.notification.alert(message, servicecontract.alertDismissed, 'Medvantage', 'OK');
        };
        servicecontract.alertDismissed = function() {};

        servicecontract.showAlertMessage = function(message) {
            navigator.notification.alert(message, servicecontract.alertBack, 'Medvantage', 'OK');
        };
        servicecontract.alertBack = function() { $ionicHistory.goBack(); };


        var scid = $stateParams.serviceId;
        AccountsService.getAccountServiceContractDetails(scid)
            .then(
                function(serv) {
                    servicecontract.service = serv.records[0];
                    $ionicLoading.hide();
                    $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                        setContractHt();
                    }, 800);

                    angular.forEach(woservicecontractList, function(module) {
                        storeDataInOffline(module, scid, servicecontract);
                    });
                },
                function(err) {
                    angular.forEach(woservicecontractList, function(module, key) {
                        getDataFromOffline(module, scid);
                    });
                }
            );


        function storeDataInOffline(type, scid, servicecontract) {
            var configObject = getPreFilledJSONArray(type);
            var woservicecontractArr = [];
            var woservicecontractObj = {};
            woservicecontractObj.Id = scid;
            woservicecontractObj.data = servicecontract[type];
            woservicecontractArr.push(woservicecontractObj);
            DataService.setSoupData(configObject.soupName, woservicecontractArr);
        }


        function getDataFromOffline(type, scid) {
            if (servicecontract.dontProceed) {
                return;
            }
            var configObject = getPreFilledJSONArray(type);

            DataService.getSoupData(configObject.soupName, 10).then(
                function(entries) {

                    var scIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                        if (obj.Id == scid) {
                            return index; 
                        } 
                    }); 

                    if (scIdIndex.length === 0) {
                        if (servicecontract.dontProceed === false) {
                            servicecontract.dontProceed = true;
                            $scope.showAlertMessage('No Offline Data Found');
                            return;
                        }
                    }
                    servicecontract[type] = entries.currentPageOrderedEntries[scIdIndex].data;
                     $timeout(function() {
                        angular.element('.item-note').show().css('color', 'black');
                        setContractHt();
                    }, 800);
                    $ionicLoading.hide();
                },
                function(err) {
                    $ionicLoading.hide();
                }
            );
        }


        function getPreFilledJSONArray(type) {
            var configJSON = {};
            switch (type) {
                case 'service':
                    configJSON.soupName = SOUPINFO.ServiceContractGeneralInfo;
                    return configJSON;
            }
        }

        function setContractHt() {
            var windowHt = $(window).outerHeight(true);
            var headerHt = $(".bar-header").outerHeight(true);
            var subNameHt = $(".NameHdr").outerHeight(true);
            var subHeaderHt = $(".subDetailsHdr").outerHeight(true);
            var tabHt = $(".tsb-icons").outerHeight(true);            
            var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt);
            $(".scrollAtHt").css({ "height": cntCtHt, "overflow": "auto" });
        }

        angular.element($window).on('resize', setContractHt);
        function cleanUp() {
            angular.element($window).off('resize', setContractHt);
        }

        $scope.$on('$destroy', cleanUp);
    });
