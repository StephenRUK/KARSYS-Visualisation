<?php
require('db.php');  // TODO improve security

/************************************************
* Top-level methods
************************************************/

function getTypeIdFromObjectId ($objectID) {
    return substr($objectID, 0, 2);
}

function getTypeIdDetails ($dbConn, $typeId) {
    $query = "SELECT code,displayname FROM " . DB_Table_DataTypes . " WHERE ID = " . $typeId;
    $result = doQueryAssoc($dbConn, $query);

    return $result;
}

function getObjectData ($dbConn, $objectID) {
    $typeID = getTypeIdFromObjectId($objectID);
    $typeDetails = getTypeIdDetails($dbConn, $typeID);
    $dataTable = DB_View_Prefix . $typeDetails['code'];

    $query = "SELECT * FROM " . $dataTable . " WHERE ID = '" . $objectID . "'";
    $objectData = doQueryAssoc($dbConn, $query);
    
    if (!$objectData) {
        $objectData = array();
    }
    
    if ($typeDetails) {
        $objectData['title'] = $typeDetails['displayname'];
    }
    
    return $objectData;
}

function getObjectDataJSON ($dbConn, $objectID) {
    return json_encode(getObjectData($dbConn, $objectID));
}

/************************************************
* Methods for retrieving specific type data
************************************************/

function doQueryAssoc($dbConn, $sql) {
    $result = $dbConn->query($sql);
    if ($result) {
        $result = $result->fetch_assoc();
    }

    return $result;
}

/************************************************
* Request handling
************************************************/

$conn = new mysqli(DB_Server, DB_User, DB_Pass, DB_Name);

if ($conn->connect_error) {
    die ('SQL Connection failed: ' . $conn->connect_error);
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];   // TODO Maybe need to sanitize input
    
    echo getObjectDataJSON($conn, $id);

}

$conn->close();
    
?>