app.service('MedContactsSQLService', ['force', 'MedvantageUtils', '$http', medContactsSQLService]);
app.service('MedAssetsSQLService', ['force', 'MedvantageUtils', '$http', medAssetsSQLService]);
app.service('MedProductsSQLService', ['force', 'MedvantageUtils', '$http', medProductsSQLService]);
app.service('MedAccountsSQLService', ['force', 'MedvantageUtils', '$http', medAccountsSQLService]);
app.service('MedMasterAnalysisCodesSQLService', ['force', 'MedvantageUtils', '$http', medMasterAnalysisCodesSQLService]);
app.service('MedMasterFaultCodesSQLService', ['force', 'MedvantageUtils', '$http', medMasterFaultCodesSQLService]);
app.service('MedSubCodesSQLService', ['force', 'MedvantageUtils', '$http', medSubCodesSQLService]);
app.service('MedProductPriceSQLService', ['force', 'MedvantageUtils', '$http', medProductPriceSQLService]);
app.service('MedTechnicianRateHrSQLService', ['force', 'MedvantageUtils', '$http', medTechnicianRateHrSQLService]);
app.service('SyncUpDataService', ['force', 'MedvantageUtils', '$http', SyncUpDataService]);

app.service('MedSyncDownDataSQLService', ['MedContactsSQLService', 'MedAssetsSQLService', 'MedProductsSQLService', 'MedAccountsSQLService', 'MedMasterAnalysisCodesSQLService', 'MedMasterFaultCodesSQLService', 'MedSubCodesSQLService', 'MedProductPriceSQLService', 'MedTechnicianRateHrSQLService', medSyncDownDataSQLService]);

function SyncUpDataService(force, MedvantageUtils, $http) {
    this.doSyncUp = function(requestBody) {

        var params = {
            path: 'MobileWebServiceFacade',
            method: 'POST',
            data: requestBody
        };

        return force.apexrest(params);
    };
}

function medContactsSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getContactsListSQLQuery = function(days, userId) {
        return "SELECT Id, Name, AccountId,Account.Name,FirstName,LastName,MailingAddress, MailingCity,MailingCountry,MailingLatitude,MailingLongitude,MailingState,MailingStreet,MobilePhone,Phone,PhotoUrl FROM Contact WHERE Id IN(SELECT " + serverInstance + "Contact__c FROM " + serverInstance + "Work_Order__c WHERE  " + serverInstance + "Appointed_Technician__r." + serverInstance + "User__c ='" + userId + "' AND (" + serverInstance + "Assigned_End_Time__c=LAST_N_DAYS:" + days + " OR " + serverInstance + "Assigned_End_Time__c=Next_N_DAYS:" + days + ")) ORDER BY Name ASC NULLS FIRST";

    };
}

function medMasterAnalysisCodesSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getMasterAnalysisCodesListSQLQuery = function(days, userId) {
        return "SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, RecordType.Name, (SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE (RecordType.Name = 'Analysis Code') AND " + serverInstance + "Parent_Code__c=NULL ORDER BY Name";
    };
}

function medMasterFaultCodesSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getMasterFaultCodesListSQLQuery = function(days, userId) {
        return "SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c, RecordType.Name, (SELECT Id, Name, " + serverInstance + "Code_Number__c, " + serverInstance + "Code_Level__c, " + serverInstance + "Description__c FROM " + serverInstance + "Codes__r) FROM " + serverInstance + "Code__c WHERE (RecordType.Name = 'Fault Code') AND " + serverInstance + "Parent_Code__c=NULL ORDER BY Name";
    };
}



function medSubCodesSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getSubCodesListSQLQuery = function(days, userId) {
        return "SELECT Id, " + serverInstance + "Code__c, " + serverInstance + "Product__r.Name, " + serverInstance + "Product__c FROM  " + serverInstance + "Code_Product_Assignment__c";
    };

}

function medAssetsSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getAssetsListSQLQuery = function(days, userId) {
        return "SELECT Id,Name," + serverInstance + "Installed_By__r.Name," + serverInstance + "Product__r.Name," + serverInstance + "Serial_No__c," + serverInstance + "Type__c" +
            " FROM " + serverInstance + "Asset__c WHERE ID IN(SELECT " + serverInstance + "Asset__c FROM " + serverInstance + "Work_Order__c WHERE " + serverInstance + "Appointed_Technician__r." + serverInstance + "User__c ='" + userId + "' AND (" + serverInstance + "Assigned_End_Time__c=LAST_N_DAYS:" + days + " OR " + serverInstance + "Assigned_End_Time__c=Next_N_DAYS:" + days + ")) ORDER BY Id DESC NULLS FIRST";

    };
}

function medProductsSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getProductsListSQLQuery = function(days, userId) {
        return "SELECT Name, Id, " + serverInstance + "Therapeutic_Area__c, " + serverInstance + "Company_Product__c, OwnerId, " + serverInstance + "Product_Category__c" +
            " FROM " + serverInstance + "Product__c WHERE Id IN(SELECT " + serverInstance + "Product__c FROM " + serverInstance + "Work_Order__c WHERE  " + serverInstance + "Appointed_Technician__r." + serverInstance + "User__c ='" + userId + "' AND (" + serverInstance + "Assigned_End_Time__c=LAST_N_DAYS:" + days + " OR " + serverInstance + "Assigned_End_Time__c=Next_N_DAYS:" + days + ")) ORDER BY Name NULLS FIRST";
    };
}

function medAccountsSQLService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getAccountsListSQLQuery = function(days, userId) {
        return "SELECT Id,AccountNumber,BillingAddress,BillingCity,BillingCountry,BillingLatitude,BillingLongitude," + serverInstance + "Account_Address__c,Name,Phone,Website FROM Account WHERE Id IN (SELECT " + serverInstance + "Account__c FROM " + serverInstance + "Work_Order__c WHERE " + serverInstance + "Appointed_Technician__r." + serverInstance + "User__c='" + userId + "' AND (" + serverInstance + "Assigned_End_Time__c=LAST_N_DAYS:" + days + " OR " + serverInstance + "Assigned_End_Time__c=Next_N_DAYS:" + days + ")) ORDER BY Name ASC";
    };
}

function medCodeSQLService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getCodeListSQLQuery = function() {
        return 'SELECT Id, Name, RecordType.Name FROM ' + serverInstance + 'Code__c ORDER BY Name  ' + sqlDataLimit;
    };
}

function medProductPriceSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getProductPriceSQLQuery = function() {
        return "SELECT Id, " + serverInstance + "Product__c, " + serverInstance + "List_Price__c FROM " + serverInstance + "Price__c WHERE " + serverInstance + "Pricebook__c = 'NA PriceBook' AND " + serverInstance + "Start_Date__c <= TODAY AND " + serverInstance + "End_Date__c >= TODAY";
    };
}

function medTechnicianRateHrSQLService(force, MedvantageUtils) {
    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    var sqlDataLimit = MedvantageUtils.getMedSQlDataLimit();

    this.getTechnicianRateHrSqlQuery = function() {
        return "SELECT Id, " + serverInstance + "Activity__c, " + serverInstance + "Technician__c, " + serverInstance + "Rate_Hr__c FROM " + serverInstance + "Technician_Skill__c WHERE " + serverInstance + "Activity__c <> '' ORDER BY Name";
    };
}


function medSyncDownDataSQLService(MedContactsSQLService, MedAssetsSQLService, MedProductsSQLService, MedAccountsSQLService, MedMasterAnalysisCodesSQLService, MedMasterFaultCodesSQLService, MedSubCodesSQLService, MedProductPriceSQLService, MedTechnicianRateHrSQLService) {

    this.startSyncDownData = function(moduleType, filterValue, userId) {
        switch (moduleType) {
            case 'Account':
                return this.syncDownAccountsData(filterValue, userId);
            case 'Contact':
                return this.syncDownContactsData(filterValue, userId);
            case 'Product':
                return this.syncDownProductsData(filterValue, userId);
            case 'Asset':
                return this.syncDownAssetsData(filterValue, userId);
            case 'MasterAnalysisCode':
                return this.syncDownMasterAnalysisCodesData(filterValue, userId);
            case 'MasterFaultCode':
                return this.syncDownMasterFaultCodesData(filterValue, userId);
            case 'SubCode':
                return this.syncDownSubCodesData(filterValue, userId);
            case 'ProductPrice':
                return this.syncDownProductPriceData(filterValue, userId);
            case 'TechnicianRateHr':
                return this.syncDownTechnicianHrData(filterValue, userId);
        }
    };


    this.syncDownContactsData = function(filterValue, userId) {
        return MedContactsSQLService.getContactsListSQLQuery(filterValue, userId);
    };

    this.syncDownAccountsData = function(filterValue, userId) {
        return MedAccountsSQLService.getAccountsListSQLQuery(filterValue, userId);
    };

    this.syncDownProductsData = function(filterValue, userId) {
        return MedProductsSQLService.getProductsListSQLQuery(filterValue, userId);
    };

    this.syncDownAssetsData = function(filterValue, userId) {
        return MedAssetsSQLService.getAssetsListSQLQuery(filterValue, userId);
    };

    this.syncDownMasterAnalysisCodesData = function(filterValue, userId) {
        return MedMasterAnalysisCodesSQLService.getMasterAnalysisCodesListSQLQuery(filterValue, userId);
    };

    this.syncDownMasterFaultCodesData = function(filterValue, userId) {
        return MedMasterFaultCodesSQLService.getMasterFaultCodesListSQLQuery(filterValue, userId);
    };

    this.syncDownSubCodesData = function(filterValue, userId) {
        return MedSubCodesSQLService.getSubCodesListSQLQuery(filterValue, userId);
    };

    this.syncDownProductPriceData = function(filterValue, userId) {
        return MedProductPriceSQLService.getProductPriceSQLQuery(filterValue, userId);
    };

    this.syncDownTechnicianHrData = function(filterValue, userId) {
        return MedTechnicianRateHrSQLService.getTechnicianRateHrSqlQuery(filterValue, userId);
    };

}
