app.service('CalendarService', ['force', CalendarService]);
app.service('UserService', ['force', UserService]);
app.service('NetworkService', NetworkService);

function UserService (force) {
	this.getUserDetails = function () {
		return force.query("SELECT Id,Address,City,Title,CompanyName,ContactId,Country,Email,FirstName,LastName,Latitude,Longitude,MedConnectDev__Address__c,MobilePhone,Name,Phone,State,Street,Username,UserType FROM User WHERE Id='"+force.getUserId()+"'");
	};
}

function CalendarService(force) {
    this.getItems = function(start,end) {
        var sql = "SELECT Id, Name, MedConnectDev__Assigned_Start_Time__c, MedConnectDev__Assigned_End_Time__c, MedConnectDev__Installed_Location__c, MedConnectDev__Asset__r.Name, MedConnectDev__Processing_Status__c, MedConnectDev__Product__c FROM MedConnectDev__Work_Order__c Where MedConnectDev__Asset__c != null AND MedConnectDev__Processing_Status__c In ('Open','In progress','Pending Completion','Accepted by FSE/Scheduled','Completed') And MedConnectDev__Appointed_Technician__r.MedConnectDev__User__c = '"+force.getUserId()+"' And MedConnectDev__Assigned_Start_Time__c != null AND MedConnectDev__Assigned_End_Time__c != null AND ((MedConnectDev__Assigned_Start_Time__c >="+ start +" And MedConnectDev__Assigned_End_Time__c <="+ end +" ) Or (MedConnectDev__Assigned_Start_Time__c >="+ start +" And MedConnectDev__Assigned_Start_Time__c <="+ end +") Or (MedConnectDev__Assigned_End_Time__c >="+ start +" And MedConnectDev__Assigned_End_Time__c <="+ end +") Or (MedConnectDev__Assigned_Start_Time__c <="+ start +" And MedConnectDev__Assigned_End_Time__c >="+ end +")) ORDER BY MedConnectDev__Assigned_Start_Time__c";
        return force.query(sql);
    };

    this.getItemsStatic = function() {
        return force.query("SELECT Id, Name, MedConnectDev__Assigned_Start_Time__c, MedConnectDev__Assigned_End_Time__c, MedConnectDev__Installed_Location__c, MedConnectDev__Asset__r.Name, MedConnectDev__Product__c FROM MedConnectDev__Work_Order__c Where MedConnectDev__Asset__c != null AND MedConnectDev__Processing_Status__c <> 'Completed' And MedConnectDev__Appointed_Technician__r.MedConnectDev__User__c = '00536000002dcVQAAY' And MedConnectDev__Assigned_Start_Time__c != null AND MedConnectDev__Assigned_End_Time__c != null AND ((MedConnectDev__Assigned_Start_Time__c >= 2016-07-30T18:30:00.000Z And MedConnectDev__Assigned_End_Time__c <= 2016-09-10T18:30:00.000Z ) Or (MedConnectDev__Assigned_Start_Time__c >= 2016-07-30T18:30:00.000Z And MedConnectDev__Assigned_Start_Time__c <= 2016-09-10T18:30:00.000Z) Or (MedConnectDev__Assigned_End_Time__c >= 2016-07-30T18:30:00.000Z And MedConnectDev__Assigned_End_Time__c <= 2016-09-10T18:30:00.000Z) Or (MedConnectDev__Assigned_Start_Time__c <= 2016-07-30T18:30:00.000Z And MedConnectDev__Assigned_End_Time__c >= 2016-09-10T18:30:00.000Z)) ORDER BY MedConnectDev__Assigned_Start_Time__c");
    };
}

function NetworkService() {

    this.isDeviceOnline = function() {
        var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            return true;
        } else {
            return false;
        }
    };
}