app.controller('CalendarController', ['$scope', '$compile', '$timeout', 'UserService', 'CalendarService', '$ionicLoading', 'uiCalendarConfig', 'NgMap', 'force', 'DataService', 'SOUPINFO', 'MedvantageUtils', 'localStorageService',function($scope, $compile, $timeout, UserService, CalendarService, $ionicLoading, uiCalendarConfig, NgMap, force, DataService, SOUPINFO, MedvantageUtils, localStorageService) {

    //getting current locations
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    //scope digest on map initialized
    $scope.mycallback = function() {
        $scope.$apply();
    };

    //getting user details
    $scope.getUser = function() {
        $scope.disableMap = false;
        UserService.getUserDetails().then(function(user) {
            $scope.UserDetail = user.records[0];

            if ($scope.CurrentLocationErr) {
                $scope.user_addr = $scope.UserDetail.Address.street + ',' + $scope.UserDetail.Address.city + ',' + $scope.UserDetail.Address.country;

                $scope.userlat = $scope.UserDetail.Latitude;
                $scope.userlong = $scope.UserDetail.Longitude;
                if ($scope.user_addr != 'null,null,null') {
                    $scope.usr_addr_map = $scope.user_addr;
                } else {
                    $scope.usr_addr_map = $scope.userlat + ',' + $scope.userlong;
                }
                // console.log('user rejected curr location (err)',$scope.usr_addr_map);
                
            } else if ($scope.CurrentLocationErr === undefined) {
                $scope.usr_addr_map = $scope.lat + ',' + $scope.long;
            // $scope.usr_addr_map = $scope.UserDetail.Address.street + ',' + $scope.UserDetail.Address.city + ',' + $scope.UserDetail.Address.country;
             // console.log('user rejected curr location (undefined)', $scope.usr_addr_map);
            }

        }, function(err) {
            console.log('user receive err', err);
        });

    };

    $scope.getUser();

    //success callback map functions
    function onSuccess(position) {
        $scope.disableMap = false;
        $scope.lat = position.coords.latitude;
        $scope.long = position.coords.longitude;

        $scope.usr_addr_map = $scope.lat + ',' + $scope.long;
        $scope.usr_addr_map_enable_gprs = $scope.lat + ',' + $scope.long;
        console.log('come to success to grab location', $scope.usr_addr_map);
        $scope.CurrentLocationErr = false;
    }

    // onError Callback receives a PositionError object
    function onError(error) {
        $scope.CurrentLocationErr = true;
        // console.log('Map Err code: ' + error.code + '\n' + ' Map Err message: ' + error.message + '\n');

        if (error.code === 1) {
            $scope.errorGPSMessage = 'Please enable Location Services in settings to view the map';
        }
    }

    $scope.disableMap = false;
    $scope.selectedButton = 'AgendaDay';
    $scope.buttonClick = function(s) { $scope.selectedButton = s; };

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.changeTo = 'Hungarian';

    /* event source that contains custom events on the scope */
    $scope.events = [
        // { title: 'Short Events', start: ' 2016-08-12T07:06:00.000Z', color: '#6b46e5', constraint: 'availableForMeeting', className: 'rede' },
        // { title: 'Another Events', start: ' 2016-08-12T07:06:00.000Z' },
        // { title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2), rendering: 'background' },
        // { id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false },
        // { id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false },
        // { title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false },
        // { title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/' }
    ];

    /* event source that calls a function on every view switch */
    $scope.eventsF = function(start, end, timezone, callback) {

        var eventDate1 = new Date(start);
        var eventDate2 = new Date(end);
        var timeDiff = Math.abs(eventDate2.getTime() - eventDate1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (diffDays === 1) {
                localStorageService.set('calendarDayView', true);
                localStorageService.set('calendarDate', start);
        } else {
            localStorageService.set('calendarDayView', false);
            localStorageService.set('calendarDate', '');
        }

        var istart = start._d.toISOString();
        var iend = end._d.toISOString();
        // console.log('istart',istart);
         // var gdate = $('.calendar').fullCalendar('getView');
         // console.log('get View',gdate);


        $ionicLoading.show({
            template: '<ion-spinner icon="ios-small"></ion-spinner> Loading...'
        });
        $scope.wayPoints = [
            { location: { lat: 44.32384807250689, lng: -78.079833984375 }, stopover: true },
            { location: { lat: 44.55916341529184, lng: -76.17919921875 }, stopover: true },
        ];

        $scope.origin = '';
        $scope.destination = '';
        $scope.wayPoints2 = [];
        CalendarService.getItems(istart, iend).then(function(it) {
                var baseItems = it.records;
                var i;
                for (i = 0; i < baseItems.length; i++) {

                    baseItems[i].title = baseItems[i].Name;
                    
                    if (baseItems[i].MedConnectDev__Assigned_Start_Time__c && baseItems[i].MedConnectDev__Assigned_Start_Time__c.length > 4) {
                        var start_time_arr = baseItems[i].MedConnectDev__Assigned_Start_Time__c.split("+");
                        baseItems[i].start = new Date(start_time_arr[0]);
                    } else {
                        baseItems[i].start = baseItems[i].MedConnectDev__Assigned_Start_Time__c;
                    }
                    if (baseItems[i].MedConnectDev__Assigned_End_Time__c && baseItems[i].MedConnectDev__Assigned_End_Time__c.length > 4) {
                        var end_time_arr = baseItems[i].MedConnectDev__Assigned_End_Time__c.split("+");
                        baseItems[i].end = new Date(end_time_arr[0]);
                    } else {
                        baseItems[i].end = baseItems[i].MedConnectDev__Assigned_End_Time__c;
                    }                    
                    baseItems[i].url = '#/app/workorder/' + baseItems[i].Id;

                    if (baseItems[i].MedConnectDev__Processing_Status__c === 'Open') {
                        baseItems[i].color = '#4296e7';

                    } else if (baseItems[i].MedConnectDev__Processing_Status__c === 'In Progress') {
                        baseItems[i].color = '#EF9638';

                    } else if (baseItems[i].MedConnectDev__Processing_Status__c === 'Completed') {
                        baseItems[i].color = '#3DCE8D';

                    } else if (baseItems[i].MedConnectDev__Processing_Status__c && baseItems[i].MedConnectDev__Processing_Status__c.indexOf('Rejected') !== -1) {
                        baseItems[i].color = '#F42E52';

                    } else if (baseItems[i].MedConnectDev__Processing_Status__c && baseItems[i].MedConnectDev__Processing_Status__c.indexOf('Accepted') !== -1) {
                        baseItems[i].color = '#3DCE8D';

                    } else {
                        baseItems[i].color = '#4296e7';
                    }

                    if (baseItems[i].MedConnectDev__Installed_Location__c && $scope.setMap) {
                        $scope.wayPoints2.push({
                            location: baseItems[i].MedConnectDev__Installed_Location__c,
                            stopover: true
                        });
                        $scope.origin = baseItems[0].MedConnectDev__Installed_Location__c;
                        $scope.destination = baseItems[i].MedConnectDev__Installed_Location__c;
                    }

                    delete baseItems[i].Name;
                    delete baseItems[i].MedConnectDev__Assigned_Start_Time__c;
                    delete baseItems[i].MedConnectDev__Assigned_End_Time__c;

                }
                
                $scope.wayPoints2.pop();

                if (baseItems.length === 0) {                    
                    $scope.suppressmarkers = true;
                } else {
                    $scope.suppressmarkers = false;
                }

                $timeout(function() {
                    $scope.zoom = 15;
                    $scope.zoomtrue = true;
                });

                if ($scope.selectedButton === 'AgendaDay') {
                    $scope.disableMap = false;
                } else {
                    $scope.disableMap = true;
                    $scope.disableMapMsg = 'Map is available only for day view';
                }
                
                storeDataInOffline(istart, baseItems);
                $ionicLoading.hide();
                callback(baseItems);

            },
            function(err) {
                getDataFromOffline(istart, callback);
                $scope.disableMap = true;
                $scope.disableMapMsg = 'Map cannot be displayed in OFFLINE';
            });

        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
    };

    $scope.calEventsExt = {
        color: '#f89406',
        textColor: 'yellow',
        events: []
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function(date, jsEvent, view) {
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function(value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function() {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    /* remove event */
    $scope.remove = function(index) {
        $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function(view, calendar) {
       
        if (view === 'agendaDay') {
            $scope.setMap = true;
        } else {
            $scope.setMap = false;
            $scope.disableMap = true;
            $scope.disableMapMsg = 'Map is available only for day view';
        }

        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    $scope.renderCalendar = function(calendar) {
        $scope.events.push({
            title: 'result.data[int].idevenement.titre_annonce',
            start: new Date(),
            allDay: true
        });
        uiCalendarConfig.calendars.calendar.fullcalendar('refetchEvents');
        $timeout(function() {

            if (uiCalendarConfig.calendars[calendar]) {
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        });
    };
    /* Render Tooltip */
    $scope.eventRender = function(event, element, view) {
        element.attr({
            'tooltip': event.title,
            'tooltip-append-to-body': true,
        });

        $compile(element)($scope);
    };
    /* config object */

    $scope.calendarConfig = {
        calendar: {
            height: "100%",
            viewRender: function(view, element) {
                // console.log("View viewRender: ", view.intervalStart, view.intervalßßßßEnd, view.start, view.end);
                // console.log("View viewRender: ", view);
                // console.log("View element: ", element);
            }
        }
    };
    $scope.uiConfig = {
        calendar: {
            height: 450,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            defaultView: 'agendaDay',
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender,
            timeFormat: 'h(:mm)a',
            viewRender: function(view, element) {
                /*if (view.name != 'month') {
                    setCalendarHeight();
                }*/
                // console.log("View Changed: ", view.visStart, view.visEnd, view.start, view.end);
                // console.log("View Changed-->: ", view);
                // console.log("element Changed-->: ", element);
            
            },
            dayClick: function(date, jsEvent, view) {
                $scope.setMap = true;
                $scope.buttonClick('AgendaDay');
                $('.calendar').fullCalendar('gotoDate', date);
                $('.calendar').fullCalendar('changeView', 'agendaDay');
            },
            lazyFetching: false
        }
    };

    /* event sources array*/
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];

    function getDataFromOffline(startDate, callback) {
        DataService.getSoupData(SOUPINFO.workOrderList, 100).then(
            function(entries) {
                var offline_baseItems = entries.currentPageOrderedEntries;
                for (i = 0; i < offline_baseItems.length; i++) {
                    if (offline_baseItems[i].start && offline_baseItems[i].start.length > 4) {
                        var start_time_arr = offline_baseItems[i].start;
                         offline_baseItems[i].start = new Date(start_time_arr);
                    }
                    if (offline_baseItems[i].end && offline_baseItems[i].end.length > 4) {
                        var end_time_arr = offline_baseItems[i].end;
                        offline_baseItems[i].end = new Date(end_time_arr);
                    }
                }
                callback(offline_baseItems);
                 $ionicLoading.hide();
                 return;
            },
            function(err) {
                $ionicLoading.hide();
            }
        );
    }

    function storeDataInOffline(startDate, baseItems) {
        // var woListArr = [];
        // var woListObj = {};
        // woListObj.Id = startDate;
        // woListObj.data = baseItems;
        // woListArr.push(woListObj);
        // DataService.setSoupData(SOUPINFO.workOrderList, woListArr);
        DataService.setSoupData(SOUPINFO.workOrderList, baseItems);
    }
}]);

function setCalendarHeight() {
    var windowHt = $(window).outerHeight(true);
    var headerHt = $(".bar-header").outerHeight(true);
    var tabHt = $(".tsb-icons").outerHeight(true);
    var btnsHt = $(".cal-button").outerHeight(true);
    var fcToolbar = $(".fc-toolbar").outerHeight(true);
    var fcViewHt = windowHt - (headerHt + tabHt + btnsHt + fcToolbar);
    $(".fc-view").css({ "height": fcViewHt, "overflow-y": "scroll" });
}