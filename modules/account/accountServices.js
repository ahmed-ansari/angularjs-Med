app.service('AccountsService', ['force','MedvantageUtils', AccountsService]);
app.filter('AccountNumber', AccountNumber);
app.filter('AccountCallOn', AccountCallOn);
app.filter('AccountWebsite', AccountWebsite);

function AccountNumber() {
    return function(input) {
        if(input !== null) {
            return 'Account Number: ' + input;
        } else {
            return 'Account Number: NA'; 
        }
        
    };
}

function AccountCallOn() {
    return function(input) {
        if(input !== null) {
            return 'Call On: ' + input;
        } else {
            return 'Call On: NA';
        }   
    };
}

function AccountWebsite() {
    return function(input) {
        if(input !== null){
            return ' | ' + input;
        } else {
            return ' | NA';
        }
    };
}

function AccountsService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }


    this.getAccounts = function(days, limit, userId) {
     
        return force.query("SELECT Id,AccountNumber,BillingAddress,BillingCity,BillingCountry,BillingLatitude,BillingLongitude,"+serverInstance+"Account_Address__c,Name,Phone,Website FROM Account WHERE Id IN (SELECT "+serverInstance+"Account__c FROM "+serverInstance+"Work_Order__c WHERE "+serverInstance+"Appointed_Technician__r."+serverInstance+"User__c='"+userId+"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+serverInstance+"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name ASC LIMIT " + limit);

    };
    this.getAccountsMore = function(days, num, userId) {
        return force.query("SELECT Id,AccountNumber,BillingAddress,BillingCity,BillingCountry,BillingLatitude,BillingLongitude,"+serverInstance+"Account_Address__c,Name,Phone,Website FROM Account WHERE Id IN (SELECT "+serverInstance+"Account__c FROM "+serverInstance+"Work_Order__c WHERE "+serverInstance+"Appointed_Technician__r."+serverInstance+"User__c='"+userId+"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+serverInstance+"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name ASC LIMIT 20 OFFSET " + num);
    };
    this.setAccount = function(account) {
        return force.create('account', account);
    };
    this.getAccountById = function(id) {
        return force.query("SELECT Id, Name, AccountNumber, Description, Phone,Website, ParentId, Type,"+serverInstance+"GPO_Membership_1__c, "+serverInstance+"GPO_Membership_1__r.Name, "+serverInstance+"GPO_Membership_2__c,"+serverInstance+"GPO_Membership_2__r.Name, "+serverInstance+"IDN_input__c,"+serverInstance+"IDN_input__r.Name, Rating, "+serverInstance+"Institute_Speciality__c, "+serverInstance+"Institute_Speciality_2__c, "+serverInstance+"Laboratory_Speciality_1__c, "+serverInstance+"Laboratory_Speciality_2__c, "+serverInstance+"Type_of_Laboratory__c, NumberOfEmployees, "+serverInstance+"No_of_Tests_per_day__c,"+serverInstance+"Type_of_Pharmacy__c, "+serverInstance+"Type_of_Affiliate__c,  "+serverInstance+"No_of_Doctors__c, "+serverInstance+"No_of_Surgeries__c, "+serverInstance+"No_of_Beds__c, Fax, "+serverInstance+"Email_Address__c, "+serverInstance+"Preferred_Shipping_Method__c, Site, BillingStreet, BillingCity, BillingState, BillingCountry, BillingPostalCode, BillingLatitude,BillingLongitude,ShippingStreet, ShippingCity, ShippingState, ShippingCountry, ShippingPostalCode, "+serverInstance+"CustomerPriority__c, "+serverInstance+"Active__c, "+serverInstance+"NumberofLocations__c, Ownership, "+serverInstance+"Therapeutic_Area__c, "+serverInstance+"Payment_Terms__c, AnnualRevenue, "+serverInstance+"Global_Presence__c, "+serverInstance+"Number_of_Offices_accross_Globe__c, "+serverInstance+"SLA__c, "+serverInstance+"Percentage_Revenue_from_MedDevices__c, "+serverInstance+"Number_of_warehouses__c, RecordType.DeveloperName, recordType.Name, Parent.recordType.Name, Parent.Name FROM Account WHERE Id='"+id+"'");
    };
    this.getAccountIncidents = function(id) {
        return force.query("SELECT Name,"+serverInstance+"Contact__c,"+serverInstance+"Contact__r.Name,"+serverInstance+"Priority__c,"+serverInstance+"Status__c,"+serverInstance+"Subject__c" + " FROM "+serverInstance+"Incident__c WHERE "+serverInstance+"Account__c='" + id + "' ORDER BY Name LIMIT 5");
    };

    this.getAccountServiceRequest = function(id) {
        return force.query("SELECT Id,Name,"+serverInstance+"Billable__c,"+serverInstance+"Product_ID__c,"+serverInstance+"Product_Name__c,"+serverInstance+"Asset__r.Id,"+serverInstance+"Asset__r.Name,"+serverInstance+"Processing_Status__c, " +serverInstance+ "SR_Type__c FROM "+serverInstance+"Service_Request__c WHERE "+serverInstance+"Account__c='" + id + "' ORDER BY Id LIMIT 8");
    };

    this.getAccountServiceContract = function(id) {
        return force.query("SELECT Id,Name,"+serverInstance+"Active__c,"+serverInstance+"Contract_Number__c, " + serverInstance + "Contract_Signed__c FROM "+serverInstance+"Service_Maintenance_Contract__c WHERE "+serverInstance+"Account__c = '" + id + "' ORDER BY Id");
    };

    this.getAccountAsset = function(id) {
        return force.query("SELECT Id,Name,"+serverInstance+"Date_Shipped__c,"+serverInstance+"Installed_By__r.Name,"+serverInstance+"Installed_Date__c,"+serverInstance+"Product__r.Id,"+serverInstance+"Product__r.Name,"+serverInstance+"Serial_No__c,"+serverInstance+"Service_Due_On__c,"+serverInstance+"Type__c" + " FROM "+serverInstance+"Asset__c WHERE "+serverInstance+"Account__c = '" + id + "' ORDER BY Id");
    };

    this.getAccountOpenActivity = function(id) {
        return force.query("SELECT (SELECT WhoId,Who.Name,Subject,AccountId,Account.Name,IsTask,Status,Priority,Owner.Name, ActivityDate " + "FROM openactivities ORDER BY ActivityDate ASC, LastModifiedDate DESC LIMIT 100) FROM Account  WHERE Id='" + id + "'");
    };

    this.getAccountServiceContractDetails = function(id) {
        var sql = "SELECT Id,Name,"+
            serverInstance+"Contract_Price__c,"+
            serverInstance+"Discount__c,"+
            serverInstance+"Discounted_Price__c,"+
            serverInstance+"Service_Contract_Notes__c,"+
            serverInstance+"All_Products_Covered__c,"+
            serverInstance+"All_Sites_Covered__c,"+
            serverInstance+"All_Contacts_Covered__c,"+
            serverInstance+"All_Services_Covered__c,"+
            serverInstance+"Activation_Notes__c,"+
            serverInstance+"Cancelation_Notes__c,"+
            serverInstance+"Renewal_Notes__c,"+
            serverInstance+"Canceled_On__c,"+
            serverInstance+"Canceled_By__r.Name,"+
            serverInstance+"Renewal_Date__c,"+
            serverInstance+"Contract_Number__c,"+
            serverInstance+"Account__c,"+
            serverInstance+"Account__r.Name,"+
            serverInstance+"Contact__c,"+
            serverInstance+"Contact__r.Name,"+
            serverInstance+"Active__c,"+
            serverInstance+"Renewal_Number_View__c,"+
            serverInstance+"Contract_Signed__c,"+
            serverInstance+"Contract_Duration_Months__c,"+
            serverInstance+"Weeks_To_Renewal__c,"+
            serverInstance+"Start_Date__c,"+
            serverInstance+"End_Date__c,"+
            serverInstance+"Payment_Terms__c,"+
            serverInstance+"PO_Number__c,"+
            serverInstance+"PO_Required__c,"+
            serverInstance+"SLA_Terms__c,"+
            serverInstance+"SLA_Terms__r.Name"+
            " FROM "+serverInstance+"Service_Maintenance_Contract__c WHERE Id='" + id + "'";
        return force.query(sql);
    };

    this.getContactsById = function(id) {
        return force.query("SELECT Email,Id,MobilePhone,Name,Phone, Department FROM Contact Where AccountId='" + id + "' ORDER BY Name");
    };

    this.getNotesnAttachments = function (acc_id) {
        return force.query("SELECT (Select Id, Title, ParentId, LastModifiedDate, CreatedBy.Name, Parent.Name From Notes) from Account where Id='"+acc_id+"'");
    };

    this.getActivityHistory = function (acc_id) {
        return force.query("SELECT (SELECT WhoId,Who.Name,Subject,AccountId,Account.Name,IsTask,Owner.Name,ActivityDate,LastModifiedDate FROM ActivityHistories ORDER BY ActivityDate DESC,LastModifiedDate DESC LIMIT 8) FROM Account WHERE Id='"+acc_id+"'");
    };

    this.getAccountHierarchy = function(requestType,account_id) {

        var params = {
            path: 'MobileWebServiceAccountHierarchy/' + account_id,
            method: requestType
        };

        return force.apexrest(params);
    };
}
