<?php
require('db.php');  // TODO improve security

/************************************************
* Top-level methods
************************************************/

function getTypeIdFromObjectId ($objectID) {
    return substr($objectID, 0, 2);
}

function getTypeCodeFromId ($dbConn, $typeCode) {
    $query = "SELECT Code FROM " . $DB_dataTypeTable . " WHERE ID = " . $typeCode;
    $result = doQueryAssoc($dbConn, $query);

    return $result->Code;
}

function getObjectData ($dbConn, $objectID) {
    $typeID = getTypeIdFromObjectId($objectID);
    $dataTable = getTypeCodeFromId($dbConn, $typeID);

    $query = "SELECT * FROM " . $dataTable . " WHERE ID = " . $objectID;

    if ($query) {
        return doQueryAssoc($dbConn, $query);
    } else {
        return array(); // Return empty array representing "no data"
    }
    
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

$conn = new mysqli($DB_serv, $DB_user, $DB_pass, $DB_name);

if ($conn->connect_error) {
    die ('SQL Connection failed: ' . $conn->connect_error);
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];   // TODO Maybe need to sanitize input
    
    echo getObjectDataJSON($conn, $id);

}

$conn->close();
    
?>