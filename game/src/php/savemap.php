<?php 
require("db.php");

$response = array();

// Set appropriate CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Fetch-Request"); // Allow X-Fetch-Request header

$jsonData = file_get_contents('php://input');

// Check if JSON data is present
if (!isset($jsonData) || empty($jsonData)) {
    $response['success'] = false;
    $response['message'] = "No JSON data found in the request body";
    echo json_encode($response);
    exit;
}

// Decode the JSON data
$decodedData = json_decode($jsonData, true);

// Check if JSON data is valid
if ($decodedData === null) {
    $response['success'] = false;
    $response['message'] = "Invalid JSON data in the request body";
    echo json_encode($response);
    exit;
}

/*
// Specify the directory where JSON files are stored
$directory = '../../assets/';

// Get all files with names matching the pattern 'map*.json' in the specified directory
$files = glob($directory . 'map*.js');

// If no files found, start with map1.js
if (empty($files)) {
    $latestFileNumber = 0;
} else {
    // Extract the file numbers from the filenames and find the maximum
    $fileNumbers = array_map(function ($file) {
        return intval(preg_replace('/[^0-9]+/', '', basename($file, '.js')));
    }, $files);
    $latestFileNumber = max($fileNumbers);
}

// Increment the latest file number to generate the filename for the new file
$newFileName = 'map' . ($latestFileNumber + 1) . '.js';
$filePath = $directory . $newFileName;
*/

$alias = $decodedData['alias'];
$data = json_encode($decodedData['data']);

try {
    // Insert JSON data into the database
    // Check if the data already exists
    $selectStmt = $pdo->prepare("SELECT COUNT(*) FROM maps WHERE mapdata = :mapdata");
    $selectStmt->bindParam(':mapdata', $data, PDO::PARAM_STR);
    $selectStmt->execute();
    $count = $selectStmt->fetchColumn();

    if ($count > 0) {
        // Data already exists, handle accordingly (e.g., return error response)
        $response['exist'] = true;
        $response['message'] = "Data already exists in the database";
        echo json_encode($response);
        exit;
    }

    // Insert the data into the database
    $insertStmt = $pdo->prepare("INSERT INTO maps (alias, mapdata) VALUES (:alias, :mapdata)");
    $insertStmt->bindParam(':alias', $alias, PDO::PARAM_STR);
    $insertStmt->bindParam(':mapdata', $data, PDO::PARAM_STR); 
    $insertStmt->execute();


        // Retrieve all existing IDs from the maps table
    $existingIdsStmt = $pdo->query("SELECT id FROM maps ORDER BY id");
    $existingIds = $existingIdsStmt->fetchAll(PDO::FETCH_COLUMN);

    // Check if there are any gaps in the IDs
    $expectedIds = range(1, count($existingIds));
    if ($existingIds !== $expectedIds) {
        // Reorder the IDs sequentially starting from 1
        $newIds = range(1, count($existingIds));

        // Update the IDs in the database
        $updateStmt = $pdo->prepare("UPDATE maps SET id = :newId WHERE id = :oldId");
        for ($i = 0; $i < count($existingIds); $i++) {
            $updateStmt->execute([':newId' => $newIds[$i], ':oldId' => $existingIds[$i]]);
        }
    }


    $response['status'] = 'success';

    /*
    // Save the JSON data to the new file
    if (file_put_contents($filePath, $jsonData) !== false) {
        // If successful, send success response
        $response['status'] = 'success';
        $response['file'] = $newFileName;
    } else {
        // If error occurred while saving to file, send error response
        $response['success'] = false;
        $response['message'] = 'Failed to save JSON data to file.';
    }
    */
} catch (PDOException $e) {
    // If database insertion fails, send error response
    $response['success'] = false;
    $response['message'] = "Error: " . $e->getMessage();
}
header('Content-Type: application/json');
echo json_encode($response);
?>