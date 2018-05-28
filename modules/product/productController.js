app.controller('ProductListCtrl', function($scope, force,  $ionicModal, ProductsService, localStorageService, $ionicLoading, DataService, SOUPINFO) {

    var productlist = this;
    productlist.no_product = 'No Records Found!';

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    var filterValue = localStorageService.get("filterValue");
    if (filterValue === null) {
      productlist.filterContact = 7;
    } else {
      productlist.filterContact = filterValue;
    }

    productlist.noMoreItemsAvailable = true;
    productlist.loggedInId = '';

    var sfOAuthPlugin  = cordova.require("com.salesforce.plugin.oauth");
    sfOAuthPlugin.getAuthCredentials(function(usr) {
        productlist.loggedInId = usr.userId;
        productlist.callList(productlist.filterContact, productlist.loggedInId);
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
    *   Desc - fetches product list
    *   @param - days - [number of days], userId [loggedIn user Id]
    */
    productlist.callList = function(days, userId) {
          DataService.getSoupData(SOUPINFO.productList, rec_entries).then(
                function (entries) {
                  productlist.products = entries.currentPageOrderedEntries;
                  productlist.noMoreItemsAvailable = true;
                   $ionicLoading.hide();
                },
                function (err) {
                  productlist.accounts = [];
                  $ionicLoading.hide();
                }
              );
          $ionicLoading.hide();
    };
    productlist.entries = 0;
})

.controller('ProductCtrl', function($window, $scope, $stateParams, ProductsService, $q, $ionicLoading,DataService, SOUPINFO, $timeout) {
    var singleproduct = this;
    var productSubModulesList=["product","part_list","activity"];
    singleproduct.dontProceed = false;
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    var productID = $stateParams.productId;
    var ppromise1 = ProductsService.getProductById(productID);
    var ppromise2 = ProductsService.getProductPartList(productID);
    var ppromise3 = ProductsService.getProductActivityInstruction(productID);

    $q.all([ppromise1, ppromise2, ppromise3]).
    then(
        function(data) {
            data[0].records[0].MedConnectDev__Consumer_site__c = (data[0].records[0].MedConnectDev__Consumer_site__c && data[0].records[0].MedConnectDev__Consumer_site__c != 'null') ? "http://" + data[0].records[0].MedConnectDev__Consumer_site__c : '';
            singleproduct.product = data[0].records[0];
            singleproduct.part_list = data[1].records;
            singleproduct.activity = data[2].records;
            $ionicLoading.hide();

          angular.forEach(productSubModulesList,function(module){
            storeProductDataInOffline(module,productID);
          });

          angular.element($window).on('resize', setProductHt);

          $timeout(function() {
            angular.element('.item-note').show().css('color', 'black');
            angular.element('.item-note a').show().css('color', 'blue');
            setProductHt();
          }, 800);

        },
        function(err) {  
             
          angular.forEach(productSubModulesList,function(module){
            getProductDataFromOffline(module,productID);
          });

          $timeout(function() {
            angular.element('.item-note').show().css('color', 'black');
            angular.element('.item-note a').show().css('color', 'blue');
            angular.element($window).on('resize', setProductHt);
            setProductHt();
          }, 800);
           $ionicLoading.hide();
        }
    );

    function cleanUp() {
        angular.element($window).off('resize', setProductHt);
    }

    $scope.$on('$destroy', cleanUp);

    /** 
    *   Desc - set account  page height
    *   @param - none
    */
    function setProductHt() {
      var windowHt = $(window).outerHeight(true);
      var headerHt = $(".bar-header").outerHeight(true);
      var subNameHt = $(".subTopHdr").outerHeight(true);
      var subHeaderHt = $(".subtmHdr").outerHeight(true);
      var tabHt = $(".tsb-icons").outerHeight(true);
      var subCtInfo = $(".cntInfo").outerHeight(true);
      //Adding 30px as buffer
      var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt + 40);
      var cntCtOthersHt = windowHt - (headerHt + subNameHt + subHeaderHt + subCtInfo + tabHt + 40);
      $(".scrollPtHtGI").css({"height": cntCtHt, "overflow": "auto"});
      $(".scrollPtHt").css({"height": cntCtOthersHt, "overflow": "auto"});
    }

    /** 
    *   Desc - store offline data in soup
    *   @param - none
    */
    function storeProductDataInOffline(type, productId) {
      var configObject=getProductPreFilledJSONArray(type);
      var ProductDetailsArr = [];
      var productDetailsObj = {};
      productDetailsObj.Id = productId;
      productDetailsObj.data = singleproduct[type];
      ProductDetailsArr.push(productDetailsObj);
      DataService.setSoupData(configObject.soupName, ProductDetailsArr);
    }
    /** 
    *   Desc - fetch offline data from soup
    *   @param - type [ tabs of product], product Id[product Id]
    */
    function getProductDataFromOffline(type, productId) {
         if (singleproduct.dontProceed) {
            return;
        }
      var configObject=getProductPreFilledJSONArray(type);
      DataService.getSoupData(configObject.soupName, 10).then(
        function (entries) {
          var productIdIndex = $.map(entries.currentPageOrderedEntries, function (obj, index) {
            if (obj.Id === productId){
              return index;
            } 
          });
                if (productIdIndex.length === 0) {
                    if (singleproduct.product === undefined && singleproduct.dontProceed === false) {
                        singleproduct.dontProceed = true;
                        $scope.showAlertMessage('No Offline Data Found');
                        return;
                    }
                }
          singleproduct[type]=entries.currentPageOrderedEntries[productIdIndex].data;
          if (type === 'product') {
            singleproduct[type].MedConnectDev__Consumer_site__c = (singleproduct[type].MedConnectDev__Consumer_site__c && singleproduct[type].MedConnectDev__Consumer_site__c != 'null') ? "http://" + singleproduct[type].MedConnectDev__Consumer_site__c : '';
          }
          $ionicLoading.hide();
        },
        function (err){
          $ionicLoading.hide();
        }
      );
    }
    /** 
    *   Desc - Maps the soups names to the tabs of products pages for showing in offline
    *   @param - type [ tabs of products]
    */
    function getProductPreFilledJSONArray(type) {
      var configJSON = {};
      switch (type) {
        case 'product':
          configJSON.soupName = SOUPINFO.productDetails;
          return configJSON;
        case 'part_list':
          configJSON.soupName = SOUPINFO.productPartDetails;
          return configJSON;
        case 'activity':
          configJSON.soupName = SOUPINFO.productActivityInstructionDetails;
          return configJSON;
      }
    }
});
