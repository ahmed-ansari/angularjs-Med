var app = angular.module('Medvantage', ['ionic', 'forceng', 'ui.router', 'ngAnimate', 'ngMaterial', 'LocalStorageModule', 'pascalprecht.translate', 'ui.calendar', 'ui.bootstrap', 'tmh.dynamicLocale', 'ngCookies', 'ngMessages', 'ngMap', 'tabSlideBox', 'angucomplete-alt', 'toastr']);
/* jshint -W100:true */
/* jshint scripturl:true */
/* jshint -W100 */
app.constant('forcengOptions', {});
app.run(function($ionicPlatform, $state, force, forcengOptions, DataService, MedvantageUtils, $rootScope, $ionicHistory) {

    $ionicPlatform.ready(function() {

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs) 

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            window.cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
        
        $rootScope.getVariableDataFromObject = function(obj, primaryVariableName, secondaryVariableName) {
            var dataToBeSent = "";
            if (obj != undefined && obj != null) {
                var retrievalObj = MedvantageUtils.getMedSQlServerInstance() + primaryVariableName;
                dataToBeSent = obj[retrievalObj];
                if (secondaryVariableName != null && secondaryVariableName != "" && dataToBeSent != null) {
                    dataToBeSent = dataToBeSent[secondaryVariableName];
                }
                if(dataToBeSent === 'null'){
                    dataToBeSent = "";
                }
            }
            return dataToBeSent;
        };

        $rootScope.showAlertMessage = function(message) {
            navigator.notification.alert(message, function() {
                $ionicHistory.goBack();
            }, 'Medvantage', 'OK');
        };
         $rootScope.displayAlertMessage = function(message) {
            navigator.notification.alert(message, function() {            
            }, 'Medvantage', 'OK');
        };

        // Initialize forceng
         // $state.go('app.calendar');return;
        force.init(forcengOptions);

        if (forcengOptions.accessToken) {
            // If the accessToken was provided (typically when running the app from within a Visualforce page,
            // go straight to the contact list
            DataService.syncUpAutomaticData();
            $state.go('app.calendar');
            // $state.go('app.settings');
        } else {
            // Otherwise (the app is probably running as a standalone web app or as a hybrid local app with the
            // Mobile SDK, login first.)  
            force.login().then(
                function() {
                    //Initialize data soups
                    DataService.initializeSoups();
                    MedvantageUtils.initializeMedConfigObject().then(function(result) {
                        MedvantageUtils.setMedConfigData(result);
                    });
                    $state.go('app.calendar');
                    // $state.go('app.settings');

                },
                function(error) {
                    alert("Login was not successful");
                });
        }

    });
});
 

/*For translate */
app.config(function($translateProvider) {
    // $translateProvider.useSanitizeValueStrategy('sanitize');
    $translateProvider.useMissingTranslationHandlerLog();

    $translateProvider.useStaticFilesLoader({
        prefix: 'assets/resources/locale-', // path to translations files
        suffix: '.json' //  suffix, currently- extension of the translations
    });
    // $translateStaticFilesLoader
    $translateProvider.preferredLanguage('en_US'); // is applied on first load
    $translateProvider.useLocalStorage(); // saves selected language to localStorage
});

/*Configuration for routes */
app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$provide', 'localStorageServiceProvider', 'toastrConfig','$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $httpProvider, $provide, localStorageServiceProvider, toastrConfig, $ionicConfigProvider) {

    localStorageServiceProvider.setPrefix('Medvantage');
    

    angular.extend(toastrConfig, {
        positionClass: 'toast-bottom-right'
    });

    $ionicConfigProvider.views.swipeBackEnabled(false);

    $urlRouterProvider.otherwise('/app');

    $stateProvider
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "modules/nav/nav.html",
            controller: 'NavController as nav'
        })
        .state('app.contactlist', {
            cache: false,
            url: "/contactlist",
            views: {
                'menuContent': {
                    templateUrl: "modules/contact/contact-list.html",
                    controller: 'ContactListCtrl as contactlist'
                }
            }
        })
        .state('app.contact', {
            url: "/contacts/:contactId",
            views: {
                'menuContent': {
                    templateUrl: "modules/contact/contact.html",
                    controller: 'ContactCtrl as singlecontact'
                }
            }
        })
        .state('app.cmap', {
            url: "/contact-map/:contactId",
            views: {
                'menuContent': {
                    templateUrl: "modules/contact/contactmap.html",
                    controller: 'ContactMapCtrl as contactmap'
                }
            }
        })
        .state('app.add-contact', {
            url: "/create-contact",
            views: {
                'menuContent': {
                    templateUrl: "modules/contact/edit-contact.html",
                    controller: 'CreateContactCtrl as createcontact'
                }
            }
        })


    //Account
    .state('app.accountlist', {
            cache: false,
            url: "/accountlist",
            views: {
                'menuContent': {
                    templateUrl: "modules/account/account-list.html",
                    controller: 'AccountListCtrl as accountlist'
                }
            }
        })
        .state('app.account', {
            url: "/accounts/:accountId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/account/account.html",
                    controller: 'AccountCtrl as singleaccount'
                }
            }
        })
        .state('app.servicecontract', {
            url: "/servicecontract/:serviceId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/account/service_contract.html",
                    controller: 'ServiceContractCtrl as servicecontract'
                }
            }
        })
        .state('app.acmap', {
            url: "/account-map/:accountId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/account/accountmap.html",
                    controller: 'AccountMapCtrl as accountmap'
                }
            }
        })
        .state('app.add-account', {
            url: "/create-account",
            views: {
                'menuContent': {
                    templateUrl: "modules/account/edit-account.html",
                    controller: 'CreateAccountCtrl'
                }
            }
        })

    .state('app.show-note', {
        url: "/show-note/:noteId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/contact/show-note.html",
                controller: 'ShowNoteCtrl as shownote'
            }
        }
    })

    .state('app.show-attachment', {
        url: "/show-attachment/:attachmentId",
        views: {
            'menuContent': {
                templateUrl: "modules/contact/show-attachment.html",
                controller: 'ShowAttachmentCtrl as showattachment'
            }
        }
    })

    //Products
    .state('app.productlist', {
            url: "/productlist",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/product/product-list.html",
                    controller: 'ProductListCtrl as productlist'
                }
            }
        })
        .state('app.product', {
            url: "/products/:productId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/product/product.html",
                    controller: 'ProductCtrl as singleproduct'
                }
            }
        })

    .state('app.assetlist', {
            url: "/assetlist",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/asset/asset-list.html",
                    controller: 'AssetListCtrl as assetlist'
                }
            }
        })
        .state('app.asset', {
            url: "/assets/:assetId",
            views: {
                'menuContent': {
                    templateUrl: "modules/asset/asset.html",
                    controller: 'AssetCtrl as singleasset'
                }
            }
        })


    //calendar
    .state('app.calendar', {
            url: "/calendar",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/calendar/index.html",
                    controller: 'CalendarController'
                }
            }
        })
        .state('app.workorder', {
            url: "/workorder/:workorderId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/workorder.html",
                    controller: 'WorkOrderCtrl as singleWorkOrder'
                }
            }
        })
        .state('app.acceptorder', {
            url: "/acceptorder",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/acceptorder.html",
                    controller: 'AcceptRejectOrderCtrl as acceptRejectOrder'
                }
            }
        })
        .state('app.rejectorder', {
            url: "/rejectorder",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/rejectorder.html",
                    controller: 'AcceptRejectOrderCtrl as acceptRejectOrder'
                }
            }
        })

        .state('app.rmaorder', {
            url: "/rmaorder/:rmaorderId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/wo_rmadetail.html",
                    controller: 'RMAController as singleRMA'
                }
            }
        })


    .state('app.returnaction', {
        url: "/returnaction/:returnActionId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/wo_rmaorder_returnDetail.html",
                controller: 'ReturnActionController as returnaction'
            }
        }
    })

    .state('app.loaner', {
        url: "/loaner/:loanerId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/wo_rmaorder_loanerDetail.html",
                controller: 'LoanerController as singleLoaner'
            }
        }
    })


    .state('app.add-wo-activity', {
        url: "/add-activity/:workorderId/:activityId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/add_activity.html",
                controller: "ActivityCtrl as activity"
            },
            params: {
                workorderId: null,
                activityId: null
            }
        }
    })

     //test instruction
    .state('app.add-testinstruction', {
        url: "/add-testinstruction/:RAId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/add_testinstruction.html",
                controller: "TestInstructionCtrl as testinstruction"
            }
        }
    })
    .state('app.testinstructiontest', {
        url: "/testinstructiontest/:testId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/test_instructionTestNow.html",
                controller: "TestInstructionCtrl as testinstruction"
               // controller: "RepairAnalysisDetailCtrl as singleRA"

               
            }
        }
    })
    .state('app.testinstructionview', {
        url: "/testinstructionview/:testId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/test_instructionView.html",
               controller: "TestInstructionCtrl as testinstruction"
            }
        }
    })
    .state('app.create-wo-tool', {
            url: "/create-wo-tool/:activityId",
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/create_tool.html",
                    controller: "CreateToolCtrl as createTool"
                }
            }
        })
        .state('app.assign_tool_details', {
            url: "/assign_tool_details/:assignToolId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/assign_details.html",
                    controller: "AssignToolDetailsCtrl as assignDetails"
                }
            }
        })

    .state('app.assign-wo-tool', {
        url: "/assign-wo-tool/:activityId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/assign_tool.html",
                controller: "AssignToolCtrl as assignTool"
            }
        }
    })

    .state('app.wo-activity', {
        url: "/activity/:activityId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/activity.html",
                controller: "ActivityDetailCtrl as singleActivity"
            }
        }
    })

    .state('app.add-wo-expense', {
        url: "/add-expense/:workorderId/:expenseId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/add_expense.html",
                controller: "ExpenseCtrl as expense"
            }
        }
    })

    .state('app.wo-expense', {
            url: "/expense/:expenseId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/expense.html",
                    controller: "ExpenseDetailCtrl as singleExpense"
                }
            }
        })
        //Repair Analysis
        .state('app.add-wo-repair-analysis', {
            url: "/add-repair-analysis/:workorderId/:RAId",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/workorder/add_repair_analysis.html",
                    controller: "RepairAnalysisCtrl as RA"
                }
            }
        })

    .state('app.wo-repair-analysis', {
        url: "/repair-analysis/:repair_analysisId/:assetId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/repair_analysis.html",
                controller: "RepairAnalysisDetailCtrl as singleRA"
            }
        }
    })
    //Quote
    .state('app.add-wo-quote', {
        url: "/add-quote/:workorderId/:quoteId/:revise",
        views: {
            'menuContent': {
                templateUrl: "modules/quote/add_quote.html",
                controller: "QuoteCreationCtrl as quoteCreate"
            }
        }
    })
    .state('app.add-wo-invoice', {
        url: "/add-invoice/:workorderId/:accountId/:contactId/:invoiceStatus/:invoiceId/:invoiceName",
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/add_invoice.html",
                controller: "InvoiceCtrl as invoice"
            }
        }
    }) 
    .state('app.add-wo-invoice-detail', {
        url: "/add-invoice-detail/:workorderId/:invoiceId/:invoiceName/:invoiceDetailId/:quoteName",
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/add_invoice_detail.html",
                controller: "CreateInvoiceDetailCtrl as createInvoiceDetail"
            }
        }
    })
    .state('app.wo-quote', {
        url: "/quote/:quoteId/:workOrderID",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/quote.html",
                controller: "QuoteCtrl as singleQuote"
            }
        }
    })
    .state('app.wo-invoice', {
        url: "/invoice/:invoiceId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/invoice.html",
                controller: "WOInvoiceCtrl as singleWOInvoice"
            }
        }
    })
    .state('app.invoice-detail', {
        url: "/invoice-detail/:invoiceDetailId/:invoiceDetailName",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/invoice-details.html",
                controller: "InvoiceDetailsCtrl as singleInvoiceDetail"
            }
        }
    })
    .state('app.add-invoice-expense', {
        url: "/add-invoice-expense/:expenseId/:invoiceId/:invoiceName/:invoiceExpenseName",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/add-expense.html",
                controller: "InvoiceExpenseCtrl as invoiceExpense"
            }
        }
    })
    .state('app.add-invoice-material', {
        url: "/add-invoice-material/:materialId/:invoiceId/:invoiceName/:workOrderId/:invoiceMaterialName",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/add-material.html",
                controller: "InvoiceMaterialCtrl as invoiceMaterial"
            }
        }
    })
    .state('app.quote-labour', {
        url: "/quote-labour/:labourId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/labour-detail.html",
                controller: "QuoteLabourDetailCtrl as quoteLabour"
            }
        }
    })
    .state('app.quote-material', {
        url: "/quote-material/:materialId/:workOrderId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/material-detail.html",
                controller: "QuoteMaterialDetailCtrl as quoteMaterial"
            }
        }
    })
    .state('app.quote-expense', {
        url: "/quote-expense/:expenseId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/expense-detail.html",
                controller: "QuoteExpenseDetailCtrl as quoteExpenseData"
            }
        }
    })
    .state('app.invoice-labour', {
        url: "/invoice-labour/:labourId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/labour-detail.html",
                controller: "InvoiceLabourDetailCtrl as invoiceLabour"
            }
        }
    })
    .state('app.invoice-material', {
        url: "/invoice-material/:materialId/:workOrderId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/material-detail.html",
                controller: "InvoiceMaterialDetailCtrl as invoiceMaterial"
            }
        }
    })
    .state('app.invoice-expense', {
        url: "/invoice-expense/:expenseId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/expense-detail.html",
                controller: "InvoiceExpenseDetailCtrl as invoiceExpenseData"
            }
        }
    })
    .state('app.add-quote-expense', {
        url: "/add-quote-expense/:expenseId/:quoteId/:quoteName",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/add-expense.html",
                controller: "QuoteExpenseCtrl as quoteExpense"
            }
        }
    })
     .state('app.add-invoice-labor', {
        url: "/add-invoice-labor/:laborId/:invoiceId/:invoiceName/:invoiceLaborName",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/invoice/add-labour.html",
                controller: "InvoiceLaborCtrl as invoiceLabor"
            }
        }
    })
    .state('app.add-quote-labour', {
        url: "/add-quote-labour/:labourId/:quoteId/:quoteName",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/add-labour.html",
                controller: "QuoteLabourCtrl as quoteLabour"
            }
        }
    })
    .state('app.add-quote-material', {
        url: "/add-quote-material/:materialId/:quoteId/:workOrderId/:quoteName/",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/quote/add-material.html",
                controller: "QuoteMaterialCtrl as quoteMaterial"
            }
        }
    })
    .state('app.add-camera', {
        url: "/camera/:parentId/",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/camera.html",
                controller: "CameraCtrl as camera"
            }
        }
    })

    .state('app.analysis-code', {
        url: "/analysis-code",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/analysis_code.html",
                controller: "AnalysisCodeCtrl as analysisCode"
            }
        }
    })

    .state('app.fault-code', {
        url: "/fault-code",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/fault_code.html",
                controller: "FaultCodeCtrl as faultCode"
            }
        }
    })

    .state('app.child-code', {
        url: "/child-code/:parentId",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/child_codes.html",
                controller: "ChildCodeCtrl as childCode"
            }
        }
    })

    .state('app.install-asset', {
        url: "/install-asset",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/install_asset.html",
                controller: "InstallAssetCtrl as installAsset"
            }
        }
    })

    .state('app.uninstall-asset', {
        url: "/uninstall-asset",
        cache: false,
        views: {
            'menuContent': {
                templateUrl: "modules/workorder/uninstall_asset.html",
                controller: "UninstallAssetCtrl as uninstallAsset"
            }
        }
    })

    //Setting
    .state('app.settings', {
            url: "/settings",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/setting/index.html",
                    //controller: 'SettingController as syncSettings'
                }
            }
        })
        .state('app.sync', {
            url: "/settings/sync",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/setting/syncSetting.html",
                    controller: 'syncController as syncSettings'
                }
            }
        })
        .state('app.offline', {
            url: "/settings/offline",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/setting/offlineData.html",
                    controller: 'offlineController as offlineData'
                }
            }
        })
        .state('app.filter', {
            url: "/settings/filter",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/setting/filter.html",
                    controller: 'filterController as filter'
                }
            }
        })
        .state('app.inventorylist', {
            url: "/inventorylist",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "modules/inventory/inventory-list.html",
                    controller: 'InventoryListCtrl as inventorylist'
                }
            }
        })
        .state('app.inventory', {
            url: "/inventory/:inventoryId",
            views: {
                'menuContent': {
                    templateUrl: "modules/inventory/inventory.html",
                    controller: 'InventoryCtrl as singleinventory'
                }
            }
        })
        .state('app.inventory-item-detail', {
            url: "/inventoryItemDetail/:itemId",
            views: {
                'menuContent': {
                    templateUrl: "modules/inventory/line_item_detail.html",
                    controller: 'LineItemCtrl as lineitem'
                }
            }
        })
        .state('app.inventory-transactions-detail', {
            url: "/inventoryTransactionsDetail/:transId",
            views: {
                'menuContent': {
                    templateUrl: "modules/inventory/transactions_detail.html",
                    controller: 'InventoryTransactionsCtrl as trans'
                }
            }
        });
        //  .state('app.inventory-transactions-detail-type', {
        //     url: "/inventoryTransactionsDetailType/:transId",
        //     views: {
        //         'menuContent': {
        //             templateUrl: "modules/inventory/transactions_type_detail.html",
        //             controller: 'InventoryTransactionsTypeCtrl as transType'
        //         }
        //     }
        // })

}]);

app.run(function($rootScope, DataService, $state, toastr, MedvantageUtils, $timeout, localStorageService, $ionicHistory) {

    $rootScope.isSuccess = false;
    $rootScope.freezePendingRecords = false;
    $rootScope.anaCodeArr = [];
    $rootScope.faultCodeArr = [];
    $rootScope.showActivity = false;

    $rootScope.backCounter = 0;

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
       
        if (fromState.name === 'app.add-wo-expense' && toState.name === 'app.wo-expense') {
                $timeout(function(){
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-wo-expense') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-wo-activity' && toState.name === 'app.wo-activity') {
                $timeout(function(){
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-wo-activity') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-wo-repair-analysis' && toState.name === 'app.wo-repair-analysis') {
                $timeout(function(){
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-wo-repair-analysis') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-wo-quote' && toState.name === 'app.wo-quote') {
                $timeout(function(){
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-wo-quote') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-wo-invoice' && toState.name === 'app.wo-invoice') {
                $timeout(function(){
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-wo-invoice') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-wo-invoice-detail' && toState.name === 'app.invoice-detail') {
                $timeout(function(){
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-wo-invoice-detail') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        /*if (fromState.name === 'app.child-code' && toState.name === 'app.wo-repair-analysis') {
            console.log('came from child to repair analysis');
                $timeout(function(){
                    console.log('ionic history : ',$ionicHistory);
                    console.log('back view ionic history',$ionicHistory.viewHistory());
                    console.log('back view',$ionicHistory.backView());
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.child-code') {
                        alert("backCounter: " + $rootScope.backCounter);
                        
                    }
                },600);
        }*/

        if (fromState.name === 'app.wo-activity' && toState.name === 'app.add-wo-repair-analysis') {
            $rootScope.showActivity = true;
        } else {
            $rootScope.showActivity = false;
        }

        /*if (fromState.name === 'app.add-quote-expense' && toState.name === 'app.quote-expense') {
            console.log('came from add to detail');
                $timeout(function(){
                    console.log('back view',$ionicHistory.backView());
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-quote-expense') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-quote-labour' && toState.name === 'app.quote-labour') {
            console.log('came from add to detail');
                $timeout(function(){
                    console.log('back view',$ionicHistory.backView());
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-quote-labour') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }

        if (fromState.name === 'app.add-quote-material' && toState.name === 'app.quote-material') {
            console.log('came from add to detail');
                $timeout(function(){
                    console.log('back view',$ionicHistory.backView());
                    if ($ionicHistory.backView() && $ionicHistory.backView().stateName === 'app.add-quote-material') {
                        $ionicHistory.removeBackView();
                    }
                },600);
        }*/



        //Checking internet Status
        var Internet_handler = MedvantageUtils.checkInternetAvailability();
        if (Internet_handler === 'No network connection') {
            $timeout(function() {
                angular.element('.offline-img').show();
            },1000);
        }

        //checking syncup process
        var syncup_handler = localStorageService.get('syncup');
        if (syncup_handler === true) { 
              $timeout(function() {
                 angular.element('.syncup-img').show();
            },1000);
        }
        $rootScope.previousState = fromState;
    });
    
    document.addEventListener("online",function () {
        DataService.syncUpAutomaticData();
        angular.element('.offline-img').hide();
        toastr.info('You are now online');
    }, false);

    document.addEventListener("offline", function() {
        angular.element('.offline-img').show();
        toastr.error('Device is not connected to the Internet');
    }, false);

});
