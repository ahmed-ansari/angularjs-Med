app.service('AssetsService', ['force', 'MedvantageUtils', AssetsService]);
app.service('AssetNetworkService', AssetNetworkService);



function AssetsService(force, MedvantageUtils) {

  var serverInstance = MedvantageUtils.getMedSQlServerInstance();
  if (serverInstance === null || serverInstance === '') {
    serverInstance = 'MedConnectDev__';
  }

  this.getAssets = function (days, limit, userId) {
    return force.query("SELECT Id,Name," + serverInstance + "Installed_By__r.Name," + serverInstance + "Product__r.Name," + serverInstance + "Serial_No__c," + serverInstance + "Type__c" +
      " FROM " + serverInstance + "Asset__c WHERE ID IN(SELECT "+ serverInstance +"Asset__c FROM " + serverInstance + "Work_Order__c WHERE " + serverInstance + "Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+ days + " OR "+ serverInstance +"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Id DESC NULLS FIRST LIMIT " + limit);

  };

  this.getAssetsMore = function (days, num, userId) {
    return force.query("SELECT Id,Name," + serverInstance + "Installed_By__r.Name," + serverInstance + "Product__r.Name," + serverInstance + "Serial_No__c," + serverInstance + "Type__c" +
      " FROM " + serverInstance + "Asset__c WHERE ID IN(SELECT "+ serverInstance +"Asset__c FROM " + serverInstance + "Work_Order__c WHERE " + serverInstance + "Appointed_Technician__r."+serverInstance+"User__c ='"+ userId +"' AND ("+serverInstance+"Assigned_End_Time__c=LAST_N_DAYS:"+ days + " OR "+ serverInstance +"Assigned_End_Time__c=Next_N_DAYS:"+days+")) ORDER BY Name NULLS FIRST LIMIT 20 OFFSET " + num);

  };

  this.getAssetById = function (id) {

    return force.query('SELECT Id,' + serverInstance + 'Account__c,' + serverInstance + 'Current_Location__c,' + serverInstance + 'Date_Shipped__c,' + serverInstance + 'Device_Manufacture_Date__c,' +
      '' + serverInstance + 'Expiration_Date__c,' + serverInstance + 'Installed_By__c,' + serverInstance + 'Installed_Date__c,' + serverInstance + 'Last_Serviced_By__c,' + serverInstance + 'Last_Serviced_Date__c,' +
      '' + serverInstance + 'Last_Shipped_Date__c,' + serverInstance + 'Manufacturer_Location__c,' + serverInstance + 'Manufacturer_Name__c,' + serverInstance + 'Manufacturer_Report_Number__c,' +
      '' + serverInstance + 'Manufacturing_Country__c,' + serverInstance + 'Manufacturing_Location__c,' + serverInstance + 'Order_Line_Item__c,' + serverInstance + 'Ownership_Level__c,' + serverInstance + 'Postal_Code__c,' +
      '' + serverInstance + 'Product__c,' + serverInstance + 'Purchase_Order_No__c,' + serverInstance + 'Quantity__c,' + serverInstance + 'Referenceable__c,' + serverInstance + 'Serial_No__c,' + serverInstance + 'Service_Due_On__c,' + serverInstance + 'State__c,' + serverInstance + 'Street__c,' + serverInstance + 'Type__c,' + serverInstance + 'UDI__c,' + serverInstance + 'Usage_Status__c,Name, ' + serverInstance + 'Account__r.Name,' +
      '' + serverInstance + 'Product__r.Name, ' + serverInstance + 'Installed_By__r.Name' +
      ' FROM ' + serverInstance + 'Asset__c WHERE Id='+"'"+id+"'");
  };

  this.getAssetWorkOrder = function (id) {
    var sql = 'SELECT Id,Name,' + serverInstance + 'Processing_Status__c,' + serverInstance + 'Product__c, ' + serverInstance + 'Product__r.Name, ' + serverInstance + 'Appointed_Technician__r.MedConnectDev__User__c' +
      ' FROM ' + serverInstance + 'Work_Order__c WHERE ' + serverInstance + 'Asset__c='+"'"+id+"'";
    return force.query(sql);
  };

  this.getAssetServiceContract = function (id) {

    return force.query('SELECT Id, Name, ' + serverInstance + 'Service_Maintenance_Contract__c, ' + serverInstance + 'Service_Maintenance_Contract__r.Name, '+ serverInstance + 'Service_Maintenance_Contract__r.'+ serverInstance +'Active__c, ' + serverInstance + 'Service_Maintenance_Contract__r.' + serverInstance + 'Contract_Number__c, ' + serverInstance + 'Product_Name__c , ' + serverInstance + 'Service_Maintenance_Contract__r.' + serverInstance + 'Contract_Signed__c '+
      'FROM ' + serverInstance + 'Covered_Asset__c WHERE ' + serverInstance + 'Asset__c='+"'"+id+"'");
  };

}

function AssetNetworkService() {

    this.isDeviceOnline = function() {
        var networkState = navigator.connection.type;
        if (networkState !== Connection.UNKNOWN && networkState !== Connection.NONE) {
            return true;
        } else {
            return false;
        }
    };
}