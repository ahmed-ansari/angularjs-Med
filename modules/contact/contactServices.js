app.service('ContactsService', ['force', 'MedvantageUtils', ContactsService]);
app.service('AttachmentService', ['force', 'MedvantageUtils', AttachmentService]);
app.service('NoteService', ['force', 'MedvantageUtils', NoteService]);
app.filter('ContactsBrackets', ContactsBrackets);
app.filter('NullCheck', NullCheck);

function ContactsBrackets() {
    return function(input) {
        return '( ' + input + ' )';
    };
}

function NullCheck() {
    return function(input) {
        if (input !== null) {
            return input;
        } else {
            return 'NA';
        }
    };
}



function ContactsService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }


    this.getContacts = function(days, limit, userId) {
        return force.query("SELECT Id, Name, AccountId,Account.Name,FirstName,LastName,MailingAddress, MailingCity,MailingCountry,MailingLatitude,MailingLongitude,MailingState,MailingStreet,MobilePhone,Phone,PhotoUrl FROM Contact WHERE Id IN(SELECT "+ serverInstance +"Contact__c FROM "+ serverInstance +"Work_Order__c WHERE  "+ serverInstance +"Appointed_Technician__r."+ serverInstance +"User__c ='"+userId+"' AND ("+ serverInstance +"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+ serverInstance +"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name ASC NULLS FIRST LIMIT " + limit);

    };

    this.getContactsMore = function(days, num, userId) {return force.query("SELECT Id, Name, AccountId,Account.Name,FirstName,LastName,MailingAddress, MailingCity,MailingCountry,MailingLatitude,MailingLongitude,MailingState,MailingStreet,MobilePhone,Phone,PhotoUrl FROM Contact WHERE Id IN(SELECT "+ serverInstance +"Contact__c FROM "+ serverInstance +"Work_Order__c WHERE  "+ serverInstance +"Appointed_Technician__r."+ serverInstance +"User__c ='"+userId+"' AND ("+ serverInstance +"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+ serverInstance +"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name ASC NULLS FIRST LIMIT 20 OFFSET " + num);

    };
    this.setContact = function(contact) {
        return force.create('contact', contact);
    };
    this.getContactById = function(id) {
        return force.query("SELECT AccountId, LastName, " + serverInstance + "Adaptability_to_Change__c, AssistantName, AssistantPhone, " + serverInstance + "Best_Day_to_Call__c, " + serverInstance + "Buying_Role__c, " + serverInstance + "Coverage__c, Department, Description, Email, Fax, FirstName, " + serverInstance + "Gender__c, HomePhone, Id, " + serverInstance + "Languages__c, " + serverInstance + "Level__c, MailingCity, MailingCountry, MailingPostalCode, MailingState, MailingStreet, MobilePhone, Name, OtherCity, OtherCountry, OtherPhone, OtherPostalCode, OtherState, OtherStreet, " + serverInstance + "Other_Speciality_1__c, " + serverInstance + "Other_Speciality_2__c, " + serverInstance + "Our_Status__c, Phone," + serverInstance + "Speciality__c, " + serverInstance + "Therapeutic_Area__c, Title," + serverInstance + "Type__c, recordType.developerName, recordType.Name, Account.Name, Account.AccountNumber, RecordTypeId, Birthdate  FROM Contact where Id='" + id + "'");
    };
    this.getContactIncidents = function(id) {
        return force.query("SELECT Name, " + serverInstance + "Priority__c," + serverInstance + "Status__c," + serverInstance + "Subject__c " + "FROM " + serverInstance + "Incident__c WHERE " + serverInstance + "Contact__c='" + id + "' ORDER BY Name");
    };
    this.getContactServiceRequest = function(id) {
        return force.query("SELECT Id,Name," + serverInstance + "Product_ID__c," + serverInstance + "Product_Name__c, " + serverInstance + "Asset__r.Id," + serverInstance + "Asset__r.Name," + serverInstance + "Processing_Status__c " + "FROM " + serverInstance + "Service_Request__c WHERE " + serverInstance + "Incident__r." + serverInstance + "Contact__c='" + id + "'");
    };

    this.getContactOpenActivity = function(id) {
        return force.query("SELECT (SELECT WhoId,Who.Name,Subject,AccountId,Account.Name,IsTask,Status,Priority,Owner.Name, ActivityDate,What.Name " + "FROM openactivities ORDER BY ActivityDate ASC, LastModifiedDate DESC LIMIT 100) FROM Contact  WHERE Id='" + id + "'");
    };

    this.getActivityHistory = function(contact_id) {
        return force.query("SELECT (SELECT WhoId,Who.Name,Subject,AccountId,Account.Name,IsTask,Owner.Name,ActivityDate,LastModifiedDate,Status,Priority,What.Name  FROM ActivityHistories ORDER BY ActivityDate DESC,LastModifiedDate DESC LIMIT 499) FROM Contact  WHERE Id='" + contact_id + "'");
    };

    this.getNotesnAttachments = function(contact_id) {
        return force.query("SELECT (Select Id, Title, ParentId,CreatedById,LastModifiedDate, Parent.Name, CreatedBy.Name From Notes), (Select Id, Name, ParentId,ContentType,CreatedById,LastModifiedDate,Parent.Name,CreatedBy.Name From Attachments) FROM Contact where Id='" + contact_id + "'");
    };
}

function AttachmentService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }

    this.getAttachments =  function (attached_id) {
        return force.query("SELECT Body,BodyLength,ContentType,CreatedById,CreatedDate,Description,Id,IsDeleted,IsPrivate,LastModifiedById,LastModifiedDate,Name FROM Attachment WHERE Id = '"+attached_id+"'");
    };
}

function NoteService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }

     this.getNotes =  function (noted_id) {
        return force.query("SELECT Id,Title,Body FROM Note WHERE Id = '"+noted_id+"'");
    };
}