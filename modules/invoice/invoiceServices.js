app.service('InvoiceService', ['force', 'MedvantageUtils', InvoiceService]);


function InvoiceService (force, MedvantageUtils) {
	var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }

    this.getWOInvoiceById = function(id){
    	return force.query("Select Id, Name, " + serverInstance +"Total_Invoice_Detail_Amount__c, "+ serverInstance + "Work_Order__c, " + serverInstance + "Work_Order__r.Name, "+ serverInstance + "Account__c, " + serverInstance + "Account__r.Name, "+ serverInstance + "Contact__c, " + serverInstance + "Contact__r.Name, "+ serverInstance + "Contact__r.MobilePhone, " + serverInstance +"Status__c From "+ serverInstance +"Invoice__c Where Id='"+id+"'");
    };

    this.getWOInvoiceDetailsList = function(id){
    	return force.query("Select Id, Name,  " + serverInstance + "Invoice__c, " + serverInstance + "Quote__c, " + serverInstance + "Status__c, " + serverInstance + "Total_Payable_Amount__c," + serverInstance + "Quote__r.Name, " + serverInstance + "Work_Order__c, " + serverInstance + "Work_Order__r.Name From " + serverInstance + "Invoice_Detail__c Where "+ serverInstance +"Invoice__c='" + id + "' ORDER BY Name");
    };

    this.getInvoiceDetailsById = function(id) {
        return force.query("Select Id, Name,  " + serverInstance + "Total_Payable_Amount__c, " + serverInstance + "Discount__c, " + serverInstance + "Total_Billable_Line_Amount__c, " + serverInstance + "Status__c," + serverInstance + "Quote__c, " + serverInstance + "Quote__r.Name, "+ serverInstance + "Invoice__c, " + serverInstance + "Invoice__r.Name, " + serverInstance + "Work_Order__c, " + serverInstance + "Work_Order__r.Name From " + serverInstance + "Invoice_Detail__c Where Id='" + id + "'");
    };

    this.getInvLineItemByInvDetailId = function(id) {
        var sql = "Select Id, Name,  " + serverInstance + "Product__r.Name, " + serverInstance + "Quantity__c, " + serverInstance + "Unit_Price__c, " + serverInstance + "Discount_Type__c," + serverInstance + "Discount__c, " + serverInstance+"Description__c,"+serverInstance+"Apply_Warranty__c," + serverInstance + "Gross_Line_Amount__c, " + serverInstance + "Line_Amount__c, "+ serverInstance + "Activity_Type__c, " + serverInstance + "Hours_Worked__c, " + serverInstance + "Rate__c, "+ serverInstance + "Expense_Type__c, " + serverInstance + "Line_Type__c, "+ serverInstance + "Expense_Amount__c, "+ serverInstance + "Billable__c From " + serverInstance + "Invoice_Line__c Where "+serverInstance+"Invoice__c='" + id + "'";
    	 return force.query(sql);
    };

     this.getInvoiceLineItemsDetails = function(id) {
         return force.query("Select Id, Name,  " + serverInstance + "Product__r.Name, " + serverInstance + "Activity__r.Name, " + serverInstance + "Quantity__c, " + serverInstance + "Unit_Price__c, " + serverInstance + "Discount_Type__c," + serverInstance + "Discount__c, " + serverInstance + "Gross_Line_Amount__c, " + serverInstance+"Description__c,"+serverInstance+"Apply_Warranty__c,"+serverInstance + "Line_Amount__c, "+ serverInstance + "Activity_Type__c, " + serverInstance + "Hours_Worked__c, " + serverInstance + "Rate__c, "+ serverInstance + "Expense_Type__c, " + serverInstance + "Line_Type__c, "+serverInstance+"Applied_Rate_Type__c,"+ serverInstance + "Expense_Amount__c, "+ serverInstance + "Billable__c From " + serverInstance + "Invoice_Line__c Where Id='" + id + "'");
    };

    this.createInvoice = function(data) {
        return force.create("" + serverInstance + "Invoice__c", data);
    };
    this.updateInvoice = function(data) {
        return force.update(serverInstance + "Invoice__c", data);
    };
    this.updateInvoiceDetail = function(data) {
        return force.update(serverInstance + "Invoice_Detail__c", data);
    };

    this.createInvoiceLineItems = function(data) {
        return force.create("" + serverInstance + "Invoice_Line__c", data);
    };

    this.updateInvoiceLineItems = function(data) {
        return force.update("" + serverInstance + "Invoice_Line__c", data);
    };

    this.getTechnicianRate = function (activity, technician_id) {
        return force.query("SELECT Id, "+serverInstance+"Rate_Hr__c FROM "+serverInstance+"Technician_Skill__c WHERE "+serverInstance+"Activity__c='"+activity+"' AND "+serverInstance+"Technician__c='"+technician_id+"'");
    };

    this.mobileWebServiceInvoiceDetail =  function (request_data) {
          var params = {
            path: '/services/apexrest/MedConnectDev/MobileWebServiceInvoiceDetail',
            method: 'POST',
            data: request_data
        };

        return force.apexrest(params);
    };

  }
