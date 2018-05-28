/**
 * Service Layer responsible for Offline Storage of the application 
 */

app.service('DataService', function(SOUPINFO, $q, force, $state, SyncUpService, $ionicLoading, NetworkService, SyncUpDataService, toastr, $timeout, $rootScope,localStorageService) {

    var soupObjects = SOUPINFO;
    var syncType = 'automatic';

    function initializeSoups() {
        var keys = Object.keys(soupObjects);
        keys.forEach(function(key) {
            createSoup(soupObjects[key]);
        });
    }

    function createSoup(soupObject) {
        var soupObj = soupObject;
        navigator.smartstore.soupExists(soupObj.Name, function(param) {
            if (!param) {
                navigator.smartstore.registerSoup(soupObj.Name, [soupObj.IndexSpecs], function() {
                }, function(error) {
                    // console.log('Soup Failed :', error);
                });
            } else {
                // console.log('Soup Already Exists');
            }
        });
    }

    function getSoupData(soupObject) {
        var soupObj = soupObject;
        var soupDataPromise = $q.defer();
        var querySpec = navigator.smartstore.buildAllQuerySpec(soupObj.IndexSpecs.path, 'ascending', 100);
        navigator.smartstore.querySoup(soupObj.Name, querySpec,
            function(cursor) {
                soupDataPromise.resolve(cursor);
            },
            function(error) {
                soupDataPromise.reject(error);
            });
        return soupDataPromise.promise;
    }

    function setSoupData(soupObject, dataToBeInserted) {
        var soupObj = soupObject;
        navigator.smartstore.upsertSoupEntriesWithExternalId(soupObj.Name, dataToBeInserted, soupObj.IndexSpecs.path, function(items) {
            // console.log('after process Soup Obj2 Items: ', items);
        }, function(error) {
            // console.log('Error Inserting records ', error);
        });
    }

    function setSoupData3(soupObject, dataToBeInserted) {
        var soupObj = soupObject;
        navigator.smartstore.upsertSoupEntriesWithExternalId(soupObj.Name, dataToBeInserted, soupObj.IndexSpecs.path, function(items) {
            // console.log('after process Soup Obj2 Items: ', items);
        }, function(error) {
            // console.log('Error Inserting records ', error);
        });
    }

    function setSoupData2(soupObject, dataToBeInserted) {
        var soupObj = soupObject;

        return navigator.smartstore.upsertSoupEntriesWithExternalId(soupObj.Name, dataToBeInserted, soupObj.IndexSpecs.path, function(items) {
            // console.log('Records Inserted Successfully', items.length);
            return dataToBeInserted;
        }, function(error) {
            // console.log('Error Inserting records ', error);
        });
    }

    function clearSoups(soupObject) {
        var soupObj = soupObject;
        navigator.smartstore.clearSoup(soupObj.Name, clearSoupSuccessCallBack, clearSoupSuccessFailure);
    }

    function removeRecordFromSoup(soupName, recordId) {
        var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', recordId);
        return navigator.smartstore.removeFromSoup(false, soupName, querySpec, clearSoupSuccessCallBack, clearSoupSuccessFailure);
    }

    function clearSoupSuccessCallBack() {
        // console.log('invoked clearSoupSuccessCallBack');
    }

    function clearSoupSuccessFailure() {
        // console.log('invoked clearSoupSuccessFailure');
    }

    function syncDownData(soupObject, targetQuery) {
        // console.log("SYNC DOWN DATA INVOKED");
        var soupDataPromise = $q.defer();
        var syncDownInstance = cordova.require("com.salesforce.plugin.smartsync");
        var options = { mergeMode: "Force.MERGE_MODE_DOWNLOAD.LEAVE_IF_CHANGED" };
        var target = {
            type: "soql",
            query: targetQuery
        };
        clearSoups(soupObject);
        syncDownInstance.syncDown(target, soupObject.Name, options, function successCallback(params) {
            document.addEventListener("sync", function(event) {
                if (event !== null && event.detail.status === "DONE") {
                    // console.log("event--------->>>" + JSON.stringify(event));
                    soupDataPromise.resolve();
                }
            });
        }, function errorCallback(error) {
            soupDataPromise.reject(error);
        });
        return soupDataPromise.promise;
    }

    function setOfflineSoupData(dataToBeInserted) {
        var offlinePromise = $q.defer();
        // console.log('Offline Obj: ', dataToBeInserted);

        if (dataToBeInserted.action === 'New') {
            DataService.getSoupData(SOUPINFO.offlineDataSoup).then(function(resp) {
                var data = resp.currentPageOrderedEntries;
                data.push(dataToBeInserted);
                DataService.setSoupData(SOUPINFO.offlineDataSoup, data);
                return offlinePromise.resolve();
            }, function(er) {
                // console.log('Failed in retriving Offline soup data: ', er);
                return offlinePromise.reject(er);
            });
        } else if (dataToBeInserted.action === 'Edit') {
            // console.log('Editing a record which is already in soup');
            var querySpec = navigator.smartstore.buildExactQuerySpec('randomId', dataToBeInserted.randomId);
            navigator.smartstore.querySoup(SOUPINFO.offlineDataSoup.Name, querySpec, function(resp) {
                if (resp && resp.currentPageOrderedEntries.length !== 0) {
                    // console.log('resp.currentPageOrderedEntries', resp.currentPageOrderedEntries);
                    // console.log('.dataToBeInserted', dataToBeInserted);
                    resp.currentPageOrderedEntries[0].data = dataToBeInserted.data;
                    resp.currentPageOrderedEntries[0].lock = dataToBeInserted.lock;
                    //resp.currentPageOrderedEntries[0].checked = dataToBeInserted.checked;
                    DataService.setSoupData3(SOUPINFO.offlineDataSoup, resp.currentPageOrderedEntries);
                } else {
                    // console.log('Adding a record which is edited first time which is not in soup');
                    DataService.getSoupData(SOUPINFO.offlineDataSoup).then(function(resp) {
                        var data = resp.currentPageOrderedEntries;
                        data.push(dataToBeInserted);
                        DataService.setSoupData(SOUPINFO.offlineDataSoup, data);

                    }, function(er) {
                        // console.log('Failed in retriving Offline soup data: ', er);
                        return offlinePromise.reject(er);
                    });
                }
                return offlinePromise.resolve();
            });
        }

        return offlinePromise.promise;
    }

    function syncUpAutomaticData() {
        localStorageService.set('syncup', false);
        getSoupData(SOUPINFO.offlineDataSoup).then(function(resp) {
                // console.log('Offline Record from soup: ', resp.currentPageOrderedEntries);
                if (resp.currentPageOrderedEntries.length > 0) {
                    $rootScope.freezePendingRecords = 'true';
                    // console.info('offline record found ,Sync type automatic triggrered');
                    startNewSyncUp(resp.currentPageOrderedEntries);
                }
            },
            function(er) {
                // console.error('Unable to retrieve records offline from offline data soup');
            });
    }

    function syncUpManualData(manualSyncRecords) {
        // console.log('manualSyncRecords',manualSyncRecords);
        startManualSyncUp(manualSyncRecords);
    }

    function startNewSyncUp(offlineData) {
        // console.log('sync up process going to start');
        SyncUpService.start();
        // return;
        // toastr.info('Syncing Offline Records...');
        // console.log('state name',$state.current);
        if ($state.current.name === 'app.offline') {
            // toastr.info('app offline state');
            $ionicLoading.show({
                template: '<ion-spinner icon="ios-small"></ion-spinner> Syncing Offline Records...'
            });

        }
        var itemsProcessed = 0;
        angular.forEach(offlineData, function(singleOfflineDataObject, index) {
            itemsProcessed++;
            if (singleOfflineDataObject.lock === true && singleOfflineDataObject.type !== 'RQTE') {
                // console.log('particular offine object has locked status', singleOfflineDataObject);
                if (itemsProcessed === offlineData.length) {
                        SyncUpService.stop();
                        $ionicLoading.hide();
                        // console.info('sync stopped');
                        localStorageService.set('syncup', false);                        
                }
                return;
            }
            var syncingNewRecords = {};
            var offlineObject = {
                "action": singleOfflineDataObject.type,
                "refId": singleOfflineDataObject.randomId,
                "data": singleOfflineDataObject.data
            };
            syncingNewRecords.records = [offlineObject];
            // console.log('offlineObject created in array', syncingNewRecords);
            SyncUpDataService.doSyncUp(syncingNewRecords)
                .then(function(suc) {
                    // console.log('suc', suc);
                    if (suc) {
                        // console.log('inside suc');

                        if (suc.results.status === "Success") {
                            // console.log('creating succ record');
                            syncingNewRecords.records[0].timestamp = getCurrentTimeStamp();
                            syncingNewRecords.records[0].randomId = suc.results.refId;
                            syncingNewRecords.records[0].Name = singleOfflineDataObject.Name;
                            // console.log('record going to success soup and removed', syncingNewRecords.records[0]);
                            setSoupData2(SOUPINFO.successRecordsSoup, [syncingNewRecords.records[0]]);
                            removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, suc.results.refId);
                        } else {
                            // console.error('this record not synced', syncingNewRecords);
                            if (suc.results.status === 'Failure') {
                                syncingNewRecords.records[0].timestamp = getCurrentTimeStamp();
                                syncingNewRecords.records[0].randomId = suc.results.refId;
                                syncingNewRecords.records[0].error = suc.results.msg;
                                syncingNewRecords.records[0].resync = true;
                                syncingNewRecords.records[0].Name = singleOfflineDataObject.Name;
                                syncingNewRecords.records[0].action = singleOfflineDataObject.type;
                                // console.log('record going to failure soup and removed', syncingNewRecords.records[0]);
                                setSoupData2(SOUPINFO.failedRecordsSoup, [syncingNewRecords.records[0]]);
                                removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, suc.results.refId);

                            }
                        }
                    }
                }, function(er) {
                    toastr.error('There was an error in syncing record - '+singleOfflineDataObject.Name);
                })
                .then(function() {
                    if (itemsProcessed === offlineData.length) {
                        SyncUpService.stop();
                        // console.info('sync stopped');
                        localStorageService.set('syncup', false);
                        if ($state.current.name === 'app.offline') {
                            $timeout(function() {
                                // $ionicLoading.hide();
                                 $rootScope.freezePendingRecords = 'false';
                                $state.reload();
                            }, 4000);

                        }
                    }
                });
        });

        return;
    }

    function startManualSyncUp(offlineData) {
        // console.log('sync up process going to start');
        SyncUpService.start();
        // return;
        // toastr.info('Syncing Offline Records...');
        var itemsProcessed = 0;
        angular.forEach(offlineData, function(singleOfflineDataObject, index) {
            itemsProcessed++;
            if (singleOfflineDataObject.lock === true) {
                // console.log('particular offine object has locked status', singleOfflineDataObject);
                return;
            }
            var syncingNewRecords = {};
            var offlineObject = {
                "action": singleOfflineDataObject.action,
                "refId": singleOfflineDataObject.randomId,
                "data": singleOfflineDataObject.data
            };
            syncingNewRecords.records = [offlineObject];
            // console.log('offlineObject created in array', syncingNewRecords);
            SyncUpDataService.doSyncUp(syncingNewRecords)
                .then(function(suc) {
                    // console.log('suc', suc);
                    if (suc) {
                        // console.log('inside suc');

                        if (suc.results.status === "Success") {
                            // console.log('creating succ record');
                            syncingNewRecords.records[0].timestamp = getCurrentTimeStamp();
                            syncingNewRecords.records[0].randomId = suc.results.refId;
                            syncingNewRecords.records[0].Name = singleOfflineDataObject.Name;
                            // console.log('record going to success soup and removed', syncingNewRecords.records[0]);
                            setSoupData2(SOUPINFO.successRecordsSoup, [syncingNewRecords.records[0]]);
                            removeRecordFromSoup(SOUPINFO.failedRecordsSoup.Name, suc.results.refId);
                        } else {
                            // console.error('this record not synced', syncingNewRecords);
                            if (suc.results.status === 'Failure') {
                                syncingNewRecords.records[0].timestamp = getCurrentTimeStamp();
                                syncingNewRecords.records[0].randomId = suc.results.refId;
                                syncingNewRecords.records[0].error = suc.results.msg;
                                syncingNewRecords.records[0].resync = true;
                                syncingNewRecords.records[0].Name = singleOfflineDataObject.Name;
                                // console.log('record going to success soup and removed', syncingNewRecords.records[0]);
                                setSoupData2(SOUPINFO.failedRecordsSoup, [syncingNewRecords.records[0]]);
                                //removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, suc.results.refId);

                            }
                        }
                    }
                }, function(er) {})
                .then(function() {
                    if (itemsProcessed === offlineData.length) {
                        SyncUpService.stop();
                        // console.info('sync stopped');
                        if ($state.current.name === 'app.offline') {
                            $timeout(function() {
                                $rootScope.freezePendingRecords = 'false';
                                $ionicLoading.hide();
                                $state.reload();
                            }, 3000);

                        }
                    }
                });
        });

        return;
    }

    function startSyncUp(offlineData, syncUpType) {
        // console.log('SYNCUP DATA INVOKED');
        SyncUpService.start();
        angular.forEach(offlineData, function(singleOfflineData, index) {
            // console.log('Index: ' + index + ' Lock: ' + singleOfflineData.lock);
            if (singleOfflineData.lock === true) {
                SyncUpService.stop();
                return;
            }
            if (singleOfflineData.type === 'Activity' || singleOfflineData.type === 'Expense') {
                if (singleOfflineData.data.Id) {
                    // console.log('while sycing set soup data- adding ', singleOfflineData.data);
                    force.update(singleOfflineData.object, singleOfflineData.data).then(function() {
                        singleOfflineData.resync = false;
                        return singleOfflineData;
                    }, function(er) {
                        singleOfflineData.error = er;
                        singleOfflineData.timestamp = getCurrentTimeStamp();
                        singleOfflineData.resync = true;
                        setSoupData2(SOUPINFO.failedRecordsSoup, [singleOfflineData]);
                    }).then(function(offData1) {
                        if (offData1 !== undefined) {
                            offData1.timestamp = getCurrentTimeStamp();
                            return setSoupData2(SOUPINFO.successRecordsSoup, [offData1]);
                        }
                    }, function(err2) {
                        // console.log('second promise err', err2);
                    }).then(function(offData2) {
                        //removing from pending / failed records
                        if (syncUpType === 'automatic') {
                            return removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, singleOfflineData.randomId);
                        } else if (syncUpType === 'manual' && singleOfflineData.resync === false) {
                            return removeRecordFromSoup(SOUPINFO.failedRecordsSoup.Name, singleOfflineData.randomId);
                        }
                    }, function(err3) {
                        // console.log('third promise err', err3);
                    }).then(function() {
                        if (index === offlineData.length - 1) {
                            SyncUpService.stop();
                            if ($state.current.name === 'app.offline') {
                                $ionicLoading.hide();
                                $state.reload();
                            }
                        }
                    });
                } else {
                    // console.log('while sycing set soup data- adding ', singleOfflineData.data);
                    force.create(singleOfflineData.object, singleOfflineData.data).then(
                        function(resp) {
                            singleOfflineData.resync = false;
                            return singleOfflineData;
                        },
                        function(er) {
                            singleOfflineData.error = er;
                            singleOfflineData.timestamp = getCurrentTimeStamp();
                            singleOfflineData.resync = true;

                            setSoupData2(SOUPINFO.failedRecordsSoup, [singleOfflineData]);
                        }
                    ).then(function(offData1) {
                        //putting into success
                        if (offData1 !== undefined) {
                            offData1.timestamp = getCurrentTimeStamp();
                            offData1.checked = false;
                            return setSoupData2(SOUPINFO.successRecordsSoup, [offData1]);
                        }
                    }, function(err2) {
                        // console.log('second promise err', err2);
                    }).then(function(offData2) {
                        //removing from pending / failed records
                        if (syncUpType === 'automatic') {
                            return removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, singleOfflineData.randomId);
                        } else if (syncUpType === 'manual' && singleOfflineData.resync === false) {
                            return removeRecordFromSoup(SOUPINFO.failedRecordsSoup.Name, singleOfflineData.randomId);
                        }
                    }, function(err3) {
                        // console.log('third promise err', err3);
                    }).then(function() {
                        if (index === offlineData.length - 1) {
                            SyncUpService.stop();
                            if ($state.current.name === 'app.offline') {
                                $ionicLoading.hide();
                                $state.reload();
                            }
                        }
                    });
                }
            } else if (singleOfflineData.type === 'RA') {
                force.apexrest(singleOfflineData.params).then(function(RAResponse) {
                    // console.log('In Success apex REST response: ', RAResponse);
                    if (RAResponse && RAResponse.status && RAResponse.status === 'Success') {
                        singleOfflineData.timestamp = getCurrentTimeStamp();
                        singleOfflineData.checked = false;
                        return setSoupData2(SOUPINFO.successRecordsSoup, [singleOfflineData]);
                    } else {
                        singleOfflineData.error = RAResponse.status;
                        singleOfflineData.timestamp = getCurrentTimeStamp();
                        singleOfflineData.resync = true;
                        return setSoupData2(SOUPINFO.failedRecordsSoup, [singleOfflineData]);
                    }
                }, function(er) {
                    // console.log('In Error APEX rest response: ', er);
                }).then(function(succRARecord) {
                    //removing from pending / failed records
                    if (syncUpType === 'automatic') {
                        return removeRecordFromSoup(SOUPINFO.offlineDataSoup.Name, singleOfflineData.randomId);
                    } else if (syncUpType === 'manual' && singleOfflineData.resync === false) {
                        return removeRecordFromSoup(SOUPINFO.failedRecordsSoup.Name, singleOfflineData.randomId);
                    }
                }, function(err) {
                    // console.log('Error in moving the records based on status: ', err);
                }).then(function() {
                    if (index === offlineData.length - 1) {
                        SyncUpService.stop();
                        if ($state.current.name === 'app.offline') {
                            $ionicLoading.hide();
                            $state.reload();
                        }
                    }
                });
            }
        });
    }

    function getCurrentTimeStamp() {
        var d = new Date(),
            dformat = [d.getDate().padLeft(),
                (d.getMonth() + 1).padLeft(),
                d.getFullYear()
            ].join('/') +
            ' ' + [d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()
            ].join(':');

        return dformat;
    }

    Number.prototype.padLeft = function(base, chr) {
        var len = (String(base || 10).length - String(this).length) + 1;
        return len > 0 ? new Array(len).join(chr || '0') + this : this;
    };

    function showAlertMessage(message) {
        navigator.notification.alert(message, alertDismissed, 'Medvantage', 'OK');
    }

    function alertDismissed(buttonIndex) {
        if (buttonIndex == 1) {
            $state.reload();
        }
    }

    function AnsaristartNewSyncUp(offlineData, syncUpType) {
        // console.log('sync up process going to start');
        SyncUpService.start();
        var syncingNewRecords = {};
        syncingNewRecords.records = [];
        var itemsProcessed = 0;
        angular.forEach(offlineData, function(singleOfflineDataObject, index) {
            itemsProcessed++;
            if (singleOfflineDataObject.lock === true) {
                // console.log('particular offine object', singleOfflineDataObject);
                return;
            }
            var offlineObject = {
                "action": singleOfflineDataObject.type,
                "ref-id": singleOfflineDataObject._soupEntryId,
                "data": singleOfflineDataObject.data
            };
            // offineObject.action = singleOfflineDataObject.type;
            // offineObject.ref-id = singleOfflineDataObject.type;
            // console.log('offlineObject', offlineObject);
            syncingNewRecords.records.push(offlineObject);
            // console.log('syncingNewRecords', syncingNewRecords);

        });
        if (itemsProcessed === offlineData.length) {
            // console.log('syncingNewRecords final', syncingNewRecords);
            if (NetworkService.isDeviceOnline()) {
                SyncUpDataService.doSyncUp(syncingNewRecords).then(function(suc) {
                    // console.log('syncup suc', suc);
                    if (suc && suc.results.length > 0) {
                        var itemsSucProcessed = 0;
                        angular.forEach(suc.results, function(singleSuccessObject, indexs) {
                            if (singleSuccessObject.status) {
                                // var refId = singleSuccessObject["ref-id"];
                                // console.log('suc singleSuccessObject', singleSuccessObject);
                                angular.forEach(syncingNewRecords, function(earlierRecord, index) {
                                    if (earlierRecord["ref-id"] === singleSuccessObject["ref-id"]) {
                                        singleSuccessObject.timestamp = getCurrentTimeStamp();
                                        return setSoupData2(SOUPINFO.successRecordsSoup, [singleSuccessObject]);
                                    }
                                });
                            } else {
                                // var refId = singleSuccessObject["ref-id"];
                                // console.log('err singleSuccessObject', singleSuccessObject);
                                angular.forEach(syncingNewRecords, function(earlierRecord, index) {
                                    if (earlierRecord["ref-id"] === singleSuccessObject["ref-id"]) {
                                        singleSuccessObject.timestamp = getCurrentTimeStamp();
                                        singleSuccessObject.error = singleSuccessObject.msg;
                                        singleSuccessObject.resync = true;
                                        return setSoupData2(SOUPINFO.failedRecordsSoup, [singleSuccessObject]);
                                    }
                                });
                            }
                            itemsSucProcessed++;

                        });
                        if (itemsSucProcessed === suc.results.length) {
                            SyncUpService.stop();
                            if ($state.current.name === 'app.offline') {
                                $ionicLoading.hide();
                                $state.reload();
                            }
                        }
                    }

                }, function(err) {

                });
            }
        } else {
            // console.log('no');
        }

    }

    var DataService = {
        initializeSoups: initializeSoups,
        createSoup: createSoup,
        setSoupData: setSoupData,
        setSoupData2: setSoupData2,
        setSoupData3: setSoupData3,
        getSoupData: getSoupData,
        clearSoups: clearSoups,
        removeRecordFromSoup: removeRecordFromSoup,
        syncDownData: syncDownData,
        setOfflineSoupData: setOfflineSoupData,
        syncUpAutomaticData: syncUpAutomaticData,
        syncUpManualData: syncUpManualData,
        startSyncUp: startSyncUp
    };

    return DataService;
});
