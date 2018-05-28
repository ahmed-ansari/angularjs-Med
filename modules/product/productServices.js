app.service('ProductsService', ['force', 'MedvantageUtils', ProductsService]);

function ProductsStaticData($http) {
    this.getProducts = function() {
        return $http({
            method: 'get',
            url: "assets/data/products.json"
        });
    };

    this.getProductById = function() {
        return $http({
            method: 'get',
            url: "assets/data/product.json"
        });
    };

}

function ProductsService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }

    this.getProducts = function(days,limit,userId) {
        return force.query("SELECT Name, Id, "+serverInstance+"Therapeutic_Area__c, "+serverInstance+"Company_Product__c, OwnerId, "+serverInstance+"Product_Category__c" +
            " FROM "+serverInstance+"Product__c WHERE Id IN(SELECT "+serverInstance+"Product__c FROM "+serverInstance+"Work_Order__c WHERE  "+serverInstance+"Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+serverInstance+"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name NULLS FIRST LIMIT " + limit);    

    };

    this.getProductsOnline = function () {
        return force.query("SELECT Id,Name FROM "+serverInstance+"Product__c ORDER BY Name");
    };

    this.getProductsMore = function(days, num, userId) {      
        return force.query("SELECT Name, Id, "+serverInstance+"Therapeutic_Area__c, "+serverInstance+"Company_Product__c, OwnerId, "+serverInstance+"Product_Category__c" +
            " FROM "+serverInstance+"Product__c WHERE Id IN(SELECT "+serverInstance+"Product__c FROM "+serverInstance+"Work_Order__c WHERE  "+serverInstance+"Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+days+" OR "+serverInstance+"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name NULLS FIRST LIMIT 20 OFFSET " + num);        

    };

    this.setProduct = function(product) {
        return force.create('product', product);
    };

    this.getProductById = function(id) {
        return force.query("SELECT Name, Id, "+serverInstance+"Therapeutic_Area__c, "+serverInstance+"Company_Product__c, "+serverInstance+"Effective_End_Date__c," +
            " "+serverInstance+"Effective_Start_Date__c, OwnerId, "+serverInstance+"Product_Line__c, "+serverInstance+"Consumer_site__c, "+serverInstance+"Controlled_Substance__c," +
            " "+serverInstance+"Product_Category__c, "+serverInstance+"Price_Type__c, "+serverInstance+"Device_Class__c, "+serverInstance+"Status__c, "+serverInstance+"Ship_Method__c," +
            " "+serverInstance+"UOM__c, "+serverInstance+"Quantity_in_each_UOM__c, "+serverInstance+"Description__c, "+serverInstance+"Clinical_Investigation_Number__c," +
            " "+serverInstance+"Manufacturing_Location__c, "+serverInstance+"Manufacturer_Name__c ,"+serverInstance+"Model_Number__c, "+serverInstance+"Catalog_Number__c, "+serverInstance+"Is_Bundle__c, "+serverInstance+"Is_Part__c," + 
            " "+serverInstance+"Distributor__c,"+serverInstance+"Structure_Type__c,"+serverInstance+"Similar_Product__r.Name,"+serverInstance+"Device_License_No__c,"+serverInstance+"Product_Recall_Required__c,"+
            " "+serverInstance+"Repair_Site__c,"+serverInstance+"Radiation_Emitting_Device__c,"+serverInstance+"Service_Maintenance_Contract__r.Name,"+serverInstance+"Service_Maintenance_Contract__r.Id,"+serverInstance+"Product_Part_Number__c,"+serverInstance+"is_ready_to_return__c"+
            "  FROM "+serverInstance+"Product__c where Id='" + id + "'");

    };

    this.getProductPartList = function(id) {
        return force.query("SELECT Id, Name, "+serverInstance+"Distributor__c, "+serverInstance+"Company_Product__c, "+serverInstance+"Product_Category__c, "+serverInstance+"Structure_Type__c," +
            "  "+serverInstance+"Price_Type__c, "+serverInstance+"UOM__c, "+serverInstance+"Status__c " + 
            "FROM "+serverInstance+"Product__c where "+serverInstance+"Parent_Product_Name__c ='" + id + "'");
    };

    this.getProductActivityInstruction = function(id) {
        return force.query("SELECT "+serverInstance+"Activity_Sub_Type__c, "+serverInstance+"Activity_Type__c,Id, "+serverInstance+"Item__c,Name, "+serverInstance+"Product__c " +
            "FROM "+serverInstance+"Product_Activity_Instruction__c WHERE "+serverInstance+"Product__c ='" + id + "'");
    };
}