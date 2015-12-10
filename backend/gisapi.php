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
    $query = "SELECT * FROM " . DB_Table_Data_Fields . " WHERE LayerID = " . $typeID;
    $result = $dbConn->query($query);
    if ($result) {
        $result = $result->fetch_all(MYSQLI_ASSOC);
    }
    return $result;
}

function getObjectData ($dbConn, $objectID) {
    // Generate output array
    $map = array();
    
    $typeID = getTypeIdFromObjectId($objectID);
    $typeDetails = getTypeIdDetails($dbConn, $typeID);
    
    if (!$typeDetails) {
        $map['error'] = "No type found with ID $typeID";
        return $map;
    }
    
    $typeTable = $typeDetails['code'];
    $map['title'] = $typeDetails['displayname'];
    
    // Get fields for the object type
    $fields = getFieldsForTypeId($dbConn, $typeID);
    
    if (count($fields) == 0) {
        return $map;
    }
    
    // Build super-query to retrieve values with domain values
    $columns = array();
    $joins   = array();
    for ($i=0; $i < count($fields); $i++) {
        $f = $fields[$i];
        $fName = $f['Field'];
        $fDisp = $f['DisplayName'];

        if ($f['isDomainVal']) {
            $d = "dom_{$fName}";          // Domain alias
            $fNameOrig = $f['Field'];     // Original field name
            $fName = "{$d}.value";        // Replace field in query with the domain value
            $joins[] = "INNER JOIN " . DB_Table_Data_Domain ." $d ON {$d}.LayerID = $typeID AND {$d}.Field = '$fNameOrig' AND {$d}.Code = $fNameOrig";
        }

        $columns[] = "$fName AS '$fDisp'";
    }

    $colsStr = join(',', $columns);
    $joinStr = join(' ', $joins);
    $query = "SELECT $colsStr FROM $typeTable $joinStr WHERE {$typeTable}.{$typeTable}_id = '$objectID'";
    $values = doQueryAssoc($dbConn, $query);
    //echo "VALUES:<pre>"; print_r($values); echo "</pre>";

    // Populate output array with field data
    $i=0;
    foreach ($values as $k => $v) {
        $map['fields'][] = array(
            'name' => $k,
            'value' => $v,
            'unit' => $fields[$i]['Unit'],
            'digits' => $fields[$i]['DecimalDigits']
        );
        $i++;
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
    } else {
        $result = array();  // Return empty result instead of NULL
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