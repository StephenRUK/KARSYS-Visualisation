<?php
include('db.php');  // TODO improve security

/************************************************
* Top-level methods
************************************************/

function getTypeIdFromObjectId ($objectID) {
    return $objectID.substring(2);
}

function getObjectData ($objectID) {
    $typeID = getTypeIdFromObjectId ($objectID);
    $data = null;
    
    switch ($typeID) {
        case 14:
            $data = getDataSprings($objectID);
            break;
        case 24:
            $data = getDataPhreaticZone($objectID);
            break;
    }
    
    return $data;
}

function getObjectDataJSON ($objectID) {
    return json_encode(getObjectData($objectID));
}

/************************************************
* Methods for retrieving specific type data
************************************************/

function getDataSprings($objectID) {
    $sql = 'SELECT ip_name, ip_rem FROM ip WHERE ip_id = ' . $objectID;
    $result = $conn->query($sql)->fetch_assoc();

    return $result;
}

/************************************************
* Request handling
************************************************/

$conn = new mysqli($DB_serv, $DB_user, $DB_pass, $DB_name);

if ($conn->connect_error) {
    die ('SQL Connection failed: ' . $conn->connect_error);
}

echo "Connected to DB.";

if ($_GET['id']) {    
    $id = $_GET['id'];   // TODO Maybe need to sanitize input
    echo 'Object ID: ' . $id;
    echo getObjectDataJSON($id);
    
}

$conn->close();
    
?>