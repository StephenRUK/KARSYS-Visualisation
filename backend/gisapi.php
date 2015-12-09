<?php
require('db.php');  // TODO improve security

/************************************************
* Top-level methods
************************************************/

function getTypeIdFromObjectId ($objectID) {
    return substr($objectID, 0, 2);
}

function getTypeIdDetails ($dbConn, $typeId) {
    $query = "SELECT id, code, displayname FROM " . DB_Table_Data_Types . " WHERE ID = " . $typeId;
    $result = doQueryAssoc($dbConn, $query);

    return $result;
}

function getFieldsForTypeId ($dbConn, $typeID) {
    $query = "SELECT Field FROM " . DB_Table_Data_Fields . " WHERE LayerID = " . $typeID;
    $result = $dbConn->query($query);
    
    $fields = array();
    
    while ($row = $result->fetch_array()) {
        $fields[] = $row[0];
    }

    return $fields;
}

function getFieldDisplayNames ($dbConn, $typeID) {
    // TODO Add language check in future
    $query = "SELECT DisplayName FROM " . DB_Table_Data_Fields . " WHERE LayerID = " . $typeID;
    $result = $dbConn->query($query);
    
    $names = array();
    
    while ($row = $result->fetch_array()) {
        $names[] = $row[0];
    }

    return $names;
}

function getValuesForFields ($dbConn, $table, $fields, $objectID) {
    $fieldList = '';
    foreach ($fields as $field) {
        $fieldList .= $field . ',';
    }
    $fieldList = substr($fieldList, 0, strlen($fieldList)-1);  // Trim last comma

    $query = 'SELECT ' . $fieldList . ' FROM ' . $table . ' WHERE ' . $table . "_id = '" . $objectID . "'";
    $result = $dbConn->query($query);
    
    $values = array();
    $row = $result->fetch_array(MYSQLI_ASSOC);
    
    foreach ($row as $k=>$v) {
        /*if (is_string($v)) {
            $v = utf8_encode($v);
        }*/
        $values[] = $v;
    }
    
    return $values;
}

function getDomainValues ($dbConn, $table, $fields, $values) {
    $conditions = '';
    $len = count($fields);
    // Assemble query condition
    for ($i=0; $i < $len-1; $i++) {
        $conditions .= "(field = '" . $fields[$i] ."' AND code = '" . $values[$i] ."')";
        $conditions .= " OR ";
    }
    $conditions .= "(field = '" . $fields[$len-1] ."' AND code = '" . $values[$len-1] ."')";    // Append last without 'or'
    
    $query = 'SELECT * FROM ' . DB_Table_Data_Domain . ' WHERE ' . $conditions;
    
    // TODO perform query, return array of assoc arrays
}

function getObjectData ($dbConn, $objectID) {
    $typeID = getTypeIdFromObjectId($objectID);
    $typeDetails = getTypeIdDetails($dbConn, $typeID);
    
    if (!$typeDetails) return null;
    
    $typeTable = $typeDetails['code'];
    
    $fields = getFieldsForTypeId($dbConn, $typeID);                         // Internal field names
    $fieldDisplayNames = getFieldDisplayNames($dbConn, $typeID);            // Display name for each field
    $values = getValuesForFields($dbConn, $typeTable, $fields, $objectID);  // Value of each field
        
    // Generate output array with title and fields
    $map = array();
    $map['title'] = $typeDetails['displayname'];
    
    for ($i=0; $i < count($fields); $i++) {
        // TODO Check if there's a domain value for each field

        $map['fields'][] = array(
            'name' => $fieldDisplayNames[$i],
            'value' => $values[$i]
            // TODO get unit and format
        );
    }
    
    return $map;
}

function getObjectDataJSON ($dbConn, $objectID) {
    $dataArray = getObjectData($dbConn, $objectID);
    $json = json_encode($dataArray, JSON_UNESCAPED_UNICODE);
    
    if (json_last_error()==JSON_ERROR_UTF8) {
        die('JSON Encode error: Malformed UTF8 characters');
    }
    
    return $json;
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
$conn->set_charset("utf8"); // IMPORTANT for JSON encoding to work with special characters

if ($conn->connect_error) {
    die ('SQL Connection failed: ' . $conn->connect_error);
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];   // TODO Maybe need to sanitize input
    
    echo getObjectDataJSON($conn, $id);

}

$conn->close();
    
?>