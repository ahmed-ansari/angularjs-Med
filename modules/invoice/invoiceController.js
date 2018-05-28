/* jshint -W100 */
app.controller('WOInvoiceCtrl', ['$scope', '$stateParams', 'InvoiceService', '$q', '$ionicLoading', 'DataService', 'SOUPINFO', 'NetworkService', '$ionicPopover', WOInvoiceCtrl]);
app.controller('InvoiceDetailsCtrl', ['$scope', '$stateParams', 'InvoiceService', '$q', '$ionicLoading', 'DataService', 'SOUPINFO', 'NetworkService', '$ionicPopover', '$timeout', InvoiceDetailsCtrl]);
app.controller('InvoiceCtrl', ['$scope', '$stateParams', 'InvoiceService', '$q', '$ionicLoading', 'DataService', 'SOUPINFO', 'NetworkService', '$ionicPopover', 'SharedPreferencesService', 'toastr', '$ionicHistory', '$state', InvoiceCtrl]);
app.controller('CreateInvoiceDetailCtrl', ['$scope', '$stateParams', 'InvoiceService', '$q', '$ionicLoading', 'DataService', 'SOUPINFO', 'NetworkService', '$ionicPopover', 'SharedPreferencesService', 'toastr', '$ionicHistory', '$ionicModal', '$state', CreateInvoiceDetailCtrl]);
app.controller('InvoiceExpenseCtrl', ['$q', '$scope', 'InvoiceService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'SOUPINFO', 'NetworkService', 'SharedPreferencesService', 'DataService', InvoiceExpenseCtrl]);
app.controller('InvoiceLaborCtrl', ['$q', '$scope', 'InvoiceService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'NetworkService', 'SharedPreferencesService', 'DataService', 'SOUPINFO', InvoiceLaborCtrl]);
app.controller('InvoiceMaterialCtrl', ['$q', '$scope', 'InvoiceService', '$stateParams', '$state', '$ionicLoading', 'toastr', '$ionicHistory', 'NetworkService', 'SharedPreferencesService', 'DataService', '$ionicModal', 'SOUPINFO', 'ActivityService', 'QuoteService', 'ProductsService', '$timeout', InvoiceMaterialCtrl]);

function WOInvoiceCtrl($scope, $stateParams, InvoiceService, $q, $ionicLoading, DataService, SOUPINFO, NetworkService, $ionicPopover) {

    var singleWOInvoice = this;
    singleWOInvoice.dontProceed = false;

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    $ionicPopover.fromTemplateUrl('modules/invoice/wo_invoice_popover.html', {
        scope: $scope
    }).then(function(popover) {
        singleWOInvoice.popover = popover;
    });

    var woInvoiceSubModulesList = ["invoice", "invoiceDetails"];
    var woInvoiceId = $stateParams.invoiceId;
    singleWOInvoice.Id = woInvoiceId;
    var promise1 = InvoiceService.getWOInvoiceById(woInvoiceId);
    var promise2 = InvoiceService.getWOInvoiceDetailsList(woInvoiceId);

    $q.all([promise1, promise2]).then(function(resp) {
        if (resp && resp.length > 0) {
            singleWOInvoice.invoice = resp[0].records[0];
            singleWOInvoice.invoiceDetails = resp[1].records;
        }

        angular.forEach(woInvoiceSubModulesList, function(module) {
            storeDataInOffline(module, woInvoiceId, singleWOInvoice);
        });

        setHeight();
        $ionicLoading.hide();

    }, function(err) {
        $ionicLoading.hide();
        if (NetworkService.isDeviceOnline()) {
            singleWOInvoice.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
        } else {
            if (woInvoiceId && woInvoiceId.length === 18) {
                angular.forEach(woInvoiceSubModulesList, function(module, key) {
                    getDataFromOffline(module, woInvoiceId);
                });
            } else {
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', woInvoiceId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineWOInvoice) {
                    if (offlineWOInvoice && offlineWOInvoice.currentPageOrderedEntries.length > 0) {
                        singleWOInvoice.invoice = offlineWOInvoice.currentPageOrderedEntries[0].data;
                        singleWOInvoice.invoice.Name = offlineWOInvoice.currentPageOrderedEntries[0].Name;
                        singleWOInvoice.invoice.MedConnectDev__Work_Order__r = {};
                        singleWOInvoice.invoice.MedConnectDev__Account__r = {};
                        singleWOInvoice.invoice.MedConnectDev__Contact__r = {};
                        singleWOInvoice.invoice.MedConnectDev__Work_Order__r.Name = offlineWOInvoice.currentPageOrderedEntries[0].WOName;
                        singleWOInvoice.invoice.MedConnectDev__Account__r.Name = offlineWOInvoice.currentPageOrderedEntries[0].AccountName;
                        singleWOInvoice.invoice.MedConnectDev__Contact__r.Name = offlineWOInvoice.currentPageOrderedEntries[0].ContactName;

                    }
                });
            }
        }
    });

    singleWOInvoice.showAlertMessage = function(message) {
        navigator.notification.alert(message, singleWOInvoice.alertDismissed, 'Medvantage', 'OK');
    };
    singleWOInvoice.alertDismissed = function() {};

    function storeDataInOffline(type, woInvoiceId, singleWOInvoice) {

        var configObject = getPreFilledJSONArray(type);
        var woInvoiceDetailsArr = [];
        var woInvoiceDetailsObj = {};
        woInvoiceDetailsObj.Id = woInvoiceId;
        woInvoiceDetailsObj.data = singleWOInvoice[type];
        woInvoiceDetailsArr.push(woInvoiceDetailsObj);

        DataService.setSoupData(configObject.soupName, woInvoiceDetailsArr);
    }

    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'invoice':
                configJSON.soupName = SOUPINFO.workOrderInvoiceGeneralInfo;
                return configJSON;
            case 'invoiceDetails':
                configJSON.soupName = SOUPINFO.workOrderInvoiceDetailsList;
                return configJSON;
        }
    }

    function getDataFromOffline(type, woInvoiceId) {
        if (singleWOInvoice.dontProceed) {
            return;
        }

        var configObject = getPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {

                var woIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === woInvoiceId) {
                        return index; 
                    } 
                }); 

                if (woIdIndex.length === 0) {
                    if (singleWOInvoice.invoice === undefined && singleWOInvoice.dontProceed === false) {
                        singleWOInvoice.dontProceed = true;
                        $scope.showAlertMessage('No Offline Data Found');
                        return;
                    }
                }
                if (woIdIndex) {
                    singleWOInvoice[type] = entries.currentPageOrderedEntries[woIdIndex].data;
                }


                setHeight();
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }

    function setHeight() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subheaderHt = $(".subHeader").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var footerHt = $(".bar-footer").outerHeight(true);
        var contentHdr = $(".cntHdr").outerHeight(true);

        $('.scroll-height').css("height", windowHt - (headerHt + subheaderHt + tabHt + footerHt + contentHdr));
    }
}

function InvoiceDetailsCtrl($scope, $stateParams, InvoiceService, $q, $ionicLoading, DataService, SOUPINFO, NetworkService, $ionicPopover, $timeout) {

    var singleInvoiceDetail = this;
    singleInvoiceDetail.dontProceed = false;
    var invoiceDetailId = $stateParams.invoiceDetailId;
    singleInvoiceDetail.invoiceDetailId = $stateParams.invoiceDetailId;
    singleInvoiceDetail.invoiceDetailName = $stateParams.invoiceDetailName;
    singleInvoiceDetail.invoiceMaterial = [];
    singleInvoiceDetail.invoiceLabour = [];
    singleInvoiceDetail.invoiceExpense = [];

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    $ionicPopover.fromTemplateUrl('modules/invoice/wo_invoice_detail_popover.html', {
        scope: $scope
    }).then(function(popover) {
        singleInvoiceDetail.popover = popover;
    });

    var promise1 = InvoiceService.getInvoiceDetailsById(invoiceDetailId);
    var promise2 = InvoiceService.getInvLineItemByInvDetailId(invoiceDetailId);

    $q.all([promise1, promise2]).then(function(resp) {
        if (resp && resp.length > 0) {
            singleInvoiceDetail.invoiceDetail = resp[0].records[0];
            singleInvoiceDetail.populateLineItems(resp[1].records);
        }
        setHeight();
        var singleInvoiceDetailArr = [];
        var singleInvObj = {};
        singleInvObj.Id = invoiceDetailId;
        singleInvObj.data = resp;
        singleInvoiceDetailArr.push(singleInvObj);

        DataService.setSoupData(SOUPINFO.workOrderInvoiceDetails, singleInvoiceDetailArr);

        $timeout(function() {
            angular.element('.item-note').show().css('color', 'black');
        }, 1000);

        $ionicLoading.hide();

    }, function(err) {
        if (NetworkService.isDeviceOnline()) {
            $ionicLoading.hide();
            singleInvoiceDetail.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
        } else {
            var querySpec = navigator.smartstore.buildExactQuerySpec('Id', invoiceDetailId);
            navigator.smartstore.querySoup(SOUPINFO.workOrderInvoiceDetails.Name, querySpec, function(resp) {
                if (resp && resp.currentPageOrderedEntries.length > 0) {
                    singleInvoiceDetail.invoiceDetail = resp.currentPageOrderedEntries[0].data[0].records[0];
                    singleInvoiceDetail.populateLineItems(resp.currentPageOrderedEntries[0].data[1].records);
                } else {
                    $scope.showAlertMessage('No Offline Data Found');
                    return;
                }
            });

            $timeout(function() {
                angular.element('.hyper').show().css('color', '#387ef5');
            }, 1500);

            setHeight();
            $ionicLoading.hide();
        }
    });

    singleInvoiceDetail.populateLineItems = function(data) {
        var invoiceMaterials = [],
            invoiceLabours = [],
            invoiceExpenses = [];

        angular.forEach(data, function(value, index) {
            if (value.MedConnectDev__Line_Type__c === 'Material') {
                invoiceMaterials.push(value);
            } else if (value.MedConnectDev__Line_Type__c === 'Labour') {
                invoiceLabours.push(value);
            } else if (value.MedConnectDev__Line_Type__c === 'Expense') {
                invoiceExpenses.push(value);
            }

            //Checking for last iteration and binding data to model
            if (index == data.length - 1) {
                singleInvoiceDetail.invoiceMaterial = invoiceMaterials;
                singleInvoiceDetail.invoiceLabour = invoiceLabours;
                singleInvoiceDetail.invoiceExpense = invoiceExpenses;
            }
        });
    };

    singleInvoiceDetail.showAlertMessage = function(message) {

        navigator.notification.alert(message, singleInvoiceDetail.alertDismissed, 'Medvantage', 'OK');
    };

    singleInvoiceDetail.alertDismissed = function() {};

    function setHeight() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subheaderHt = $(".subHeader").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var footerHt = $(".bar-footer").outerHeight(true);
        var contentHdr = $(".cntHdr").outerHeight(true);

        $('.scroll-height').css("height", windowHt - (headerHt + subheaderHt + tabHt + footerHt + contentHdr));
    }
}

function InvoiceCtrl($scope, $stateParams, InvoiceService, $q, $ionicLoading, DataService, SOUPINFO, NetworkService, $ionicPopover, SharedPreferencesService, toastr, $ionicHistory, $state) {

    var invoice = this;
    var new_invoice = {};

    var invoiceId = $stateParams.invoiceId || '';

    invoice.invoiceId = invoiceId;
    invoice.workorderId = $stateParams.workorderId || '';
    invoice.accountId = $stateParams.accountId || '';
    invoice.contactId = $stateParams.contactId || '';
    invoice.invoiceStatus = $stateParams.invoiceStatus || 'null';
    invoice.invoiceName = $stateParams.invoiceName || '';

    invoice.workOrderName = SharedPreferencesService.getWorkOrderName();
    invoice.accountName = SharedPreferencesService.getAccountName();
    invoice.contactName = SharedPreferencesService.getContactName();

    invoice.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    invoice.invoiceSave = function($form) {
        if ($form.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            new_invoice.MedConnectDev__Work_Order__c = invoice.workorderId;
            new_invoice.MedConnectDev__Account__c = invoice.accountId;
            new_invoice.MedConnectDev__Contact__c = invoice.contactId;
            new_invoice.MedConnectDev__Status__c = invoice.invoiceStatus || '';

            if (invoiceId !== '' && invoiceId !== 'null' && invoiceId.length === 18) {
                new_invoice.Id = invoiceId;
                InvoiceService.updateInvoice(new_invoice).then(function() {
                    var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceId);
                    navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                        if (resp.currentPageOrderedEntries.length > 0) {
                            DataService.removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, invoiceId);
                        }
                        toastr.success('Invoice updated successfully');
                        $ionicHistory.goBack();
                    });
                }, function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        invoice.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                    } else {
                        navigator.notification.confirm(
                            'Do you want to edit the Invoice Offline?',
                            function(buttonIndex) {
                                invoice.editInvoiceOffline(buttonIndex, new_invoice, invoiceId);
                            },
                            'Medvantage', ['Confirm', 'Cancel']
                        );
                    }
                });

            } else {
                delete new_invoice.Id;
                InvoiceService.createInvoice(new_invoice).then(function(resp) {
                    toastr.success('Invoice created successfully');
                    $state.go('app.wo-invoice', { "invoiceId": resp.id });
                }, function(err) {
                    $ionicLoading.hide();
                    if (NetworkService.isDeviceOnline()) {
                        invoice.showAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                    } else {
                        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceId);
                        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                            if (resp.currentPageOrderedEntries.length > 0) {
                                navigator.notification.confirm(
                                    'Do you want to edit the Invoice Offline?',
                                    function(buttonIndex) {
                                        invoice.createInvoiceOffline(buttonIndex, new_invoice, invoiceId);
                                    },
                                    'Medvantage', ['Confirm', 'Cancel']
                                );
                            } else {
                                navigator.notification.confirm(
                                    'Do you want to add the Invoice Offline?',
                                    function(buttonIndex) {
                                        invoice.createInvoiceOffline(buttonIndex, new_invoice, invoiceId);
                                    },
                                    'Medvantage', ['Confirm', 'Cancel']
                                );
                            }
                        });
                    }
                });
            }

        }
    };

    invoice.editInvoiceOffline = function(buttonIndex, new_invoice, invoiceId) {
        if (buttonIndex == 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            var promises = [];
            if (invoiceId.length === 18) { //Trying to Edit a newly added record will contain 15 digit Id
                var offlineObj = {
                    "action": "Edit",
                    "type": "INV",
                    "Name": invoice.invoiceName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "AccountName": SharedPreferencesService.getAccountName(),
                    "ContactName": SharedPreferencesService.getContactName(),
                    "data": new_invoice,
                    "randomId": invoiceId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/invoice/" + invoiceId
                };

                var querySpec = navigator.smartstore.buildExactQuerySpec('Id', invoiceId);
                navigator.smartstore.querySoup(SOUPINFO.workOrderInvoiceGeneralInfo.Name, querySpec, function(resp) {
                    var rec = resp.currentPageOrderedEntries[0].data;

                    rec.MedConnectDev__Work_Order__c = new_invoice.MedConnectDev__Work_Order__c;
                    rec.MedConnectDev__Account__c = new_invoice.MedConnectDev__Account__c;
                    rec.MedConnectDev__Contact__c = new_invoice.MedConnectDev__Contact__c;
                    rec.MedConnectDev__Status__c = new_invoice.MedConnectDev__Status__c;
                    rec.MedConnectDev__Reason_For_Change__c = new_invoice.MedConnectDev__Reason_For_Change__c;

                    resp.currentPageOrderedEntries[0].data = rec;
                    promises.push(DataService.setSoupData(SOUPINFO.workOrderInvoiceGeneralInfo, resp.currentPageOrderedEntries));

                }, function(er) {
                    $ionicLoading.hide();
                });

                promises.push(DataService.setOfflineSoupData(offlineObj));
            } else {
                delete new_invoice.Id;
                new_invoice.MedConnectDev__Work_Order__c = workorderId;
                var offlineObj2 = {
                    "action": "New",
                    "type": "INV",
                    "data": new_invoice,
                    "randomId": invoiceId,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/invoice/" + invoiceId
                };

                var querySpecNew = navigator.smartstore.buildExactQuerySpec('randomId', invoiceId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpecNew, function(resp) {
                    var rec = resp.currentPageOrderedEntries[0];
                    offlineObj2.Name = rec.Name;
                    offlineObj2.WOName = rec.WOName;
                });

                promises.push(DataService.setOfflineSoupData(offlineObj2));
            }

            $q.all(promises).then(function(resp) {
                toastr.info('Invoice modified offline successfully');
                $ionicHistory.goBack();
            });
        }
    };

    invoice.createInvoiceOffline = function(buttonIndex, new_invoice, invoiceId) {
        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            if (invoiceId !== '' && invoiceId !== 'null') {
                var offlineObj = {};
                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var obj = resp.currentPageOrderedEntries[0];
                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.AccountName = obj.AccountName;
                        offlineObj.ContactName = obj.ContactName;
                        offlineObj.object = obj.object;
                        offlineObj.data = new_invoice;
                        offlineObj.randomId = invoiceId;
                        offlineObj.resync = obj.resync;
                        offlineObj.lock = true;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info('Invoice created offline successfully');
                            $ionicHistory.goBack();
                        });
                    }
                });
            } else {
                var randomId = new Date().getTime().toString();
                var invName = "Inv-" + randomId;
                var offlineObj3 = {
                    "action": "New",
                    "type": "INV",
                    "Name": invName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "AccountName": SharedPreferencesService.getAccountName(),
                    "ContactName": SharedPreferencesService.getContactName(),
                    "data": new_invoice,
                    "randomId": randomId,
                    "resync": false,
                    "createdDate": randomId,
                    "href": "#/app/invoice/" + randomId
                };

                DataService.setOfflineSoupData(offlineObj3).then(function() {
                    toastr.info('Invoice created offline successfully');
                    $ionicHistory.goBack();
                });
            }
        }
    };

    invoice.showAlertMessage = function(message) {

        navigator.notification.alert(message, invoice.alertDismissed, 'Medvantage', 'OK');
    };

    invoice.alertDismissed = function() {};
}

function CreateInvoiceDetailCtrl($scope, $stateParams, InvoiceService, $q, $ionicLoading, DataService, SOUPINFO, NetworkService, $ionicPopover, SharedPreferencesService, toastr, $ionicHistory, $ionicModal, $state) {

    var createInvoiceDetail = this;
    var workorderId = $stateParams.workorderId || '';
    var invoiceId = $stateParams.invoiceId || '';
    createInvoiceDetail.invoiceId = $stateParams.invoiceId || '';
    createInvoiceDetail.invoiceDetailId = $stateParams.invoiceDetailId || '';
    createInvoiceDetail.selected_quote_name = ($stateParams.quoteName !== 'null') ? $stateParams.quoteName : '';
    createInvoiceDetail.selected_quote_id = '';
    createInvoiceDetail.workOrderName = SharedPreferencesService.getWorkOrderName();
    createInvoiceDetail.invoiceName = $stateParams.invoiceName || '';
    createInvoiceDetail.err_msg = '';

    createInvoiceDetail.showQuotes = function() {

        DataService.getSoupData(SOUPINFO.workOrderQuote, 100).then(
            function(entries) {
                var woIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id == workorderId) {
                        return index; 
                    } 
                }); 
                createInvoiceDetail.quotes = entries.currentPageOrderedEntries[woIdIndex].data;

                $ionicModal.fromTemplateUrl('modules/invoice/quotes_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            function(err) {
                createInvoiceDetail.quotes = [];
            }
        );
    };

    createInvoiceDetail.select_the_quote = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        createInvoiceDetail.selected_quote_name = name;
        createInvoiceDetail.selected_quote_id = id;


        $scope.modal.hide();
        $ionicLoading.hide();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    createInvoiceDetail.getFromQuote = function() {
        if (createInvoiceDetail.selected_quote_id === '' && createInvoiceDetail.selected_quote_id.length < 16) {
            createInvoiceDetail.err_msg = 'This field is required';
            return false;
        }

        if (workorderId === '') {
            $scope.displayAlertMessage('WorkOrder Required to perform this operation');
            return false;
        }
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (createInvoiceDetail.invoiceId.length === 18) {
            var dataToSend = {
                "records": [{
                    "Operation": "GetFromQuote",
                    "WorkOrderId": workorderId,
                    "QuoteId": createInvoiceDetail.selected_quote_id,
                    "InvoiceId": createInvoiceDetail.invoiceId
                }]
            };
            InvoiceService.mobileWebServiceInvoiceDetail(dataToSend).then(function(suc) {
                $state.go('app.invoice-detail', { 'invoiceDetailId': suc.InvDetailsIds[0], 'invoiceDetailName': null });
            }, function(err) {
                $ionicLoading.hide();

                if (NetworkService.isDeviceOnline()) {
                    $scope.displayAlertMessage('Error : ' + JSON.stringify(err));
                } else {
                    navigator.notification.confirm(
                        'Do you want to Add the Invoice Detail Offline?',
                        function(buttonIndex) {
                            if (buttonIndex == 1) {
                                $ionicLoading.show({
                                    template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
                                });
                                var dataToSendOffline = {
                                    "Operation": "GetFromQuote",
                                    "MedConnectDev__Work_Order__c": workorderId,
                                    "QuoteId": createInvoiceDetail.selected_quote_id,
                                    "Id": createInvoiceDetail.invoiceId
                                };
                                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                                var invName = "InvoiceDetail_" + randomId;
                                var offlineObj = {
                                    "action": "New",
                                    "type": "INV",
                                    "Name": invName,
                                    "WOName": SharedPreferencesService.getWorkOrderName(),
                                    "data": dataToSendOffline,
                                    "randomId": randomId,
                                    "resync": false,
                                    "createdDate": new Date().getTime().toString(),
                                    "href": "#/app/add-invoice-detail/" + workorderId + "/" + createInvoiceDetail.invoiceId + "/" + invName + "/" + randomId + "/" + createInvoiceDetail.selected_quote_name
                                };

                                DataService.setOfflineSoupData(offlineObj).then(function() {
                                    toastr.info('Invoice Detail created offline successfully');
                                    $ionicHistory.goBack();
                                });
                            } else {
                                $ionicHistory.goBack();
                            }

                        },
                        'Medvantage', ['Confirm', 'Cancel']
                    );
                }

            });

        } else {

            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', createInvoiceDetail.invoiceId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineInvoiceDetail) {
                if (offlineInvoiceDetail && offlineInvoiceDetail.currentPageOrderedEntries.length > 0) {
                    var obj = offlineInvoiceDetail.currentPageOrderedEntries[0];

                    if ('Operation' in obj.data) {
                        $scope.displayAlertMessage('Multiple Invoice Detail cannot be added to Offline Invoice');
                        $ionicHistory.goBack();
                    } else {

                        navigator.notification.confirm(
                            'Do you want to create the Invoice Detail Offline?',
                            function(buttonIndex) {
                                if (buttonIndex === 1) {
                                    if (!('Operation' in obj.data)) {
                                        obj.data.Operation = 'GetFromQuote';
                                        obj.data.QuoteId = createInvoiceDetail.selected_quote_id;
                                        obj.data.MedConnectDev__Status__c = createInvoiceDetail.status;
                                        DataService.setOfflineSoupData(obj).then(function() {
                                            toastr.info('Invoice Detail saved offline successfully');
                                            $ionicHistory.goBack();
                                        });
                                    }
                                } else {
                                    $ionicHistory.goBack();
                                }
                            },
                            'Medvantage', ['Confirm', 'Cancel']
                        );
                    }


                } else {
                    $scope.displayAlertMessage('You cannot add Invoice Detail Offline');
                    $ionicHistory.goBack();
                }
            });
        }


    };

    createInvoiceDetail.getFromActuals = function() {
        if (createInvoiceDetail.selected_quote_name !== '' && createInvoiceDetail.selected_quote_name.length > 0) {
            createInvoiceDetail.err_msg = 'Quote Should be removed to perform this operation';
            return false;
        }

        if (workorderId === '') {
            $scope.displayAlertMessage('WorkOrder Required to perform this operation');
            return false;
        }
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        if (createInvoiceDetail.invoiceId.length === 18) {
            var dataToSend = {
                "records": [{
                    "Operation": "GetFromActuals",
                    "WorkOrderId": workorderId,
                    "InvoiceId": createInvoiceDetail.invoiceId
                }]
            };
            InvoiceService.mobileWebServiceInvoiceDetail(dataToSend).then(function(suc) {

                $state.go('app.invoice-detail', { 'invoiceDetailId': suc.InvDetailsIds[0], 'invoiceDetailName': null });
            }, function(err) {

                $ionicLoading.hide();
                if (NetworkService.isDeviceOnline()) {
                    $scope.displayAlertMessage('Error : ' + JSON.stringify(err));
                } else {
                    navigator.notification.confirm(
                        'Do you want to Add the Invoice Detail Offline?',
                        function(buttonIndex) {
                            if (buttonIndex == 1) {
                                $ionicLoading.show({
                                    template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
                                });
                                var dataToSendOffline = {
                                    "Operation": "GetFromActuals",
                                    "MedConnectDev__Work_Order__c": workorderId,
                                    "Id": createInvoiceDetail.invoiceId
                                };

                                var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                                var invName = "InvoiceDetail_" + randomId;
                                var offlineObj = {
                                    "action": "New",
                                    "type": "INV",
                                    "Name": invName,
                                    "WOName": SharedPreferencesService.getWorkOrderName(),
                                    "data": dataToSendOffline,
                                    "randomId": randomId,
                                    "resync": false,
                                    "createdDate": new Date().getTime().toString(),
                                    "href": "#/app/add-invoice-detail/" + workorderId + "/" + createInvoiceDetail.invoiceId + "/" + invName + "/" + randomId + "/" + createInvoiceDetail.selected_quote_name
                                };

                                DataService.setOfflineSoupData(offlineObj).then(function() {
                                    toastr.info('Invoice Detail created offline successfully');
                                    $ionicHistory.goBack();
                                });
                            } else {
                                $ionicHistory.goBack();
                            }

                        },
                        'Medvantage', ['Confirm', 'Cancel']
                    );
                }

            });
        } else {

            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', createInvoiceDetail.invoiceId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineInvoiceDetail) {
                if (offlineInvoiceDetail && offlineInvoiceDetail.currentPageOrderedEntries.length > 0) {
                    var obj = offlineInvoiceDetail.currentPageOrderedEntries[0];
                    if ('Operation' in obj.data) {
                        $scope.displayAlertMessage('Multiple Invoice Detail cannot be added to Offline Invoice');
                        $ionicHistory.goBack();
                    } else {

                        navigator.notification.confirm(
                            'Do you want to create the Invoice Detail Offline?',
                            function(buttonIndex) {

                                if (buttonIndex === 1) {
                                    if (!('Operation' in obj.data)) {
                                        obj.data.Operation = 'GetFromActuals';
                                        DataService.setOfflineSoupData(obj).then(function() {
                                            toastr.info('Invoice Detail saved offline successfully');
                                            $ionicHistory.goBack();
                                        });
                                    }
                                } else {
                                    $ionicHistory.goBack();
                                }
                            },
                            'Medvantage', ['Confirm', 'Cancel']
                        );
                    }
                } else {
                    $scope.displayAlertMessage('You cannot add Invoice Detail Offline');
                    $ionicHistory.goBack();
                }
            });
        }


    };

    createInvoiceDetail.save = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        var dataToSend = {
            "Id": createInvoiceDetail.invoiceDetailId,
            "MedConnectDev__Status__c": createInvoiceDetail.status
        };
        InvoiceService.updateInvoiceDetail(dataToSend).then(function(suc) {
            $ionicLoading.hide();
            toastr.info('Invoice Detail updated successfully');
            $ionicHistory.goBack();
        }, function(err) {
            $ionicLoading.hide();
            if (NetworkService.isDeviceOnline()) {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {
                navigator.notification.confirm(
                    'Do you want to edit the Invoice Detail Offline?',
                    function(buttonIndex) {
                        createInvoiceDetail.editInvoiceDetailOffline(buttonIndex, dataToSend);
                    },
                    'Medvantage', ['Confirm', 'Cancel']
                );
            }

        });
    };

    createInvoiceDetail.takeMeBack = function() {

        $ionicHistory.goBack();
    };

    createInvoiceDetail.editInvoiceDetailOffline = function(buttonIndex, newInvoiceDetail) {
        if (buttonIndex == 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            var promises = [];
            if (newInvoiceDetail.Id.length === 18) { //Trying to Edit a newly added record will contain 15 digit Id
                var offlineObj = {
                    "action": "Edit",
                    "type": "INVD",
                    "Name": createInvoiceDetail.invoiceName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "data": newInvoiceDetail,
                    "randomId": newInvoiceDetail.Id,
                    "resync": false,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/invoice-detail/" + newInvoiceDetail.Id + "/" + createInvoiceDetail.invoiceName
                };

                var querySpec = navigator.smartstore.buildExactQuerySpec('Id', newInvoiceDetail.Id);
                navigator.smartstore.querySoup(SOUPINFO.workOrderInvoiceDetails.Name, querySpec, function(resp) {
                    resp.currentPageOrderedEntries[0].data[0].records[0].MedConnectDev__Status__c = newInvoiceDetail.MedConnectDev__Status__c;
                    promises.push(DataService.setSoupData(SOUPINFO.workOrderInvoiceDetails, resp.currentPageOrderedEntries));
                });

                promises.push(DataService.setOfflineSoupData(offlineObj));

            }
            /*else {
                           delete new_invoice.Id;
                           new_invoice.MedConnectDev__Work_Order__c = workorderId;
                           var offlineObj = {
                               "action": "New",
                               "type": "INV",
                               "data": new_invoice,
                               "randomId": invoiceId,
                               "resync": false,
                               "createdDate": new Date().getTime().toString(),
                               "href": "#/app/invoice/" + invoiceId
                           };

                           var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceId);
                           navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                               var rec = resp.currentPageOrderedEntries[0];
                               offlineObj["Name"] = rec.Name;
                               offlineObj["WOName"] = rec.WOName;
                           });

                           promises.push(DataService.setOfflineSoupData(offlineObj));
            }*/

            $q.all(promises).then(function(resp) {
                toastr.info('Invoice Detail modified offline successfully');
                $ionicHistory.goBack();
            });
        }
    };
}

function InvoiceExpenseCtrl($q, $scope, InvoiceService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, SOUPINFO, NetworkService, SharedPreferencesService, DataService) {
    var invoiceExpense = this;
    invoiceExpense.invoiceId = $stateParams.invoiceId;
    invoiceExpense.expenseId = $stateParams.expenseId;
    invoiceExpense.invoiceName = $stateParams.invoiceName;
    invoiceExpense.invoiceExpenseName = $stateParams.invoiceExpenseName;


    invoiceExpense.inv = {};
    invoiceExpense.takeMeBack = function() {
        $ionicHistory.goBack();
    };
    if (invoiceExpense.expenseId.length === 18) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        InvoiceService.getInvoiceLineItemsDetails(invoiceExpense.expenseId).
        then(function(invoiceExpenseRes) {
            if (invoiceExpenseRes) {
                invoiceExpense.expense = invoiceExpenseRes.records[0];
                invoiceExpense.inv.type = invoiceExpense.expense.MedConnectDev__Expense_Type__c;
                invoiceExpense.inv.billable = invoiceExpense.expense.MedConnectDev__Billable__c;
                invoiceExpense.inv.applyWarranty = invoiceExpense.expense.MedConnectDev__Apply_Warranty__c;
                invoiceExpense.inv.amount = invoiceExpense.expense.MedConnectDev__Expense_Amount__c;
                invoiceExpense.inv.discount = invoiceExpense.expense.MedConnectDev__Discount__c;
                invoiceExpense.inv.discountType = invoiceExpense.expense.MedConnectDev__Discount_Type__c;
                invoiceExpense.inv.description = invoiceExpense.expense.MedConnectDev__Description__c;

            }

            DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
                if (entries && entries.currentPageOrderedEntries.length > 0) {
                    var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                    var expenseEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Expense_End_Date__c : '';

                    invoiceExpense.inv.warrantyValid = invoiceExpense.checkWarrantyValid(startDate, expenseEndDate);
                }
            });
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();

            if (NetworkService.isDeviceOnline()) {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {
                invoiceExpense.getInvoiceExpenseOffline(invoiceExpense.expenseId);
            }

            DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
                if (entries && entries.currentPageOrderedEntries.length > 0) {
                    var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                    var expenseEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Expense_End_Date__c : '';

                    invoiceExpense.inv.warrantyValid = invoiceExpense.checkWarrantyValid(startDate, expenseEndDate);
                }
            });
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceExpense.expenseId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                invoiceExpense.expense = resp.currentPageOrderedEntries[0].data;

                invoiceExpense.inv.type = invoiceExpense.expense.MedConnectDev__Expense_Type__c;
                invoiceExpense.inv.billable = invoiceExpense.expense.MedConnectDev__Billable__c;
                invoiceExpense.inv.applyWarranty = invoiceExpense.expense.MedConnectDev__Apply_Warranty__c;
                invoiceExpense.inv.amount = invoiceExpense.expense.MedConnectDev__Expense_Amount__c;
                invoiceExpense.inv.discount = invoiceExpense.expense.MedConnectDev__Discount__c;
                invoiceExpense.inv.discountType = invoiceExpense.expense.MedConnectDev__Discount_Type__c;
                invoiceExpense.inv.description = invoiceExpense.expense.MedConnectDev__Description__c;

                $ionicLoading.hide();
            }
        });

        DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
            if (entries && entries.currentPageOrderedEntries.length > 0) {
                var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                var expenseEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Expense_End_Date__c : '';

                invoiceExpense.inv.warrantyValid = invoiceExpense.checkWarrantyValid(startDate, expenseEndDate);
            }
        });
    }


    invoiceExpense.getInvoiceExpenseOffline = function(expenseId) {
        DataService.getSoupData(SOUPINFO.workOrderInvoiceDetails, 100).then(function(entries) {
            $.map(entries.currentPageOrderedEntries, function(obj, index) {
                if (obj.Id === invoiceExpense.invoiceId) {
                    var ExpenseIdIndex = $.map(entries.currentPageOrderedEntries[index].data[1].records, function(obj, subIndex) {
                        if (obj.Id === expenseId && obj.MedConnectDev__Line_Type__c == "Expense") {
                            return subIndex; 
                        } 
                    }); 

                    invoiceExpense.expense = entries.currentPageOrderedEntries[index].data[1].records[ExpenseIdIndex];
                    invoiceExpense.inv.type = invoiceExpense.expense.MedConnectDev__Expense_Type__c;
                    invoiceExpense.inv.billable = invoiceExpense.expense.MedConnectDev__Billable__c;
                    invoiceExpense.inv.applyWarranty = invoiceExpense.expense.MedConnectDev__Apply_Warranty__c;
                    invoiceExpense.inv.amount = invoiceExpense.expense.MedConnectDev__Expense_Amount__c;
                    invoiceExpense.inv.discount = invoiceExpense.expense.MedConnectDev__Discount__c;
                    invoiceExpense.inv.discountType = invoiceExpense.expense.MedConnectDev__Discount_Type__c;
                    invoiceExpense.inv.description = invoiceExpense.expense.MedConnectDev__Description__c;
                } 
            }); 
        });
    };


    invoiceExpense.expenseSave = function(expenseForm) {
        if (expenseForm.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            var invoiceExpData = {};
            invoiceExpData.MedConnectDev__Expense_Type__c = invoiceExpense.inv.type;
            invoiceExpData.MedConnectDev__Billable__c = invoiceExpense.inv.billable;
            invoiceExpData.MedConnectDev__Apply_Warranty__c = invoiceExpense.inv.applyWarranty;
            invoiceExpData.MedConnectDev__Expense_Amount__c = invoiceExpense.inv.amount;
            invoiceExpData.MedConnectDev__Discount__c = invoiceExpense.inv.discount;
            invoiceExpData.MedConnectDev__Discount_Type__c = invoiceExpense.inv.discountType;
            invoiceExpData.MedConnectDev__Description__c = invoiceExpense.inv.description;
            if (invoiceExpense.expenseId.length === 18) {
                invoiceExpData.Id = invoiceExpense.expenseId;
                InvoiceService.updateInvoiceLineItems(invoiceExpData).then(function(exp_updated) {

                        toastr.success('Expense updated successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            navigator.notification.confirm(
                                'Do you want to edit the Expense Offline?',
                                function(buttonIndex) {
                                    invoiceExpense.editInvoiceExpenseOffline(buttonIndex, invoiceExpense, invoiceExpData, invoiceExpense.expenseId);
                                },
                                'Medvantage', ['Confirm', 'Cancel']
                            );
                        }
                    });

            } else {
                invoiceExpData.MedConnectDev__Invoice__c = invoiceExpense.invoiceId;
                invoiceExpData.MedConnectDev__Line_Type__c = 'Expense';
                InvoiceService.createInvoiceLineItems(invoiceExpData).then(function(exp_added) {
                        toastr.success('Expense created successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            $ionicLoading.hide();
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceExpense.expenseId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp && resp.currentPageOrderedEntries.length > 0) {
                                    navigator.notification.confirm(
                                        'Do you want to edit the Expense Offline?',
                                        function(buttonIndex) {
                                            invoiceExpense.createInvoiceExpenseOffline(buttonIndex, invoiceExpData, invoiceExpense.expenseId);
                                        },
                                        'Medvantage', ['Confirm', 'Cancel']
                                    );
                                } else {
                                    navigator.notification.confirm(
                                        'Do you want to create the Expense Offline?',
                                        function(buttonIndex) {
                                            invoiceExpense.createInvoiceExpenseOffline(buttonIndex, invoiceExpData, invoiceExpense.expenseId);
                                        },
                                        'Medvantage', ['Confirm', 'Cancel']
                                    );
                                }
                            });

                        }
                    });
            }
        }
    };

    invoiceExpense.createInvoiceExpenseOffline = function(buttonIndex, new_invoice_exp, invoiceExpenseId) {
        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            if (invoiceExpense.invoiceId.length === 15) {
                $scope.showAlertMessage('Cannot create expense for this Invoice Detail');
                $ionicLoading.hide();
                return false;
            }
            if (invoiceExpense.invoiceId !== '' && invoiceExpense.invoiceId !== 'null') {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceExpenseId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var obj = resp.currentPageOrderedEntries[0];
                        var offlineObj = {};
                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.object = obj.object;
                        offlineObj.data = new_invoice_exp;
                        offlineObj.randomId = invoiceExpenseId;
                        offlineObj.resync = obj.resync;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info('Expense modified offline successfully');
                            $ionicHistory.goBack();
                        });
                    } else {
                        var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                        var expName = "INVLN-Exp-" + randomId;
                        var offlineObjNew = {
                            "action": "New",
                            "type": "INVLI",
                            "Name": expName,
                            "WOName": SharedPreferencesService.getWorkOrderName(),
                            "data": new_invoice_exp,
                            "randomId": randomId,
                            "resync": false,
                            "createdDate": new Date().getTime().toString(),
                            "href": "#/app/add-invoice-expense/" + randomId + "/" + invoiceExpense.invoiceId + "/" + invoiceExpense.invoiceName + "/" + expName
                        };

                        DataService.setOfflineSoupData(offlineObjNew).then(function() {
                            toastr.info('Expense created offline successfully');
                            $ionicHistory.goBack();
                        });
                    }
                });
            }
        }
    };


    invoiceExpense.editInvoiceExpenseOffline = function(buttonIndex, old_invoice_exp, new_invoice_exp, invoiceExpenseId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            var promises = [],
                offlineObj = {
                    "action": "Edit",
                    "type": "INVLI",
                    "Name": invoiceExpense.invoiceExpenseName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "data": new_invoice_exp,
                    "randomId": invoiceExpenseId,
                    "resync": false,
                    "lock": true,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/add-invoice-expense/" + invoiceExpenseId + "/" + old_invoice_exp.invoiceId + "/" + old_invoice_exp.invoiceName + "/" + invoiceExpense.invoiceExpenseName
                };

            DataService.getSoupData(SOUPINFO.workOrderInvoiceDetails, 100).then(function(entries) {
                $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === invoiceExpense.invoiceId) {
                        var ExpenseIdIndex = $.map(entries.currentPageOrderedEntries[index].data[1].records, function(obj, subIndex) {
                            if (obj.Id === invoiceExpenseId) {
                                return subIndex; 
                            } 
                        }); 

                        invoiceExpense.expense = entries.currentPageOrderedEntries[index].data[1].records[ExpenseIdIndex];
                        invoiceExpense.expense.MedConnectDev__Expense_Type__c = new_invoice_exp.MedConnectDev__Expense_Type__c;
                        invoiceExpense.expense.MedConnectDev__Billable__c = new_invoice_exp.MedConnectDev__Billable__c;
                        invoiceExpense.expense.MedConnectDev__Apply_Warranty__c = new_invoice_exp.MedConnectDev__Apply_Warranty__c;
                        invoiceExpense.expense.MedConnectDev__Expense_Amount__c = new_invoice_exp.MedConnectDev__Expense_Amount__c;
                        invoiceExpense.expense.MedConnectDev__Discount__c = new_invoice_exp.MedConnectDev__Discount__c;
                        invoiceExpense.expense.MedConnectDev__Discount_Type__c = new_invoice_exp.MedConnectDev__Discount_Type__c;
                        invoiceExpense.expense.MedConnectDev__Description__c = new_invoice_exp.MedConnectDev__Description__c;

                        entries.currentPageOrderedEntries[index].data[1].records[ExpenseIdIndex] = invoiceExpense.expense;
                        promises.push(DataService.setSoupData(SOUPINFO.workOrderInvoiceDetails, entries.currentPageOrderedEntries));
                    } 
                }); 
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info('Expense is modified successfully in offline');
                $ionicHistory.goBack();
            });
        }
    };

    invoiceExpense.checkWarrantyValid = function(startDate, expenseEndDate) {
        var d = new Date();
        var todayDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        if (todayDate >= startDate && todayDate <= expenseEndDate) {
            return true;
        } else {
            return false;
        }
    };

}

function InvoiceLaborCtrl($q, $scope, InvoiceService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, NetworkService, SharedPreferencesService, DataService, SOUPINFO) {
    var invoiceLabor = this;
    invoiceLabor.invoiceId = $stateParams.invoiceId;
    invoiceLabor.laborId = $stateParams.laborId;
    invoiceLabor.invoiceName = $stateParams.invoiceName;
    invoiceLabor.invoiceLaborName = $stateParams.invoiceLaborName;
    var appointedTechId = SharedPreferencesService.getAppointedTechnicianId();

    invoiceLabor.labor = {};
    invoiceLabor.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    function showMessage(message) {
        navigator.notification.alert(message, alertDismissed, 'Medvantage', 'OK');
    }

    function alertDismissed() {}

    if (invoiceLabor.laborId.length === 18) {

        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        InvoiceService.getInvoiceLineItemsDetails(invoiceLabor.laborId).
        then(function(invoiceLaborRes) {
            if (invoiceLaborRes) {
                invoiceLabor.labor = invoiceLaborRes.records[0];
                invoiceLabor.labor.Activitytype = invoiceLabor.labor.MedConnectDev__Activity_Type__c;
                invoiceLabor.labor.RateType = invoiceLabor.labor.MedConnectDev__Applied_Rate_Type__c;
                invoiceLabor.labor.hours = invoiceLabor.labor.MedConnectDev__Hours_Worked__c;
                invoiceLabor.labor.rate = invoiceLabor.labor.MedConnectDev__Rate__c;
                invoiceLabor.labor.billable = invoiceLabor.labor.MedConnectDev__Billable__c;
                invoiceLabor.labor.applyWarranty = invoiceLabor.labor.MedConnectDev__Apply_Warranty__c;
                invoiceLabor.labor.discount = invoiceLabor.labor.MedConnectDev__Discount__c;
                invoiceLabor.labor.discountType = invoiceLabor.labor.MedConnectDev__Discount_Type__c;
                invoiceLabor.labor.description = invoiceLabor.labor.MedConnectDev__Description__c;

            }

            DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
                if (entries && entries.currentPageOrderedEntries.length > 0) {
                    var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                    var laborEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Labor_End_Date__c : '';

                    invoiceLabor.labor.warrantyValid = invoiceLabor.checkWarrantyValid(startDate, laborEndDate);
                }
            });
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();

            if (NetworkService.isDeviceOnline()) {
                showMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {
                invoiceLabor.getInvoiceLaborOffline(invoiceLabor.laborId);
            }

            DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
                if (entries && entries.currentPageOrderedEntries.length > 0) {
                    var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                    var laborEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Labor_End_Date__c : '';

                    invoiceLabor.labor.warrantyValid = invoiceLabor.checkWarrantyValid(startDate, laborEndDate);
                }
            });
        });
    } else {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceLabor.laborId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                invoiceLabor.labor = resp.currentPageOrderedEntries[0].data;
                invoiceLabor.labor.Activitytype = invoiceLabor.labor.MedConnectDev__Activity_Type__c;
                invoiceLabor.labor.RateType = invoiceLabor.labor.MedConnectDev__Applied_Rate_Type__c;
                invoiceLabor.labor.hours = invoiceLabor.labor.MedConnectDev__Hours_Worked__c;
                invoiceLabor.labor.rate = invoiceLabor.labor.MedConnectDev__Rate__c;
                invoiceLabor.labor.billable = invoiceLabor.labor.MedConnectDev__Billable__c;
                invoiceLabor.labor.applyWarranty = invoiceLabor.labor.MedConnectDev__Apply_Warranty__c;
                invoiceLabor.labor.discount = invoiceLabor.labor.MedConnectDev__Discount__c;
                invoiceLabor.labor.discountType = invoiceLabor.labor.MedConnectDev__Discount_Type__c;
                invoiceLabor.labor.description = invoiceLabor.labor.MedConnectDev__Description__c;

                $ionicLoading.hide();
            }
        });

        DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
            if (entries && entries.currentPageOrderedEntries.length > 0) {
                var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                    var laborEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Labor_End_Date__c : '';

                    invoiceLabor.labor.warrantyValid = invoiceLabor.checkWarrantyValid(startDate, laborEndDate);
                }
        });
    }


    invoiceLabor.getInvoiceLaborOffline = function(laborId) {
        DataService.getSoupData(SOUPINFO.workOrderInvoiceDetails, 100).then(function(entries) {
            $.map(entries.currentPageOrderedEntries, function(obj, index) {
                if (obj.Id === invoiceLabor.invoiceId) {
                    var laborIdIndex = $.map(entries.currentPageOrderedEntries[index].data[1].records, function(obj, subIndex) {
                        if (obj.Id === laborId && obj.MedConnectDev__Line_Type__c == "Labour") {
                            return subIndex; 
                        } 
                    }); 

                    invoiceLabor.labor = entries.currentPageOrderedEntries[index].data[1].records[laborIdIndex];
                    invoiceLabor.labor.Activitytype = invoiceLabor.labor.MedConnectDev__Activity_Type__c;
                    invoiceLabor.labor.RateType = invoiceLabor.labor.MedConnectDev__Applied_Rate_Type__c;
                    invoiceLabor.labor.hours = invoiceLabor.labor.MedConnectDev__Hours_Worked__c;
                    invoiceLabor.labor.rate = invoiceLabor.labor.MedConnectDev__Rate__c;
                    invoiceLabor.labor.billable = invoiceLabor.labor.MedConnectDev__Billable__c;
                    invoiceLabor.labor.applyWarranty = invoiceLabor.labor.MedConnectDev__Apply_Warranty__c;
                    invoiceLabor.labor.discount = invoiceLabor.labor.MedConnectDev__Discount__c;
                    invoiceLabor.labor.discountType = invoiceLabor.labor.MedConnectDev__Discount_Type__c;
                    invoiceLabor.labor.description = invoiceLabor.labor.MedConnectDev__Description__c;
                } 
            }); 
        });
    };


    invoiceLabor.changeRateOnActivity = function(activity_type) {

        if (typeof activity_type !== 'undefined' && activity_type !== '' && activity_type !== null) {
            if (NetworkService.isDeviceOnline()) {
                InvoiceService.getTechnicianRate(activity_type, appointedTechId).then(function(data) {
                    if (data.records.length > 0) {
                        if (data.records[0].MedConnectDev__Rate_Hr__c !== null) {
                            invoiceLabor.labor.rate = data.records[0].MedConnectDev__Rate_Hr__c;
                        } else {
                            invoiceLabor.labor.rate = 0;
                        }
                    } else {
                        invoiceLabor.labor.rate = 0;
                    }
                }, function(err) {
                    showMessage('Error Code: ' + err[0].errorCode + '\n Error message: ' + err[0].message);
                });
            } else {
                DataService.getSoupData(SOUPINFO.technicianRateHrList).then(function(entries) {
                    var bool = false;
                    if (entries.currentPageOrderedEntries.length > 0) {
                        angular.forEach(entries.currentPageOrderedEntries, function(value, index) {
                            if (value.MedConnectDev__Activity__c == activity_type && value.MedConnectDev__Technician__c == appointedTechId) {
                                if (null !== value.MedConnectDev__Rate_Hr__c) {
                                    bool = true;
                                    invoiceLabor.labor.rate = value.MedConnectDev__Rate_Hr__c;
                                } else {
                                    invoiceLabor.labor.rate = 0;
                                }
                            }
                        });
                        if (!bool) {
                            invoiceLabor.labor.rate = 0;
                        }
                    } else {
                        invoiceLabor.labor.rate = 0;
                    }
                }, function(error) {});
            }
        }
    };


    invoiceLabor.laborSave = function(laborForm) {
        if (laborForm.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            var invoiceLabData = {};
            invoiceLabData.MedConnectDev__Activity_Type__c = invoiceLabor.labor.Activitytype;
            invoiceLabData.MedConnectDev__Applied_Rate_Type__c = invoiceLabor.labor.RateType;
            invoiceLabData.MedConnectDev__Hours_Worked__c = invoiceLabor.labor.hours;
            invoiceLabData.MedConnectDev__Rate__c = invoiceLabor.labor.rate;
            invoiceLabData.MedConnectDev__Billable__c = invoiceLabor.labor.billable;
            invoiceLabData.MedConnectDev__Apply_Warranty__c = invoiceLabor.labor.applyWarranty;
            invoiceLabData.MedConnectDev__Discount__c = invoiceLabor.labor.discount;
            invoiceLabData.MedConnectDev__Discount_Type__c = invoiceLabor.labor.discountType;
            invoiceLabData.MedConnectDev__Description__c = invoiceLabor.labor.description;
            if (invoiceLabor.laborId.length === 18) {
                invoiceLabData.Id = invoiceLabor.laborId;
                InvoiceService.updateInvoiceLineItems(invoiceLabData).then(function(lab_updated) {
                        toastr.success('Labor updated successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();

                        if (NetworkService.isDeviceOnline()) {
                            showMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            navigator.notification.confirm(
                                'Do you want to edit the Labor Offline?',
                                function(buttonIndex) {
                                    invoiceLabor.editInvoiceLaborOffline(buttonIndex, invoiceLabor, invoiceLabData, invoiceLabor.laborId);
                                },
                                'Medvantage', ['Confirm', 'Cancel']
                            );
                        }

                    });

            } else {
                invoiceLabData.MedConnectDev__Invoice__c = invoiceLabor.invoiceId;
                invoiceLabData.MedConnectDev__Line_Type__c = 'Labour';
                InvoiceService.createInvoiceLineItems(invoiceLabData).then(function(lab_added) {
                        toastr.success('Labor created successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();

                        if (NetworkService.isDeviceOnline()) {
                            showMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            $ionicLoading.hide();
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceLabor.laborId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp && resp.currentPageOrderedEntries.length > 0) {
                                    navigator.notification.confirm(
                                        'Do you want to edit the Labor Offline?',
                                        function(buttonIndex) {
                                            invoiceLabor.createInvoiceLaborOffline(buttonIndex, invoiceLabData, invoiceLabor.laborId);
                                        },
                                        'Medvantage', ['Confirm', 'Cancel']
                                    );
                                } else {
                                    navigator.notification.confirm(
                                        'Do you want to create the Labor Offline?',
                                        function(buttonIndex) {
                                            invoiceLabor.createInvoiceLaborOffline(buttonIndex, invoiceLabData, invoiceLabor.laborId);
                                        },
                                        'Medvantage', ['Confirm', 'Cancel']
                                    );

                                }
                            });
                        }
                    });
            }
        }
    };


    invoiceLabor.createInvoiceLaborOffline = function(buttonIndex, new_invoice_lab, invoiceLaborId) {
        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            if (invoiceLabor.invoiceId.length === 15) {
                $scope.showAlertMessage('Cannot create labor for this Invoice Detail');
                $ionicLoading.hide();
                return false;
            }
            if (invoiceLabor.invoiceId !== '' && invoiceLabor.invoiceId !== 'null') {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceLaborId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length > 0) {
                        var offlineObj = {};
                        var obj = resp.currentPageOrderedEntries[0];
                        offlineObj.action = obj.action;
                        offlineObj.type = obj.type;
                        offlineObj.Name = obj.Name;
                        offlineObj.WOName = obj.WOName;
                        offlineObj.object = obj.object;
                        offlineObj.data = new_invoice_lab;
                        offlineObj.randomId = invoiceLaborId;
                        offlineObj.resync = obj.resync;
                        offlineObj.createdDate = new Date().getTime().toString();
                        offlineObj.href = obj.href;

                        DataService.setOfflineSoupData(offlineObj).then(function() {
                            toastr.info('Labor modified offline successfully');
                            $ionicHistory.goBack();
                        });
                    } else {
                        var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                        var labName = "INVLN-Lab-" + randomId;
                        var offlineObjNew = {
                            "action": "New",
                            "type": "INVLI",
                            "Name": labName,
                            "WOName": SharedPreferencesService.getWorkOrderName(),
                            "data": new_invoice_lab,
                            "randomId": randomId,
                            "resync": false,
                            "createdDate": new Date().getTime().toString(),
                            "href": "#/app/add-invoice-labor/" + randomId + "/" + invoiceLabor.invoiceId + "/" + invoiceLabor.invoiceName + "/" + labName
                        };

                        DataService.setOfflineSoupData(offlineObjNew).then(function() {
                            toastr.info('Labor created offline successfully');
                            $ionicHistory.goBack();
                        });
                    }
                });
            }

        }
    };

    invoiceLabor.editInvoiceLaborOffline = function(buttonIndex, old_invoice_labor, new_invoice_labor, invoiceLaborId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            var promises = [],
                offlineObj = {
                    "action": "Edit",
                    "type": "INVLI",
                    "Name": invoiceLabor.invoiceLaborName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "data": new_invoice_labor,
                    "randomId": invoiceLaborId,
                    "resync": false,
                    "lock": true,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/add-invoice-labor/" + invoiceLaborId + "/" + old_invoice_labor.invoiceId + "/" + old_invoice_labor.invoiceName + "/" + invoiceLabor.invoiceLaborName
                };

            DataService.getSoupData(SOUPINFO.workOrderInvoiceDetails, 100).then(function(entries) {
                $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === invoiceLabor.invoiceId) {
                        var laborIdIndex = $.map(entries.currentPageOrderedEntries[index].data[1].records, function(obj, subIndex) {
                            if (obj.Id === invoiceLaborId) {
                                return subIndex; 
                            } 
                        }); 

                        invoiceLabor.labor = entries.currentPageOrderedEntries[index].data[1].records[laborIdIndex];

                        invoiceLabor.labor.MedConnectDev__Activity_Type__c = new_invoice_labor.MedConnectDev__Activity_Type__c;
                        invoiceLabor.labor.MedConnectDev__Applied_Rate_Type__c = new_invoice_labor.MedConnectDev__Applied_Rate_Type__c;
                        invoiceLabor.labor.MedConnectDev__Hours_Worked__c = new_invoice_labor.MedConnectDev__Hours_Worked__c;
                        invoiceLabor.labor.MedConnectDev__Rate__c = new_invoice_labor.MedConnectDev__Rate__c;
                        invoiceLabor.labor.MedConnectDev__Billable__c = new_invoice_labor.MedConnectDev__Billable__c;
                        invoiceLabor.labor.MedConnectDev__Apply_Warranty__c = new_invoice_labor.MedConnectDev__Apply_Warranty__c;
                        invoiceLabor.labor.MedConnectDev__Discount__c = new_invoice_labor.MedConnectDev__Discount__c;
                        invoiceLabor.labor.MedConnectDev__Discount_Type__c = new_invoice_labor.MedConnectDev__Discount_Type__c;
                        invoiceLabor.labor.MedConnectDev__Description__c = new_invoice_labor.MedConnectDev__Description__c;


                        entries.currentPageOrderedEntries[index].data[1].records[laborIdIndex] = invoiceLabor.labor;
                        promises.push(DataService.setSoupData(SOUPINFO.workOrderInvoiceDetails, entries.currentPageOrderedEntries));
                    } 
                }); 
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info('Labor is modified successfully in offline');
                $ionicHistory.goBack();
            });
        }
    };

    invoiceLabor.checkWarrantyValid = function(startDate, laborEndDate) {

        var d = new Date();
        var todayDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        if (todayDate >= startDate && todayDate <= laborEndDate) {
            return true;
        } else {
            return false;
        }
    };

}

function InvoiceMaterialCtrl($q, $scope, InvoiceService, $stateParams, $state, $ionicLoading, toastr, $ionicHistory, NetworkService, SharedPreferencesService, DataService, $ionicModal, SOUPINFO, ActivityService, QuoteService, ProductsService, $timeout) {
    var invoiceMaterial = this;
    invoiceMaterial.invoiceId = $stateParams.invoiceId;
    invoiceMaterial.materialId = $stateParams.materialId;
    invoiceMaterial.invoiceName = $stateParams.invoiceName;
    invoiceMaterial.workOrderId = $stateParams.workOrderId;
    invoiceMaterial.invoiceMaterialName = $stateParams.invoiceMaterialName;

    invoiceMaterial.selectedActivity = '';
    invoiceMaterial.selectedProduct = '';
    invoiceMaterial.products = [];
    invoiceMaterial.activities = [];

    invoiceMaterial.material = {};

    invoiceMaterial.showProducts = function() {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        ProductsService.getProductsOnline().then(function(prods) {
            invoiceMaterial.products = prods.records;
            $timeout(function() {
                $ionicLoading.hide();
            }, 2000);

            $ionicModal.fromTemplateUrl('modules/invoice/products_lookup.html', {
                scope: $scope,
                animation: 'slide-in-up',
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });

        }, function(err) {
            DataService.getSoupData(SOUPINFO.productList, 50).then(
                function(entries) {
                    invoiceMaterial.products = entries.currentPageOrderedEntries;
                    $ionicLoading.hide();
                    $ionicModal.fromTemplateUrl('modules/invoice/products_lookup.html', {
                        scope: $scope,
                        animation: 'slide-in-up',
                    }).then(function(modal) {
                        $scope.modal = modal;
                        $scope.modal.show();
                    });
                },
                function(err) {
                    invoiceMaterial.products = [];
                });
        });

    };

    invoiceMaterial.select_the_product = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        invoiceMaterial.selected_product_name = name;
        invoiceMaterial.selected_product_id = id;


        if (NetworkService.isDeviceOnline()) {
            if (id) {
                QuoteService.getUnitPrice(id).then(function(unit_Data) {
                    if (unit_Data.records.length) {
                        invoiceMaterial.material.unitPrice = unit_Data.records[0].MedConnectDev__List_Price__c;
                    } else {
                        invoiceMaterial.material.unitPrice = '';
                    }
                }, function(err) {
                    $ionicLoading.hide();
                });
            }

        } else {
            DataService.getSoupData(SOUPINFO.productPriceList).then(function(entries) {
                var bool = false;
                if (entries.currentPageOrderedEntries.length > 0) {
                    angular.forEach(entries.currentPageOrderedEntries, function(value, index) {
                        if (id === value.MedConnectDev__Product__c) {
                            if (null !== value.MedConnectDev__List_Price__c) {
                                bool = true;
                                invoiceMaterial.material.unitPrice = value.MedConnectDev__List_Price__c;
                            } else {
                                bool = false;
                                invoiceMaterial.material.unitPrice = 0;
                            }
                        }
                    });
                    if (!bool) {
                        invoiceMaterial.material.unitPrice = 0;
                    }
                } else {
                    invoiceMaterial.material.unitPrice = 0;
                }
            }, function(error) {});
        }
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    invoiceMaterial.showActivities = function() {

        DataService.getSoupData(SOUPINFO.workOrderActivities, 50).then(
            function(entries) {
                if (entries.currentPageOrderedEntries.length > 0) {
                    angular.forEach(entries.currentPageOrderedEntries, function(act, index) {
                        if (act.Id === invoiceMaterial.workOrderId) {
                            invoiceMaterial.activities = act.data;
                        }
                    });
                }

                $ionicModal.fromTemplateUrl('modules/invoice/activities_lookup.html', {
                    scope: $scope,
                    animation: 'slide-in-up',
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            },
            function(err) {
                invoiceMaterial.activities = [];
            }
        );

    };

    invoiceMaterial.select_the_activity = function(id, name) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });

        invoiceMaterial.selected_activity_name = name;
        invoiceMaterial.selected_activity_id = id;
        $scope.modal.hide();
        $ionicLoading.hide();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };


    invoiceMaterial.takeMeBack = function() {
        $ionicHistory.goBack();
    };

    if (invoiceMaterial.materialId.length === 18) {
        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        InvoiceService.getInvoiceLineItemsDetails(invoiceMaterial.materialId).
        then(function(invoiceMaterialRes) {
            if (invoiceMaterialRes) {
                invoiceMaterial.material = invoiceMaterialRes.records[0];
                invoiceMaterial.selected_activity_name = (invoiceMaterial.material.MedConnectDev__Activity__r) ? invoiceMaterial.material.MedConnectDev__Activity__r.Name : '';
                invoiceMaterial.selected_activity_id = (invoiceMaterial.material.MedConnectDev__Activity__c) ? invoiceMaterial.material.MedConnectDev__Activity__c : '';
                invoiceMaterial.selected_product_name = (invoiceMaterial.material.MedConnectDev__Product__r) ? invoiceMaterial.material.MedConnectDev__Product__r.Name : '';
                invoiceMaterial.selected_product_id = (invoiceMaterial.material.MedConnectDev__Product__c) ? invoiceMaterial.material.MedConnectDev__Product__c : '';
                invoiceMaterial.material.rate = invoiceMaterial.material.MedConnectDev__Rate__c;
                invoiceMaterial.material.billable = invoiceMaterial.material.MedConnectDev__Billable__c;
                invoiceMaterial.material.applyWarranty = invoiceMaterial.material.MedConnectDev__Apply_Warranty__c;
                invoiceMaterial.material.discount = invoiceMaterial.material.MedConnectDev__Discount__c;
                invoiceMaterial.material.discountType = invoiceMaterial.material.MedConnectDev__Discount_Type__c;
                invoiceMaterial.material.description = invoiceMaterial.material.MedConnectDev__Description__c;
                invoiceMaterial.material.unitPrice = invoiceMaterial.material.MedConnectDev__Unit_Price__c;
                invoiceMaterial.material.quantity = invoiceMaterial.material.MedConnectDev__Quantity__c;

            }
            $ionicLoading.hide();
        }, function(err) {
            $ionicLoading.hide();

            if (NetworkService.isDeviceOnline()) {
                $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
            } else {

                invoiceMaterial.getInvoiceMaterialOffline(invoiceMaterial.materialId);

            }
        }).then(function() {
            //For Online Warranty valid checkbox
            DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
                if (entries && entries.currentPageOrderedEntries.length > 0) {
                    // console.log('entries',entries);
                    var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                    var materialEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Material_End_Date__c : '';

                    invoiceMaterial.material.warrantyValid = invoiceMaterial.checkWarrantyValid(startDate, materialEndDate);
                }
            });
        });
    } else {

        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceMaterial.materialId);
        navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
            if (resp && resp.currentPageOrderedEntries.length > 0) {

                invoiceMaterial.material = resp.currentPageOrderedEntries[0].data;
                invoiceMaterial.selected_activity_name = (invoiceMaterial.material.MedConnectDev__Activity__r) ? invoiceMaterial.material.MedConnectDev__Activity__r.Name : '';
                invoiceMaterial.selected_activity_id = (invoiceMaterial.material.MedConnectDev__Activity__c) ? invoiceMaterial.material.MedConnectDev__Activity__c : '';
                invoiceMaterial.selected_product_name = (invoiceMaterial.material.MedConnectDev__Product__r) ? invoiceMaterial.material.MedConnectDev__Product__r.Name : '';
                invoiceMaterial.selected_product_id = (invoiceMaterial.material.MedConnectDev__Product__c) ? invoiceMaterial.material.MedConnectDev__Product__c : '';
                invoiceMaterial.material.rate = invoiceMaterial.material.MedConnectDev__Rate__c;
                invoiceMaterial.material.billable = invoiceMaterial.material.MedConnectDev__Billable__c;
                invoiceMaterial.material.applyWarranty = invoiceMaterial.material.MedConnectDev__Apply_Warranty__c;
                invoiceMaterial.material.discount = invoiceMaterial.material.MedConnectDev__Discount__c;
                invoiceMaterial.material.discountType = invoiceMaterial.material.MedConnectDev__Discount_Type__c;
                invoiceMaterial.material.description = invoiceMaterial.material.MedConnectDev__Description__c;
                invoiceMaterial.material.unitPrice = invoiceMaterial.material.MedConnectDev__Unit_Price__c;
                invoiceMaterial.material.quantity = invoiceMaterial.material.MedConnectDev__Quantity__c;

                $ionicLoading.hide();
            }
        });
        //For Offline Warranty valid checkbox
        DataService.getSoupData(SOUPINFO.workOrderWarrentyInfo, 100).then(function(entries) {
            if (entries && entries.currentPageOrderedEntries.length > 0) {
                var startDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Start_Date__c : '';
                var materialEndDate = (entries.currentPageOrderedEntries[0].data !== null) ? entries.currentPageOrderedEntries[0].data.MedConnectDev__Material_End_Date__c : '';

                invoiceMaterial.material.warrantyValid = invoiceMaterial.checkWarrantyValid(startDate, materialEndDate);

            }
        });
    }


    invoiceMaterial.checkWarrantyValid = function(startDate, materialEndDate) {

        var d = new Date();
        var todayDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        if (todayDate >= startDate && todayDate <= materialEndDate) {
            return true;
        } else {
            return false;
        }
    };


    invoiceMaterial.getInvoiceMaterialOffline = function(materialId) {
        DataService.getSoupData(SOUPINFO.workOrderInvoiceDetails, 100).then(function(entries) {
            $.map(entries.currentPageOrderedEntries, function(obj, index) {
                if (obj.Id === invoiceMaterial.invoiceId) {

                    var MaterialIdIndex = $.map(entries.currentPageOrderedEntries[index].data[1].records, function(obj, subIndex) {
                        if (obj.Id === materialId && obj.MedConnectDev__Line_Type__c == "Material") {
                            return subIndex; 
                        } 
                    }); 


                    invoiceMaterial.material = entries.currentPageOrderedEntries[index].data[1].records[MaterialIdIndex];

                    invoiceMaterial.selected_activity_name = (invoiceMaterial.material.MedConnectDev__Activity__r) ? invoiceMaterial.material.MedConnectDev__Activity__r.Name : '';
                    invoiceMaterial.selected_activity_id = (invoiceMaterial.material.MedConnectDev__Activity__c) ? invoiceMaterial.material.MedConnectDev__Activity__c : '';
                    invoiceMaterial.selected_product_name = (invoiceMaterial.material.MedConnectDev__Product__r) ? invoiceMaterial.material.MedConnectDev__Product__r.Name : '';
                    invoiceMaterial.selected_product_id = (invoiceMaterial.material.MedConnectDev__Product__c) ? invoiceMaterial.material.MedConnectDev__Product__c : '';
                    invoiceMaterial.material.rate = invoiceMaterial.material.MedConnectDev__Rate__c;
                    invoiceMaterial.material.billable = invoiceMaterial.material.MedConnectDev__Billable__c;
                    invoiceMaterial.material.applyWarranty = invoiceMaterial.material.MedConnectDev__Apply_Warranty__c;
                    invoiceMaterial.material.discount = invoiceMaterial.material.MedConnectDev__Discount__c;
                    invoiceMaterial.material.discountType = invoiceMaterial.material.MedConnectDev__Discount_Type__c;
                    invoiceMaterial.material.description = invoiceMaterial.material.MedConnectDev__Description__c;
                    invoiceMaterial.material.unitPrice = invoiceMaterial.material.MedConnectDev__Unit_Price__c;
                    invoiceMaterial.material.quantity = invoiceMaterial.material.MedConnectDev__Quantity__c;
                } 
            }); 
        });
    };


    invoiceMaterial.populateLineItems = function(data) {
        var invoiceMaterials = [],
            invoiceLabours = [],
            invoiceExpenses = [];
        if (data.length === 0) {
            // singleInvoiceDetail.lineItemsErrorMsg = 'No records found!';
        }

        angular.forEach(data, function(value, index) {
            if (value.MedConnectDev__Line_Type__c === 'Material') {
                invoiceMaterials.push(value);
            } else if (value.MedConnectDev__Line_Type__c === 'Labour') {
                invoiceLabours.push(value);
            } else if (value.MedConnectDev__Line_Type__c === 'Expense') {
                invoiceExpenses.push(value);
            }

            //Checking for last iteration and binding data to model
            if (index == data.length - 1) {
                invoiceMaterial.invoiceMaterial = invoiceMaterials;
                invoiceMaterial.invoiceLabour = invoiceLabours;
                invoiceMaterial.invoiceExpense = invoiceExpenses;
            }
        });
    };


    invoiceMaterial.materialSave = function(materialForm) {
        if (materialForm.$valid) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });
            var invoiceMatData = {};
            invoiceMatData.MedConnectDev__Product__c = invoiceMaterial.selected_product_id;
            invoiceMatData.MedConnectDev__Activity__c = invoiceMaterial.selected_activity_id;
            invoiceMatData.MedConnectDev__Quantity__c = invoiceMaterial.material.quantity;
            invoiceMatData.MedConnectDev__Unit_Price__c = invoiceMaterial.material.unitPrice;
            invoiceMatData.MedConnectDev__Billable__c = invoiceMaterial.material.billable;
            invoiceMatData.MedConnectDev__Apply_Warranty__c = invoiceMaterial.material.applyWarranty;
            invoiceMatData.MedConnectDev__Discount__c = invoiceMaterial.material.discount;
            invoiceMatData.MedConnectDev__Discount_Type__c = invoiceMaterial.material.discountType;
            invoiceMatData.MedConnectDev__Description__c = invoiceMaterial.material.description;

            if (invoiceMaterial.materialId.length === 18) {

                invoiceMatData.Id = invoiceMaterial.materialId;
                InvoiceService.updateInvoiceLineItems(invoiceMatData).then(function(mat_updated) {
                        toastr.success('Material updated successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        navigator.notification.confirm(
                            'Do you want to edit the Material Offline?',
                            function(buttonIndex) {
                                invoiceMaterial.editInvoiceMaterialOffline(buttonIndex, invoiceMaterial, invoiceMatData, invoiceMaterial.materialId);

                            },
                            'Medvantage', ['Confirm', 'Cancel']
                        );
                    });

            } else {
                invoiceMatData.MedConnectDev__Invoice__c = invoiceMaterial.invoiceId;
                invoiceMatData.MedConnectDev__Line_Type__c = 'Material';
                InvoiceService.createInvoiceLineItems(invoiceMatData).then(function(mat_added) {
                        toastr.success('Material created successfully');
                        $ionicHistory.goBack(-1);
                    },
                    function(err) {
                        $ionicLoading.hide();

                        if (NetworkService.isDeviceOnline()) {
                            $scope.displayAlertMessage('Error Code: ' + err[0].errorCode + '\n Error Message: ' + err[0].message);
                        } else {
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceMaterial.materialId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp && resp.currentPageOrderedEntries.length > 0) {
                                    navigator.notification.confirm(
                                        'Do you want to edit the Material Offline?',
                                        function(buttonIndex) {
                                            invoiceMaterial.createInvoiceMaterialOffline(buttonIndex, invoiceMatData, invoiceMaterial.materialId);
                                        },
                                        'Medvantage', ['Confirm', 'Cancel']
                                    );
                                } else {
                                    navigator.notification.confirm(
                                        'Do you want to create the Material Offline?',
                                        function(buttonIndex) {
                                            invoiceMaterial.createInvoiceMaterialOffline(buttonIndex, invoiceMatData, invoiceMaterial.materialId);
                                        },
                                        'Medvantage', ['Confirm', 'Cancel']
                                    );

                                }
                            });
                        }
                    });
            }
        }
    };


    invoiceMaterial.createInvoiceMaterialOffline = function(buttonIndex, new_invoice_mat, invoiceMaterialId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });


            if (invoiceMaterial.invoiceId !== '' && invoiceMaterial.invoiceId !== 'null') {

                var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceMaterial.invoiceId);
                navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(offlineInvoice) {
                    if (offlineInvoice && offlineInvoice.currentPageOrderedEntries.length > 0) {
                        var obj = offlineInvoice.currentPageOrderedEntries[0];
                        var offlineInvoiceData = obj.data;
                        delete new_invoice_mat.MedConnectDev__Invoice__c;
                        if (offlineInvoiceData.hasOwnProperty('Invoice_Line_Items')) {
                            offlineInvoiceData.Invoice_Line_Items.push(new_invoice_mat);
                        } else {
                            offlineInvoiceData.Quote_Line_Items = [new_invoice_mat];
                        }

                        obj.data = offlineInvoiceData;
                        DataService.setOfflineSoupData(obj).then(function() {
                            toastr.info('Material saved to Invoice offline successfully');
                            $ionicHistory.goBack();
                        });

                    } else {
                        if (invoiceMaterialId !== '' && invoiceMaterialId !== 'null') {
                            var offlineObj = {};
                            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', invoiceMaterialId);
                            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                                if (resp.currentPageOrderedEntries.length > 0) {
                                    var obj = resp.currentPageOrderedEntries[0];
                                    offlineObj.action = obj.action;
                                    offlineObj.type = obj.type;
                                    offlineObj.Name = obj.Name;
                                    offlineObj.WOName = obj.WOName;
                                    offlineObj.ProductName = invoiceMaterial.selected_product_name;
                                    offlineObj.ActivityName = invoiceMaterial.selected_activity_name;
                                    offlineObj.data = new_invoice_mat;
                                    offlineObj.randomId = invoiceMaterialId;
                                    offlineObj.resync = obj.resync;
                                    offlineObj.createdDate = new Date().getTime().toString();
                                    offlineObj.href = obj.href;

                                    DataService.setOfflineSoupData(offlineObj).then(function() {
                                        toastr.info('Material modified offline successfully');
                                        $ionicHistory.goBack();
                                    });
                                }
                            });
                        } else {
                            var randomId = Math.floor(Math.random() * (999999999999999 - 1 + 1)) + 1; //15 digit random number
                            var matName = "INVLN-Mat-" + randomId;
                            var offlineObjNew = {
                                "action": "New",
                                "type": "INVLI",
                                "Name": matName,
                                "WOName": SharedPreferencesService.getWorkOrderName(),
                                "ActivityName": invoiceMaterial.selected_activity_name,
                                "ProductName": invoiceMaterial.selected_product_name,
                                "data": new_invoice_mat,
                                "randomId": randomId,
                                "resync": false,
                                "createdDate": new Date().getTime().toString(),
                                "href": "#/app/add-invoice-material/" + randomId + "/" + invoiceMaterial.invoiceId + "/" + invoiceMaterial.invoiceName + "/" + invoiceMaterial.workOrderId + "/" + matName
                            };

                            DataService.setOfflineSoupData(offlineObjNew).then(function() {
                                toastr.info('Material created offline successfully');
                                $ionicHistory.goBack();
                            });
                        }


                    }


                });



            }
        }
    };


    invoiceMaterial.editInvoiceMaterialOffline = function(buttonIndex, old_invoice_mat, new_invoice_mat, invoiceMaterialId) {

        if (buttonIndex === 1) {
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
            });

            var promises = [],
                offlineObj = {
                    "action": "Edit",
                    "type": "INVLI",
                    "Name": invoiceMaterial.invoiceMaterialName,
                    "WOName": SharedPreferencesService.getWorkOrderName(),
                    "ProductName": invoiceMaterial.selected_product_name,
                    "ActivityName": invoiceMaterial.selected_activity_name,
                    "data": new_invoice_mat,
                    "randomId": invoiceMaterialId,
                    "resync": false,
                    "lock": true,
                    "createdDate": new Date().getTime().toString(),
                    "href": "#/app/add-invoice-material/" + invoiceMaterialId + "/" + old_invoice_mat.invoiceId + "/" + old_invoice_mat.workOrderId + "/" + old_invoice_mat.invoiceName + "/" + invoiceMaterial.invoiceMaterialName

                };

            DataService.getSoupData(SOUPINFO.workOrderInvoiceDetails, 100).then(function(entries) {
                $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === invoiceMaterial.invoiceId) {

                        var MaterialIdIndex = $.map(entries.currentPageOrderedEntries[index].data[1].records, function(obj, subIndex) {
                            if (obj.Id === invoiceMaterialId) {
                                return subIndex; 
                            } 
                        }); 

                        invoiceMaterial.material = entries.currentPageOrderedEntries[index].data[1].records[MaterialIdIndex];

                        invoiceMaterial.material.MedConnectDev__Activity__c = new_invoice_mat.MedConnectDev__Activity__c;
                        invoiceMaterial.material.MedConnectDev__Activity__r = {};
                        invoiceMaterial.material.MedConnectDev__Activity__r.Name = invoiceMaterial.selected_activity_name;
                        invoiceMaterial.material.MedConnectDev__Product__c = new_invoice_mat.MedConnectDev__Product__c;
                        invoiceMaterial.material.MedConnectDev__Product__r = {};
                        invoiceMaterial.material.MedConnectDev__Product__r.Name = invoiceMaterial.selected_product_name;
                        invoiceMaterial.material.MedConnectDev__Billable__c = new_invoice_mat.MedConnectDev__Billable__c;
                        invoiceMaterial.material.MedConnectDev__Apply_Warranty__c = new_invoice_mat.MedConnectDev__Apply_Warranty__c;
                        invoiceMaterial.material.MedConnectDev__Unit_Price__c = new_invoice_mat.MedConnectDev__Unit_Price__c;
                        invoiceMaterial.material.MedConnectDev__Quantity__c = new_invoice_mat.MedConnectDev__Quantity__c;
                        invoiceMaterial.material.MedConnectDev__Discount__c = new_invoice_mat.MedConnectDev__Discount__c;
                        invoiceMaterial.material.MedConnectDev__Discount_Type__c = new_invoice_mat.MedConnectDev__Discount_Type__c;
                        invoiceMaterial.material.MedConnectDev__Description__c = new_invoice_mat.MedConnectDev__Description__c;

                        entries.currentPageOrderedEntries[index].data[1].records[MaterialIdIndex] = invoiceMaterial.material;
                        promises.push(DataService.setSoupData(SOUPINFO.workOrderInvoiceDetails, entries.currentPageOrderedEntries));

                    } 
                }); 
            });

            promises.push(DataService.setOfflineSoupData(offlineObj));

            $q.all(promises).then(function(resp) {
                toastr.info('Material is modified successfully in offline');
                $ionicHistory.goBack();
            });
        }
    };

}
