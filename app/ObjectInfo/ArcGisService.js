'use strict';

/*********************
* ArcGisService
*   Retrieves data for a specific object from the ArcGIS database.
*   Data is exposed by a REST-like API.
*********************/
function ArcGisService(serverURL, $http) {
    var url,
        validIdPattern = /^\d{2}(\d{4})?\w{2}\d{4}$/;  // Examples: 121203VD0002, 54BS0123
    
    /**********************
    * Private API
    **********************/
    
    function performQuery(queryString) {
        return $http.get(url + '?' + queryString);
    }
    
    function init() {
        // Test server connectivity?
        url = serverURL;
    }
    
    /**********************
    * Utility methods
    **********************/
    
    function parseID(id) {
        var idClean = id.trim().replace('_', '');
        return idClean;
    }
    
    /**********************
    * Public API
    **********************/
    
    this.isValidID = function (ObjectID) {
        var idClean = parseID(ObjectID);
        return validIdPattern.test(idClean);
    };
    
    this.getObjectData = function (ObjectID) {
        var idClean = parseID(ObjectID);
        var queryParams = 'id=' + idClean;
        
        return performQuery(queryParams);
    };
    
    this.getObjectField = function (ObjectID, fieldName) {
        var idClean = parseID(ObjectID);
        var queryParams = 'id=' + idClean + '&field=' + fieldName;
        
        return performQuery(queryParams);
    };
    
    /**********************/
    init();
    
}