<?php 
require("db.php");

$response = array();

// Set appropriate CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, X-Fetch-Request"); // Allow X-Fetch-Request header

// Get the JSON data from the request body
$jsonData = file_get_contents('php://input');

// Check if JSON data is present
if (!isset($jsonData) || empty($jsonData)) {
    $response['success'] = false;
    $response['message'] = "No JSON data found in the request body";
    echo json_encode($response);
    exit;
}

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

try {
    // Insert JSON data into the database
    $insertStmt = $pdo->prepare("INSERT INTO maps (mapdata) VALUES (:mapdata)");
    $insertStmt->bindParam(':mapdata', $jsonData, PDO::PARAM_STR);
    $insertStmt->execute();

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
} catch (PDOException $e) {
    // If database insertion fails, send error response
    $response['success'] = false;
    $response['message'] = "Error: " . $e->getMessage();
}

echo json_encode($response);
?>
