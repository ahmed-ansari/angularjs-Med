// app.controller('homeController', ['$scope','flexImagesService','$localStorage','BearService',homeControllerfunc]);
app.controller('homeController', ['$scope', 'flexImagesService', 'localStorageService', 'BearService', homeControllerfunc]);

function homeControllerfunc($scope, flexImagesService, localStorageService, BearService) {
    $scope.fleximages = '';
    $scope.bears = '';

    flexImagesService.getImages().then(function(img) {
        $scope.fleximages = img;
    });

    // $scope.user = $localStorage.username;
    $scope.user = 'Aditya';

    $scope.getBears = function() {
        BearService.getBears().then(function(bears) {
            $scope.bears = bears.data;
            console.log($scope.bears);
        });
    };
}


//Aditya
app.controller('AppCtrl', function($scope, force) {

    $scope.logout = function() {
        force.logout();
    };

})

.controller('ContactListCtrl', function($scope, force) {
    console.log(" i am in contactlistctrl");

    // navigator.smartstore.soupExists('contactsSoup', function(param) {
    //     if (!param) {
    //         var indexSpecs = [{ "path": "name", "type": "string" }, { "path": "Id", "type": "string" }];
    //         navigator.smartstore.registerSoup('contactsSoup', indexSpecs, function(records) {
    //             console.log('Soup Registered Successfully');
    //         }, function(error) {
    //             console.log('Soup Failed :', error);
    //         });
    //     } else {
    //         console.log('Soup Already Exists');
    //     }
    // });

    console.log('Device is online');
    var options = {
        "fieldlist": ["Name", "Title"]
    };

    //Syncup contact added offline
    cordova.require("com.salesforce.plugin.smartsync").syncUp('contactsSoup', options, function(param) {
        console.log('starting sync up...: ', JSON.stringify(param));
        document.addEventListener('sync', function(event) {
            console.log('Sync up Event Details : ', event.details);

            if (event.details.status == 'DONE') {
                console.log('calling sync down....');
                //syncDownRecords();
            }
        });

    });

    /*force.query('select id, name, title from contact limit 50').then(
        function(data) {
            $scope.contacts = data.records;
            navigator.smartstore.upsertSoupEntries('contactsSoup', data.records, function(items) {
                console.log('Records Inserted Successfully', items.length);
            }, function(error) {
                console.log('Error Inserting records ', error);
            });
        },
        function(error) {
            console.log("*****Error Retrieving Contacts******", error);
            var querySpec = navigator.smartstore.buildAllQuerySpec('Id', null, 50);
            navigator.smartstore.querySoup('contactsSoup', querySpec, function(cursor) {
                console.log('Success callback cursor', JSON.stringify(cursor.currentPageOrderedEntries));
                $scope.contacts = cursor.currentPageOrderedEntries;
            }, function(error) {
                console.log('Error in offline retriving contacts', error);
            });

        });*/

})

.controller('ContactCtrl', function($scope, $stateParams, force) {

    force.retrieve('contact', $stateParams.contactId, 'id,name,title,phone,mobilephone,email').then(
        function(contact) {
            $scope.contact = contact;
        });
})


.controller('CreateContactCtrl', function($scope, $stateParams, $ionicNavBarDelegate, force) {
    console.log('Inside Create contact Ctrl');

    // navigator.smartstore.soupExists('contactsSoup', function(param) {
    //     if (!param) {
    //         var indexSpecs = [{ "path": "firstname", "type": "string" }, { "path": "lastname", "type": "string" },
    //             { "path": "phone", "type": "string" }, { "path": "mobile", "type": "string" }, { "path": "email", "type": "string" }
    //         ];

    //         navigator.smartstore.registerSoup('contactsSoup', indexSpecs, function(records) {
    //             console.log('Soup Registered Successfully');
    //         }, function(error) {
    //             console.log('Soup Failed :', error);
    //         });
    //     } else {
    //         console.log('Soup Already Exists');
    //     }
    // });

    $scope.contact = { "Name": "Abc1 def1", "Title": "SA-Mobility" };

    $scope.save = function() {
        force.create('contact', $scope.contact).then(
            function(response) {
                $ionicNavBarDelegate.back();
            },
            function() {
                console.log("An error has occurred in adding contact", $scope.contact);

                var records = [];
                records.push($scope.contact);

                navigator.smartstore.upsertSoupEntries('contactsSoup', records, function(items) {
                    console.log('Records Inserted Successfully', items.length);
                }, function(error) {
                    console.log('Error Inserting records ', error);
                });
            });
    };
});
