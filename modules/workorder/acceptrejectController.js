app.controller('AcceptRejectOrderCtrl', function ($scope,$state, $stateParams, $q, $ionicLoading, SharedPreferencesService, AcceptRejectWorkOrderService, $ionicHistory) {

  var acceptRejectOrder = this;
  var date = new Date();
  var NOT_A_TECHNICIAN = 'The current user is not an appointed technician';
  acceptRejectOrder.reason = '';

  acceptRejectOrder.woName = SharedPreferencesService.getWorkOrderName();
  acceptRejectOrder.currentDate = SharedPreferencesService.getMonth(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getFullYear();
  acceptRejectOrder.altTime = SharedPreferencesService.getAlternateTime();
  acceptRejectOrder.signComments = 'I Accepted';
  var workOrderId = SharedPreferencesService.getWorkOrderId();
  var productId = SharedPreferencesService.getProductId();
  var appointedTechnicianId = SharedPreferencesService.getAppointedTechnicianId();
  var assignedTechnicianId = SharedPreferencesService.getAssignedTechnicianId();
  var loggedInUserId = SharedPreferencesService.getLoggedInUserId();

  acceptRejectOrder.isApplicableForWOAcceptReject = function (processType) {
    
    $ionicLoading.show({
      template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    if (acceptRejectOrder.userId) {
      if (acceptRejectOrder.password) {
        if (processType === 'RejectWorkOrder' && acceptRejectOrder.reason === '') {
            showAlertMessage('Please enter the reason for rejection');
        } else {
            var promise1 = AcceptRejectWorkOrderService.getUserIdFromTechId(appointedTechnicianId);
            var promise2 = AcceptRejectWorkOrderService.getLoggedInUserIdFromEmail(acceptRejectOrder.userId);

            $q.all([promise1, promise2]).then(function (data) {

              var technicianUserId, enteredUserId = null;

              if (data[0].records.length > 0) {
                technicianUserId = data[0].records[0].MedConnectDev__User__c;
                if (technicianUserId.length == 18) {
                  technicianUserId = technicianUserId.substr(0, 15);
                }
              }

              if (data[1].records.length > 0) {
                enteredUserId = data[1].records[0].Id;
                if (enteredUserId.length == 18) {
                  enteredUserId = enteredUserId.substr(0, 15);
                }
              }

              if (enteredUserId !== null) {
                if (technicianUserId != enteredUserId) {
                showAlertMessage('The current user is not an appointed technician');
                } else {
                if (assignedTechnicianId !== null && processType == 'AcceptWorkOrder') {
                  showAlertMessage('The Work Order ' + acceptRejectOrder.woName + ' is already accepted');
                } else {
                  acceptRejectOrder.checkWorkOrderAccept(processType);
                }
                }
              } else {
                showAlertMessage('Username/password is not correct');
              }
              
            }, function (err) {
              showAlertMessage('Error in fetching data');
            });
        }
      } else {
        showAlertMessage('Please enter password');
      }
    } else {
      showAlertMessage('Please enter username');
    }
  };

  acceptRejectOrder.clearFields = function (processType) {
    acceptRejectOrder.userId = '';
    acceptRejectOrder.password = '';
    if (processType === 'AcceptWorkOrder') {
      acceptRejectOrder.signComments = 'I Accepted';
    } else if (processType === 'RejectWorkOrder') {
      acceptRejectOrder.altTime = '';
      acceptRejectOrder.reason = '';
      acceptRejectOrder.signComments = '';
    }
  };

  acceptRejectOrder.checkWorkOrderAccept = function (processType) {
    acceptRejectOrder.checkValidUserWhileAcceptRejectWO(acceptRejectOrder.userId, acceptRejectOrder.password, processType);
  };

  acceptRejectOrder.checkValidUserWhileAcceptRejectWO = function (username, password, processType) {

    var requestJSON = {
      'userName': username,
      'userPassword': password
    };

    AcceptRejectWorkOrderService.validateUser('POST', requestJSON).then(function (response) {

      if (typeof response.status != 'undefined' && response.status == 'ValidUser') {
        acceptRejectOrder.checkWhetherUserExistsInOrg(username, processType);
      } else if (typeof response.status != 'undefined' && response.status == 'InvalidUser') {
        showAlertMessage('Invalid username or password');
        acceptRejectOrder.userId = null;
        acceptRejectOrder.password = null;
        acceptRejectOrder.signComments = 'I Accepted';
      }
    }, function (err) {
      $ionicLoading.hide();
    });
  };

  acceptRejectOrder.checkWhetherUserExistsInOrg = function (username, processType) {

    AcceptRejectWorkOrderService.checkUserInOrg(username).then(function (data) {
      var userInfoId = data.records[0].Id;
      acceptRejectOrder.processWorkOrderAccept(userInfoId, processType);

    }, function (err) {
      $ionicLoading.hide();
      showAlertMessage('User ' + username + ' is not available!');
    });
  };

  acceptRejectOrder.processWorkOrderAccept = function (userInfoId, processType) {
    var processingStatus = "";
    var queueId = null;
    var woRecord = {};
    var productId = '';

    if (processType == 'AcceptWorkOrder') {
      woRecord.MedConnectDev__Assigned_Technician__c = userInfoId;
      woRecord.MedConnectDev__Processing_Status__c = 'Accepted by FSE/Scheduled';
      woRecord.MedConnectDev__Reason_For_Change__c = 'Via Approval Process';
      woRecord.MedConnectDev__Signature_Comment__c = acceptRejectOrder.signComments;

      acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);
    } else if (processType == 'RejectWorkOrder') {

      woRecord.MedConnectDev__Assigned_Technician__c = null;
      woRecord.MedConnectDev__Appointed_Technician__c = null;
      woRecord.MedConnectDev__Processing_Status__c = 'Rejected by FSE';
      woRecord.MedConnectDev__Reason_For_Change__c = 'Via Approval Process';
      woRecord.MedConnectDev__Signature_Comment__c = acceptRejectOrder.reason;
      woRecord.MedConnectDev__Alternate_Time__c = acceptRejectOrder.altTime;

      var recordType = SharedPreferencesService.getRecordType();

      // If Record Type of the WO is 'Field Service'
      // then update OwnerId of WO with Id of Field Service Manager Queue
      if (recordType == 'Field Service') {
        AcceptRejectWorkOrderService.getIdOnRecordType().then(function (response) {
          if (typeof response.records != 'undefined' && response.records.length > 0) {
            queueId = response.records[0].Id;
            // Update Owner Id in every case in Reject scenario
            woRecord.OwnerId = queueId;
            acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);
          }
        });
      } else if (recordType == 'Depot Repair') {
          var depotQueue = SharedPreferencesService.getDepotQueue();
          if (typeof depotQueue !== undefined && depotQueue !== '' && depotQueue !== null) {
            queueId = SharedPreferencesService.getDepotQueue();
            if(queueId && queueId.length > 0) {
              woRecord.OwnerId = queueId;
            }
          }
          acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);

      } else {
          acceptRejectOrder.updateWorkOrderWhenAcceptReject(workOrderId, productId, woRecord, userInfoId, processType);
      }

    }
  };

  acceptRejectOrder.updateWorkOrderWhenAcceptReject = function (workOrderId, productId, woRecord, userInfoId, processType) {

    AcceptRejectWorkOrderService.getDetailsFromWOAction(workOrderId).then(function (response) {
      var woaList = null;
      var woaRecord = {};
      var action = '';
      if (processType == 'AcceptWorkOrder')
        action = 'Accept';
      else
        action = 'Reject';

      if (response.records.length > 0)
        woaList = response.records[0];

      woaRecord.MedConnectDev__Action_Label__c = action;
      woaRecord.MedConnectDev__Action_Name__c = action;
      woaRecord.MedConnectDev__Comments__c = woRecord.MedConnectDev__Signature_Comment__c;
      woaRecord.MedConnectDev__Performed_By__c = userInfoId;
      woaRecord.MedConnectDev__ESignature_Captured__c = true;
      if (woaList !== null && woaList.CreatedDate)
        woaRecord.MedConnectDev__Previous_Action_Date__c = woaList.CreatedDate;
        woaRecord.MedConnectDev__Work_Order__c = workOrderId;

      AcceptRejectWorkOrderService.createWOActionRecord(woaRecord).then(function (response) {
        //Update Work Order
        AcceptRejectWorkOrderService.updateWOActionRecord(workOrderId, woRecord).then(function (response) {
          showSuccessAlertMessage('The Work Order ' + acceptRejectOrder.woName + ' is ' + action +'ed Successfully', action);
        }, function (err) {
          showAlertMessage('Error Code: '+err[0].errorCode+'\n Error Message: '+err[0].message);
        });
      }, function (err) {
        $ionicLoading.hide();
        showAlertMessage('Error Code: '+err[0].errorCode+'\n Error Message: '+err[0].message);
      });
    }, function (err) {
      $ionicLoading.hide();
      showAlertMessage('Error Code: '+err[0].errorCode+'\n Error Message: '+err[0].message);
    });
  };

  function showAlertMessage(message) {
    $ionicLoading.hide();
    navigator.notification.alert(message, alertDismissed, 'Medvantage', 'OK');
  }

  function alertDismissed() {
  }

  function showSuccessAlertMessage(message, action) {
    $ionicLoading.hide();
    navigator.notification.alert(message, backToWorkOrder(action), 'Medvantage', 'OK');
  }

  function backToWorkOrder (action) {
    if (action == 'Accept') {
      $ionicHistory.goBack();
    } else if (action == 'Reject') {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.calendar');
    }
  }

});
