/* jshint -W100 */
app.controller('ContactListCtrl', function($scope, force, ContactsService, $ionicModal, localStorageService, $ionicLoading, DataService, SOUPINFO, $timeout, SyncUpService) {

    var contactlist = this;

    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    var filterValue = localStorageService.get("filterValue");
    if (filterValue === null) {
        contactlist.filterContact = 7;
    } else {
        contactlist.filterContact = filterValue;
    }

    contactlist.noMoreItemsAvailable = true;
    contactlist.nocontacts = false;
    contactlist.no_contact = "No Record Found!";
    contactlist.loggedInId = '';

    var sfOAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
    sfOAuthPlugin.getAuthCredentials(function(usr) {
        contactlist.loggedInId = usr.userId;
        contactlist.callList(contactlist.filterContact, contactlist.loggedInId);
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
    *   Desc - fetches contact list
    *   @param - days - [number of days], userId [loggedIn user Id]
    */
    contactlist.callList = function(days, userId) {

        DataService.getSoupData(SOUPINFO.contactList, rec_entries).then(
            function(entries) {
                contactlist.contacts = entries.currentPageOrderedEntries;
                contactlist.noMoreItemsAvailable = true;
                $ionicLoading.hide();
            },
            function(err) {
                contactlist.contacts = [];
                $ionicLoading.hide();
            }
        );
        $ionicLoading.hide();
    };
    contactlist.entries = 0;
    /** 
    *   Desc - trigger call pop up
    *   @param - none
    */
    contactlist.callNumber = function(mobile) {
        if (mobile !== null && mobile.length > 14) {
            navigator.notification.alert("Cannot make a call to this number! please check the number before dial", alertDismissed, 'Medvantage', 'OK');
        }
    };

    function alertDismissed() {}

}).controller('ContactCtrl', function($window, $scope, $stateParams, ContactsService, $q, $ionicLoading, DataService, SOUPINFO, $timeout) {
    var singlecontact = this;
    singlecontact.dontProceed = false;

    var contactSubModulesList = ["contact", "incidents", "service_request", "open_activity", "acc_notes", "acc_attachments"];
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading ...'
    });

    var contactID = $stateParams.contactId;
    var promise1 = ContactsService.getContactById(contactID);
    var promise2 = ContactsService.getContactIncidents(contactID);
    var promise3 = ContactsService.getContactServiceRequest(contactID);
    var promise4 = ContactsService.getContactOpenActivity(contactID);
    var promise5 = ContactsService.getActivityHistory(contactID);
    var promise6 = ContactsService.getNotesnAttachments(contactID);

    $q.all([promise1, promise2, promise3, promise4, promise5, promise6]).then(function(data) {
        singlecontact.contact = data[0].records[0];
        singlecontact.incidents = data[1].records;

        singlecontact.service_request = data[2].records;
        if (data[3].records[0].OpenActivities === null) {
            singlecontact.open_activity = [];
        } else {
            singlecontact.open_activity = data[3].records[0].OpenActivities.records;
        }
        singlecontact.history = data[4].records[0].ActivityHistories;
        singlecontact.acc_notes = data[5].records[0].Notes;
        singlecontact.acc_attachments = data[5].records[0].Attachments;

        angular.forEach(contactSubModulesList, function(module) {
            storeDataInOffline(module, contactID);
        });



        angular.element($window).on('resize', setHeightForContact);
        setHeightForContact();

        $timeout(function() {
            angular.element('.item-note').show().css('color', 'black');
            setHeightForContact();

            var sfSmartstore = function() {
                console.log('smartstore',cordova.require("com.salesforce.plugin.smartstore"));
                return cordova.require("com.salesforce.plugin.smartstore");};
            sfSmartstore().showInspector();
            console.log('hello'); 
            navigator.smartstore.getDatabaseSize(function(db){
                console.log('size',db);
            },
            function (err){
                console.log('err',err);
            });

    
        }, 800);
            
        angular.element('#telChk').attr('href', 'tel:' + singlecontact.contact.Phone);

        $ionicLoading.hide();
    }, function(err) {
        angular.forEach(contactSubModulesList, function(module) {
            getDataFromOffline(module, contactID);
        });
    });
    /** 
    *   Desc - set contact  page height
    *   @param - none
    */
    function setHeightForContact() {
        var windowHt = $(window).outerHeight(true);
        var headerHt = $(".bar-header").outerHeight(true);
        var subNameHt = $(".contact-detail").outerHeight(true);
        var subHeaderHt = $(".subCtHdr").outerHeight(true);
        var tabHt = $(".tsb-icons").outerHeight(true);
        var subCtInfo = $(".cntInfo").outerHeight(true);
        //Adding 30px as buffer
        var cntCtHt = windowHt - (headerHt + subNameHt + subHeaderHt + tabHt + 40);
        var cntCtOthersHt = windowHt - (headerHt + subNameHt + subHeaderHt + subCtInfo + tabHt + 40);
        $(".scrollCtHtGI").css({ "height": cntCtHt, "overflow": "auto" });
        $(".scrollCtHt").css({ "height": cntCtOthersHt, "overflow": "auto" });
    }

    function cleanUp() {
        angular.element($window).off('resize', setHeightForContact);
    }

    $scope.$on('$destroy', cleanUp);
    /** 
    *   Desc - trigger email pop up
    *   @param - none
    */
    singlecontact.sendEmail = function() {
        cordova.plugins.email.isAvailable(
            function(isAvailable) {
                if (isAvailable) {
                    cordova.plugins.email.open({
                        to: singlecontact.contact.Email,
                        cc: '',
                        bcc: [],
                        subject: '',
                        body: ''
                    });
                } else {
                    singlecontact.showAlertMessage('Email not configured in device');
                }
            }
        );
    };

    singlecontact.showAlertMessage = function(message) {
        navigator.notification.alert(message, singlecontact.alertDismissed, 'Medvantage', 'OK');
    };
    singlecontact.alertDismissed = function() {};
    /** 
    *   Desc - fetch offline data from soup
    *   @param - type [ tabs of contact], contact Id[contact Id]
    */
    function getDataFromOffline(type, contactId) {
        var configObject = getPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {
                var contactIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === contactId) {
                        return index; 
                    } 
                }); 

                if (contactIdIndex.length === 0) {
                    if (singlecontact.contact === undefined && singlecontact.dontProceed === false) {
                        singlecontact.dontProceed = true;
                        $scope.showAlertMessage('No Offline Data Found');
                        return; 
                    }
                }

                singlecontact[type] = entries.currentPageOrderedEntries[contactIdIndex].data;
                $ionicLoading.hide(); 

                $timeout(function() {
                    angular.element('.item-note').show().css('color', 'black');
                }, 800);
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }
    /** 
    *   Desc - store offline data in soup
    *   @param - none
    */
    function storeDataInOffline(type, contactId) {
        var configObject = getPreFilledJSONArray(type);
        var contactDetailsArr = [];
        var contactsDetailsObj = {};
        contactsDetailsObj.Id = contactId;
        contactsDetailsObj.data = singlecontact[type];
        contactDetailsArr.push(contactsDetailsObj);
        DataService.setSoupData(configObject.soupName, contactDetailsArr);
    }
    /** 
    *   Desc - Maps the soups names to the tabs of contact pages for showing data in offline
    *   @param - type [ tabs of contact]
    */
    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'contact':
                configJSON.soupName = SOUPINFO.contactDetails;
                return configJSON;
            case 'incidents':
                configJSON.soupName = SOUPINFO.contactIncidentDetails;
                return configJSON;
            case 'service_request':
                configJSON.soupName = SOUPINFO.contactServiceRequestDetails;
                return configJSON;
            case 'open_activity':
                configJSON.soupName = SOUPINFO.contactOpenActivitiesDetails;
                return configJSON;
            case 'acc_notes':
                configJSON.soupName = SOUPINFO.contactNotesDetails;
                return configJSON;
            case 'acc_attachments':
                configJSON.soupName = SOUPINFO.contactAttachmentsDetails;
                return configJSON;
        }
    }

}).controller('ContactMapCtrl', function($scope, $stateParams, ContactsService, $q, $ionicLoading, DataService, SOUPINFO) {
    var contactmap = this;
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });
    ContactsService.getContactById($stateParams.contactId).then(function(contactm) {
            contactmap.contact = contactm.records[0];

            if (contactmap.contact.MailingLatitude === null || contactmap.contact.MailingLongitude === null) {
                contactmap.contact.addr = (contactmap.contact.MailingStreet !== null ? contactmap.contact.MailingStreet : '') + ', ' +
                    (contactmap.contact.MailingCity !== null ? contactmap.contact.MailingCity : '') + ', ' +
                    (contactmap.contact.MailingState !== null ? contactmap.contact.MailingState : '') + ', ' +
                    (contactmap.contact.MailingCountry !== null ? contactmap.contact.MailingCountry : '');
            } else {
                contactmap.contact.addr = (contactmap.contact.MailingLatitude !== null ? contactmap.contact.MailingLatitude : '') + ',' +
                    (contactmap.contact.MailingLongitude !== null ? contactmap.contact.MailingLongitude : '');
            }

            $ionicLoading.hide();

        },
        function(err) {
            contactmap.contact = '';
            $ionicLoading.hide();
        });
});

app.controller('ShowNoteCtrl', ['$scope', '$stateParams', 'NoteService', '$ionicLoading', 'DataService', 'SOUPINFO', function($scope, $stateParams, NoteService, $ionicLoading, DataService, SOUPINFO) {
    var shownote = this;
    var noteSubModulesList = ["notes"];
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });
    var noteId = $stateParams.noteId;
    if (noteId) {
        NoteService.getNotes(noteId).then(function(data) {
            shownote.notes = data.records;
            angular.forEach(noteSubModulesList, function(module) {
                storeDataInOffline(module, noteId);
            });
            $ionicLoading.hide();
        }, function(err) {
            angular.forEach(noteSubModulesList, function(module) {
                getNoteDataFromOffline(module, noteId);
            });
        });
    }

    function getNoteDataFromOffline(type, noteId) {
        if (shownote.dontProceed) {
            return;
        }
        var configObject = getPreFilledJSONArray(type);
        DataService.getSoupData(configObject.soupName, 10).then(
            function(entries) {
                var noteIdIndex = $.map(entries.currentPageOrderedEntries, function(obj, index) {
                    if (obj.Id === noteId) {
                        return index; 
                    } 
                }); 
                if (noteIdIndex.length === 0) {
                    if (shownote.notes === undefined && shownote.dontProceed === false) {
                        singleaccount.dontProceed = true;
                        $scope.showAlertMessage('No Offline Data Found');
                        return;
                    }
                }
                shownote[type] = entries.currentPageOrderedEntries[noteIdIndex].data; 
                $ionicLoading.hide();
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }

    function storeDataInOffline(type, noteId) {
        var configObject = getPreFilledJSONArray(type);
        var noteDetailsArr = [];
        var notesDetailsObj = {};
        notesDetailsObj.Id = noteId;
        notesDetailsObj.data = shownote[type];
        noteDetailsArr.push(notesDetailsObj);
        DataService.setSoupData(configObject.soupName, noteDetailsArr);
    }

    function getPreFilledJSONArray(type) {
        var configJSON = {};
        switch (type) {
            case 'notes':
                configJSON.soupName = SOUPINFO.notesSoup;
                return configJSON;

        }
    }

}]);

app.controller('ShowAttachmentCtrl', ['$scope', '$stateParams', 'AttachmentService', '$ionicLoading', function($scope, $stateParams, AttachmentService, $ionicLoading) {
    var showattachment = this;
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
    });

    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    showattachment.attachmentId = $stateParams.attachmentId;
    if (showattachment.attachmentId) {
        AttachmentService.getAttachments(showattachment.attachmentId).then(function(data) {
            showattachment.attached = data.records;
            // console.log('attached', data);
            var img_id = data.records[0].Body;
            // console.log('img_id', img_id);
            if (img_id) {
                sfoAuthPlugin = cordova.require("com.salesforce.plugin.oauth");
                sfoAuthPlugin.getAuthCredentials(function(usr) {
                    var url = usr.instanceUrl + img_id;
                    var request = new XMLHttpRequest();
                    request.open("GET", url, true);
                    request.responseType = "arraybuffer";
                    request.setRequestHeader("Authorization", "Bearer " + usr.accessToken);
                    if (usr.userAgent !== null) {
                        request.setRequestHeader('User-Agent', usr.userAgent);
                        request.setRequestHeader('X-User-Agent', usr.userAgent);
                    }
                    if (url !== null)
                        request.setRequestHeader('SalesforceProxy-Endpoint', url);
                    request.onreadystatechange = function() {
                        if (request.readyState == 4) {
                            if (request.status == 200) {
                                try {
                                    //console.log('request', request);
                                    showattachment.attach_img = arrayBufferToBase64(request.response);
                                    $ionicLoading.hide();
                                } catch (e) {
                                    alert("Error reading the response: " + e.toString());
                                    $ionicLoading.hide();
                                }
                            } else if (request.status == 401) {
                                //console.log('request status 401', request);
                                $ionicLoading.hide();
                            } else {
                                //console.log('request in else', request, request.statusText, request.response);
                                $ionicLoading.hide();
                            }
                        }
                    };
                    request.send();
                });
            }

        }, function(err) {

            $scope.showAlertMessage('No Offline Data Found');
            $ionicLoading.hide();
        });
    }

}]);
