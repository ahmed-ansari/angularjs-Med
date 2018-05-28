app.service('InventoryService', ['force', 'MedvantageUtils', InventoryService]);

function InventoryService(force, MedvantageUtils) {

    var serverInstance = MedvantageUtils.getMedSQlServerInstance();
    if (serverInstance === null || serverInstance === '') {
        serverInstance = 'MedConnectDev__';
    }

    this.getInventoryList = function(userId) {
        return force.query("SELECT Id,"+serverInstance+"Location__c,"+serverInstance+"Location__r.Name,"+serverInstance+"Owner_Account__c,"+serverInstance+"Owner_Account__r.Name,Name FROM "+serverInstance+"Inventory_Header__c WHERE "+serverInstance+"Owner_Technician__r."+serverInstance+"User__c='"+userId+"' ORDER BY Name");
    };

    this.getInventoryById = function(id) {
        var sql ="SELECT Id,MedConnectDev__Owner_Account__c,MedConnectDev__Owner_Account__r.Name, Name,OwnerId,Owner.Name FROM MedConnectDev__Inventory_Header__c WHERE Id='"+id+"'";
        return force.query(sql);
    };

    this.getInventoryLineItemsList = function (id) {
        var sql = "SELECT Id,MedConnectDev__Asset__c,MedConnectDev__Product__c,MedConnectDev__Status__c,Name,MedConnectDev__Quantity__c,MedConnectDev__Product__r.Name,MedConnectDev__Asset__r.Name FROM MedConnectDev__Inventory_Line_Item__c WHERE MedConnectDev__Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };

    this.getSourceInventoryTransactionsList = function (id) {
        var sql = "SELECT Id,Name,MedConnectDev__Source_Inventory__c,MedConnectDev__Destination_Inventory__c,MedConnectDev__Type__c,MedConnectDev__Asset__r.Name,MedConnectDev__Source_Inventory__r.Name,MedConnectDev__Destination_Inventory__r.Name,MedConnectDev__Parent_Asset1__r.Name,MedConnectDev__Product__r.Name,MedConnectDev__Lot_Master__r.Name,MedConnectDev__Quantity__c FROM MedConnectDev__Inventory_Transaction__c WHERE MedConnectDev__Source_Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };
    this.getInventoryTransactionlists = function (id) {
        var sql = "SELECT Id,Name,MedConnectDev__Source_Inventory__c,MedConnectDev__Destination_Inventory__c,MedConnectDev__Type__c,MedConnectDev__Asset__r.Name,MedConnectDev__Source_Inventory__r.Name,MedConnectDev__Destination_Inventory__r.Name,MedConnectDev__Parent_Asset1__r.Name,MedConnectDev__Product__r.Name,MedConnectDev__Lot_Master__r.Name,MedConnectDev__Quantity__c FROM MedConnectDev__Inventory_Transaction__c WHERE MedConnectDev__Source_Inventory__c = '"+id+"' OR MedConnectDev__Destination_Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };
    this.getDestinationInventoryTransactionsList = function (id) {
        var sql = "SELECT Id,Name,MedConnectDev__Source_Inventory__c,MedConnectDev__Destination_Inventory__c,MedConnectDev__Type__c,MedConnectDev__Asset__r.Name,MedConnectDev__Source_Inventory__r.Name,MedConnectDev__Destination_Inventory__r.Name,MedConnectDev__Parent_Asset1__r.Name,MedConnectDev__Product__r.Name,MedConnectDev__Lot_Master__r.Name,MedConnectDev__Quantity__c FROM MedConnectDev__Inventory_Transaction__c WHERE MedConnectDev__Destination_Inventory__c = '"+id+"' ORDER BY Name";
        return force.query(sql);
    };
    this.getInventoryLineItemDetails = function (id) {
        var sql = "SELECT Id, Name, MedConnectDev__Asset__c,MedConnectDev__Asset__r.Name,MedConnectDev__Batch_No__r.Name,MedConnectDev__Condition__c,MedConnectDev__Inventory__c, MedConnectDev__Lot_Master__r.Name,MedConnectDev__Product__c,MedConnectDev__Product__r.Name,MedConnectDev__Quantity__c,MedConnectDev__Serial_No__c,MedConnectDev__Status__c,MedConnectDev__Type__c,MedConnectDev__Inventory__r.Name,CreatedBy.Name,LastModifiedBy.Name FROM MedConnectDev__Inventory_Line_Item__c WHERE Id='"+id+"'";
        return force.query(sql);
    };
    this.getInventoryTransactionDetails = function (id) {
        return force.query("SELECT Id,Name,MedConnectDev__Asset__c,MedConnectDev__Asset__r.Name, MedConnectDev__Product__c,MedConnectDev__Product__r.Name,MedConnectDev__Quantity__c , MedConnectDev__Type__c, MedConnectDev__Source_Inventory__c, MedConnectDev__Source_Inventory__r.Name, MedConnectDev__Destination_Inventory__c, MedConnectDev__Destination_Inventory__r.Name FROM MedConnectDev__Inventory_Transaction__c WHERE Id='"+id+"'");
    };
}