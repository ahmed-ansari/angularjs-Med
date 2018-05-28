app.service('QuoteService', ['force', 'MedvantageUtils', QuoteService]);

function QuoteService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }
     this.getQuotesByWOId = function(woId){
        return force.query("SELECT Id,Name, "+serverInstance+"Total_Payble_Amount__c, "+serverInstance+"Status__c,"+serverInstance+"Valid_Till__c,"+serverInstance+"Discount__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Description__c FROM "+serverInstance+"Quote__c WHERE "+serverInstance+"Work_Order__c='"+woId+"' ORDER BY Name");
    };

    this.getQuote = function(id) {
        return force.query("SELECT "+serverInstance+"Account__c,"+serverInstance+"Account__r.Name,"+serverInstance+"Child_Quote__c,"+serverInstance+"Contact__c,CreatedById,"+serverInstance+"Description__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Discount__c,"+serverInstance+"Expense_Warranty_Coverage__c,Id,"+serverInstance+"Invoiced__c,"+serverInstance+"Labour_Warranty_Coverage__c,"+serverInstance+"Material_Warranty_Coverage__c,Name,OwnerId,"+serverInstance+"Parent_Quote__c,"+serverInstance+"Parent_Quote__r.Name,"+serverInstance+"Product__c,"+serverInstance+"Signature_Status__c,"+serverInstance+"SignOff__c,"+serverInstance+"Status__c,"+serverInstance+"Total_Billable_Line_Amount__c,"+serverInstance+"Total_Gross_Amount__c,"+serverInstance+"Total_Payble_Amount__c,"+serverInstance+"Valid_Till__c,"+serverInstance+"Version_Number__c,"+serverInstance+"Work_Order__c,"+serverInstance+"Work_Order__r.Name, "+serverInstance+"Work_Order__r."+serverInstance+"Product__c, "+serverInstance+"Contact__r.Name, "+serverInstance+"Contact__r.Phone, "+serverInstance+"Work_Order__r."+serverInstance+"Appointed_Technician__c FROM "+serverInstance+"Quote__c WHERE Id='"+id+"'");
    };

    this.createQuote = function (data) {
        return force.create(serverInstance+"Quote__c",data);
    };
    
    this.updateQuote = function (data) {
        return force.update(serverInstance+"Quote__c",data);
    };

    this.getQuoteLineItemsType =  function (id,LineItemType) {
        var sql = "SELECT "+serverInstance+"Activity_Type__c,"+serverInstance+"Activity__r.Name,"+serverInstance+"Activity__c,"+serverInstance+"Applied_Rate_Type__c,"+serverInstance+"Product__r.Name,"+serverInstance+"Billable__c,"+serverInstance+"Covered__c,"+serverInstance+"Description__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Discount__c,"+serverInstance+"Expense_Amount__c,"+serverInstance+"Expense_Type__c,"+serverInstance+"Gross_Line_Amount__c,"+serverInstance+"Hours_Worked__c,Id,"+serverInstance+"Line_Amount__c,"+serverInstance+"Line_Type__c,Name,"+serverInstance+"Product__c,"+serverInstance+"Quantity__c,"+serverInstance+"Quote__c,"+serverInstance+"Quote__r.Name,"+serverInstance+"Rate__c,"+serverInstance+"Unit_Price__c FROM "+serverInstance+"Quote_Line_Item__c WHERE "+serverInstance+"Quote__c='"+id+"' AND "+serverInstance+"Line_Type__c = '"+LineItemType+"'";
    	return force.query(sql);
    };

    this.createQuoteLineItems = function (data){
        return force.create("" + serverInstance + "Quote_Line_Item__c", data);
    };

    this.updateQuoteLineItems = function(data) {
        return force.update("" + serverInstance + "Quote_Line_Item__c", data);
    };
    this.getQuoteLineItemsDetails = function (id, LineItemType) {
        var query = "SELECT "+serverInstance+"Activity_Type__c,"+serverInstance+"Activity__r.Name,"+serverInstance+"Activity__c,"+serverInstance+"Applied_Rate_Type__c,"+serverInstance+"Product__r.Name,"+serverInstance+"Billable__c,"+serverInstance+"Covered__c,"+serverInstance+"Description__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Discount__c,"+serverInstance+"Expense_Amount__c,"+serverInstance+"Expense_Type__c,"+serverInstance+"Gross_Line_Amount__c,"+serverInstance+"Hours_Worked__c,Id,"+serverInstance+"Line_Amount__c,"+serverInstance+"Line_Type__c,Name,"+serverInstance+"Product__c,"+  serverInstance+"Apply_Warranty__c,"+ serverInstance+"Quantity__c,"+serverInstance+"Quote__c,"+serverInstance+"Quote__r.Name,"+serverInstance+"Rate__c,"+serverInstance+"Unit_Price__c, "+serverInstance+"Warranty_Coverage2__c FROM "+serverInstance+"Quote_Line_Item__c WHERE Id='"+id+"' AND "+serverInstance+"Line_Type__c = '"+LineItemType+"'";
        return force.query(query);
    };

    this.getQuoteLineItems =  function (id) {
        var query = "SELECT "+serverInstance+"Activity_Type__c,"+serverInstance+"Activity__r.Name,"+serverInstance+"Activity__c,"+serverInstance+"Applied_Rate_Type__c,"+serverInstance+"Product__r.Name,"+serverInstance+"Billable__c,"+serverInstance+"Covered__c,"+serverInstance+"Description__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Discount__c,"+serverInstance+"Expense_Amount__c,"+serverInstance+"Expense_Type__c,"+serverInstance+"Gross_Line_Amount__c,"+serverInstance+"Hours_Worked__c,Id,"+serverInstance+"Line_Amount__c,"+serverInstance+"Line_Type__c,Name,"+serverInstance+"Product__c,"+  serverInstance+"Apply_Warranty__c,"+ serverInstance+"Quantity__c,"+serverInstance+"Quote__c,"+serverInstance+"Quote__r.Name,"+serverInstance+"Rate__c,"+serverInstance+"Unit_Price__c, "+serverInstance+"Warranty_Coverage2__c FROM "+serverInstance+"Quote_Line_Item__c WHERE "+serverInstance+"Quote__c='"+id+"'";
        return force.query(query);
    };

        this.getQuoteLineItems2 =  function (id) {
        var query = "SELECT "+serverInstance+"Activity_Type__c,"+serverInstance+"Activity__c,"+serverInstance+"Applied_Rate_Type__c,"+serverInstance+"Billable__c,"+serverInstance+"Covered__c,"+serverInstance+"Description__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Discount__c,"+serverInstance+"Expense_Amount__c,"+serverInstance+"Expense_Type__c,"+serverInstance+"Hours_Worked__c,"+serverInstance+"Line_Type__c,"+serverInstance+"Product__c,"+  serverInstance+"Apply_Warranty__c,"+ serverInstance+"Quantity__c,"+serverInstance+"Rate__c,"+serverInstance+"Unit_Price__c, "+serverInstance+"Warranty_Coverage2__c FROM "+serverInstance+"Quote_Line_Item__c WHERE "+serverInstance+"Quote__c='"+id+"'";
        return force.query(query);
    };

        this.getQuoteLineItemsComposite =  function (id) {
        var query = "SELECT "+serverInstance+"Activity_Type__c,"+serverInstance+"Activity__c,"+serverInstance+"Applied_Rate_Type__c,"+serverInstance+"Billable__c,"+serverInstance+"Covered__c,"+serverInstance+"Description__c,"+serverInstance+"Discount_Type__c,"+serverInstance+"Discount__c,"+serverInstance+"Expense_Amount__c,"+serverInstance+"Expense_Type__c,"+serverInstance+"Gross_Line_Amount__c,"+serverInstance+"Hours_Worked__c,Id,"+serverInstance+"Line_Amount__c,"+serverInstance+"Line_Type__c,Name,"+serverInstance+"Product__c,"+  serverInstance+"Apply_Warranty__c,"+ serverInstance+"Quantity__c,"+serverInstance+"Quote__c,"+serverInstance+"Rate__c,"+serverInstance+"Unit_Price__c, "+serverInstance+"Warranty_Coverage2__c FROM "+serverInstance+"Quote_Line_Item__c WHERE "+serverInstance+"Quote__c='"+id+"'";
        return force.query(query);
    };

    this.setSignatureToId = function(data) {
        return force.update("" + serverInstance + "Quote__c", data);
    };

    this.getSignatureById = function(id) {
        return force.query("SELECT " + serverInstance + "SignOff__c FROM " + serverInstance + "Quote__c WHERE Id='" + id + "'"); 
    };

    this.getUnitPrice = function (id) {
        return force.query("SELECT Id, "+serverInstance+"List_Price__c FROM "+serverInstance+"Price__c WHERE "+serverInstance+"Product__c = '"+id+"' AND "+serverInstance+"Pricebook__c = 'NA PriceBook' AND "+serverInstance+"Start_Date__c <= TODAY AND "+serverInstance+"End_Date__c >= TODAY LIMIT 1");
    };

    this.createReviseQuote = function(data) {

        var params = {
            path: 'MedConnectDev__Quote__c',
            method: 'POST',
            data:data
        };

        return force.apexrestSFDC(params);
    };

    this.getTechnicianRate = function (activity, technician_id) {
        return force.query("SELECT Id, "+serverInstance+"Rate_Hr__c FROM "+serverInstance+"Technician_Skill__c WHERE "+serverInstance+"Activity__c='"+activity+"' AND "+serverInstance+"Technician__c='"+technician_id+"'");
    };

}