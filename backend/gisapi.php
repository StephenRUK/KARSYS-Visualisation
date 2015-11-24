<?php
require('db.php');  // TODO improve security

/************************************************
* Top-level methods
************************************************/

function getTypeIdFromObjectId ($objectID) {
    return substr($objectID, 0, 2);
}

function getObjectData ($dbConn, $objectID) {
    $typeID = getTypeIdFromObjectId ($objectID);
    $query = "";
    
    switch ($typeID) {
        case 12:    // Cross-section
            $query = "SELECT cs_filenam AS 'File Name', cs_author AS 'Author', cs_rem AS 'Comments' FROM cs WHERE cs_id = '" . $objectID . "'";
            break;
        case 17:    // po???
            $query = "SELECT po_name AS 'Name', po_x AS 'x', po_y AS 'y', po_z AS 'z', po_rem AS 'Comments' FROM po WHERE po_id = '" . $objectID . "'";
            break;
        case 18:    // tr???
            $query = "SELECT tr_po_id AS 'Related PO ID', tr_rem AS 'Comments' FROM tr WHERE tr_id = '" . $objectID . "'";
            break;
        case 14:    // Springs
            $query = "SELECT ip_name AS 'Name', ip_rem AS 'Comments' FROM ip WHERE ip_id = '" . $objectID . "'";
            break;
        case 24:    // Phreatic Zone
            $query = "SELECT nk_type AS 'Type', nk_vol AS 'Volume' FROM nk WHERE nk_id = '" . $objectID . "'";
            break;
        case 52:    // oq???
            $query = "SELECT oq_type AS 'Type', oq_rem AS 'Comments' FROM oq WHERE oq_id = '" . $objectID . "'";
            break;
            
    }
    
    if ($query) {
        return doQueryAssoc($dbConn, $query);
    } else {
        return array(); // Return empty array representing "no data"
    }
    
}

function getObjectDataJSON ($dbConn, $objectID) {
    return json_encode(getObjectData($dbConn, $objectID), JSON_PRETTY_PRINT);
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