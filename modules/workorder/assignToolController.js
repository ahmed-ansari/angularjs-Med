app.controller('AssignToolCtrl', function ($scope, $stateParams, $state, $q, SharedPreferencesService,  $ionicLoading, AssignToolService, toastr, $ionicHistory, DataService, SOUPINFO, NetworkService) {
	  var assignTool = this;
    assignTool.isSuggestedOn = false;
    assignTool.isOthersOn = false;
    assignTool.activityId = $stateParams.activityId;
    assignTool.workorderId = $stateParams.workorderId;
    assignTool.suggestedToolList = [];
    assignTool.othersToolList = [];
    $scope.isSuggChecked = {};
    $scope.isOthersChecked = {};
    assignTool.mainArr = [];
    assignTool.already_assigned_list = [];

    $ionicLoading.show({
      template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    var woaId = SharedPreferencesService.getWorkOrderActivityId();
    
    AssignToolService.fetchAssignedIds(woaId).then(function (ids) {
        var serverInstance = 'MedConnectDev__';
        var concatStr = "SELECT Id,"+serverInstance+"Description__c,"+serverInstance+"Product__c,"+serverInstance+"Tool_Name__c,Name FROM "+serverInstance+"Tool__c";

        if (ids.records.length > 0) {
          concatStr += ' WHERE Id NOT IN (';
          angular.forEach(ids.records, function (val, index) {
            if (index == ids.records.length - 1) {
              concatStr += "'" + val.MedConnectDev__Tool__c + "')";
            } else {
              concatStr += "'" + val.MedConnectDev__Tool__c + "',";
            }
          });
        }

        AssignToolService.fetchToolList(concatStr).then(function (data) {
          assignTool.suggestedToolList = [];
          assignTool.othersToolList = [];
          var productId = SharedPreferencesService.getProductId();
          angular.forEach(data.records, function (value, key) {
            if (value.MedConnectDev__Product__c === null || productId != value.MedConnectDev__Product__c) {
              assignTool.othersToolList.push(value);
            } else if (productId == value.MedConnectDev__Product__c) {
              assignTool.suggestedToolList.push(value);
            }
          });
          
          var assignToolArray = {};
          var dataObj = {"ST": assignTool.suggestedToolList, "AT": assignTool.othersToolList};

          assignToolArray.Id = woaId;
          assignToolArray.data = dataObj;

          DataService.setSoupData(SOUPINFO.toolsList, [assignToolArray]);
          $ionicLoading.hide();
        }, function (err) {
            $ionicLoading.hide();
        });
        
        }, function (err) {
            if(!NetworkService.isDeviceOnline()){
                var querySpec = navigator.smartstore.buildExactQuerySpec('Id', woaId);
                navigator.smartstore.querySoup(SOUPINFO.toolsList.Name, querySpec, function(resp) {
                    if (resp.currentPageOrderedEntries.length !== 0) {
                        var assignToolArr = resp.currentPageOrderedEntries[0];
                        assignTool.suggestedToolList = assignToolArr.data.ST;
                        assignTool.othersToolList = assignToolArr.data.AT;
                    }
                  });
            }
            $ionicLoading.hide();
        });


    assignTool.backToActivityList = function () {
        $state.go('app.wo-activity', {"activityId": $stateParams.activityId});
    };

    assignTool.AssignSelectedTool = function () {

      assignTool.mainArr = [];

      var promises = [], failedRecords = [];

      $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
      });

      for (var pos in $scope.isSuggChecked) {
        if ($scope.isSuggChecked[pos] === true) {
          assignTool.mainArr.push(assignTool.suggestedToolList[pos]);
        }
      }

      for (var posOthers in $scope.isOthersChecked) {
        if ($scope.isOthersChecked[posOthers] === true) {
          assignTool.mainArr.push(assignTool.othersToolList[posOthers]);
        }
      }

      var description_arr = [];
      var tool_name_arr = [];
      var tool_id_arr = [];

      if (assignTool.mainArr.length > 0) {
          angular.forEach(assignTool.mainArr, function (value, index) {
            description_arr.push(value.MedConnectDev__Description__c);
            tool_name_arr.push(value.MedConnectDev__Tool_Name__c);
            tool_id_arr.push(value.Id); 

            var inputParam = {};
            inputParam.MedConnectDev__Tool__c = value.Id;
            inputParam.MedConnectDev__Work_Order_Activity__c = $stateParams.activityId;

            AssignToolService.assignToolList(inputParam).then(function(data){
                if(index === assignTool.mainArr.length - 1) {
                  if(failedRecords.length > 0){
                      toastr.info(failedRecords.length+ ' got failed and added to offline');
                  } else {
                    toastr.success('Selected tools assigned successfully');
                  }
                  $ionicHistory.goBack();
              }
            }, function(er){
                failedRecords.push(inputParam);
                 var offlineObj = {
                    "action": "New",
                    "type": "AssignTools",
                    "Name": value.Name,
                    "WOName": SharedPreferencesService.getWorkOrderActivity(),
                    "object": "MedConnectDev__Assign_Tool__c",
                    "data": inputParam,
                    "randomId": value.Id,
                    "resync" : false,
                    "createdDate": new Date().getTime().toString()
                };

                DataService.setOfflineSoupData(offlineObj);

            });

            if(index === assignTool.mainArr.length - 1) {
                if(failedRecords.length > 0){
                    toastr.info(failedRecords.length+ ' got failed and added to offline');
                } else {
                  toastr.success('Selected tools assigned successfully');
                }
                $ionicHistory.goBack();
            }
          });
      } else {
        $ionicLoading.hide();
          showAlertMessage('No Tool selected');
      }
    
    };

      function showAlertMessage(message, bool) {
        $ionicLoading.hide();
        navigator.notification.alert(message, alertDismissed(bool), 'Medvantage', 'OK');
      }

      function alertDismissed(bool) {
        if (bool) {
          $state.go('app.wo-activity', {"activityId": $stateParams.activityId});
        }
      }

    assignTool.toggleSuggested = function () {
      assignTool.isSuggestedOn = !assignTool.isSuggestedOn;
      if (assignTool.isSuggestedOn) {
        assignTool.isOthersOn = false;
      }
    };

    assignTool.toggleOthers = function () {
      assignTool.isOthersOn = !assignTool.isOthersOn;
      if (assignTool.isOthersOn) {
        assignTool.isSuggestedOn = false;
      }
    };

    assignTool.backToActivityList = function () {
        $state.go('app.wo-activity', {"activityId": $stateParams.activityId});
    };

});
